import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

// Service binding dispatch ignores the actual host — this just has to be a
// well-formed URL so loot-api's own router sees the right pathname+query.
const API_ORIGIN = "https://loot-api.internal";

/** Calls loot-api through the Service Binding (wrangler.jsonc `API`) —
 * never a public URL, and never the extractor directly. This is the only
 * way any apps/web code reaches the backend. */
export async function callApi(path: string, init?: RequestInit): Promise<Response> {
  const { env } = getCloudflareContext();
  return env.API.fetch(new URL(path, API_ORIGIN).toString(), init);
}
