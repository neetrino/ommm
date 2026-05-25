import type { ImageProps } from "next/image";

type ImageLoadingProps = Pick<ImageProps, "loading" | "fetchPriority" | "preload">;

/** Primary LCP candidate — at most one per page/viewport. */
export function lcpImageProps(): ImageLoadingProps {
  return {
    loading: "eager",
    fetchPriority: "high",
  };
}

/** Above-the-fold images that are not the primary LCP element. */
export function aboveFoldImageProps(): ImageLoadingProps {
  return {
    loading: "eager",
  };
}

/** Explicitly defer below-the-fold images. */
export function belowFoldImageProps(): ImageLoadingProps {
  return {
    loading: "lazy",
    fetchPriority: "low",
  };
}

/** First grid row on marketing list pages (e.g. coaches). */
export function firstRowGridImageProps(index: number, rowSize = 4): ImageLoadingProps {
  if (index === 0) {
    return lcpImageProps();
  }
  if (index < rowSize) {
    return aboveFoldImageProps();
  }
  return belowFoldImageProps();
}
