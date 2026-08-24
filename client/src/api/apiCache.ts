// Tiny in-memory GET-response cache. Scoped per browser tab (cleared on
// reload) — this is about avoiding redundant refetches while navigating
// around the site, not long-term persistence.
//
// Keyed by accessToken so one user's cached response (e.g. a browse page's
// per-item is_watching flags) never leaks into another user's session.

type CacheEntry = { data: unknown; expiresAt: number };

const cache = new Map<string, CacheEntry>();

function buildKey(path: string, accessToken: string | null | undefined): string {
  return `${accessToken ?? "anon"}::${path}`;
}

export function getCached<T>(path: string, accessToken: string | null | undefined): T | undefined {
  const entry = cache.get(buildKey(path, accessToken));
  if (!entry) return undefined;
  if (Date.now() > entry.expiresAt) {
    cache.delete(buildKey(path, accessToken));
    return undefined;
  }
  return entry.data as T;
}

export function setCached(path: string, accessToken: string | null | undefined, data: unknown, ttlMs: number): void {
  cache.set(buildKey(path, accessToken), { data, expiresAt: Date.now() + ttlMs });
}

// Call after a mutation so stale reads don't linger — e.g. clear everything
// after login/logout (identity changed) or a specific prefix after an
// action that invalidates it (rarely needed since TTLs are short).
export function clearCache(pathPrefix?: string): void {
  if (!pathPrefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    const path = key.slice(key.indexOf("::") + 2);
    if (path.startsWith(pathPrefix)) cache.delete(key);
  }
}
