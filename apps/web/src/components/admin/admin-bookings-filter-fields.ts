import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import { formatFilterDateChipLabel } from "@/lib/filter-date-display";

type BookingFilterOptions = {
  classTypes: Array<{ id: string; name: string }>;
  coaches: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; label: string }>;
  statusLabels: Record<string, string>;
  labels: {
    dateFrom: string;
    dateTo: string;
    classAll: string;
    coachAll: string;
    clientAll: string;
    statusAll: string;
  };
};

export function buildAdminBookingsFilterFields(
  options: BookingFilterOptions,
): AdminIntegratedFilterField[] {
  return [
    {
      key: "from",
      label: options.labels.dateFrom,
      fieldType: "date",
      emptyValue: "",
      resolveChipLabel: (value) => formatFilterDateChipLabel(options.labels.dateFrom, value),
    },
    {
      key: "to",
      label: options.labels.dateTo,
      fieldType: "date",
      emptyValue: "",
      resolveChipLabel: (value) => formatFilterDateChipLabel(options.labels.dateTo, value),
    },
    {
      key: "classTypeId",
      label: "Class type",
      allLabel: options.labels.classAll,
      options: options.classTypes.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    },
    {
      key: "coachId",
      label: "Coach",
      allLabel: options.labels.coachAll,
      options: options.coaches.map((item) => ({
        value: item.id,
        label: item.name,
      })),
    },
    {
      key: "clientId",
      label: "Client",
      allLabel: options.labels.clientAll,
      options: options.clients.map((item) => ({
        value: item.id,
        label: item.label,
      })),
    },
    {
      key: "status",
      label: "Status",
      allLabel: options.labels.statusAll,
      options: Object.entries(options.statusLabels).map(([value, label]) => ({
        value,
        label,
      })),
    },
  ];
}

export function adminBookingsFilterValuesFromState(values: {
  from: string;
  to: string;
  classTypeId: string;
  coachId: string;
  clientId: string;
  status: string;
}): Record<string, string> {
  return {
    from: values.from,
    to: values.to,
    classTypeId: values.classTypeId,
    coachId: values.coachId,
    clientId: values.clientId,
    status: values.status,
  };
}
