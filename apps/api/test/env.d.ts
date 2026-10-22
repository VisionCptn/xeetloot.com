import type { Env as WorkerEnv } from "../src/env.js";

declare global {
  namespace Cloudflare {
    // Empty body is required here — this merges WorkerEnv's members into
    // the global Cloudflare.Env namespace via declaration merging, which
    // only works through an interface extension, not a type alias.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface Env extends WorkerEnv {}
  }
}

export {};
