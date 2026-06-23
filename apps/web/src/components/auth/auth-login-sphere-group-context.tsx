"use client";

import { createContext, useContext } from "react";
import type { AuthLoginSphereGroup } from "@/components/auth/auth-login-sphere-group";

export const AuthLoginSphereGroupContext = createContext<AuthLoginSphereGroup | null>(null);

export function useAuthLoginSphereGroup(): AuthLoginSphereGroup {
  const group = useContext(AuthLoginSphereGroupContext);
  if (!group) {
    throw new Error("AuthLoginSphere must be rendered inside AuthLoginSphereField.");
  }
  return group;
}
