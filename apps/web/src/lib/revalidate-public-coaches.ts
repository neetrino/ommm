import { revalidatePublicCoachesAction } from "@/server/revalidate-public-coaches";

/** Bust Next.js ISR cache for public coaches after admin mutations. */
export async function revalidatePublicCoaches(): Promise<void> {
  await revalidatePublicCoachesAction();
}
