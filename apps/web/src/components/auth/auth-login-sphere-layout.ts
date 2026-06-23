export type AuthLoginSpherePosition = {
  left: number;
  top: number;
  /** Stagger WAAPI start so spheres desync. */
  startDelayMs: number;
};

/** Percentage positions across the auth shell — edges and mid-field, away from the card center. */
export const AUTH_LOGIN_SPHERE_LAYOUT: readonly AuthLoginSpherePosition[] = [
  { left: 4, top: 5, startDelayMs: 0 },
  { left: 17, top: 3, startDelayMs: 680 },
  { left: 31, top: 9, startDelayMs: 1360 },
  { left: 47, top: 2, startDelayMs: 420 },
  { left: 63, top: 7, startDelayMs: 2040 },
  { left: 79, top: 4, startDelayMs: 1020 },
  { left: 93, top: 11, startDelayMs: 2720 },
  { left: 2, top: 26, startDelayMs: 540 },
  { left: 11, top: 44, startDelayMs: 1700 },
  { left: 5, top: 63, startDelayMs: 860 },
  { left: 89, top: 30, startDelayMs: 2380 },
  { left: 95, top: 47, startDelayMs: 280 },
  { left: 91, top: 67, startDelayMs: 1200 },
  { left: 7, top: 84, startDelayMs: 3060 },
  { left: 86, top: 89, startDelayMs: 1880 },
];
