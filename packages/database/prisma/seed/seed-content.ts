import { ContentStatus, ContentType, PrismaClient } from "@prisma/client";

type ContentSeed = {
  slug: string;
  type: ContentType;
  status: ContentStatus;
  title: string;
  excerpt: string;
  body: string;
  authorName?: string;
  tags?: string[];
  publishedAt?: Date | null;
};

const CONTENT_POST_SEEDS: readonly ContentSeed[] = [
  {
    slug: "welcome-open-studio-day",
    type: ContentType.EVENT,
    status: ContentStatus.PUBLISHED,
    title: "Open Studio Day — Move With Us",
    excerpt: "Tour the studio, meet our coaches, and enjoy a complimentary intro class.",
    body: "Join us for a luminous afternoon of reformer demos, yoga tastings, and community tea.",
    authorName: "Ommm Team",
    tags: ["event", "community"],
    publishedAt: new Date(),
  },
  {
    slug: "breath-first-pilates",
    type: ContentType.BLOG,
    status: ContentStatus.PUBLISHED,
    title: "Breath-First Pilates: Why It Changes Everything",
    excerpt: "How conscious breathing unlocks deeper core connection on the reformer.",
    body: "When breath leads movement, tension releases and precision appears naturally.",
    authorName: "Sona Melikyan",
    tags: ["pilates", "wellness"],
    publishedAt: new Date(),
  },
  {
    slug: "new-morning-yoga-schedule",
    type: ContentType.NEWS,
    status: ContentStatus.PUBLISHED,
    title: "New Sunrise Yoga Blocks Added",
    excerpt: "We expanded weekday sunrise sessions to welcome more early movers.",
    body: "Bookings open now for 7:00 and 8:15 morning flows with Elena.",
    authorName: "Studio Desk",
    tags: ["schedule", "yoga"],
    publishedAt: new Date(),
  },
  {
    slug: "app-waitlist-alerts",
    type: ContentType.UPDATE,
    status: ContentStatus.PUBLISHED,
    title: "Waitlist Alerts Now Live in the App",
    excerpt: "Get notified the moment a spot opens in your favorite class.",
    body: "Enable waitlist alerts in your notification settings to never miss a opening.",
    authorName: "Product Team",
    tags: ["product"],
    publishedAt: new Date(),
  },
  {
    slug: "reformer-etiquette-guide",
    type: ContentType.KNOWLEDGE_ARTICLE,
    status: ContentStatus.PUBLISHED,
    title: "Reformer Studio Etiquette",
    excerpt: "A quick guide to arriving calm, prepared, and ready to move.",
    body: "Arrive ten minutes early, grip socks on, phone silenced, spirit open.",
    authorName: "Ommm Team",
    tags: ["guide", "reformer"],
    publishedAt: new Date(),
  },
  {
    slug: "summer-retreat-draft",
    type: ContentType.EVENT,
    status: ContentStatus.DRAFT,
    title: "Summer Retreat — Draft",
    excerpt: "Weekend retreat concept still in planning.",
    body: "Internal draft — location and dates TBD.",
    authorName: "Mariam Avetisyan",
    tags: ["draft"],
    publishedAt: null,
  },
  {
    slug: "member-spotlight-march",
    type: ContentType.BLOG,
    status: ContentStatus.IN_REVIEW,
    title: "Member Spotlight: Ani’s Six-Month Journey",
    excerpt: "A story of consistency, courage, and reformer milestones.",
    body: "Awaiting final quotes and photo approval.",
    authorName: "Content Team",
    tags: ["story"],
    publishedAt: null,
  },
  {
    slug: "legacy-pricing-update",
    type: ContentType.UPDATE,
    status: ContentStatus.HIDDEN,
    title: "Legacy Pricing Page",
    excerpt: "Hidden archival update for admin preview.",
    body: "This post should not appear on the public site.",
    authorName: "Admin",
    tags: ["archive"],
    publishedAt: null,
  },
  {
    slug: "rejected-promo-post",
    type: ContentType.NEWS,
    status: ContentStatus.REJECTED,
    title: "Rejected Promo Copy",
    excerpt: "Example of a rejected editorial submission.",
    body: "Review notes: tone does not match brand voice.",
    authorName: "Guest Author",
    tags: ["review"],
    publishedAt: null,
  },
];

export async function seedContentPosts(prisma: PrismaClient): Promise<void> {
  for (const post of CONTENT_POST_SEEDS) {
    await prisma.contentPost.upsert({
      where: { slug: post.slug },
      update: {
        type: post.type,
        status: post.status,
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        authorName: post.authorName,
        tags: post.tags ?? [],
        publishedAt: post.publishedAt ?? null,
      },
      create: {
        type: post.type,
        status: post.status,
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        body: post.body,
        authorName: post.authorName,
        tags: post.tags ?? [],
        publishedAt: post.publishedAt ?? null,
      },
    });
  }
}
