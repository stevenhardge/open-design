import { describe, expect, test } from 'vitest';
import {
  agentEnvCacheKey,
  createDetectionCache,
} from '../../src/runtimes/detection-cache.js';
import type { DetectedAgent } from '../../src/runtimes/types.js';

function agent(id: string): DetectedAgent {
  return { id } as DetectedAgent;
}

describe('createDetectionCache', () => {
  test('serves a cached list within the TTL and refreshes stale entries in the background', async () => {
    let now = 1_000;
    let calls = 0;
    const cache = createDetectionCache({ ttlMs: 100, now: () => now });
    const load = async () => {
      calls += 1;
      return [agent(`a${calls}`)];
    };

    expect(await cache.read('k', { load })).toEqual([agent('a1')]);
    now += 50;
    expect(await cache.read('k', { load })).toEqual([agent('a1')]);
    expect(calls).toBe(1);

    now += 51;
    // Stale entry is answered immediately; the probe runs in the background.
    expect(await cache.read('k', { load })).toEqual([agent('a1')]);
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(calls).toBe(2);
    expect(await cache.read('k', { load })).toEqual([agent('a2')]);
  });

  test('collapses concurrent cold reads into one probe', async () => {
    let calls = 0;
    const cache = createDetectionCache({ ttlMs: 100 });
    let release: (agents: DetectedAgent[]) => void = () => {};
    const load = () => {
      calls += 1;
      return new Promise<DetectedAgent[]>((resolve) => {
        release = resolve;
      });
    };

    const first = cache.read('k', { load });
    const second = cache.read('k', { load });
    release([agent('a')]);
    expect(await Promise.all([first, second])).toEqual([[agent('a')], [agent('a')]]);
    expect(calls).toBe(1);
  });

  test('refresh bypasses a fresh entry', async () => {
    let calls = 0;
    const cache = createDetectionCache({ ttlMs: 10_000 });
    const load = async () => {
      calls += 1;
      return [agent(`a${calls}`)];
    };
    await cache.read('k', { load });
    expect(await cache.read('k', { load, refresh: true })).toEqual([agent('a2')]);
    expect(calls).toBe(2);
  });

  test('keeps the last good list when a refresh fails', async () => {
    const cache = createDetectionCache({ ttlMs: 1 });
    await cache.read('k', { load: async () => [agent('good')] });
    const failing = async () => {
      throw new Error('probe exploded');
    };
    expect(await cache.read('k', { load: failing, refresh: true })).toEqual([agent('good')]);
  });

  test('a new key never reuses the previous env key', async () => {
    let calls = 0;
    const cache = createDetectionCache({ ttlMs: 10_000 });
    const load = async () => {
      calls += 1;
      return [agent(`a${calls}`)];
    };
    await cache.read('k1', { load });
    expect(await cache.read('k2', { load })).toEqual([agent('a2')]);
    expect(calls).toBe(2);
    expect(cache.peek('k1')).toBeNull();
  });

  test('ttl 0 disables caching', async () => {
    let calls = 0;
    const cache = createDetectionCache({ ttlMs: 0 });
    const load = async () => {
      calls += 1;
      return [agent(`a${calls}`)];
    };
    await cache.read('k', { load });
    await cache.read('k', { load });
    expect(calls).toBe(2);
  });
});

describe('agentEnvCacheKey', () => {
  test('is stable across object key order and distinguishes values', () => {
    const a = { codex: { B: '2', A: '1' }, claude: { Z: '3' } };
    const b = { claude: { Z: '3' }, codex: { A: '1', B: '2' } };
    expect(agentEnvCacheKey(a)).toBe(agentEnvCacheKey(b));
    expect(agentEnvCacheKey(a)).not.toBe(agentEnvCacheKey({ codex: { A: '1' } }));
  });
});
