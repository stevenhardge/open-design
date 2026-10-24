import { detectAgents, detectAgentsStream } from './detection.js';
import type { DetectedAgent } from './types.js';

// Agent discovery spawns one bounded probe per registered CLI (27+ at the
// time of writing), so an uncached `GET /api/agents` costs seconds. The web
// shell re-requests it on navigation, which turns that into a recurring stall.
// A short TTL keeps the installed-CLI picture fresh while making repeat
// requests effectively free. `OD_AGENTS_CACHE_TTL_MS=0` disables caching.
const DEFAULT_TTL_MS = 60_000;

export interface DetectionCacheOptions {
  ttlMs?: number;
  now?: () => number;
}

export interface DetectionCacheReadOptions {
  refresh?: boolean;
  load: () => Promise<DetectedAgent[]>;
}

export interface DetectionCache {
  read(key: string, options: DetectionCacheReadOptions): Promise<DetectedAgent[]>;
  peek(key: string): DetectedAgent[] | null;
  store(key: string, agents: DetectedAgent[]): void;
  invalidate(): void;
}

interface CacheEntry {
  key: string;
  at: number;
  agents: DetectedAgent[];
}

export function createDetectionCache(options: DetectionCacheOptions = {}): DetectionCache {
  const ttlMs = options.ttlMs ?? DEFAULT_TTL_MS;
  const now = options.now ?? Date.now;
  let entry: CacheEntry | null = null;
  let inflight: {
    key: string;
    token: object;
    promise: Promise<DetectedAgent[]>;
  } | null = null;

  const fresh = (key: string): DetectedAgent[] | null => {
    if (!entry || entry.key !== key) return null;
    // ttl 0 disables caching entirely.
    if (ttlMs === 0) return null;
    if (now() - entry.at >= ttlMs) return null;
    return entry.agents;
  };

  const store = (key: string, agents: DetectedAgent[]) => {
    entry = { key, at: now(), agents };
  };

  const startLoad = (key: string, load: () => Promise<DetectedAgent[]>) => {
    if (inflight && inflight.key === key) return inflight.promise;
    const token = {};
    const promise = (async () => {
      try {
        const agents = await load();
        store(key, agents);
        return agents;
      } catch (error) {
        // Keep serving the last good picture rather than blanking the agent
        // picker because one probe pass failed.
        if (entry && entry.key === key) return entry.agents;
        throw error;
      } finally {
        if (inflight && inflight.token === token) inflight = null;
      }
    })();
    inflight = { key, token, promise };
    return promise;
  };

  const read = (key: string, { refresh = false, load }: DetectionCacheReadOptions) => {
    if (!refresh) {
      const cached = fresh(key);
      if (cached) return Promise.resolve(cached);
      // Stale but usable: answer from the previous probe pass immediately and
      // refresh in the background. A navigation after the TTL must never wait
      // seconds just because the cached list aged out.
      if (entry && entry.key === key) {
        if (!inflight || inflight.key !== key) void startLoad(key, load).catch(() => {});
        return Promise.resolve(entry.agents);
      }
    }
    return startLoad(key, load);
  };

  return {
    read,
    peek: (key) => fresh(key),
    store,
    invalidate() {
      entry = null;
      inflight = null;
    },
  };
}

function cacheTtlMs(): number {
  const raw = Number(process.env.OD_AGENTS_CACHE_TTL_MS);
  return Number.isFinite(raw) && raw >= 0 ? raw : DEFAULT_TTL_MS;
}

/** Stable key for the per-agent CLI env override map from app config. */
export function agentEnvCacheKey(
  configuredEnvByAgent: Record<string, Record<string, string>> = {},
): string {
  const agentIds = Object.keys(configuredEnvByAgent).sort();
  return JSON.stringify(
    agentIds.map((agentId) => {
      const env = configuredEnvByAgent[agentId] ?? {};
      return [agentId, Object.keys(env).sort().map((name) => [name, env[name]])];
    }),
  );
}

let sharedCache: DetectionCache | null = null;

function cache(): DetectionCache {
  if (!sharedCache) sharedCache = createDetectionCache({ ttlMs: cacheTtlMs() });
  return sharedCache;
}

/** Drop the cached agent list (Settings refresh, tests, explicit reloads). */
export function invalidateAgentDetectionCache(): void {
  sharedCache?.invalidate();
}

export function detectAgentsCached(
  configuredEnvByAgent: Record<string, Record<string, string>> = {},
  options: { refresh?: boolean } = {},
): Promise<DetectedAgent[]> {
  const key = agentEnvCacheKey(configuredEnvByAgent);
  return cache().read(key, {
    load: () => detectAgents(configuredEnvByAgent),
    ...(options.refresh ? { refresh: true } : {}),
  });
}

/**
 * Streaming variant used by `GET /api/agents?stream=1`. A warm cache answers
 * immediately; a cold cache keeps the incremental probe so the picker can
 * still paint cards as each CLI settles.
 */
export async function* detectAgentsStreamCached(
  configuredEnvByAgent: Record<string, Record<string, string>> = {},
  options: { refresh?: boolean } = {},
): AsyncGenerator<DetectedAgent> {
  const key = agentEnvCacheKey(configuredEnvByAgent);
  if (!options.refresh) {
    const cached = cache().peek(key);
    if (cached) {
      for (const agent of cached) yield agent;
      return;
    }
  }
  const collected: DetectedAgent[] = [];
  for await (const agent of detectAgentsStream(configuredEnvByAgent)) {
    collected.push(agent);
    yield agent;
  }
  cache().store(key, collected);
}
