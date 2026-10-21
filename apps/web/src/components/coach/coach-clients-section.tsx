"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { CoachClientBookingsSheet } from "@/components/coach/coach-client-bookings-sheet";
import { CoachClientsList } from "@/components/coach/coach-clients-list";
import {
  filterCoachClients,
  type CoachPanelClient,
} from "@/components/coach/coach-clients-types";
import { StaffListPageLayout } from "@/components/shared/staff/staff-list-page-layout";
import { ListPageSearchFilters } from "@/components/shared/search/list-page-search-filters";

type CoachClientsSectionProps = {
  locale: string;
  clients: readonly CoachPanelClient[];
};

export function CoachClientsSection({ locale, clients }: CoachClientsSectionProps) {
  const t = useTranslations("coachPages.clients");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const visible = useMemo(() => filterCoachClients(clients, search), [clients, search]);
  const selected = clients.find((client) => client.id === selectedId) ?? null;
  const emptyLabel = search.trim().length > 0 ? t("filteredEmpty") : t("empty");

  return (
    <>
      <StaffListPageLayout
        title={t("title")}
        description={t("description")}
        search={
          <ListPageSearchFilters
            search={search}
            onSearchChange={setSearch}
            searchPlaceholder={t("searchPlaceholder")}
            onClearAll={() => setSearch("")}
            resetLabel={t("resetSearch")}
          />
        }
      >
        {visible.length === 0 ? (
          <p className="text-sm text-sage-600">{emptyLabel}</p>
        ) : (
          <CoachClientsList
            clients={visible}
            locale={locale}
            onSelect={(client) => setSelectedId(client.id)}
          />
        )}
      </StaffListPageLayout>
      <CoachClientBookingsSheet
        client={selected}
        locale={locale}
        onClose={() => setSelectedId(null)}
      />
    </>
  );
}
