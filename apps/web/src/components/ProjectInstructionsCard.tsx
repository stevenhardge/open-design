// Project instructions — the per-project counterpart to
// Settings → Instructions → "Global rules".
//
// WHY THIS FILE EXISTS
// The field already existed end to end and simply had no way to reach it:
//
//   storage   projects.custom_instructions                    (db.ts)
//   read      GET  /api/projects/:id    → project.customInstructions
//   write     PATCH /api/projects/:id   → updateProject()     (validates string|null, max 5000)
//   effect    injected into every run's system prompt
//             (apps/daemon/src/server.ts → user_and_project_instructions)
//
// What was missing was the surface. The copy for it had already shipped in the
// dictionaries — `project.customInstructions` ("Project instructions") and
// `project.customInstructionsPlaceholder` — with nothing rendering it. This card
// is that surface, so it introduces no new i18n keys and no new API.
//
// SCOPE
// Applies to this one project, appended after the global rules. It is not
// memory: it is fixed text, not an extracted fact. See the Global rules card's
// own hint, which draws the same line for the app-wide field.
//
// WHY IT AUTOSAVES
// The global card's draft rides the Settings dialog's own persist flow. This
// card is deliberately self-contained instead, so it needs no change to
// SettingsDialog's save plumbing — which is the whole point of it being small.
// Edits are debounced, flushed on blur, and flushed again on unmount so closing
// the dialog mid-typing cannot silently drop the last keystrokes.

import { useCallback, useEffect, useRef, useState } from 'react';

import type { WorkspaceCollabContext } from '@open-design/contracts';

import { useT } from '../i18n';
import { getProjectDetail, patchProject } from '../state/projects';

/** Mirrors the daemon's own limit — routes/project/index.ts rejects longer than this. */
const MAX_LENGTH = 5000;
const SAVE_DEBOUNCE_MS = 700;

type SaveState = 'loading' | 'idle' | 'saving' | 'saved' | 'error';

export function ProjectInstructionsCard({
  projectId,
  workspaceContext,
}: {
  /** The project whose instructions this edits. The card renders only when one is open. */
  projectId: string;
  workspaceContext?: WorkspaceCollabContext | null;
}) {
  const t = useT();
  const [value, setValue] = useState('');
  const [state, setState] = useState<SaveState>('loading');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Latest text + whether it differs from what the daemon has. Held in refs so
  // the unmount flush can read them without re-subscribing the effect.
  const latestRef = useRef('');
  const savedRef = useRef('');

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    void getProjectDetail(projectId, undefined, workspaceContext ?? null).then((detail) => {
      // A project switch mid-flight must not paint one project's text into
      // another project's field.
      if (cancelled) return;
      const loaded = detail?.project.customInstructions ?? '';
      setValue(loaded);
      latestRef.current = loaded;
      savedRef.current = loaded;
      setState('idle');
    });
    return () => {
      cancelled = true;
    };
  }, [projectId, workspaceContext]);

  const commit = useCallback(
    async (next: string) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (next === savedRef.current) return;
      setState('saving');
      // `null` clears the column; `''` would store an empty string.
      const ok = await patchProject(
        projectId,
        { customInstructions: next.length > 0 ? next : null },
        workspaceContext ?? null,
      );
      if (ok) {
        savedRef.current = next;
        setState('saved');
      } else {
        setState('error');
      }
    },
    [projectId, workspaceContext],
  );

  const onChange = useCallback(
    (next: string) => {
      setValue(next);
      latestRef.current = next;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        void commit(latestRef.current);
      }, SAVE_DEBOUNCE_MS);
    },
    [commit],
  );

  // Flush on unmount: closing Settings within the debounce window must not lose
  // the edit. Fire-and-forget — there is nothing left to await into.
  useEffect(
    () => () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (latestRef.current !== savedRef.current) {
        void patchProject(
          projectId,
          { customInstructions: latestRef.current.length > 0 ? latestRef.current : null },
          workspaceContext ?? null,
        );
      }
    },
    [projectId, workspaceContext],
  );

  const status =
    state === 'saving'
      ? t('settings.autosaveSaving')
      : state === 'saved'
        ? t('settings.autosaveSaved')
        : state === 'error'
          ? t('settings.autosaveError')
          : null;

  return (
    <div className="memory-field-block instructions-rules-card" style={{ marginTop: 12 }}>
      <div className="memory-block-head">
        <div>
          <h4>{t('project.customInstructions')}</h4>
          <p className="hint">{t('project.customInstructionsPlaceholder')}</p>
        </div>
      </div>
      <textarea
        className="custom-instructions-input instructions-rules-input"
        rows={5}
        maxLength={MAX_LENGTH}
        placeholder={t('project.customInstructionsPlaceholder')}
        value={value}
        disabled={state === 'loading'}
        onChange={(event) => onChange(event.target.value)}
        onBlur={() => void commit(latestRef.current)}
      />
      {status ? <p className="hint">{status}</p> : null}
    </div>
  );
}
