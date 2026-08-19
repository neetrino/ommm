"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import type { ClientRow } from "@/components/admin/admin-clients-types";
import { SphereImageGrid } from "@/components/ui/sphere-image-grid";
import type { SphereImageItem } from "@/components/ui/sphere-image-grid.types";
import { resolveApiAssetUrl } from "@/lib/resolve-api-asset-url";

type AdminClientsSphereViewProps = {
  rows: ClientRow[];
  onSelect: (row: ClientRow) => void;
};

const SPHERE_SHELL_CLASS =
  "overflow-visible rounded-3xl border border-white/60 bg-white/40 px-3 py-4 shadow-sm backdrop-blur-md sm:px-6";

function clientDisplayName(row: ClientRow): string {
  return [row.name, row.lastName].filter(Boolean).join(" ").trim() || row.email;
}

function clientInitials(name: string): string {
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
  return initials || "?";
}

function toSphereImage(row: ClientRow): SphereImageItem {
  const name = clientDisplayName(row);
  return {
    id: row.id,
    src: resolveApiAssetUrl(row.avatarUrl) ?? null,
    alt: name,
    fallbackLabel: clientInitials(name),
  };
}

export function AdminClientsSphereView({ rows, onSelect }: AdminClientsSphereViewProps) {
  const t = useTranslations("adminPages.clients");
  const images = useMemo(() => rows.map(toSphereImage), [rows]);
  const rowsById = useMemo(() => new Map(rows.map((row) => [row.id, row])), [rows]);

  if (rows.length === 0) {
    return null;
  }

  return (
    <div className={SPHERE_SHELL_CLASS}>
      <SphereImageGrid
        images={images}
        ariaLabel={t("sphereAria")}
        onSelect={(id) => {
          const row = rowsById.get(id);
          if (row) {
            onSelect(row);
          }
        }}
      />
    </div>
  );
}
