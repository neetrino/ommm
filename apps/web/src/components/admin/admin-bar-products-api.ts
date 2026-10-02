import { apiFetch } from "@/lib/api";

const BAR_PRICE_MIN = 1;

export type BarProduct = {
  id: string;
  name: string;
  priceAmd: number;
  active: boolean;
};

export type BarProductPatch = {
  name?: string;
  priceAmd?: number;
  active?: boolean;
};

export function parseBarPriceAmd(value: string): number | null {
  const price = Number(value);
  if (!Number.isInteger(price) || price < BAR_PRICE_MIN) {
    return null;
  }
  return price;
}

export function fetchBarProducts(): Promise<BarProduct[]> {
  return apiFetch<BarProduct[]>("/bar/admin/products");
}

export function createBarProduct(name: string, priceAmd: number): Promise<void> {
  return apiFetch<void>("/bar/admin/products", {
    method: "POST",
    body: JSON.stringify({ name, priceAmd }),
  });
}

export function patchBarProduct(id: string, patch: BarProductPatch): Promise<void> {
  return apiFetch<void>(`/bar/admin/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
}
