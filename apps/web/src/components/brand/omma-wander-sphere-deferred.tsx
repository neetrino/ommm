import dynamic from "next/dynamic";

/** Client-only overlay — keep physics out of the first server/client payload. */
export const OmmaWanderSphereDeferred = dynamic(
  () =>
    import("@/components/brand/omma-wander-sphere").then((module) => module.OmmaWanderSphere),
  { ssr: false },
);
