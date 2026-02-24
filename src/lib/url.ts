/**
 * Normalizes a URL to a canonical form for deduplication.
 * - Lowercases hostname
 * - Strips "www." prefix
 * - Strips trailing slash
 * - Strips fragment (#...)
 * - Keeps path and query params
 */
export function normalizeUrl(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    const hostname = url.hostname.toLowerCase().replace(/^www\./, "");
    const pathname = url.pathname.replace(/\/+$/, "") || "";
    const search = url.search || "";
    return `${url.protocol}//${hostname}${pathname}${search}`;
  } catch {
    // If URL parsing fails, just lowercase and trim
    return rawUrl.toLowerCase().trim();
  }
}
