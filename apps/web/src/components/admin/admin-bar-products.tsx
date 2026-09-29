"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError, apiFetch } from "@/lib/api";

type BarProduct = { id: string; name: string; priceAmd: number; active: boolean };

const FIELD_CLASS = "h-10 rounded-xl border border-sand-500/30 bg-white px-3 text-sm";

export function AdminBarProducts() {
  const t = useTranslations("adminPages.giftCards.actions");
  const [products, setProducts] = useState<BarProduct[]>([]);
  const [name, setName] = useState("");
  const [priceAmd, setPriceAmd] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void reload(setProducts, setError, t("failed"));
  }, []);

  return (
    <section className="mt-6 space-y-3 rounded-[24px] border border-white/70 bg-white/80 p-4">
      <h2 className="text-sm font-semibold text-sage-900">{t("barTitle")}</h2>
      {error !== null ? <p className="text-sm text-red-800">{error}</p> : null}
      <div className="flex flex-wrap items-center gap-2">
        <input className={FIELD_CLASS} value={name} placeholder={t("barName")} onChange={(event) => setName(event.target.value)} />
        <input className={`${FIELD_CLASS} w-32`} inputMode="numeric" value={priceAmd} placeholder={t("barPrice")} onChange={(event) => setPriceAmd(event.target.value)} />
        <OmmButton type="button" variant="secondary" size="sm" onClick={() => void createProduct(name, priceAmd, t("failed"), setError, setName, setPriceAmd, setProducts)}>
          {t("barAdd")}
        </OmmButton>
      </div>
      <ul className="space-y-2 text-sm text-sage-800">
        {products.map((product) => (
          <li key={product.id} className="flex items-center justify-between gap-2">
            <span>{product.name} · {product.priceAmd}</span>
            <OmmButton type="button" variant="ghost" size="sm" onClick={() => void toggleProduct(product, t("failed"), setError, setProducts)}>
              {product.active ? t("barActive") : t("barInactive")}
            </OmmButton>
          </li>
        ))}
      </ul>
    </section>
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
