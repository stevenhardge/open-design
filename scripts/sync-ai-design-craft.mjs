#!/usr/bin/env node
// Maintainer tool: derive the OpenCode-local copy of the `ai-design-craft`
// skill from the canonical copy vendored in this repo.
//
//   canonical  skills/ai-design-craft/SKILL.md            (OD frontmatter + OD section)
//   derived    $OD_OPENCODE_SKILLS_DIR/ai-design-craft/SKILL.md
//              (defaults to ~/.config/opencode/skills/ai-design-craft/SKILL.md)
//
// The two copies exist because OD's skill scanner wants an `od:` frontmatter
// block and an "OpenDesign integration" section, while every other agent
// directory wants a plain skill with no OD-specific vocabulary. Keeping them
// as two hand-maintained files is what let them drift; this script makes the
// repo copy the single source of truth.
//
// The transform is deliberately structural, not prose-rewriting — it never
// touches the body text:
//   1. frontmatter keeps only the top-level `name` and `description` keys
//      (drops `triggers:` and the whole `od:` block)
//   2. the `## OpenDesign integration` section is dropped
//   3. a generated-by marker is inserted after the frontmatter
//
// That means the canonical body must stay OD-neutral outside the
// `## OpenDesign integration` section. If you need an OD-only sentence, put
// it in that section; if you need a portable sentence, put it anywhere else.
//
// Usage:
//   node scripts/sync-ai-design-craft.mjs            # write the derived copy
//   node scripts/sync-ai-design-craft.mjs --check    # exit 1 when stale
//   node scripts/sync-ai-design-craft.mjs --print     # print to stdout

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');
const SKILL_NAME = 'ai-design-craft';
const CANONICAL = path.join(REPO_ROOT, 'skills', SKILL_NAME, 'SKILL.md');
const DERIVED_DIR =
  process.env.OD_OPENCODE_SKILLS_DIR ??
  path.join(os.homedir(), '.config', 'opencode', 'skills');
const DERIVED = path.join(DERIVED_DIR, SKILL_NAME, 'SKILL.md');

const OD_SECTION_HEADING = '## OpenDesign integration';
const KEEP_FRONTMATTER_KEYS = new Set(['name', 'description']);
const MARKER =
  '<!-- Generated from skills/ai-design-craft/SKILL.md in the OpenDesign repo.\n' +
  '     Edit that file (and the OpenDesign integration section for OD-only text),\n' +
  '     then run: node scripts/sync-ai-design-craft.mjs -->';

function splitFrontmatter(source) {
  if (!source.startsWith('---\n')) {
    throw new Error('canonical SKILL.md does not start with a --- frontmatter fence');
  }
  const end = source.indexOf('\n---\n', 3);
  if (end === -1) throw new Error('canonical SKILL.md frontmatter is unterminated');
  return {
    frontmatter: source.slice(4, end + 1),
    body: source.slice(end + 5),
  };
}

/** Keep allow-listed top-level keys plus their indented block-scalar bodies. */
function filterFrontmatter(frontmatter) {
  const kept = [];
  let keeping = false;
  for (const line of frontmatter.split('\n')) {
    if (line === '') continue;
    const isTopLevel = /^[A-Za-z0-9_-]+:/.test(line);
    if (isTopLevel) {
      const key = line.slice(0, line.indexOf(':'));
      keeping = KEEP_FRONTMATTER_KEYS.has(key);
      if (keeping) kept.push(line);
      continue;
    }
    if (keeping) kept.push(line);
  }
  return kept.join('\n');
}

/** Drop a `## <heading>` section: up to the next `## ` heading or EOF. */
function dropSection(body, heading) {
  const lines = body.split('\n');
  const start = lines.indexOf(heading);
  if (start === -1) return body;
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i += 1) {
    if (lines[i].startsWith('## ')) {
      end = i;
      break;
    }
  }
  // Also swallow the blank line that separated the removed section.
  let from = start;
  if (from > 0 && lines[from - 1] === '') from -= 1;
  lines.splice(from, end - from);
  return `${lines.join('\n').replace(/\n{3,}/g, '\n\n').trimEnd()}\n`;
}

function derive(canonicalSource) {
  const { frontmatter, body } = splitFrontmatter(canonicalSource);
  const filtered = filterFrontmatter(frontmatter);
  const stripped = dropSection(body, OD_SECTION_HEADING);
  return `---\n${filtered}\n---\n\n${MARKER}\n\n${stripped.replace(/^\n+/, '')}`;
}

async function main() {
  const mode = process.argv.includes('--check')
    ? 'check'
    : process.argv.includes('--print')
      ? 'print'
      : 'write';

  const canonicalSource = await readFile(CANONICAL, 'utf8');
  const derived = derive(canonicalSource);

  if (derived.includes(OD_SECTION_HEADING)) {
    throw new Error('derived output still contains the OpenDesign section — check the transform');
  }
  if (!derived.includes('# ai-design-craft')) {
    throw new Error('derived output lost the skill body — check the transform');
  }

  if (mode === 'print') {
    process.stdout.write(derived);
    return;
  }

  if (mode === 'check') {
    const current = await readFile(DERIVED, 'utf8').catch(() => null);
    if (current === derived) {
      console.log(`[sync] ${DERIVED} is up to date.`);
      return;
    }
    console.error(
      `[sync] STALE — ${DERIVED}\n` +
        `       Run: node scripts/sync-ai-design-craft.mjs`,
    );
    process.exit(1);
  }

  await mkdir(path.dirname(DERIVED), { recursive: true });
  await writeFile(DERIVED, derived);
  console.log(`[sync] wrote ${DERIVED}`);
}

main().catch((err) => {
  console.error('[sync] failed:', err && err.message ? err.message : err);
  process.exit(2);
});
