import { revalidatePublicStudioAction } from "@/server/revalidate-public-studio";

/** Bust Next.js fetch cache for public studio settings after admin mutations. */
export async function revalidatePublicStudio(): Promise<void> {
  await revalidatePublicStudioAction();
}
