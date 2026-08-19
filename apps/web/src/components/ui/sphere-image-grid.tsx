"use client";

import { useMemo, type CSSProperties } from "react";
import {
  SPHERE_BASE_IMAGE_SCALE,
  SPHERE_PERSPECTIVE_PX,
  SPHERE_RADIUS_RATIO,
} from "@/components/ui/sphere-image-grid.constants";
import { generateSpherePositions, projectSpherePositions } from "@/components/ui/sphere-image-grid.layout";
import { SphereImageGridNode } from "@/components/ui/sphere-image-grid-node";
import styles from "@/components/ui/sphere-image-grid.module.css";
import type { SphereImageGridProps } from "@/components/ui/sphere-image-grid.types";
import { useSphereImageGridRotation } from "@/components/ui/sphere-image-grid.use-rotation";
import { useObservedElementSize } from "@/hooks/use-observed-element-size";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

export type { SphereImageGridProps, SphereImageItem } from "@/components/ui/sphere-image-grid.types";

type SphereStageStyle = CSSProperties & {
  "--sphere-size": string;
  "--sphere-perspective": string;
};

export function SphereImageGrid({
  images,
  onSelect,
  autoRotate = true,
  className,
  ariaLabel,
}: SphereImageGridProps) {
  const reducedMotion = usePrefersReducedMotion();
  const { ref, size, isReady } = useObservedElementSize<HTMLDivElement>();
  const { rotation, isDragging, didDrag, handlers } = useSphereImageGridRotation(
    autoRotate && !reducedMotion,
  );
  const containerSize = size.width;
  const sphereRadius = containerSize * SPHERE_RADIUS_RATIO;
  const baseImageSize = containerSize * SPHERE_BASE_IMAGE_SCALE;

  const sphericalPositions = useMemo(
    () => generateSpherePositions(images.length, sphereRadius),
    [images.length, sphereRadius],
  );

  const worldPositions = useMemo(
    () => projectSpherePositions(sphericalPositions, rotation, sphereRadius, baseImageSize),
    [baseImageSize, rotation, sphericalPositions, sphereRadius],
  );

  const stageClassName = isDragging
    ? `${styles.stage} ${styles.stageDragging}`
    : styles.stage;
  const wrapClassName = className ? `${styles.wrap} ${className}` : styles.wrap;
  const stageStyle: SphereStageStyle = {
    "--sphere-size": `${containerSize}px`,
    "--sphere-perspective": `${SPHERE_PERSPECTIVE_PX}px`,
  };

  return (
    <div ref={ref} className={wrapClassName}>
      {!isReady ? (
        <div className={`${styles.skeleton} animate-pulse`} />
      ) : (
        <div
          className={stageClassName}
          style={stageStyle}
          role="group"
          aria-label={ariaLabel}
          {...handlers}
        >
          {images.map((image, index) => {
            const position = worldPositions[index];
            if (!position) {
              return null;
            }
            return (
              <SphereImageGridNode
                key={image.id}
                image={image}
                position={position}
                imageSize={baseImageSize * position.scale}
                onSelect={onSelect}
                shouldIgnoreClick={didDrag}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
