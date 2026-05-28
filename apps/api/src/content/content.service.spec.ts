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

    const submitCalls = prisma.contentPost.update.mock.calls as Array<
      [
        {
          where: { id: string };
          data: { status: ContentStatus };
        },
      ]
    >;
    const submitArgs = submitCalls[0][0];
    expect(submitArgs.where.id).toBe('post-1');
    expect(submitArgs.data.status).toBe(ContentStatus.IN_REVIEW);
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
    const rejectCalls = prisma.contentPost.update.mock.calls as Array<
      [
        {
          data: { status: ContentStatus; reviewNotes?: string | null };
        },
      ]
    >;
    const rejectArgs = rejectCalls[0][0];
    expect(rejectArgs.data.status).toBe(ContentStatus.REJECTED);
    expect(rejectArgs.data.reviewNotes).toBe('Needs changes');
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

    const createCalls = prisma.contentPost.create.mock.calls as Array<
      [
        {
          data: { slug: string; tags: string[]; publishedAt: Date | null };
        },
      ]
    >;
    const createArgs = createCalls[0][0];
    expect(createArgs.data.slug).toBe('morning-flow');
    expect(createArgs.data.tags).toEqual(['yoga', 'flow']);
    expect(createArgs.data.publishedAt).toBeInstanceOf(Date);
  });
});
