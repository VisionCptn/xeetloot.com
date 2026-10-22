import type { ResolveErrorCode } from "./types.js";

export class ResolveError extends Error {
  constructor(
    message: string,
    public code: ResolveErrorCode,
  ) {
    super(message);
    this.name = "ResolveError";
  }
}
