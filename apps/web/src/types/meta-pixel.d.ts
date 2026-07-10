export {};

declare global {
  interface Window {
    fbq?: (
      command: "init" | "track",
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}
