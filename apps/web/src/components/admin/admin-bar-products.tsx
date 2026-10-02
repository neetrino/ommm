"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { AmdMoneyInput } from "@/components/ui/amd-money-input";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";
import { formatAmdFromMajor } from "@/lib/price-amd";

type BarProduct = { id: string; name: string; priceAmd: number; active: boolean };

const BAR_SHELL_CLASS =
  "rounded-[28px] border border-white/80 bg-white/95 shadow-[0_28px_64px_-36px_rgba(45,40,35,0.38)]";
const BAR_FIELD_CLASS = "!h-14 !rounded-2xl bg-white px-4 text-base";
const BAR_LABEL_CLASS = "text-sm font-medium text-sage-700";

export function AdminBarProducts() {
  const t = useTranslations("adminPages.giftCards.actions");
  const [products, setProducts] = useState<BarProduct[]>([]);
  const [name, setName] = useState("");
  const [priceAmd, setPriceAmd] = useState("");
  const [error, setError] = useState<string | null>(null);
  const failed = t("failed");

  useEffect(() => {
    void reload(setProducts, setError, failed);
  }, [failed]);

  return (
    <section className={BAR_SHELL_CLASS}>
      <div className="space-y-5 px-5 py-7 sm:px-8 sm:py-8">
        <h2 className="font-serif text-2xl font-normal leading-tight tracking-tight text-sage-900">
          {t("barTitle")}
        </h2>
        {error !== null ? <p className="text-sm text-red-800">{error}</p> : null}
        <BarProductForm
          name={name}
          priceAmd={priceAmd}
          nameLabel={t("barName")}
          priceLabel={t("barPrice")}
          addLabel={t("barAdd")}
          onName={setName}
          onPrice={setPriceAmd}
          onAdd={() =>
            void createProduct(name, priceAmd, failed, setError, setName, setPriceAmd, setProducts)
          }
        />
        <BarProductList
          products={products}
          activeLabel={t("barActive")}
          inactiveLabel={t("barInactive")}
          onToggle={(product) => void toggleProduct(product, failed, setError, setProducts)}
        />
      </div>
    </section>
  );
}

function BarProductForm(props: {
  name: string;
  priceAmd: string;
  nameLabel: string;
  priceLabel: string;
  addLabel: string;
  onName: (value: string) => void;
  onPrice: (value: string) => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-[22px] border border-sand-100/80 bg-sand-50/50 p-4 sm:flex-row sm:items-end">
      <label className="flex min-w-0 flex-1 flex-col gap-2">
        <span className={BAR_LABEL_CLASS}>{props.nameLabel}</span>
        <input
          className={`ommm-input ${BAR_FIELD_CLASS}`}
          value={props.name}
          placeholder={props.nameLabel}
          onChange={(event) => props.onName(event.target.value)}
        />
      </label>
      <label className="flex w-full flex-col gap-2 sm:w-44">
        <span className={BAR_LABEL_CLASS}>{props.priceLabel}</span>
        <AmdMoneyInput
          value={props.priceAmd}
          align="start"
          placeholder={props.priceLabel}
          aria-label={props.priceLabel}
          className={BAR_FIELD_CLASS}
          onValueChange={props.onPrice}
        />
      </label>
      <OmmButton type="button" variant="primary" className="h-14 w-full sm:w-auto" onClick={props.onAdd}>
        {props.addLabel}
      </OmmButton>
    </div>
  );
}

function BarProductList(props: {
  products: readonly BarProduct[];
  activeLabel: string;
  inactiveLabel: string;
  onToggle: (product: BarProduct) => void;
}) {
  if (props.products.length === 0) {
    return null;
  }
  return (
    <ul className="space-y-2">
      {props.products.map((product) => (
        <BarProductRow
          key={product.id}
          product={product}
          activeLabel={props.activeLabel}
          inactiveLabel={props.inactiveLabel}
          onToggle={props.onToggle}
        />
      ))}
    </ul>
  );
}

function BarProductRow(props: {
  product: BarProduct;
  activeLabel: string;
  inactiveLabel: string;
  onToggle: (product: BarProduct) => void;
}) {
  const price = formatAmdFromMajor(props.product.priceAmd);
  const statusClass = props.product.active
    ? "bg-sage-800 text-white"
    : "border border-sand-500/30 bg-white text-sage-700";
  return (
    <li className="flex items-center justify-between gap-3 rounded-2xl border border-sand-100 bg-white px-4 py-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-sage-900">{props.product.name}</p>
        <p className="mt-0.5 text-sm text-sage-500">{price}</p>
      </div>
      <button
        type="button"
        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.08em] ${statusClass}`}
        onClick={() => props.onToggle(props.product)}
      >
        {props.product.active ? props.activeLabel : props.inactiveLabel}
      </button>
    </li>
  );
}

async function reload(
  setProducts: (rows: BarProduct[]) => void,
  setError: (value: string | null) => void,
  failedLabel: string,
): Promise<void> {
  try {
    setProducts(await apiFetch<BarProduct[]>("/bar/admin/products"));
    setError(null);
  } catch (caught) {
    setError(caught instanceof ApiError ? caught.message : failedLabel);
  }
}

async function createProduct(
  name: string,
  priceAmd: string,
  failedLabel: string,
  setError: (value: string | null) => void,
  setName: (value: string) => void,
  setPrice: (value: string) => void,
  setProducts: (rows: BarProduct[]) => void,
): Promise<void> {
  const price = Number(priceAmd);
  if (name.trim() === "" || !Number.isInteger(price) || price < 1) {
    setError(failedLabel);
    return;
  }
  try {
    await apiFetch("/bar/admin/products", {
      method: "POST",
      body: JSON.stringify({ name: name.trim(), priceAmd: price }),
    });
    setName("");
    setPrice("");
    await reload(setProducts, setError, failedLabel);
  } catch (caught) {
    setError(caught instanceof ApiError ? caught.message : failedLabel);
  }
}

async function toggleProduct(
  product: BarProduct,
  failedLabel: string,
  setError: (value: string | null) => void,
  setProducts: (rows: BarProduct[]) => void,
): Promise<void> {
  try {
    await apiFetch(`/bar/admin/products/${product.id}`, {
      method: "PATCH",
      body: JSON.stringify({ active: !product.active }),
    });
    await reload(setProducts, setError, failedLabel);
  } catch (caught) {
    setError(caught instanceof ApiError ? caught.message : failedLabel);
  }
}
