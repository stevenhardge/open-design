#!/usr/bin/env node
// Maintainer tool: report drift between the vendored `taste-skill` family in
// `skills/` and its upstream `Leonxlnx/taste-skill`.
//
// Why this exists: the family is vendored by hand (each SKILL.md carries an OD
// frontmatter shim, so a byte-for-byte compare always reports drift). In
// October 2026 upstream silently *renamed* its layout — the document we shipped
// as `taste-skill` became `taste-skill-v2-experimental` and `taste-skill`
// became a different skill — and nothing noticed for three weeks. This script
// is the thing that notices.
//
// It does NOT auto-apply. Upstream changes are reviewed by hand because the
// vendored copies are the artifact agents actually run: a whitespace-only
// upstream diff is noise, a `LAYOUT_VARIANCE` → `DESIGN_VARIANCE` diff is a
// real fix, and only a human can tell them apart cheaply.
//
// What it does:
//   - Lists the upstream skill tree at a ref (default `main`)
//   - Intersects it with the local `skills/` dirs to find the vendored family
//   - Reports upstream skills that are not vendored at all (how the missing
//     `taste-skill-v2-experimental` would have been caught)
//   - Compares every upstream file: `SKILL.md` by body (ignoring the OD
//     frontmatter shim, trailing whitespace, and blank-line runs), everything
//     else byte-for-byte
//   - Exits non-zero when there is drift
//
// Usage:
//   node scripts/sync-taste-skill.mjs                # report drift at main
//   node scripts/sync-taste-skill.mjs --ref <sha>    # pin a ref
//
// To apply: refresh the drifted file by copying the upstream body over the
// local body while keeping the local frontmatter block intact, then re-run
// this script until it is clean.

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = path.join(REPO_ROOT, 'skills');
const UPSTREAM_REPO = 'Leonxlnx/taste-skill';
const UPSTREAM_SKILLS_PREFIX = 'skills/';

// Upstream keeps a single `LICENSE` at the repo root. OD's skills convention is
// "Apache-2.0 unless the folder carries its own LICENSE", so each vendored
// family folder mirrors the MIT text locally. That local extra is expected and
// is not drift.
const LOCAL_ONLY_FILES = new Set(['LICENSE']);

const refIndex = process.argv.indexOf('--ref');
const REF = refIndex === -1 ? 'main' : process.argv[refIndex + 1];
if (!REF) {
  console.error('[sync] --ref needs a value');
  process.exit(2);
}

const api = (p) => `https://api.github.com/repos/${UPSTREAM_REPO}/${p}`;
const raw = (p) => `https://raw.githubusercontent.com/${UPSTREAM_REPO}/${REF}/${p}`;

/** Strip the leading `---` frontmatter block. */
function stripFrontmatter(text) {
  const m = /^---\r?\n[\s\S]*?\r?\n---\r?\n/.exec(text);
  return m ? text.slice(m[0].length) : text;
}

/** Content comparison: ignore the OD shim, trailing whitespace, blank runs. */
function normalizeBody(text) {
  return stripFrontmatter(text)
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\n+/, '')
    .replace(/\n+$/, '\n');
}

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

/** Local files under a skill dir, relative paths, sorted. */
async function localFiles(dir) {
  const out = [];
  async function walk(rel) {
    const entries = await readdir(path.join(dir, rel), { withFileTypes: true });
    for (const e of entries) {
      const child = rel ? `${rel}/${e.name}` : e.name;
      if (e.isDirectory()) await walk(child);
      else if (e.isFile()) out.push(child);
    }
  }
  await walk('');
  return out.sort();
}

async function main() {
  const treeRes = await fetch(api(`git/trees/${REF}?recursive=1`), {
    headers: { accept: 'application/vnd.github+json' },
  });
  if (!treeRes.ok) throw new Error(`GitHub tree fetch failed: ${treeRes.status}`);
  const tree = await treeRes.json();
  if (!Array.isArray(tree.tree)) throw new Error('unexpected GitHub tree payload');

  /** upstream skill dir -> [relative file paths] */
  const upstream = new Map();
  for (const e of tree.tree) {
    if (e.type !== 'blob' || !e.path.startsWith(UPSTREAM_SKILLS_PREFIX)) continue;
    const rest = e.path.slice(UPSTREAM_SKILLS_PREFIX.length);
    const slash = rest.indexOf('/');
    if (slash === -1) continue;
    const skill = rest.slice(0, slash);
    const file = rest.slice(slash + 1);
    if (!upstream.has(skill)) upstream.set(skill, []);
    upstream.get(skill).push(file);
  }

  const localDirs = (await readdir(SKILLS_DIR, { withFileTypes: true }))
    .filter((e) => e.isDirectory())
    .map((e) => e.name);
  const localSet = new Set(localDirs);

  const vendored = [...upstream.keys()].filter((s) => localSet.has(s)).sort();
  const notVendored = [...upstream.keys()].filter((s) => !localSet.has(s)).sort();

  const changed = [];
  const missingLocally = [];
  const staleLocally = [];

  for (const skill of vendored) {
    const upstreamFiles = [...upstream.get(skill)].sort();
    const localFiles_ = await localFiles(path.join(SKILLS_DIR, skill));
    const localSet_ = new Set(localFiles_);

    for (const file of upstreamFiles) {
      if (!localSet_.has(file)) {
        missingLocally.push(`${skill}/${file}`);
        continue;
      }
      const localText = await readFile(path.join(SKILLS_DIR, skill, file), 'utf8');
      const upstreamText = await fetch(raw(`skills/${skill}/${file}`)).then((r) => {
        if (!r.ok) throw new Error(`raw fetch failed for ${skill}/${file}: ${r.status}`);
        return r.text();
      });
      const same =
        file === 'SKILL.md'
          ? normalizeBody(localText) === normalizeBody(upstreamText)
          : localText === upstreamText;
      if (!same) changed.push(`${skill}/${file}`);
    }

    for (const file of localFiles_) {
      if (upstreamFiles.includes(file)) continue;
      if (LOCAL_ONLY_FILES.has(file)) continue;
      staleLocally.push(`${skill}/${file}`);
    }
  }

  console.log(`[sync] ${UPSTREAM_REPO} @ ${REF} (${tree.sha?.slice(0, 8) ?? '?'})`);
  console.log(`[sync] vendored family: ${vendored.length} skill(s)`);
  if (notVendored.length) {
    console.log(`[sync] NOTE — upstream skills not vendored locally (informational):`);
    for (const s of notVendored) console.log(`        ? skills/${s}/`);
  }

  if (!changed.length && !missingLocally.length && !staleLocally.length) {
    console.log('[sync] no content drift — every vendored file matches upstream.');
    return;
  }

  console.log('\n[sync] DRIFT DETECTED — review each diff and refresh by hand.\n');
  if (changed.length) {
    console.log('  Changed upstream (local body differs):');
    for (const f of changed) console.log(`    ~ skills/${f}`);
  }
  if (missingLocally.length) {
    console.log('  Added upstream (missing locally):');
    for (const f of missingLocally) console.log(`    + skills/${f}`);
  }
  if (staleLocally.length) {
    console.log('  Removed upstream (still vendored locally):');
    for (const f of staleLocally) console.log(`    - skills/${f}`);
  }
  console.log(
    '\n  To refresh a SKILL.md: replace the body after the closing `---` with\n' +
      '  the upstream body and keep the local frontmatter block intact.\n' +
      '  Then re-run this script until it reports no drift.',
  );
  process.exitCode = 1;
}

main().catch((err) => {
  console.error('[sync] failed:', err && err.message ? err.message : err);
  process.exit(2);
});
