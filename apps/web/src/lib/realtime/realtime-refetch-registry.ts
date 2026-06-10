import {
  REALTIME_REFETCH_DEBOUNCE_MS,
  type RealtimeRefetchKey,
} from "@/lib/realtime/realtime-refetch-keys";

type RefetchHandler = () => void | Promise<void>;

export class RealtimeRefetchRegistry {
  private readonly handlers = new Map<RealtimeRefetchKey, Set<RefetchHandler>>();
  private readonly inFlight = new Map<RealtimeRefetchKey, Promise<void>>();
  private readonly debounceTimers = new Map<
    RealtimeRefetchKey,
    ReturnType<typeof setTimeout>
  >();

  register(key: RealtimeRefetchKey, handler: RefetchHandler): () => void {
    const bucket = this.handlers.get(key) ?? new Set<RefetchHandler>();
    bucket.add(handler);
    this.handlers.set(key, bucket);
    return () => {
      bucket.delete(handler);
      if (bucket.size === 0) {
        this.handlers.delete(key);
      }
    };
  }

  requestRefetch(keys: readonly RealtimeRefetchKey[], force = false): void {
    const uniqueKeys = [...new Set(keys)];
    for (const key of uniqueKeys) {
      if (force) {
        this.clearDebounce(key);
        void this.runKey(key);
        continue;
      }
      this.scheduleDebounced(key);
    }
  }

  forceRefetchAllRegistered(): void {
    const keys = [...this.handlers.keys()];
    this.requestRefetch(keys, true);
  }

  private scheduleDebounced(key: RealtimeRefetchKey): void {
    const existing = this.debounceTimers.get(key);
    if (existing !== undefined) {
      clearTimeout(existing);
    }
    const timer = setTimeout(() => {
      this.debounceTimers.delete(key);
      void this.runKey(key);
    }, REALTIME_REFETCH_DEBOUNCE_MS);
    this.debounceTimers.set(key, timer);
  }

  private clearDebounce(key: RealtimeRefetchKey): void {
    const timer = this.debounceTimers.get(key);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.debounceTimers.delete(key);
    }
  }

  private async runKey(key: RealtimeRefetchKey): Promise<void> {
    const pending = this.inFlight.get(key);
    if (pending !== undefined) {
      await pending;
      return;
    }
    const bucket = this.handlers.get(key);
    if (bucket === undefined || bucket.size === 0) {
      return;
    }
    const run = (async (): Promise<void> => {
      await Promise.all(
        [...bucket].map(async (handler) => {
          await handler();
        }),
      );
    })();
    this.inFlight.set(key, run);
    try {
      await run;
    } finally {
      this.inFlight.delete(key);
    }
  }
}
