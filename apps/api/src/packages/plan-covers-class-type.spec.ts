import { planCoversClassType } from './plan-covers-class-type';

describe('planCoversClassType', () => {
  const reformerGroupId = 'ct-reformer-group';
  const matId = 'ct-mat';

  it('matches when class type is in typeSessionAllocations', () => {
    expect(
      planCoversClassType(
        {
          typeSessionAllocations: [
            { classTypeId: matId, sessionCount: 4 },
            { classTypeId: reformerGroupId, sessionCount: 4 },
          ],
        },
        reformerGroupId,
      ),
    ).toBe(true);
  });

  it('rejects when class type is not in allocations', () => {
    expect(
      planCoversClassType(
        {
          typeSessionAllocations: [
            { classTypeId: matId, sessionCount: 8 },
          ],
        },
        reformerGroupId,
      ),
    ).toBe(false);
  });

  it('ignores legacy classTypeId when allocations are present', () => {
    expect(
      planCoversClassType(
        {
          classTypeId: reformerGroupId,
          typeSessionAllocations: [
            { classTypeId: matId, sessionCount: 8 },
          ],
        },
        reformerGroupId,
      ),
    ).toBe(false);
  });

  it('falls back to legacy classTypeId when allocations are empty', () => {
    expect(
      planCoversClassType(
        {
          classTypeId: reformerGroupId,
          typeSessionAllocations: [],
        },
        reformerGroupId,
      ),
    ).toBe(true);
  });

  it('returns false for empty target or uncovered plan', () => {
    expect(
      planCoversClassType(
        { typeSessionAllocations: [{ classTypeId: matId, sessionCount: 1 }] },
        '  ',
      ),
    ).toBe(false);
    expect(planCoversClassType({ typeSessionAllocations: [] }, matId)).toBe(
      false,
    );
  });
});
