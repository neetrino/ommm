"use client";

import { useTranslations } from "next-intl";
import type { ContentPostFormValues } from "@/components/shared/content/content-post-types";
import {
  CONTENT_POST_STATUSES,
  CONTENT_POST_TYPES,
  type ContentPostStatus,
  type ContentPostType,
} from "@/components/shared/content/content-post-types";
import { OmmSelectDropdown } from "@/components/ui/omm-select-dropdown";

type ContentPostTypeStatusFieldsProps = {
  values: ContentPostFormValues;
  disabled?: boolean;
  layout: "stacked" | "inline";
  onChange: (next: ContentPostFormValues) => void;
};

const TYPE_STATUS_LABEL_CLASS =
  "text-xs font-semibold uppercase tracking-[0.08em] text-sage-500";

const TYPE_STATUS_INLINE_FIELD_CLASS = "min-w-0 max-w-[8.75rem]";

type SharedSelectProps = {
  values: ContentPostFormValues;
  disabled: boolean;
  onChange: (next: ContentPostFormValues) => void;
};

function ContentPostTypeSelect({ values, disabled, onChange }: SharedSelectProps) {
  const t = useTranslations("contentAdminPages.content");
  return (
    <OmmSelectDropdown<ContentPostType>
      ariaLabel={t("labels.type")}
      value={values.type}
      disabled={disabled}
      triggerClassName="ommm-dropdown-trigger--compact"
      options={CONTENT_POST_TYPES.map((value) => ({
        value,
        label: t(`typeValues.${value}`),
      }))}
      onChange={(next) => onChange({ ...values, type: next })}
    />
  );
}

function ContentPostStatusSelect({ values, disabled, onChange }: SharedSelectProps) {
  const t = useTranslations("contentAdminPages.content");
  return (
    <OmmSelectDropdown<ContentPostStatus>
      ariaLabel={t("labels.status")}
      value={values.status}
      disabled={disabled}
      triggerClassName="ommm-dropdown-trigger--compact"
      options={CONTENT_POST_STATUSES.map((value) => ({
        value,
        label: t(`statusValues.${value}`),
      }))}
      onChange={(next) => onChange({ ...values, status: next })}
    />
  );
}

/** Type and status dropdowns — stacked in the form, inline in the mobile sheet header. */
export function ContentPostTypeStatusFields({
  values,
  disabled = false,
  layout,
  onChange,
}: ContentPostTypeStatusFieldsProps) {
  const t = useTranslations("contentAdminPages.content");

  if (layout === "inline") {
    return (
      <div className="flex shrink-0 items-center gap-2">
        <div className={TYPE_STATUS_INLINE_FIELD_CLASS}>
          <ContentPostTypeSelect values={values} disabled={disabled} onChange={onChange} />
        </div>
        <div className={TYPE_STATUS_INLINE_FIELD_CLASS}>
          <ContentPostStatusSelect values={values} disabled={disabled} onChange={onChange} />
        </div>
      </div>
    );
  }

  return (
    <>
      <label className="flex flex-col gap-1.5">
        <span className={TYPE_STATUS_LABEL_CLASS} title={t("fieldHints.type")}>
          {t("labels.type")}
        </span>
        <ContentPostTypeSelect values={values} disabled={disabled} onChange={onChange} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className={TYPE_STATUS_LABEL_CLASS} title={t("fieldHints.status")}>
          {t("labels.status")}
        </span>
        <ContentPostStatusSelect values={values} disabled={disabled} onChange={onChange} />
      </label>
    </>
  );
}
