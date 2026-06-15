import {
  buildClassTypeSlugFromPackageCategory,
  syncClassTypeForPackageCategory,
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
