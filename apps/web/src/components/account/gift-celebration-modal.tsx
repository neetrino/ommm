"use client";

import { useId, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { MemberProfileAvatar } from "@/components/shell/member-profile-avatar";
import { OmmButton } from "@/components/ui/omm-button";
import { OmmModalPortal } from "@/components/ui/omm-modal";
import { useRouter } from "@/i18n/navigation";
import { formatAmdFromCents } from "@/lib/price-amd";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";
import { USER_GIFT_CARDS_PATH } from "@/lib/user-gift-cards-tab";
import { userDisplayInitials } from "@/lib/user-display-initials";
import styles from "@/components/account/required-phone-completion-gate.module.css";

/** Fixed square so the shared avatar (which fills its parent) stays a circle. */
const GIFT_SENDER_AVATAR_BOX_CLASS = "inline-flex size-8 shrink-0 overflow-hidden rounded-full";
const GIFT_SENDER_AVATAR_CLASS = "size-full rounded-full text-xs";

export type GiftCelebrationView = {
  id: string;
  amountCents: number;
  message: string | null;
  purchaserName?: string | null;
  purchaserAvatarUrl?: string | null;
};

type GiftCelebrationModalProps = {
  card: GiftCelebrationView;
  locale: string;
  onClose: () => void;
};

export function GiftCelebrationModal({
  card,
  locale,
  onClose,
}: GiftCelebrationModalProps) {
  const t = useTranslations("userPages.giftCards.celebration");
  const router = useRouter();
  const titleId = useId();
  const descId = useId();
  const sender = card.purchaserName?.trim() ?? "";
  const note = card.message?.trim() ?? "";

  return (
    <OmmModalPortal
      isOpen
      onClose={onClose}
      dialogRole="dialog"
      ariaLabelledBy={titleId}
      ariaDescribedBy={descId}
      backdropAriaLabel={t("backdropAria")}
      centered
      overlayClassName={`${styles.overlay} ommm-modal-overlay z-[120] items-center p-4`}
      panelClassName={`${styles.panel} max-h-[min(90vh,40rem)] overflow-y-auto`}
    >
      <GiftCelebrationBody
        titleId={titleId}
        descId={descId}
        eyebrow={t("eyebrow")}
        title={t("title")}
        fromLine={
          <GiftFromLine
            sender={sender}
            avatarUrl={card.purchaserAvatarUrl ?? null}
          />
        }
        amountLabel={formatAmdFromCents(card.amountCents, locale)}
        noteLabel={t("noteLabel")}
        note={note}
        closeLabel={t("close")}
        openLabel={t("openGift")}
        onClose={onClose}
        onOpen={() => {
          onClose();
          router.push(USER_GIFT_CARDS_PATH);
        }}
      />
    </OmmModalPortal>
  );
}

type GiftCelebrationBodyProps = {
  titleId: string;
  descId: string;
  eyebrow: string;
  title: string;
  fromLine: ReactNode;
  amountLabel: string;
  noteLabel: string;
  note: string;
  closeLabel: string;
  openLabel: string;
  onClose: () => void;
  onOpen: () => void;
};

function GiftCelebrationBody(props: GiftCelebrationBodyProps) {
  return (
    <div className={styles.form}>
      <p className={styles.eyebrow}>{props.eyebrow}</p>
      <h2 id={props.titleId} className={styles.title}>
        {props.title}
      </h2>
      <p id={props.descId} className={styles.body}>
        {props.fromLine}
      </p>
      <p className="font-serif text-4xl font-normal tracking-tight text-sage-900">
        {props.amountLabel}
      </p>
      {props.note.length > 0 ? (
        <GiftNote label={props.noteLabel} note={props.note} />
      ) : null}
      <GiftCelebrationActions
        closeLabel={props.closeLabel}
        openLabel={props.openLabel}
        onClose={props.onClose}
        onOpen={props.onOpen}
      />
    </div>
  );
}

function GiftFromLine({
  sender,
  avatarUrl,
}: {
  sender: string;
  avatarUrl: string | null;
}) {
  const t = useTranslations("userPages.giftCards.celebration");
  if (sender.length === 0) {
    return t("fromAnonymous");
  }
  const imageSrc = resolveApiAssetUrl(avatarUrl) ?? null;
  return t.rich("fromNamed", {
    name: sender,
    sender: (chunks) => (
      <span className="inline-flex items-center gap-2 align-middle whitespace-nowrap">
        <span className={GIFT_SENDER_AVATAR_BOX_CLASS}>
          <MemberProfileAvatar
            initials={userDisplayInitials(sender, null)}
            imageSrc={imageSrc}
            className={GIFT_SENDER_AVATAR_CLASS}
            guestIconClassName={GIFT_SENDER_AVATAR_CLASS}
          />
        </span>
        <span>{chunks}</span>
      </span>
    ),
  });
}

function GiftCelebrationActions({
  closeLabel,
  openLabel,
  onClose,
  onOpen,
}: {
  closeLabel: string;
  openLabel: string;
  onClose: () => void;
  onOpen: () => void;
}) {
  return (
    <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:justify-end">
      <OmmButton type="button" variant="secondary" onClick={onClose}>
        {closeLabel}
      </OmmButton>
      <OmmButton type="button" variant="primary" onClick={onOpen}>
        {openLabel}
      </OmmButton>
    </div>
  );
}

function GiftNote({ label, note }: { label: string; note: string }) {
  return (
    <blockquote className="rounded-2xl border border-sand-200/80 bg-sand-50 px-4 py-3">
      <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-sage-500">
        {label}
      </p>
      <p className="mt-2 whitespace-pre-wrap font-serif text-base leading-7 text-sage-800">
        {note}
      </p>
    </blockquote>
  );
}
