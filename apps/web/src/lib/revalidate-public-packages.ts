import { revalidatePublicPackagesAction } from "@/server/revalidate-public-packages";

/** Client-callable wrapper for public package cache revalidation. */
export async function revalidatePublicPackages(): Promise<void> {
  await revalidatePublicPackagesAction();
}
