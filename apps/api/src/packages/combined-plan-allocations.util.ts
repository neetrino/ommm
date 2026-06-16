import { BadRequestException } from '@nestjs/common';

type CombinedPlanComponentRef = {
  id: string;
};

type CombinedSessionAllocationInput = {
  componentId: string;
  sessionCount: number;
};

/** Validates per-source session counts and ensures they sum to the tier total. */
export function validateCombinedSessionAllocations(
  components: readonly CombinedPlanComponentRef[],
  allocations: readonly CombinedSessionAllocationInput[],
  expectedTotal: number | null,
): void {
  if (expectedTotal === null || expectedTotal <= 0) {
    throw new BadRequestException(
      'Combined package session total must be set before source allocations.',
    );
  }
  if (allocations.length !== components.length) {
    throw new BadRequestException(
      'Please set session counts for every combined source package.',
    );
  }
  const componentIds = new Set(components.map((component) => component.id));
  let sum = 0;
  for (const allocation of allocations) {
    if (!componentIds.has(allocation.componentId)) {
      throw new BadRequestException(
        'Invalid combined package source allocation.',
      );
    }
    sum += allocation.sessionCount;
  }
  if (sum !== expectedTotal) {
    throw new BadRequestException(
      'Source session counts must add up to the total session count.',
    );
  }
}
