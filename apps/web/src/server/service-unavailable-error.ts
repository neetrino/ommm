/** Thrown when the Nest API cannot be reached from the Next server. */
export class ServiceUnavailableError extends Error {
  constructor() {
    super("API unavailable");
    this.name = "ServiceUnavailableError";
  }
}
