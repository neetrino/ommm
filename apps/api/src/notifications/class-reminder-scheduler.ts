/** Holds at most one pending class-reminder timer per booking and offset. */
export class ClassReminderScheduler {
  private readonly pending = new Map<string, NodeJS.Timeout>();

  schedule(key: string, delayMs: number, run: () => Promise<void>): void {
    this.cancel(key);
    const handle = setTimeout(() => {
      this.pending.delete(key);
      void run();
    }, delayMs);
    handle.unref();
    this.pending.set(key, handle);
  }

  cancel(key: string): void {
    const existing = this.pending.get(key);
    if (existing === undefined) {
      return;
    }
    clearTimeout(existing);
    this.pending.delete(key);
  }

  clear(): void {
    for (const handle of this.pending.values()) {
      clearTimeout(handle);
    }
    this.pending.clear();
  }
}
