/** Imperative start hook — invoked synchronously from carousel navigation (user gesture). */
let startLogoMarkPlayback: (() => void) | null = null;

export function registerHomeHeroLogoMarkPlaybackStart(start: (() => void) | null): void {
  startLogoMarkPlayback = start;
}

export function beginHomeHeroLogoMarkPlaybackFromUserGesture(): void {
  startLogoMarkPlayback?.();
}
