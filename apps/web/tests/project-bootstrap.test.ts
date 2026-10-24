import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  peekProjectBootstrap,
  resetProjectBootstrapCache,
  startProjectBootstrap,
} from '../src/state/project-bootstrap';

function jsonResponse(body: unknown, ok = true): Response {
  return {
    ok,
    status: ok ? 200 : 500,
    json: async () => body,
  } as unknown as Response;
}

describe('project bootstrap', () => {
  beforeEach(() => resetProjectBootstrapCache());
  afterEach(() => {
    vi.restoreAllMocks();
    resetProjectBootstrapCache();
  });

  test('joins concurrent opens into one request', async () => {
    let resolveFetch: (value: Response) => void = () => {};
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => {
      resolveFetch = resolve;
    }));
    vi.stubGlobal('fetch', fetchMock);

    const first = startProjectBootstrap('p1');
    const second = startProjectBootstrap('p1');
    expect(first).toBe(second);
    expect(peekProjectBootstrap('p1')).toBe(first);

    resolveFetch(jsonResponse({ files: [], folders: [], tabs: {} }));
    expect(await first).toEqual({ files: [], folders: [], tabs: {} });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('caches a settled payload for the burst window', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ files: ['a'] }));
    vi.stubGlobal('fetch', fetchMock);

    await startProjectBootstrap('p1');
    const peeked = peekProjectBootstrap('p1');
    expect(peeked).not.toBeNull();
    expect(await peeked).toEqual({ files: ['a'] });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  test('returns null and does not poison the cache when the request fails', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({}, false));
    vi.stubGlobal('fetch', fetchMock);

    expect(await startProjectBootstrap('p1')).toBeNull();
    // A failure is retained briefly so a retry storm does not hammer the daemon,
    // but a reader still falls back to its own fetch path.
    expect(peekProjectBootstrap('p1')).not.toBeNull();
  });

  test('keeps workspace scopes separate', async () => {
    const fetchMock = vi.fn(async () => jsonResponse({ files: [] }));
    vi.stubGlobal('fetch', fetchMock);
    const team = {
      workspaceId: 'ws-a',
      workspaceType: 'team',
      workspaceMemberId: 'm-1',
      role: 'owner',
      lifecycleState: 'active',
      memberStatus: 'active',
      permissions: { canShareProjects: true, canWriteSyncedFiles: true },
    } as never;

    await startProjectBootstrap('p1');
    await startProjectBootstrap('p1', team);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
