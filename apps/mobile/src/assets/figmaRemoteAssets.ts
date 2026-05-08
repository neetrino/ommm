/**
 * Remote image URLs from Figma MCP export (node 1:125).
 * These URLs expire after ~7 days; replace with bundled assets under `assets/` for production.
 * @see MOBILE_SETUP.md — Figma assets section
 */
export const figmaRemoteAssets = {
  bookingHero: "https://www.figma.com/api/mcp/asset/eefc7856-fb6d-45e2-b128-eed573c24f1e",
  exploreFeatured: "https://www.figma.com/api/mcp/asset/87645628-d910-443e-a38d-a051241a003f",
  exploreRetreat: "https://www.figma.com/api/mcp/asset/d2e839a3-dcd8-4f7f-bdf5-c4e3dd73969e",
  explorePilates: "https://www.figma.com/api/mcp/asset/c2648ba0-cd98-4d64-b606-e26d8301366e",
  brandMark: "https://www.figma.com/api/mcp/asset/e0a2ea47-1d08-4b32-a934-88fcb8c7462b",
  iconArrowOut: "https://www.figma.com/api/mcp/asset/5c59c948-d2db-4f07-acbf-0866a1931d0e",
  iconPlay: "https://www.figma.com/api/mcp/asset/2ff2cfb4-2ce2-4709-b29b-bc284fa372c8",
  overlayGradient: "https://www.figma.com/api/mcp/asset/b160d4ef-840a-4474-9ed3-fbb80a3f02f3",
  tabHome: "https://www.figma.com/api/mcp/asset/438b1a79-b549-4052-b0ef-448211112a7d",
  tabClasses: "https://www.figma.com/api/mcp/asset/c2a5bd3d-f5e1-445c-bae0-4f9ad68232f9",
  tabSchedule: "https://www.figma.com/api/mcp/asset/803670d0-3680-4d65-8973-1eb4a38b3fbf",
  tabPlans: "https://www.figma.com/api/mcp/asset/014441db-f9c4-46e9-a7aa-fdd45bedfe3d",
  tabProfile: "https://www.figma.com/api/mcp/asset/4836acb0-4faf-49a4-ac96-39c9eec77adc",
} as const;
