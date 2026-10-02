"use client";

import { useEffect, useState } from "react";
import { GiftOptionSelect } from "@/components/account/custom-gift-option-fields";
import {
  plansForClassType,
  type CartPlanOption,
} from "@/components/account/studio-cart-class-plans";
import type { OmmSelectOption } from "@/components/ui/omm-select-dropdown";
import { apiFetch } from "@/lib/api";
import { formatSessionRange } from "@/lib/format-session-time";

type GiftPlan = CartPlanOption & {
  typeSessionAllocations?: ReadonlyArray<{ classTypeId: string; sessionCount?: number }>;
};

type GiftSession = {
  id: string;
  startsAt: string;
  endsAt: string;
  classType: { id: string; name: string };
};

type NamedRow = { id: string; name: string };

type CustomGiftClassChoicesProps = {
  classTypeId: string;
  classTypes: readonly NamedRow[];
  disabled: boolean;
  classPlaceholder: string;
  classTypeLabel: string;
  packageLabel: string;
  sessionLabel: string;
  skipLabel: string;
  onClassTypeChange: (classTypeId: string) => void;
  onClassSessionsChange: (classSessions: string) => void;
};

/** Class type, then that type's packages, then a scheduled class with its time. */
export function CustomGiftClassChoices(props: CustomGiftClassChoicesProps) {
  return (
    <div className="grid gap-4">
      <GiftOptionSelect
        label={props.classTypeLabel}
        value={props.classTypeId}
        disabled={props.disabled}
        options={namedOptions(props.classPlaceholder, props.classTypes)}
        onChange={(value) => {
          props.onClassTypeChange(value);
          props.onClassSessionsChange("");
        }}
      />
      {props.classTypeId.length > 0 ? (
        <GiftPackageAndClass
          key={props.classTypeId}
          classTypeId={props.classTypeId}
          disabled={props.disabled}
          packageLabel={props.packageLabel}
          sessionLabel={props.sessionLabel}
          skipLabel={props.skipLabel}
          onClassSessionsChange={props.onClassSessionsChange}
        />
      ) : null}
    </div>
  );
}

function GiftPackageAndClass({
  classTypeId,
  disabled,
  packageLabel,
  sessionLabel,
  skipLabel,
  onClassSessionsChange,
}: {
  classTypeId: string;
  disabled: boolean;
  packageLabel: string;
  sessionLabel: string;
  skipLabel: string;
  onClassSessionsChange: (classSessions: string) => void;
}) {
  const catalog = useGiftClassCatalog(classTypeId);
  const [packageId, setPackageId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const packages = plansForClassType(catalog.plans, classTypeId);

  function publish(nextPackageId: string, nextSessionId: string): void {
    if (nextSessionId.length === 0) {
      onClassSessionsChange("");
      return;
    }
    onClassSessionsChange(String(packageSessionCount(catalog.plans, nextPackageId, classTypeId)));
  }

  return (
    <>
      <GiftOptionSelect
        label={packageLabel}
        value={packageId}
        disabled={disabled}
        options={namedOptions(skipLabel, packages)}
        onChange={(value) => {
          setPackageId(value);
          publish(value, sessionId);
        }}
      />
      <GiftOptionSelect
        label={sessionLabel}
        value={sessionId}
        disabled={disabled}
        options={sessionOptions(skipLabel, catalog.sessions)}
        onChange={(value) => {
          setSessionId(value);
          publish(packageId, value);
        }}
      />
    </>
  );
}

function useGiftClassCatalog(classTypeId: string): {
  plans: readonly GiftPlan[];
  sessions: readonly GiftSession[];
} {
  const [plans, setPlans] = useState<readonly GiftPlan[]>([]);
  const [sessions, setSessions] = useState<readonly GiftSession[]>([]);
  useEffect(() => {
    let cancelled = false;
    void Promise.all([
      apiFetch<GiftPlan[]>("/packages/plans").catch(() => []),
      apiFetch<GiftSession[]>(`/classes/sessions?typeId=${encodeURIComponent(classTypeId)}`).catch(() => []),
    ]).then(([nextPlans, nextSessions]) => {
      if (!cancelled) {
        setPlans(nextPlans);
        setSessions(nextSessions);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [classTypeId]);
  return { plans, sessions };
}

function packageSessionCount(
  plans: readonly GiftPlan[],
  packageId: string,
  classTypeId: string,
): number {
  const plan = plans.find((item) => item.id === packageId);
  const allocation = plan?.typeSessionAllocations?.find((item) => item.classTypeId === classTypeId);
  if (allocation?.sessionCount !== undefined && allocation.sessionCount > 0) {
    return allocation.sessionCount;
  }
  return 1;
}

function namedOptions(emptyLabel: string, rows: readonly NamedRow[]): OmmSelectOption<string>[] {
  return [{ value: "", label: emptyLabel }, ...rows.map((row) => ({ value: row.id, label: row.name }))];
}

function sessionOptions(emptyLabel: string, sessions: readonly GiftSession[]): OmmSelectOption<string>[] {
  return [
    { value: "", label: emptyLabel },
    ...sessions.map((session) => ({
      value: session.id,
      label: `${session.classType.name} · ${formatSessionRange(session.startsAt, session.endsAt)}`,
    })),
  ];
}
