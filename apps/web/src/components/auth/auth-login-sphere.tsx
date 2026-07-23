"use client";

import type { CSSProperties } from "react";
import { useEffect, useRef } from "react";
import type { AuthLoginSpherePosition } from "@/components/auth/auth-login-sphere-layout";
import { useAuthLoginSphereGroup } from "@/components/auth/auth-login-sphere-group-context";
import { AUTH_LOGIN_SPHERE_ASSET } from "@/components/auth/auth-login-sphere-tokens";
import styles from "@/components/auth/auth-login-sphere-field.module.css";

type AuthLoginSphereProps = {
  sphereId: string;
  position: AuthLoginSpherePosition;
};

function spherePositionStyle(position: AuthLoginSpherePosition): CSSProperties {
  return {
    left: `${position.left}%`,
    top: `${position.top}%`,
  };
}

export function AuthLoginSphere({ sphereId, position }: AuthLoginSphereProps) {
  const ref = useRef<HTMLDivElement>(null);
  const group = useAuthLoginSphereGroup();

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }

    group.addSphere(
      sphereId,
      el,
      { left: position.left, top: position.top },
      position.startDelayMs,
    );

    return () => {
      group.removeSphere(sphereId);
    };
  }, [group, position.left, position.top, position.startDelayMs, sphereId]);

  return (
    <div
      ref={ref}
      className={styles.sphere}
      style={spherePositionStyle(position)}
      aria-hidden="true"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- decorative animation layer */}
      <img src={AUTH_LOGIN_SPHERE_ASSET} alt="" className={styles.sphereImage} draggable={false} />
    </div>
  );
}
