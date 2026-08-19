"use client";

import Image from "next/image";
import type { CSSProperties, KeyboardEvent, MouseEvent } from "react";
import styles from "@/components/ui/sphere-image-grid.module.css";
import type { SphereImageItem, WorldPosition } from "@/components/ui/sphere-image-grid.types";

type SphereNodeStyle = CSSProperties & {
  "--node-size": string;
  "--node-x": string;
  "--node-y": string;
  "--node-opacity": string;
  "--node-z": number;
};

type SphereImageGridNodeProps = {
  image: SphereImageItem;
  position: WorldPosition;
  imageSize: number;
  onSelect?: (id: string) => void;
  shouldIgnoreClick: () => boolean;
};

function nodeStyle(position: WorldPosition, imageSize: number): SphereNodeStyle {
  return {
    "--node-size": `${imageSize}px`,
    "--node-x": `${position.x}px`,
    "--node-y": `${position.y}px`,
    "--node-opacity": String(position.fadeOpacity),
    "--node-z": position.zIndex,
  };
}

export function SphereImageGridNode({
  image,
  position,
  imageSize,
  onSelect,
  shouldIgnoreClick,
}: SphereImageGridNodeProps) {
  if (!position.isVisible || position.fadeOpacity <= 0) {
    return null;
  }

  const selectImage = () => {
    if (shouldIgnoreClick()) {
      return;
    }
    onSelect?.(image.id);
  };

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    selectImage();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    event.preventDefault();
    onSelect?.(image.id);
  };

  return (
    <button
      type="button"
      className={styles.node}
      style={nodeStyle(position, imageSize)}
      aria-label={image.alt}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {image.src ? (
        <span className={styles.photo}>
          <Image
            src={image.src}
            alt=""
            fill
            sizes="80px"
            className={styles.photoImg}
            draggable={false}
            unoptimized
          />
        </span>
      ) : (
        <span className={styles.fallback}>{image.fallbackLabel}</span>
      )}
    </button>
  );
}
