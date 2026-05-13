"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type AdminCoachActionsProps = {
  coachId: string;
  initialSpecialization: string;
  initialBio: string;
};

export function AdminCoachActions({
  coachId,
  initialSpecialization,
  initialBio,
}: AdminCoachActionsProps) {
  const [specialization, setSpecialization] = useState(initialSpecialization);
  const [bio, setBio] = useState(initialBio);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");

  async function run(action: () => Promise<void>, okLabel: string) {
    if (busy) {
      return;
    }
    setBusy(true);
    setMessage(null);
    try {
      await action();
      setTone("ok");
      setMessage(okLabel);
      window.location.reload();
    } catch (error) {
      setTone("err");
      setMessage(error instanceof ApiError ? error.message : "Action failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-[20rem] flex-col gap-2">
      <input
        type="text"
        className="app-input h-9 text-xs"
        placeholder="Specialization"
        value={specialization}
        onChange={(event) => setSpecialization(event.target.value)}
        disabled={busy}
      />
      <input
        type="text"
        className="app-input h-9 text-xs"
        placeholder="Bio"
        value={bio}
        onChange={(event) => setBio(event.target.value)}
        disabled={busy}
      />
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          disabled={busy}
          onClick={() =>
            void run(
              () =>
                apiFetch(`/coaches/${coachId}`, {
                  method: "PATCH",
                  body: JSON.stringify({
                    specialization: specialization.trim() || null,
                    bio: bio.trim() || null,
                  }),
                }),
              "Coach updated",
            )
          }
        >
          Update
        </button>
        <button
          type="button"
          className="rounded-md border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
          disabled={busy}
          onClick={() =>
            void run(
              () =>
                apiFetch(`/coaches/${coachId}`, {
                  method: "PATCH",
                  body: JSON.stringify({ isActive: false }),
                }),
              "Coach deactivated",
            )
          }
        >
          Deactivate
        </button>
      </div>
      {message ? (
        <p className={`text-xs ${tone === "ok" ? "text-sage-700" : "text-red-800"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
