"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import {
  AUTH_PARTICLE_LAYOUT,
  type AuthParticleConfig,
  type AuthParticleSize,
} from "@/components/auth/signup-banner-particle-layout";
import styles from "@/components/auth/signup-banner-particles.module.css";

const REPEL_RADIUS_PX = 120;
const REPEL_STRENGTH_BY_SIZE: Record<AuthParticleSize, number> = {
  sm: 16,
  md: 22,
  lg: 28,
  xl: 34,
};
const REDUCED_MOTION_MEDIA_QUERY = "(prefers-reduced-motion: reduce)";

const SIZE_CLASS: Record<AuthParticleSize, string> = {
  sm: styles.sizeSm,
  md: styles.sizeMd,
  lg: styles.sizeLg,
  xl: styles.sizeXl,
};

function particleStyle(
  config: AuthParticleConfig,
): CSSProperties & Record<`--${string}`, string | number> {
  return {
    "--particle-left": config.left,
    "--particle-top": config.top,
    "--particle-delay": `${config.delay}s`,
  };
}

function setParticleOffset(
  particle: HTMLSpanElement,
  pointerX: number,
  pointerY: number,
): void {
  const size = particle.dataset.size as AuthParticleSize | undefined;
  const repelStrength = size ? REPEL_STRENGTH_BY_SIZE[size] : REPEL_STRENGTH_BY_SIZE.md;
  const rect = particle.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  const deltaX = centerX - pointerX;
  const deltaY = centerY - pointerY;
  const distance = Math.hypot(deltaX, deltaY);

  if (distance > REPEL_RADIUS_PX || distance === 0) {
    particle.style.setProperty("--repel-x", "0px");
    particle.style.setProperty("--repel-y", "0px");
    return;
  }

  const force = (1 - distance / REPEL_RADIUS_PX) * repelStrength;
  particle.style.setProperty("--repel-x", `${(deltaX / distance) * force}px`);
  particle.style.setProperty("--repel-y", `${(deltaY / distance) * force}px`);
}

function resetParticleOffset(particle: HTMLSpanElement): void {
  particle.style.setProperty("--repel-x", "0px");
  particle.style.setProperty("--repel-y", "0px");
}

export function SignupBannerParticles() {
  const layerRef = useRef<HTMLDivElement | null>(null);
  const particleRefs = useRef<Array<HTMLSpanElement | null>>([]);

  useEffect(() => {
    const reduceMotion = window.matchMedia(REDUCED_MOTION_MEDIA_QUERY);
    if (reduceMotion.matches) {
      return;
    }

    let frameId = 0;
    let pointerX = 0;
    let pointerY = 0;

    function updateParticles(): void {
      const layer = layerRef.current;
      if (!layer) {
        return;
      }

      const layerRect = layer.getBoundingClientRect();
      const isInsideLayer =
        pointerX >= layerRect.left &&
        pointerX <= layerRect.right &&
        pointerY >= layerRect.top &&
        pointerY <= layerRect.bottom;

      particleRefs.current.forEach((particle) => {
        if (!particle) {
          return;
        }
        if (!isInsideLayer) {
          resetParticleOffset(particle);
          return;
        }
        setParticleOffset(particle, pointerX, pointerY);
      });
    }

    function onPointerMove(event: PointerEvent): void {
      pointerX = event.clientX;
      pointerY = event.clientY;
      window.cancelAnimationFrame(frameId);
      frameId = window.requestAnimationFrame(updateParticles);
    }

    function onPointerLeave(): void {
      window.cancelAnimationFrame(frameId);
      particleRefs.current.forEach((particle) => {
        if (particle) {
          resetParticleOffset(particle);
        }
      });
    }

    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div ref={layerRef} className={styles.layer} aria-hidden="true">
      {AUTH_PARTICLE_LAYOUT.map((config, index) => (
        <span
          key={`particle-${index}`}
          ref={(node) => {
            particleRefs.current[index] = node;
          }}
          data-size={config.size}
          className={[
            styles.particle,
            SIZE_CLASS[config.size],
            config.alternateDrift ? styles.alternateDrift : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={particleStyle(config)}
        />
      ))}
    </div>
  );
}
