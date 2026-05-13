"use client";

import { useState } from "react";
import { ApiError, apiFetch } from "@/lib/api";

type AdminClientActionsProps = {
  clientId: string;
  initialEmail: string;
  initialName: string;
  initialLastName: string;
  initialPhone: string;
};

export function AdminClientActions({
  clientId,
  initialEmail,
  initialName,
  initialLastName,
  initialPhone,
}: AdminClientActionsProps) {
  const [email, setEmail] = useState(initialEmail);
  const [name, setName] = useState(initialName);
  const [lastName, setLastName] = useState(initialLastName);
  const [phone, setPhone] = useState(initialPhone);
  const [note, setNote] = useState("");
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
    <div className="flex min-w-[24rem] flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <input
          type="text"
          className="app-input h-9 text-xs"
          placeholder="First name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={busy}
        />
        <input
          type="text"
          className="app-input h-9 text-xs"
          placeholder="Last name"
          value={lastName}
          onChange={(event) => setLastName(event.target.value)}
          disabled={busy}
        />
        <input
          type="email"
          className="app-input h-9 text-xs"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={busy}
        />
        <input
          type="text"
          className="app-input h-9 text-xs"
          placeholder="Phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          disabled={busy}
        />
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          disabled={busy}
          onClick={() =>
            void run(
              () =>
                apiFetch(`/clients/${clientId}`, {
                  method: "PATCH",
                  body: JSON.stringify({
                    email: email.trim().toLowerCase(),
                    name: name.trim(),
                    lastName: lastName.trim(),
                    phone: phone.trim(),
                  }),
                }),
              "Client updated",
            )
          }
        >
          Update
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="app-input h-9 text-xs"
          placeholder="Internal note"
          value={note}
          onChange={(event) => setNote(event.target.value)}
          disabled={busy}
        />
        <button
          type="button"
          className="rounded-md border border-slate-300 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          disabled={busy || note.trim() === ""}
          onClick={() =>
            void run(
              () =>
                apiFetch(`/clients/${clientId}/notes`, {
                  method: "POST",
                  body: JSON.stringify({ body: note.trim() }),
                }),
              "Note added",
            )
          }
        >
          Add note
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
