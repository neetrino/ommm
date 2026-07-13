"use client";

import { usePathname } from "@/i18n/navigation";
import { AuthLoginSphereField } from "@/components/auth/auth-login-sphere-field";
import {
  AUTH_LOGIN_SPHERE_SIZE_PX,
} from "@/components/auth/auth-login-sphere-tokens";
import type { CSSProperties } from "react";

const AUTH_LOGIN_SPHERE_LAYER_STYLE = {
  "--auth-login-sphere-size": `${AUTH_LOGIN_SPHERE_SIZE_PX}px`,
  "--auth-login-sphere-size-mobile": `${Math.round(AUTH_LOGIN_SPHERE_SIZE_PX * 0.42)}px`,
} as CSSProperties;

export function AuthShellBackgroundDecor() {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isRegisterPage = pathname === "/register";

  if (!isLoginPage && !isRegisterPage) {
    return null;
  }

  return (
    <div style={AUTH_LOGIN_SPHERE_LAYER_STYLE}>
      <AuthLoginSphereField />
    </div>
  );
}
