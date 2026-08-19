import type { AdminIntegratedFilterField } from "@/components/admin/admin-integrated-search-filter-types";
import type { AdminClientsPayload } from "@/components/admin/admin-clients-types";
import {
  parseAdminClientSegmentFilters,
  serializeAdminClientSegmentFilters,
  type AdminClientSegmentFilter,
} from "@/components/admin/admin-clients-segment-filters";

const segmentFilterOptions: ReadonlyArray<readonly [AdminClientSegmentFilter, string]> = [
  ["new", "New Clients"],
  ["vip", "VIP Clients"],
  ["unpaid", "Unpaid Clients"],
  ["birthday-this-month", "Birthday This Month"],
  ["inactive-30-days", "Inactive 30+ Days"],
  ["no-show", "No-show Clients"],
];

function monthOptions(): ReadonlyArray<readonly [string, string]> {
  return [
    ["", "Any birthday month"],
    ...Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const label = new Intl.DateTimeFormat("en", { month: "long" }).format(
        new Date(2026, index, 1),
      );
      return [String(month), label] as const;
    }),
  ];
}

type BuildAdminClientsFilterFieldsArgs = {
  payload: AdminClientsPayload;
  resolveOrderChipLabel: (value: string) => string;
  renderSegments: AdminIntegratedFilterField["render"];
  renderOrder: AdminIntegratedFilterField["render"];
  packageLabels: {
    label: string;
    allLabel: string;
    activeLabel: string;
    inactiveLabel: string;
  };
};

export function buildAdminClientsFilterFields({
  payload,
  resolveOrderChipLabel,
  renderSegments,
  renderOrder,
  packageLabels,
}: BuildAdminClientsFilterFieldsArgs): AdminIntegratedFilterField[] {
  return [
    {
      key: "tag",
      label: "Badge",
      allLabel: "All badges",
      options: [
        { value: "vip", label: "VIP" },
        { value: "influencer", label: "Influencer" },
        { value: "new", label: "New" },
        { value: "beginner", label: "Beginner" },
      ],
    },
    {
      key: "status",
      label: "Status",
      allLabel: "All statuses",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "frozen", label: "Frozen" },
        { value: "blocked", label: "Blocked" },
      ],
    },
    {
      key: "package",
      label: packageLabels.label,
      allLabel: packageLabels.allLabel,
      options: [
        { value: "active", label: packageLabels.activeLabel },
        { value: "inactive", label: packageLabels.inactiveLabel },
      ],
    },
    {
      key: "paymentStatus",
      label: "Payment",
      allLabel: "All payments",
      options: [
        { value: "paid", label: "Paid" },
        { value: "unpaid", label: "Unpaid" },
        { value: "overdue", label: "Overdue" },
        { value: "partial", label: "Partial" },
      ],
    },
    {
      key: "source",
      label: "Source",
      allLabel: "All sources",
      options: [
        { value: "website", label: "Website" },
        { value: "mobile-app", label: "Mobile App" },
        { value: "admin", label: "Admin" },
        { value: "instagram", label: "Instagram" },
        { value: "referral", label: "Referral" },
      ],
    },
    {
      key: "attendance",
      label: "Attendance",
      allLabel: "All attendance",
      options: [
        { value: "regular", label: "Regular" },
        { value: "no-show", label: "No-show" },
        { value: "often-cancels", label: "Often cancels" },
        { value: "low-attendance", label: "Low attendance" },
      ],
    },
    {
      key: "birthdayMonth",
      label: "Birthday month",
      allLabel: "Any birthday month",
      options: monthOptions()
        .filter(([value]) => value !== "")
        .map(([value, label]) => ({ value, label })),
    },
    {
      key: "classLevel",
      label: "Class level",
      allLabel: "All levels",
      options: [
        { value: "beginner", label: "Beginner" },
        { value: "intermediate", label: "Intermediate" },
        { value: "advanced", label: "Advanced" },
        ...payload.filterOptions.classLevels.map((level) => ({
          value: level,
          label: level,
        })),
      ],
    },
    {
      key: "preferredCoachId",
      label: "Preferred coach",
      allLabel: "All coaches",
      options: payload.filterOptions.preferredCoaches.map((coach) => ({
        value: coach.id,
        label: coach.name,
      })),
    },
    {
      key: "quick",
      label: "Client segments",
      emptyValue: "",
      resolveChipLabel: (value) => {
        const segments = parseAdminClientSegmentFilters(value);
        if (segments.length === 0) {
          return null;
        }
        if (segments.length === 1) {
          const label =
            segmentFilterOptions.find(([segmentValue]) => segmentValue === segments[0])?.[1] ??
            segments[0];
          return `Client segments: ${label}`;
        }
        return `Client segments: ${segments.length} selected`;
      },
      render: renderSegments,
    },
    {
      key: "order",
      label: "Order",
      emptyValue: "newest",
      resolveChipLabel: (value) =>
        value !== "newest" ? `Order: ${resolveOrderChipLabel(value)}` : null,
      render: renderOrder,
    },
  ];
}

export function adminClientsFilterValuesFromState(
  filters: Record<string, string>,
): Record<string, string> {
  return {
    tag: filters.tag ?? "",
    status: filters.status ?? "",
    package: filters.package ?? "",
    paymentStatus: filters.paymentStatus ?? "",
    source: filters.source ?? "",
    attendance: filters.attendance ?? "",
    birthdayMonth: filters.birthdayMonth ?? "",
    classLevel: filters.classLevel ?? "",
    preferredCoachId: filters.preferredCoachId ?? "",
    quick: filters.quick ?? "",
    order: filters.order ?? "newest",
  };
}

export { segmentFilterOptions, serializeAdminClientSegmentFilters };
