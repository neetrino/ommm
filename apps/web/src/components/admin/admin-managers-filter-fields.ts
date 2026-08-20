import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import type { AdminManagersFilterValues } from "@/components/admin/admin-managers-types";

type BuildAdminManagersFilterFieldsArgs = {
  labels: {
    status: string;
    statusAll: string;
    statusActive: string;
    statusBlocked: string;
    order: string;
    orderNewest: string;
    orderOldest: string;
  };
  renderOrder: AdminIntegratedFilterField["render"];
};

export function adminManagersIntegratedFilterValues(
  values: Omit<AdminManagersFilterValues, "q">,
): Record<string, string> {
  return {
    status: values.status,
    order: values.order,
  };
}

export function buildAdminManagersFilterFields({
  labels,
  renderOrder,
}: BuildAdminManagersFilterFieldsArgs): AdminIntegratedFilterField[] {
  return [
    {
      key: "status",
      label: labels.status,
      emptyValue: "all",
      allLabel: labels.statusAll,
      options: [
        { value: "active", label: labels.statusActive },
        { value: "blocked", label: labels.statusBlocked },
      ],
    },
    {
      key: "order",
      label: labels.order,
      emptyValue: "newest",
      resolveChipLabel: (value) =>
        value === "oldest" ? `${labels.order}: ${labels.orderOldest}` : null,
      render: renderOrder,
    },
  ];
}
