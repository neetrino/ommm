"use client";

import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
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
        <label key={key} className="flex items-center gap-2 text-sm text-zinc-800">
          <input
            type="checkbox"
            checked={prefs[key]}
            onChange={() => toggle(key)}
            className="h-4 w-4 rounded border-zinc-300"
          />
          {label}
        </label>
      ))}
      <button
        type="button"
        disabled={busy}
        onClick={() => void save()}
        className="w-fit rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-50"
      >
        Save preferences
      </button>
      {msg ? <p className="text-sm text-zinc-600">{msg}</p> : null}
    </div>
  );
}
