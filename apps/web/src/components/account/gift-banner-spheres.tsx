"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { AUTH_LOGIN_SPHERE_LAYOUT } from "@/components/auth/auth-login-sphere-layout";
import { AuthLoginSphere } from "@/components/auth/auth-login-sphere";
import { AuthLoginSphereGroupContext } from "@/components/auth/auth-login-sphere-group-context";
import { createAuthLoginSphereGroup } from "@/components/auth/auth-login-sphere-group";
import type { AuthLoginSphereGroup } from "@/components/auth/auth-login-sphere-group";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";

const GIFT_BANNER_SPHERE_COUNT = 8;
const GIFT_BANNER_SPHERE_LAYER_CLASS =
  "pointer-events-none absolute inset-0 overflow-hidden [--auth-login-sphere-size:8.75rem] [--auth-login-sphere-size-mobile:6rem]";

/** Login spheres roaming inside the custom-gift banner only. */
export function GiftBannerSpheres() {
  const group = useMemo(() => createAuthLoginSphereGroup(), []);
  const hostRef = useRef<HTMLDivElement>(null);
  useGiftBannerSphereRoam(group, hostRef);

  return (
    <AuthLoginSphereGroupContext.Provider value={group}>
      <div
        ref={(node) => {
          hostRef.current = node;
          if (node !== null) {
            group.attachHost(node);
          }
        }}
        className={GIFT_BANNER_SPHERE_LAYER_CLASS}
        aria-hidden
      >
        {AUTH_LOGIN_SPHERE_LAYOUT.slice(0, GIFT_BANNER_SPHERE_COUNT).map((position, index) => (
          <AuthLoginSphere
            key={`gift-banner-sphere-${index}`}
            sphereId={`gift-banner-sphere-${index}`}
            position={position}
          />
        ))}
      </div>
    </AuthLoginSphereGroupContext.Provider>
  );
}

function useGiftBannerSphereRoam(
  group: AuthLoginSphereGroup,
  hostRef: RefObject<HTMLDivElement | null>,
): void {
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (reducedMotion) {
      group.freeze();
      return;
    }
    group.start();
    return () => {
      group.stop();
    };
  }, [group, reducedMotion]);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) {
      return;
    }
    return bindGiftBannerSphereHost(group, host);
  }, [group, hostRef]);
}

function bindGiftBannerSphereHost(group: AuthLoginSphereGroup, host: HTMLDivElement): () => void {
  const observer = new ResizeObserver(() => {
    group.relayoutOnResize();
  });
  observer.observe(host);

  const onPointerMove = (event: PointerEvent) => {
    group.setPointer({ x: event.clientX, y: event.clientY });
  };
  const onPointerLeave = () => {
    group.clearPointer();
  };

  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerleave", onPointerLeave);

  return () => {
    observer.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerleave", onPointerLeave);
    group.clearPointer();
  };
}
