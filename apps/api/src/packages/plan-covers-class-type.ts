import { parseStoredTypeSessionAllocations } from './packages-plan.helpers';

type PlanClassCoverageShape = {
  classTypeId?: string | null;
  typeSessionAllocations?: unknown;
};

/**
 * Whether a package plan can be used for a session of the given class type.
 * Prefers `typeSessionAllocations`; falls back to legacy single `classTypeId`
 * only when allocations are empty.
 */
export function planCoversClassType(
  plan: PlanClassCoverageShape,
  classTypeId: string,
): boolean {
  const target = classTypeId.trim();
  if (target.length === 0) {
    return false;
  }

  const allocations = parseStoredTypeSessionAllocations(
    plan.typeSessionAllocations,
  );
  if (allocations.length > 0) {
    return allocations.some((allocation) => allocation.classTypeId === target);
  }

  const legacyId = plan.classTypeId?.trim() ?? '';
  return legacyId.length > 0 && legacyId === target;
}
