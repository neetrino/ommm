"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { BarNameField, BarPriceField } from "@/components/admin/admin-bar-fields";
import { AnimatedToggleSwitch } from "@/components/ui/animated-toggle-switch";
import { AdminRowIconButton } from "@/components/ui/admin-row-icon-button";
import { EditActionButton } from "@/components/ui/edit-action-button";
import { OmmButton } from "@/components/ui/omm-button";
import { formatAmdFromMajor } from "@/lib/price-amd";
import { parseBarPriceAmd, type BarProduct } from "@/components/admin/admin-bar-products-api";

type BarProductListProps = {
  products: readonly BarProduct[];
  editingId: string | null;
  busy: boolean;
  onEdit: (product: BarProduct) => void;
  onCancel: () => void;
  onSave: (id: string, name: string, priceAmd: string) => void;
  onToggle: (product: BarProduct) => void;
};

export function BarProductList(props: BarProductListProps) {
  const t = useTranslations("adminPages.giftCards.actions");
  if (props.products.length === 0) {
    return <p className="px-1 text-sm text-sage-500">{t("barEmpty")}</p>;
  }
  return (
    <ul className="overflow-hidden rounded-[22px] border border-sand-100 bg-white">
      {props.products.map((product) => (
        <li key={product.id} className="border-b border-sand-100 last:border-b-0">
          {props.editingId === product.id ? (
            <BarProductEditor
              product={product}
              busy={props.busy}
              onCancel={props.onCancel}
              onSave={props.onSave}
            />
          ) : (
            <BarProductView
              product={product}
              busy={props.busy}
              onEdit={() => props.onEdit(product)}
              onToggle={() => props.onToggle(product)}
            />
          )}
        </li>
      ))}
    </ul>
  );
}

function BarProductView(props: {
  product: BarProduct;
  busy: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const t = useTranslations("adminPages.giftCards.actions");
  const tCards = useTranslations("adminPages.giftCards");
  const statusLabel = props.product.active ? tCards("deactivateGiftCard") : tCards("activateGiftCard");
  return (
    <div
      className={`flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between ${
        props.product.active ? "" : "bg-sand-50/70"
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-base font-medium text-sage-900">{props.product.name}</p>
        <p className="mt-0.5 text-sm text-sage-500">{formatAmdFromMajor(props.product.priceAmd)}</p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <AdminRowIconButton
          ariaLabel={statusLabel}
          title={statusLabel}
          className="ommm-admin-row-icon-button-toggle"
          disabled={props.busy}
          aria-checked={props.product.active}
          role="switch"
          onClick={props.onToggle}
        >
          <AnimatedToggleSwitch checked={props.product.active} />
        </AdminRowIconButton>
        <EditActionButton
          label={t("barEdit")}
          ariaLabel={t("barEditAria", { name: props.product.name })}
          disabled={props.busy}
          onClick={props.onEdit}
        />
      </div>
    </div>
  );
}

function BarProductEditor(props: {
  product: BarProduct;
  busy: boolean;
  onCancel: () => void;
  onSave: (id: string, name: string, priceAmd: string) => void;
}) {
  const t = useTranslations("adminPages.giftCards.actions");
  const [name, setName] = useState(props.product.name);
  const [priceAmd, setPriceAmd] = useState(String(props.product.priceAmd));
  const canSave = name.trim().length > 0 && parseBarPriceAmd(priceAmd) !== null;

  return (
    <form
      className="flex flex-col gap-3 bg-sand-50/80 px-4 py-4 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        if (canSave) {
          props.onSave(props.product.id, name, priceAmd);
        }
      }}
    >
      <div className="min-w-0 flex-1">
        <BarNameField label={t("barName")} value={name} onChange={setName} />
      </div>
      <BarPriceField label={t("barPrice")} value={priceAmd} onChange={setPriceAmd} />
      <div className="flex gap-2">
        <OmmButton type="submit" size="sm" className="h-12 px-5" disabled={props.busy || !canSave}>
          {t("barSave")}
        </OmmButton>
        <OmmButton type="button" size="sm" variant="ghost" className="h-12 px-4" disabled={props.busy} onClick={props.onCancel}>
          {t("barCancel")}
        </OmmButton>
      </div>
    </form>
  );
}
