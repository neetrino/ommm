import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import type { AdminCoachesFilterValues } from "@/components/admin/admin-coaches-types";

type BuildAdminCoachesFilterFieldsArgs = {
  classTypeOptions: readonly string[];
  labels: {
    specialization: string;
    specializationPlaceholder: string;
    classType: string;
    classTypeAll: string;
    status: string;
    statusAll: string;
    statusActive: string;
    statusInactive: string;
    order: string;
    orderNewest: string;
    orderOldest: string;
  };
  renderSpecialization: AdminIntegratedFilterField["render"];
  renderOrder: AdminIntegratedFilterField["render"];
};

export function adminCoachesIntegratedFilterValues(
  values: Omit<AdminCoachesFilterValues, "q">,
): Record<string, string> {
  return {
    specialization: values.specialization,
    classType: values.classType,
    isActive: values.isActive,
    order: values.order,
  };
}

export function buildAdminCoachesFilterFields({
  classTypeOptions,
  labels,
  renderSpecialization,
  renderOrder,
}: BuildAdminCoachesFilterFieldsArgs): AdminIntegratedFilterField[] {
  return [
    {
      key: "specialization",
      label: labels.specialization,
      emptyValue: "",
      resolveChipLabel: (value) =>
        value.trim() ? `${labels.specialization}: ${value.trim()}` : null,
      render: renderSpecialization,
    },
    {
      key: "classType",
      label: labels.classType,
      emptyValue: "",
      allLabel: labels.classTypeAll,
      options: classTypeOptions.map((classType) => ({
        value: classType,
        label: classType,
      })),
    },
    {
      key: "isActive",
      label: labels.status,
      emptyValue: "all",
      allLabel: labels.statusAll,
      options: [
        { value: "active", label: labels.statusActive },
        { value: "inactive", label: labels.statusInactive },
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
