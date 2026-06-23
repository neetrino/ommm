"use client";

import { useEffect, useMemo } from "react";
import { AUTH_LOGIN_SPHERE_LAYOUT } from "@/components/auth/auth-login-sphere-layout";
import { AuthLoginSphereGroupContext } from "@/components/auth/auth-login-sphere-group-context";
import { createAuthLoginSphereGroup } from "@/components/auth/auth-login-sphere-group";
import { AuthLoginSphere } from "@/components/auth/auth-login-sphere";
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import styles from "@/components/auth/auth-login-sphere-field.module.css";

export function AuthLoginSphereField() {
  const reducedMotion = usePrefersReducedMotion();
  const group = useMemo(() => createAuthLoginSphereGroup(), []);

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
    const onResize = () => {
      group.relayoutOnResize();
    };

    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [group]);

  return (
    <AuthLoginSphereGroupContext.Provider value={group}>
      <div className={styles.layer} aria-hidden="true">
        {AUTH_LOGIN_SPHERE_LAYOUT.map((position, index) => (
          <AuthLoginSphere
            key={`auth-login-sphere-${index}`}
            sphereId={`sphere-${index}`}
            position={position}
          />
        ))}
      </div>
    </AuthLoginSphereGroupContext.Provider>
  );
}
