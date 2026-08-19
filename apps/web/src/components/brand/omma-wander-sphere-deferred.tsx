"use client";

import dynamic from "next/dynamic";

/** Client island — Next 16 allows `ssr: false` only from a Client Component. */
export const OmmaWanderSphereDeferred = dynamic(
  () =>
    import("@/components/brand/omma-wander-sphere").then((module) => module.OmmaWanderSphere),
  { ssr: false },
);
