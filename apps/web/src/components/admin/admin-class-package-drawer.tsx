"use client";

import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ApiError, apiFetch } from "@/lib/api";
import { formatAmdFromCents } from "@/lib/price-amd";
import { coachCardDisplayName } from "@/components/coaches/coach-card-display";
import type {
  AdminClassPackageCoachRow,
  EnrichedClassPackage,
} from "@/components/admin/admin-class-packages-types";
import { OmmButton } from "@/components/ui/omm-button";

type AdminClassPackageDrawerProps = {
  pkg: EnrichedClassPackage | null;
  allCoaches: readonly AdminClassPackageCoachRow[];
  locale: string;
  onClose: () => void;
  onChanged: () => void;
};

function coachLabel(coach: AdminClassPackageCoachRow): string {
  return coachCardDisplayName({
    name: coach.user.name,
    lastName: coach.user.lastName,
    email: coach.user.email,
    avatarUrl: null,
  });
}

export function AdminClassPackageDrawer({
  pkg,
  allCoaches,
  locale,
  onClose,
  onChanged,
}: AdminClassPackageDrawerProps) {
  const t = useTranslations("adminPages.packages");
  const [selectedCoachIds, setSelectedCoachIds] = useState<string[]>([]);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const submitLockRef = useRef(false);

  const initialCoachIds = useMemo(
    () => (pkg === null ? [] : pkg.assignedCoaches.map((coach) => coach.id)),
    [pkg],
  );

  useEffect(() => {
    setSelectedCoachIds(initialCoachIds);
    setMessage(null);
  }, [initialCoachIds, pkg?.id]);

  useEffect(() => {
    if (pkg === null) {
      return undefined;
    }
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, pkg]);

  if (pkg === null || typeof document === "undefined") {
    return null;
  }

  const stats = pkg.sessionStats;
  const priceLabel =
    stats.maxPriceCents !== null
      ? stats.minPriceCents !== null && stats.minPriceCents !== stats.maxPriceCents
        ? `${formatAmdFromCents(stats.minPriceCents, locale)} – ${formatAmdFromCents(stats.maxPriceCents, locale)}`
        : formatAmdFromCents(stats.maxPriceCents, locale)
      : t("notAvailable");

  async function saveCoachAssignments() {
    if (pending || submitLockRef.current || pkg === null) {
      return;
    }
    const classTypeId = pkg.id;
    const toAdd = selectedCoachIds.filter((id) => !initialCoachIds.includes(id));
    const toRemove = initialCoachIds.filter((id) => !selectedCoachIds.includes(id));
    if (toAdd.length === 0 && toRemove.length === 0) {
      return;
    }

    submitLockRef.current = true;
    setPending(true);
    setMessage(null);
    try {
      const changedCoachIds = new Set([...toAdd, ...toRemove]);
      const updates = [...changedCoachIds].map(async (coachId) => {
        const coach = allCoaches.find((row) => row.id === coachId);
        if (coach === undefined) {
          return;
        }
        const shouldAssign = selectedCoachIds.includes(coachId);
        const nextIds = shouldAssign
          ? [...new Set([...coach.assignedClassTypeIds, classTypeId])]
          : coach.assignedClassTypeIds.filter((id) => id !== classTypeId);
        await apiFetch(`/coaches/${coachId}`, {
          method: "PATCH",
          body: JSON.stringify({ assignedClassTypeIds: nextIds }),
        });
      });
      await Promise.all(updates);
      setTone("ok");
      setMessage(t("messages.coachesUpdated"));
      onChanged();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setPending(false);
      submitLockRef.current = false;
    }
  }

  async function removePackage() {
    if (pending || pkg === null) {
      return;
    }
    const classTypeId = pkg.id;
    if (!window.confirm(t("deleteConfirm"))) {
      return;
    }
    setPending(true);
    setMessage(null);
    try {
      await apiFetch(`/classes/types/${classTypeId}`, { method: "DELETE" });
      setTone("ok");
      setMessage(t("messages.deleteSuccess"));
      onChanged();
      onClose();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : t("genericError"));
    } finally {
      setPending(false);
    }
  }

  function toggleCoach(coachId: string) {
    setSelectedCoachIds((current) =>
      current.includes(coachId)
        ? current.filter((id) => id !== coachId)
        : [...current, coachId],
    );
  }

  const coachAssignmentDirty =
    selectedCoachIds.length !== initialCoachIds.length ||
    selectedCoachIds.some((id) => !initialCoachIds.includes(id));

  return createPortal(
    <div className="fixed inset-0 z-40 flex justify-end bg-sage-950/35">
      <button type="button" className="flex-1" onClick={onClose} aria-label={t("drawerClose")} />
      <aside className="h-full w-full max-w-md overflow-y-auto border-l border-white/60 bg-white/95 p-5 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl font-semibold text-sage-900">{pkg.name}</h3>
            <p className="mt-1 text-xs text-sage-500">{pkg.slug}</p>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-sage-500 hover:bg-sage-50"
            onClick={onClose}
            aria-label={t("drawerClose")}
          >
            ×
          </button>
        </div>

        <dl className="space-y-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-sage-500">{t("fieldDescription")}</dt>
            <dd className="mt-1 text-sage-800">{pkg.description ?? t("notAvailable")}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-sage-500">{t("drawerSessions")}</dt>
            <dd className="mt-1 text-sage-800">
              {stats.sessionCount > 0
                ? t("drawerSessionCount", { count: stats.sessionCount })
                : t("drawerNoSessions")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-sage-500">{t("drawerLevels")}</dt>
            <dd className="mt-1 text-sage-800">
              {stats.levels.length > 0 ? stats.levels.join(", ") : t("notAvailable")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-sage-500">{t("drawerCapacity")}</dt>
            <dd className="mt-1 text-sage-800">
              {stats.maxCapacity !== null
                ? t("drawerCapacityRange", {
                    min: stats.minCapacity ?? stats.maxCapacity,
                    max: stats.maxCapacity,
                  })
                : t("notAvailable")}
            </dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-sage-500">{t("drawerPrice")}</dt>
            <dd className="mt-1 text-sage-800">{priceLabel}</dd>
          </div>
        </dl>

        <div className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-sage-500">
            {t("drawerCoaches")}
          </p>
          <ul className="mt-2 max-h-48 space-y-2 overflow-y-auto">
            {allCoaches.map((coach) => (
              <li key={coach.id}>
                <label className="flex items-center gap-2 rounded-xl border border-white/60 bg-white/50 px-3 py-2">
                  <input
                    type="checkbox"
                    checked={selectedCoachIds.includes(coach.id)}
                    onChange={() => toggleCoach(coach.id)}
                    disabled={pending || !coach.isActive}
                  />
                  <span className="text-sm text-sage-800">{coachLabel(coach)}</span>
                  {!coach.isActive ? (
                    <span className="text-xs text-sage-500">({t("coachInactive")})</span>
                  ) : null}
                </label>
              </li>
            ))}
          </ul>
          {coachAssignmentDirty ? (
            <OmmButton
              type="button"
              variant="primary"
              size="sm"
              className="mt-3"
              disabled={pending}
              onClick={() => {
                void saveCoachAssignments();
              }}
            >
              {pending ? t("savingButton") : t("saveCoachAssignments")}
            </OmmButton>
          ) : null}
        </div>

        <p className="mt-4 text-xs text-sage-500">{t("editUnsupportedHint")}</p>

        <div className="mt-6 flex flex-wrap gap-2 border-t border-white/50 pt-4">
          <OmmButton
            type="button"
            variant="danger"
            size="sm"
            disabled={pending}
            onClick={() => {
              void removePackage();
            }}
          >
            {t("deleteButton")}
          </OmmButton>
        </div>

        {message !== null ? (
          <p className={`mt-3 text-xs ${tone === "ok" ? "text-sage-700" : "text-red-800"}`}>
            {message}
          </p>
        ) : null}
      </aside>
    </div>,
    document.body,
  );
}
