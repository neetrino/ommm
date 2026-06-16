import { BadRequestException } from '@nestjs/common';
import { validateCombinedSessionAllocations } from './combined-plan-allocations.util';

describe('validateCombinedSessionAllocations', () => {
  const components = [{ id: 'a' }, { id: 'b' }];

  it('accepts allocations that sum to the tier total', () => {
    expect(() =>
      validateCombinedSessionAllocations(
        components,
        [
          { componentId: 'a', sessionCount: 2 },
          { componentId: 'b', sessionCount: 3 },
        ],
        5,
      ),
    ).not.toThrow();
  });

  it('rejects mismatched totals', () => {
    expect(() =>
      validateCombinedSessionAllocations(
        components,
        [
          { componentId: 'a', sessionCount: 2 },
          { componentId: 'b', sessionCount: 2 },
        ],
        5,
      ),
    ).toThrow(BadRequestException);
  });
});
