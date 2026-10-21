import { syncContentTranslations } from './content-translation-sync';

describe('syncContentTranslations', () => {
  it('upserts submitted locales and retires a dropped locale without deleting it', async () => {
    const upsert = jest.fn().mockResolvedValue({});
    const update = jest.fn().mockResolvedValue({});
    const findMany = jest
      .fn()
      .mockResolvedValue([{ id: 'tr-hy', slug: 'morning-hy' }]);
    const tx = {
      contentPostTranslation: { upsert, update, findMany },
    };

    await syncContentTranslations(tx as never, 'post-1', [
      {
        locale: 'en',
        slug: 'morning',
        title: 'Morning',
        excerpt: null,
        body: null,
        seoTitle: null,
        seoDescription: null,
      },
    ]);

    expect(upsert).toHaveBeenCalledWith({
      where: { postId_locale: { postId: 'post-1', locale: 'en' } },
      create: expect.objectContaining({ postId: 'post-1', locale: 'en' }) as {
        postId: string;
      },
      update: expect.objectContaining({ slug: 'morning' }) as { slug: string },
    });
    expect(findMany).toHaveBeenCalledWith({
      where: { postId: 'post-1', locale: { notIn: ['en'] } },
      select: { id: true, slug: true },
    });
    expect(update).toHaveBeenCalledWith({
      where: { id: 'tr-hy' },
      data: { slug: 'ommm-retired-tr-hy' },
    });
  });
});
