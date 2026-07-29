"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { resolveAdminClientsOrderLabel } from "@/components/admin/admin-clients-order-label";
import {
  buildAdminClientsFilterFields,
  segmentFilterOptions,
  serializeAdminClientSegmentFilters,
} from "@/components/admin/admin-clients-filter-fields";
import {
  parseAdminClientSegmentFilters,
  type AdminClientSegmentFilter,
} from "@/components/admin/admin-clients-segment-filters";
import type { AdminClientsPayload } from "@/components/admin/admin-clients-types";
import { OmmFilterMultiSelect } from "@/components/ui/omm-filter-multi-select";
import {
  OmmSelectDropdown,
  ommOptionsFromTuples,
} from "@/components/ui/omm-select-dropdown";

const CLIENT_ORDER_OPTIONS = [
  ["newest", "Newest clients first"],
  ["oldest", "Oldest clients first"],
  ["most-active", "Most active"],
  ["highest-lifetime-value", "Highest lifetime value"],
  ["last-visit-newest", "Last visit newest"],
  ["last-visit-oldest", "Last visit oldest"],
  ["most-bookings", "Most bookings"],
  ["most-cancellations", "Most cancellations"],
] as const;

export function useAdminClientsFilterFields(payload: AdminClientsPayload) {
  const tFilters = useTranslations("adminPages.clients.filters");

  const segmentOptions = useMemo(
    () =>
      segmentFilterOptions.map(([value, label]) => ({
        value,
        label,
      })),
    [],
  );

  return useMemo(
    () =>
      buildAdminClientsFilterFields({
        payload,
        resolveOrderChipLabel: resolveAdminClientsOrderLabel,
        renderSegments: ({ value, onChange }) => (
          <OmmFilterMultiSelect
            variant="accent"
            wrapLabel
            ariaLabel="Client segment filters"
            allLabel="All clients"
            selectedValues={parseAdminClientSegmentFilters(value)}
            onChange={(values) =>
              onChange(
                serializeAdminClientSegmentFilters(values as AdminClientSegmentFilter[]),
              )
            }
            formatSelectedCount={(count) =>
              count === 1 ? "1 segment selected" : `${count} segments selected`
            }
            options={segmentOptions}
          />
        ),
        renderOrder: ({ value, onChange }) => (
          <OmmSelectDropdown
            ariaLabel={tFilters("orderLabel")}
            label={resolveAdminClientsOrderLabel(value)}
            value={value}
            options={ommOptionsFromTuples([...CLIENT_ORDER_OPTIONS])}
            onChange={onChange}
          />
        ),
        packageLabels: {
          label: tFilters("packageLabel"),
          allLabel: tFilters("packageAll"),
          activeLabel: tFilters("packageActive"),
          inactiveLabel: tFilters("packageInactive"),
        },
      }),
    [payload, segmentOptions, tFilters],
  );
}
