/**
 * Public marketing copy aligned with web `en.json` (marketingPublic + marketing keys).
 * Mobile home uses this until i18n is wired for the app.
 */
export const homeMarketingCopy = {
  hero: {
    eyebrow: "Ommm · studio space",
    titleLine1: "Practice with",
    titleAccent: "intention.",
    lead:
      "Thoughtful scheduling, clear memberships, and a calm place to plan classes — built for studios that want the web to feel as grounded as the mat.",
    primaryCtaSignedIn: "Book a class",
    primaryCtaSignedOut: "Sign in",
    secondaryCta: "Create account",
    footnote:
      "Already a member? Sign in from Profile, then manage schedule, waitlists, and gifts.",
    footnoteSignedOut:
      "Browse classes and plans anytime — sign in or create an account when you are ready to book.",
    previewEyebrow: "Our story",
    previewTitle: "Clarity on the mat, clarity online",
    previewCta: "Open classes",
  },
  highlights: {
    title: "Everything in one calm flow",
    lead:
      "Scheduling, memberships, and studio updates — organized so members always know what is next.",
    cta: "Learn more",
    cards: [
      {
        key: "schedule",
        title: "Live schedule",
        body:
          "See upcoming sessions, capacity, and coaches — book in a few taps when you are signed in.",
      },
      {
        key: "memberships",
        title: "Memberships",
        body:
          "Transparent plans with clear inclusions. Pick what fits, then manage with the team.",
      },
      {
        key: "journal",
        title: "Studio journal",
        body:
          "Stories, events, and class notes — stay close to what is happening at the studio.",
      },
    ],
  },
} as const;
