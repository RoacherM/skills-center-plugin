import { readFile } from 'node:fs/promises';
import { join, dirname, basename } from 'node:path';
import { homedir } from 'node:os';
import { loadSkills, getSkillDetail } from './scanner.js';

/**
 * Reads the catalog the DSH agent actually sees (`ctx.skills`), so the page never lists a
 * skill the agent cannot use or misses one it can. `~/.agents/skills` is a directory shared by
 * every agent the `skills` CLI installs into (Claude Code, Codex, …); its entries are tagged
 * `shared` so the page can say so. Falls back to the directory scanner without the service.
 */

/** DSH `SkillSource` → the page's four groups. */
export function groupOf(source) {
  if (source === 'user-agents') return 'shared';
  if (source === 'user-dsh') return 'dsh';
  if (String(source).startsWith('project')) return 'project';
  return 'builtin';
}

async function lockMap() {
  try {
    return JSON.parse(await readFile(join(homedir(), '.agents', '.skill-lock.json'), 'utf8')).skills ?? {};
  } catch {
    return {};
  }
}

const skillFile = (s) => {
  const p = s.path ?? (s.resourceBase?.kind === 'directory' ? s.resourceBase.path : undefined);
  if (!p) return undefined;
  return basename(p).toLowerCase() === 'skill.md' ? p : join(p, 'SKILL.md');
};

function withOrigin(summary, lock) {
  const group = groupOf(summary.source);
  const file = skillFile(summary);
  const dirName = file ? basename(dirname(file)) : summary.name;
  const info = group === 'shared' ? (lock[dirName] ?? lock[summary.name] ?? {}) : {};
  return {
    name: summary.name,
    description: summary.description ?? '',
    whenToUse: summary.whenToUse ?? '',
    source: group,
    dshSource: summary.source,
    modelInvocable: summary.invocation?.modelInvocable !== false,
    sourceRepo: info.source ?? '',
    sourceUrl: info.source && info.sourceType === 'github' ? `https://github.com/${info.source}` : '',
    installedAt: info.installedAt ?? null,
    updatedAt: info.updatedAt ?? null,
    filePath: file ?? '',
  };
}

export async function listCatalog(ctx) {
  const skills = ctx.get('skills');
  if (!skills) return legacyList();
  const [summaries, lock] = await Promise.all([skills.list(), lockMap()]);
  return summaries.map((s) => withOrigin(s, lock));
}

export async function catalogDetail(ctx, name) {
  const skills = ctx.get('skills');
  if (!skills) {
    const d = await getSkillDetail(name);
    return d && { ...d, source: d.source === 'builtin' ? 'builtin' : 'shared' };
  }
  const [summaries, lock] = await Promise.all([skills.list(), lockMap()]);
  const summary = summaries.find((s) => s.name === name);
  if (!summary) return null;
  const item = withOrigin(summary, lock);
  const def = await skills.get(name);
  let rawContent = def?.content ?? '';
  if (item.filePath) rawContent = await readFile(item.filePath, 'utf8').catch(() => rawContent);
  const body = def?.content ?? rawContent.replace(/^---\n[\s\S]*?\n---\n?/, '');
  return { ...item, rawContent, body };
}

async function legacyList() {
  const skills = await loadSkills();
  return skills.map((s) => ({ ...s, source: s.source === 'builtin' ? 'builtin' : 'shared', filePath: join(s.path, 'SKILL.md') }));
}
