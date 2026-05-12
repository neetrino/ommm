"use client";

import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

type Prefs = {
  bookingReminders: boolean;
  waitlistAlerts: boolean;
  promotions: boolean;
  communityUpdates: boolean;
};

type Props = {
  initial: Prefs;
};

export function NotificationPrefsForm({ initial }: Props) {
  const router = useRouter();
  const [prefs, setPrefs] = useState<Prefs>(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save() {
    setBusy(true);
    setMsg(null);
    try {
      await apiFetch("/users/me/notifications", {
        method: "PATCH",
        body: JSON.stringify(prefs),
      });
      router.refresh();
      setMsg("Saved");
    } catch (e) {
      setMsg(e instanceof ApiError ? e.message : "Could not save");
    } finally {
      setBusy(false);
    }
  }

  function toggle<K extends keyof Prefs>(key: K) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  return (
    <div className="flex flex-col gap-4">
      {(
        [
          ["bookingReminders", "Booking reminders"],
          ["waitlistAlerts", "Waitlist alerts"],
          ["promotions", "Promotions"],
          ["communityUpdates", "Community updates"],
        ] as const
      ).map(([key, label]) => (
        <label
          key={key}
          className="flex items-center gap-2 text-sm text-sage-700"
        >
          <input
            type="checkbox"
            checked={prefs[key]}
            onChange={() => toggle(key)}
            className="h-4 w-4 rounded border-sand-500/40 accent-sand-500 focus:ring-sand-500/30"
          />
          {label}
        </label>
      ))}
      <OmmButton
        type="button"
        variant="primary"
        size="sm"
        className="w-fit"
        disabled={busy}
        onClick={() => void save()}
      >
        Save preferences
      </OmmButton>
      {msg ? <p className="text-sm text-sage-500">{msg}</p> : null}
    </div>
  );
}
