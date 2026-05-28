import { ContentStatus, ContentType, Role } from '@prisma/client';
import { ContentService } from './content.service';
import { ReviewDecision } from './dto/review-post.dto';

describe('ContentService', () => {
  function createService() {
    const prisma = {
      contentPost: {
        findMany: jest.fn().mockResolvedValue([]),
        findFirst: jest.fn().mockResolvedValue(null),
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn().mockResolvedValue(undefined),
      },
    };
    const audit = {
      log: jest.fn().mockResolvedValue(undefined),
    };
    return {
      service: new ContentService(prisma as never, audit as never),
      prisma,
      audit,
    };
  }

  it('submitForReview moves draft post into review state', async () => {
    const { service, prisma } = createService();
    prisma.contentPost.findUnique.mockResolvedValue({
      id: 'post-1',
      status: ContentStatus.DRAFT,
      publishedAt: null,
    });
    prisma.contentPost.update.mockResolvedValue({
      id: 'post-1',
      status: ContentStatus.IN_REVIEW,
    });

    const updated = await service.submitForReview('post-1', {
      id: 'editor-1',
      role: Role.CONTENT_ADMIN,
    });

    expect(prisma.contentPost.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'post-1' },
        data: expect.objectContaining({ status: ContentStatus.IN_REVIEW }),
      }),
    );
    expect(updated.status).toBe(ContentStatus.IN_REVIEW);
  });

  it('review approves post and sets published status', async () => {
    const { service, prisma } = createService();
    prisma.contentPost.findUnique.mockResolvedValue({
      id: 'post-1',
      status: ContentStatus.IN_REVIEW,
      publishedAt: null,
    });
    prisma.contentPost.update.mockResolvedValue({
      id: 'post-1',
      status: ContentStatus.PUBLISHED,
    });

    const updated = await service.review(
      'post-1',
      { decision: ReviewDecision.APPROVE },
      { id: 'admin-1', role: Role.ADMIN },
    );

    expect(updated.status).toBe(ContentStatus.PUBLISHED);
  });

  it('review rejects post with note', async () => {
    const { service, prisma } = createService();
    prisma.contentPost.findUnique.mockResolvedValue({
      id: 'post-1',
      status: ContentStatus.IN_REVIEW,
      publishedAt: null,
    });
    prisma.contentPost.update.mockResolvedValue({
      id: 'post-1',
      status: ContentStatus.REJECTED,
      reviewNotes: 'Needs changes',
    });

    const updated = await service.review(
      'post-1',
      { decision: ReviewDecision.REJECT, note: 'Needs changes' },
      { id: 'admin-1', role: Role.ADMIN },
    );

    expect(updated.status).toBe(ContentStatus.REJECTED);
    expect(prisma.contentPost.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: ContentStatus.REJECTED,
          reviewNotes: 'Needs changes',
        }),
      }),
    );
  });

  it('create normalizes tags and sets default publishedAt for published', async () => {
    const { service, prisma } = createService();
    prisma.contentPost.create.mockResolvedValue({
      id: 'post-1',
      status: ContentStatus.PUBLISHED,
      tags: ['yoga', 'flow'],
    });

    await service.create(
      {
        type: ContentType.BLOG,
        status: ContentStatus.PUBLISHED,
        slug: 'Morning-Flow',
        title: 'Morning flow',
        tags: [' yoga ', 'Flow', 'yoga'],
      },
      { id: 'admin-1', role: Role.ADMIN },
    );

    expect(prisma.contentPost.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          slug: 'morning-flow',
          tags: ['yoga', 'flow'],
          publishedAt: expect.any(Date),
        }),
      }),
    );
  });
});
