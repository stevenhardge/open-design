import type { WorkspaceCollabContext } from '@open-design/contracts';
import { workspaceProjectHeaders } from '../collab/workspace-identity';

// One authenticated read that carries everything a project open needs:
// project row, resolved dir, workspace scope, files, folders and tabs.
// Consumers (`fetchProjectFiles`, `fetchProjectFolders`, `loadTabs`) join the
// in-flight promise instead of issuing their own request, so a project open
// costs one tunnel round trip instead of five.
export interface ProjectBootstrapPayload {
  project: Record<string, unknown>;
  resolvedDir: string | null;
  scope: unknown;
  files: unknown[];
  folders: unknown[];
  tabs: unknown;
}

// Short retention only: the seeded slices describe the project at open time,
// and a later mutation or agent write must be able to force a real read. 0.27.0
// raised the stakes on freshness (per-principal probes capture identity at
// request time, and its fixtures expect a fresh read per mount), so this
// window stays narrow — it only has to cover the mount burst that follows the
// route bootstrap, not a later revisit.
const FRESH_MS = 1_500;

const inflight = new Map<string, Promise<ProjectBootstrapPayload | null>>();
const settled = new Map<string, { at: number; payload: ProjectBootstrapPayload | null }>();

function bootstrapKey(
  projectId: string,
  workspaceContext?: WorkspaceCollabContext | null,
): string {
  return [
    projectId,
    workspaceContext?.workspaceId ?? '',
    workspaceContext?.workspaceMemberId ?? '',
  ].join(':');
}

async function fetchBootstrap(
  projectId: string,
  workspaceContext?: WorkspaceCollabContext | null,
): Promise<ProjectBootstrapPayload | null> {
  try {
    const resp = await fetch(`/api/projects/${encodeURIComponent(projectId)}/bootstrap`, {
      cache: 'no-store',
      ...(workspaceContext ? { headers: workspaceProjectHeaders(workspaceContext) } : {}),
    });
    if (!resp.ok) return null;
    return (await resp.json()) as ProjectBootstrapPayload;
  } catch {
    return null;
  }
}

/** Start (or join) the bootstrap read for an opening project. */
export function startProjectBootstrap(
  projectId: string,
  workspaceContext?: WorkspaceCollabContext | null,
): Promise<ProjectBootstrapPayload | null> {
  const key = bootstrapKey(projectId, workspaceContext);
  const running = inflight.get(key);
  if (running) return running;
  const recent = settled.get(key);
  if (recent && Date.now() - recent.at < FRESH_MS) {
    return Promise.resolve(recent.payload);
  }
  const promise = fetchBootstrap(projectId, workspaceContext)
    .then((payload) => {
      settled.set(key, { at: Date.now(), payload });
      return payload;
    })
    .finally(() => {
      if (inflight.get(key) === promise) inflight.delete(key);
    });
  inflight.set(key, promise);
  return promise;
}

/**
 * Returns the pending or just-settled bootstrap, or null when no bootstrap is
 * running. Readers use this to ride the opening read rather than start a
 * duplicate; a null result means "fetch normally".
 */
export function peekProjectBootstrap(
  projectId: string,
  workspaceContext?: WorkspaceCollabContext | null,
): Promise<ProjectBootstrapPayload | null> | null {
  const key = bootstrapKey(projectId, workspaceContext);
  const running = inflight.get(key);
  if (running) return running;
  const recent = settled.get(key);
  if (recent && Date.now() - recent.at < FRESH_MS) {
    return Promise.resolve(recent.payload);
  }
  return null;
}

/** Test-only: drop in-flight and settled bootstrap payloads. */
export function resetProjectBootstrapCache(): void {
  inflight.clear();
  settled.clear();
}
