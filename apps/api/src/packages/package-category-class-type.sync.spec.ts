import {
  cleanupClassTypesForRemovedPackageCategories,
  buildClassTypeSlugFromPackageCategory,
  syncClassTypeForPackageCategory,
  syncMissingClassTypesForPackageCategories,
} from './package-category-class-type.sync';

describe('syncClassTypeForPackageCategory', () => {
  function createDb() {
    const classType = {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue(undefined),
      create: jest.fn().mockResolvedValue(undefined),
    };
    return { classType };
  }

  it('creates a class type for a new package category', async () => {
    const db = createDb();
    db.classType.findUnique.mockResolvedValue(null);
    db.classType.findFirst.mockResolvedValue(null);

    await syncClassTypeForPackageCategory(db, { categoryName: 'Mat Pilates' });

    expect(db.classType.create).toHaveBeenCalledWith({
      data: { name: 'Mat Pilates', slug: 'mat-pilates' },
    });
  });

  it('renames an existing class type when a package category is renamed', async () => {
    const db = createDb();
    db.classType.findUnique.mockImplementation(async ({ where }: { where: { slug: string } }) => {
      if (where.slug === 'dance') {
        return null;
      }
      if (where.slug === 'dances') {
        return { id: 'ct-1', name: 'Dances', slug: 'dances' };
      }
      return null;
    });
    db.classType.findFirst.mockResolvedValue(null);
    db.classType.findMany.mockResolvedValue([
      { id: 'ct-1', name: 'Dances', slug: 'dances' },
    ]);

    await syncClassTypeForPackageCategory(db, {
      categoryName: 'Dance',
      previousCategoryName: 'Dances',
    });

    expect(db.classType.update).toHaveBeenCalledWith({
      where: { id: 'ct-1' },
      data: { name: 'Dance', slug: 'dance' },
    });
    expect(db.classType.create).not.toHaveBeenCalled();
  });

  it('updates an existing class type when renaming to a new label with no slug match', async () => {
    const db = createDb();
    db.classType.findUnique.mockImplementation(async ({ where }: { where: { slug: string } }) => {
      if (where.slug === 'aaa') {
        return null;
      }
      if (where.slug === 'yoga') {
        return { id: 'ct-2', name: 'Yoga', slug: 'yoga' };
      }
      return null;
    });
    db.classType.findFirst.mockResolvedValue(null);
    db.classType.findMany.mockResolvedValue([
      { id: 'ct-2', name: 'Yoga', slug: 'yoga' },
    ]);

    await syncClassTypeForPackageCategory(db, {
      categoryName: 'aaa',
      previousCategoryName: 'Yoga',
    });

    expect(db.classType.update).toHaveBeenCalledWith({
      where: { id: 'ct-2' },
      data: { name: 'aaa', slug: 'aaa' },
    });
    expect(db.classType.create).not.toHaveBeenCalled();
  });

  it('skips sync when the category label is unchanged', async () => {
    const db = createDb();

    await syncClassTypeForPackageCategory(db, {
      categoryName: 'Yoga',
      previousCategoryName: 'yoga',
    });

    expect(db.classType.findUnique).not.toHaveBeenCalled();
    expect(db.classType.create).not.toHaveBeenCalled();
    expect(db.classType.update).not.toHaveBeenCalled();
  });

  it('builds stable slugs for package categories', () => {
    expect(buildClassTypeSlugFromPackageCategory('Reformer Group')).toBe(
      'reformer-group',
    );
    expect(buildClassTypeSlugFromPackageCategory('  aaa  ')).toBe('aaa');
  });
});

describe('syncMissingClassTypesForPackageCategories', () => {
  it('syncs class types for every distinct package category label', async () => {
    const classType = {
      findUnique: jest.fn().mockResolvedValue(null),
      findFirst: jest.fn().mockResolvedValue(null),
      findMany: jest.fn().mockResolvedValue([]),
      update: jest.fn(),
      create: jest.fn().mockResolvedValue(undefined),
    };
    const packagePlan = {
      findMany: jest.fn().mockResolvedValue([
        { categoryName: 'Dance' },
        { categoryName: 'Daaaaanccceeee + Dance' },
        { categoryName: 'Inactive Category' },
      ]),
    };

    await syncMissingClassTypesForPackageCategories({ classType, packagePlan });

    expect(packagePlan.findMany).toHaveBeenCalledWith({
      select: { categoryName: true },
    });
    expect(classType.create).toHaveBeenCalledTimes(3);
  });
});

describe('cleanupClassTypesForRemovedPackageCategories', () => {
  it('deletes class type when category no longer exists and no sessions are linked', async () => {
    const db = {
      packagePlan: {
        findMany: jest.fn().mockResolvedValue([{ categoryName: 'Dance' }]),
      },
      classType: {
        findUnique: jest.fn().mockImplementation(async ({ where }: { where: { slug: string } }) => {
          if (where.slug === 'yoga') {
            return { id: 'ct-yoga', name: 'Yoga', slug: 'yoga' };
          }
          return null;
        }),
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue(undefined),
      },
      classSession: {
        count: jest.fn().mockResolvedValue(0),
      },
    };

    await cleanupClassTypesForRemovedPackageCategories(db, {
      removedCategoryNames: ['Yoga'],
    });

    expect(db.classSession.count).toHaveBeenCalledWith({
      where: { classTypeId: 'ct-yoga' },
    });
    expect(db.classType.delete).toHaveBeenCalledWith({
      where: { id: 'ct-yoga' },
    });
  });

  it('keeps class type when sessions are still linked', async () => {
    const db = {
      packagePlan: {
        findMany: jest.fn().mockResolvedValue([]),
      },
      classType: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'ct-yoga',
          name: 'Yoga',
          slug: 'yoga',
        }),
        findFirst: jest.fn().mockResolvedValue(null),
        findMany: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue(undefined),
      },
      classSession: {
        count: jest.fn().mockResolvedValue(2),
      },
    };

    await cleanupClassTypesForRemovedPackageCategories(db, {
      removedCategoryNames: ['Yoga'],
    });

    expect(db.classType.delete).not.toHaveBeenCalled();
  });
});
