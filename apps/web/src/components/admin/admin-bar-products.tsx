"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { BarNameField, BarPriceField } from "@/components/admin/admin-bar-fields";
import { BarProductList } from "@/components/admin/admin-bar-product-list";
import {
  createBarProduct,
  fetchBarProducts,
  parseBarPriceAmd,
  patchBarProduct,
  type BarProduct,
} from "@/components/admin/admin-bar-products-api";
import { OmmButton } from "@/components/ui/omm-button";
import { ApiError } from "@/lib/api";

const BAR_SHELL_CLASS =
  "rounded-[28px] border border-white/80 bg-white/95 shadow-[0_28px_64px_-36px_rgba(45,40,35,0.38)]";

export function AdminBarProducts() {
  const t = useTranslations("adminPages.giftCards.actions");
  const catalog = useBarCatalog(t("failed"), t("barInvalid"));

  return (
    <section className={BAR_SHELL_CLASS}>
      <div className="space-y-5 px-5 py-7 sm:px-8 sm:py-8">
        <header>
          <h2 className="font-serif text-2xl font-normal leading-tight tracking-tight text-sage-900">
            {t("barTitle")}
          </h2>
          <p className="mt-1 text-sm text-sage-600">{t("barHint")}</p>
        </header>
        {catalog.error !== null ? <p className="text-sm text-red-800">{catalog.error}</p> : null}
        <BarAddForm
          name={catalog.name}
          priceAmd={catalog.priceAmd}
          busy={catalog.busy}
          onName={catalog.setName}
          onPrice={catalog.setPriceAmd}
          onAdd={() => void catalog.add()}
        />
        <BarProductList
          products={catalog.products}
          editingId={catalog.editingId}
          busy={catalog.busy}
          onEdit={catalog.beginEdit}
          onCancel={catalog.cancelEdit}
          onSave={(id, name, price) => void catalog.save(id, name, price)}
          onToggle={(product) => void catalog.toggle(product)}
        />
      </div>
    </section>
  );
}

function BarAddForm(props: {
  name: string;
  priceAmd: string;
  busy: boolean;
  onName: (value: string) => void;
  onPrice: (value: string) => void;
  onAdd: () => void;
}) {
  const t = useTranslations("adminPages.giftCards.actions");
  const canAdd = props.name.trim().length > 0 && parseBarPriceAmd(props.priceAmd) !== null;
  return (
    <form
      className="flex flex-col gap-3 sm:flex-row sm:items-end"
      onSubmit={(event) => {
        event.preventDefault();
        if (canAdd) {
          props.onAdd();
        }
      }}
    >
      <div className="min-w-0 flex-1">
        <BarNameField label={t("barName")} value={props.name} onChange={props.onName} />
      </div>
      <BarPriceField label={t("barPrice")} value={props.priceAmd} onChange={props.onPrice} />
      <OmmButton type="submit" className="h-12 w-full px-6 sm:w-auto" disabled={props.busy || !canAdd}>
        {t("barAdd")}
      </OmmButton>
    </form>
  );
}

function useBarCatalog(failedLabel: string, invalidLabel: string) {
  const [name, setName] = useState("");
  const [priceAmd, setPriceAmd] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const runner = useBarRunner(failedLabel);

  return {
    products: runner.products,
    name,
    setName,
    priceAmd,
    setPriceAmd,
    error: runner.error,
    editingId,
    busy: runner.busy,
    beginEdit: (product: BarProduct) => setEditingId(product.id),
    cancelEdit: () => setEditingId(null),
    add: () => addProduct(name, priceAmd, invalidLabel, setName, setPriceAmd, runner.setError, runner.run),
    save: (id: string, nextName: string, nextPrice: string) =>
      saveProduct(id, nextName, nextPrice, invalidLabel, setEditingId, runner.setError, runner.run),
    toggle: (product: BarProduct) =>
      runner.run(() => patchBarProduct(product.id, { active: !product.active })),
  };
}

function useBarRunner(failedLabel: string) {
  const [products, setProducts] = useState<BarProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const refresh = useCallback(async () => {
    setProducts(await fetchBarProducts());
    setError(null);
  }, []);

  useEffect(() => {
    void refresh().catch((caught: unknown) => {
      setError(caught instanceof ApiError ? caught.message : failedLabel);
    });
  }, [failedLabel, refresh]);

  const run = useCallback(
    async (action: () => Promise<void>) => {
      setBusy(true);
      try {
        await action();
        await refresh();
        return true;
      } catch (caught) {
        setError(caught instanceof ApiError ? caught.message : failedLabel);
        return false;
      } finally {
        setBusy(false);
      }
    },
    [failedLabel, refresh],
  );

  return { products, error, setError, busy, run };
}

async function addProduct(
  name: string,
  priceAmd: string,
  invalidLabel: string,
  setName: (value: string) => void,
  setPrice: (value: string) => void,
  setError: (value: string | null) => void,
  run: (action: () => Promise<void>) => Promise<boolean>,
): Promise<void> {
  const price = parseBarPriceAmd(priceAmd);
  if (name.trim() === "" || price === null) {
    setError(invalidLabel);
    return;
  }
  const saved = await run(() => createBarProduct(name.trim(), price));
  if (saved) {
    setName("");
    setPrice("");
  }
}

async function saveProduct(
  id: string,
  name: string,
  priceAmd: string,
  invalidLabel: string,
  setEditingId: (value: string | null) => void,
  setError: (value: string | null) => void,
  run: (action: () => Promise<void>) => Promise<boolean>,
): Promise<void> {
  const price = parseBarPriceAmd(priceAmd);
  if (name.trim() === "" || price === null) {
    setError(invalidLabel);
    return;
  }
  const saved = await run(() => patchBarProduct(id, { name: name.trim(), priceAmd: price }));
  if (saved) {
    setEditingId(null);
  }
}
