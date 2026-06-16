import {
  MAX_PACKAGE_SESSIONS,
  MIN_PACKAGE_SESSIONS,
  parseSessionsCount,
} from "@/components/admin/admin-package-form-utils";
import type { AdminCombinedPlanComponent } from "@/components/admin/admin-packages-types";

export function buildCombinedAllocationFormValues(
  components: readonly AdminCombinedPlanComponent[] | undefined,
): Record<string, string> {
  if (components === undefined || components.length === 0) {
    return {};
  }
  const allocations: Record<string, string> = {};
  for (const component of components) {
    allocations[component.id] =
      typeof component.sessionAllocation === "number" && component.sessionAllocation > 0
        ? String(component.sessionAllocation)
        : String(MIN_PACKAGE_SESSIONS);
  }
  return allocations;
}

export function sumCombinedSessionAllocations(allocations: Record<string, string>): number {
  let sum = 0;
  for (const value of Object.values(allocations)) {
    const parsed = parseSessionsCount(value);
    if (parsed !== null) {
      sum += parsed;
    }
  }
  return sum;
}

export function buildSourceSessionAllocationsPayload(
  components: readonly AdminCombinedPlanComponent[],
  allocations: Record<string, string>,
): Array<{ componentId: string; sessionCount: number }> | null {
  const payload: Array<{ componentId: string; sessionCount: number }> = [];
  for (const component of components) {
    const parsed = parseSessionsCount(allocations[component.id] ?? "");
    if (
      parsed === null ||
      parsed < MIN_PACKAGE_SESSIONS ||
      parsed > MAX_PACKAGE_SESSIONS
    ) {
      return null;
    }
    payload.push({ componentId: component.id, sessionCount: parsed });
  }
  return payload;
}

export function formatCombinedSessionsBreakdown(
  components: readonly AdminCombinedPlanComponent[] | undefined,
): string | null {
  if (components === undefined || components.length === 0) {
    return null;
  }
  const parts = components
    .filter(
      (component) =>
        typeof component.sessionAllocation === "number" && component.sessionAllocation > 0,
    )
    .map(
      (component) =>
        `${component.sourceCategoryNameSnapshot}: ${component.sessionAllocation}`,
    );
  return parts.length > 0 ? parts.join(" · ") : null;
}
