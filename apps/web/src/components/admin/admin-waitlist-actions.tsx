"use client";

import { useState } from "react";
import { AdminSmallActionButton } from "@/components/admin/admin-small-action-button";
import { ApiError, apiFetch } from "@/lib/api";

type AdminWaitlistActionsProps = {
  entryId: string;
  sessionId: string;
  locale?: string;
};

function getWaitlistActionLabels(locale: string) {
  if (locale === "hy") {
    return {
      actionFailed: "Գործողությունը չհաջողվեց",
      entryPromoted: "Մուտքը առաջխաղացվեց",
      entryRemoved: "Մուտքը հեռացվեց",
      notificationSent: "Ծանուցումը ուղարկվեց",
      promote: "Առաջխաղացնել",
      remove: "Հեռացնել",
      notify: "Ծանուցել",
      optionalMessage: "Ընտրովի ծանուցման հաղորդագրություն",
    };
  }
  if (locale === "ru") {
    return {
      actionFailed: "Действие не выполнено",
      entryPromoted: "Запись повышена",
      entryRemoved: "Запись удалена",
      notificationSent: "Уведомление отправлено",
      promote: "Повысить",
      remove: "Удалить",
      notify: "Уведомить",
      optionalMessage: "Необязательное сообщение уведомления",
    };
  }
  return {
    actionFailed: "Action failed",
    entryPromoted: "Entry promoted",
    entryRemoved: "Entry removed",
    notificationSent: "Notification sent",
    promote: "Promote",
    remove: "Remove",
    notify: "Notify",
    optionalMessage: "Optional notification message",
  };
}

export function AdminWaitlistActions({
  entryId,
  sessionId,
  locale = "en",
}: AdminWaitlistActionsProps) {
  const labels = getWaitlistActionLabels(locale);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [tone, setTone] = useState<"ok" | "err">("ok");
  const [notifyMessage, setNotifyMessage] = useState("");

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
      setMessage(error instanceof ApiError ? error.message : labels.actionFailed);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-w-[16rem] flex-col gap-2">
      <div className="flex flex-wrap gap-2">
        <AdminSmallActionButton
          tone="success"
          disabled={busy}
          onClick={() =>
            void run(
              () =>
                apiFetch(`/waitlist/entries/${entryId}/promote`, {
                  method: "POST",
                  body: JSON.stringify({ targetSessionId: sessionId }),
                }),
              labels.entryPromoted,
            )
          }
        >
          {labels.promote}
        </AdminSmallActionButton>
        <AdminSmallActionButton
          tone="danger"
          disabled={busy}
          onClick={() =>
            void run(
              () => apiFetch(`/waitlist/entries/${entryId}`, { method: "DELETE" }),
              labels.entryRemoved,
            )
          }
        >
          {labels.remove}
        </AdminSmallActionButton>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          className="app-input h-9 text-xs"
          placeholder={labels.optionalMessage}
          value={notifyMessage}
          onChange={(event) => setNotifyMessage(event.target.value)}
          disabled={busy}
        />
        <AdminSmallActionButton
          disabled={busy}
          onClick={() =>
            void run(
              () =>
                apiFetch(`/waitlist/entries/${entryId}/notify`, {
                  method: "POST",
                  body: JSON.stringify({
                    message: notifyMessage.trim() || undefined,
                  }),
                }),
              labels.notificationSent,
            )
          }
        >
          {labels.notify}
        </AdminSmallActionButton>
      </div>
      {message ? (
        <p className={`text-xs ${tone === "ok" ? "text-sage-700" : "text-red-800"}`}>
          {message}
        </p>
      ) : null}
    </div>
  );
}
