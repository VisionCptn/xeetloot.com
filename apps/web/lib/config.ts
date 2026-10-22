/** loot-api's public origin — only used to build a full href for an
 * already-signed /dl link. Never used for /resolve or /convert, which
 * always go through the service binding (see lib/api-client.ts). */
export function apiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL || "";
}

export function toApiUrl(relativeUrl: string): string {
  return `${apiBaseUrl()}${relativeUrl}`;
}
