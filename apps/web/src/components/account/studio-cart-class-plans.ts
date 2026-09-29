export type CartPlanOption = {
  id: string;
  name: string;
  classTypeId?: string | null;
  typeSessionAllocations?: ReadonlyArray<{ classTypeId: string }>;
};

/** Packages that include the selected class type. Empty selection matches nothing. */
export function plansForClassType(
  plans: readonly CartPlanOption[],
  classTypeId: string,
): CartPlanOption[] {
  if (classTypeId.trim() === "") {
    return [];
  }
  return plans.filter((plan) => planCoversClassType(plan, classTypeId));
}

export function packageMatchesClassType(
  plans: readonly CartPlanOption[],
  packageId: string,
  classTypeId: string,
): boolean {
  if (packageId === "" || classTypeId.trim() === "") {
    return false;
  }
  return plans.some((plan) => plan.id === packageId && planCoversClassType(plan, classTypeId));
}

function planCoversClassType(plan: CartPlanOption, classTypeId: string): boolean {
  const allocations = plan.typeSessionAllocations ?? [];
  if (allocations.length > 0) {
    return allocations.some((item) => item.classTypeId === classTypeId);
  }
  return (plan.classTypeId ?? "") === classTypeId;
}
