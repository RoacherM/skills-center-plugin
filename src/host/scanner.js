import { readdir, readFile, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { homedir } from 'node:os';

function parseFrontmatter(markdown) {
  if (!markdown.startsWith('---')) return { metadata: {}, body: markdown };
  const end = markdown.indexOf('\n---', 3);
  if (end === -1) return { metadata: {}, body: markdown };

  const frontmatterRaw = markdown.slice(3, end).trim();
  const body = markdown.slice(end + 4).trim();
  const metadata = {};

  for (const line of frontmatterRaw.split('\n')) {
    const colon = line.indexOf(':');
    if (colon > 0) {
      const key = line.slice(0, colon).trim();
      let value = line.slice(colon + 1).trim();
      // Remove basic surrounding quotes
      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }
      metadata[key] = value;
    }
  }

  return { metadata, body };
}

export async function loadSkills(options = {}) {
  const skills = [];
  const home = homedir();
  const agentsDir = join(home, '.agents');
  const lockPath = join(agentsDir, '.skill-lock.json');
  let lockMap = {};

  try {
    const lockRaw = await readFile(lockPath, 'utf8');
    const parsed = JSON.parse(lockRaw);
    lockMap = parsed.skills || {};
  } catch {
    // lock file might not exist
  }

  // 1. Scan ~/.agents/skills (Third-party & User installed skills)
  const userSkillsDir = join(agentsDir, 'skills');
  try {
    const entries = await readdir(userSkillsDir, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory() && !ent.isSymbolicLink()) continue;
      const skillName = ent.name;
      const skillDir = join(userSkillsDir, skillName);
      const skillFile = join(skillDir, 'SKILL.md');

      try {
        const raw = await readFile(skillFile, 'utf8');
        const { metadata, body } = parseFrontmatter(raw);
        const lockInfo = lockMap[skillName] || {};

        skills.push({
          name: metadata.name || skillName,
          description: metadata.description || '',
          whenToUse: metadata['when-to-use'] || metadata.whenToUse || '',
          source: 'third-party',
          sourceUrl: lockInfo.sourceUrl || (lockInfo.source ? `https://github.com/${lockInfo.source}` : ''),
          sourceRepo: lockInfo.source || 'Local / Custom',
          installedAt: lockInfo.installedAt || null,
          updatedAt: lockInfo.updatedAt || null,
          path: skillDir,
          hasBody: true,
        });
      } catch {
        // Not a standard skill directory or missing SKILL.md
      }
    }
  } catch {
    // ~/.agents/skills not found
  }

  // 2. Scan Built-in Office skills if available
  const officeSkillsDir = '/Applications/DeepSeek Harness.app/Contents/Resources/runtime/office-skills';
  try {
    const entries = await readdir(officeSkillsDir, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const skillName = ent.name;
      if (skillName === 'scripts') continue;
      const skillDir = join(officeSkillsDir, skillName);
      const skillFile = join(skillDir, 'SKILL.md');

      try {
        const raw = await readFile(skillFile, 'utf8');
        const { metadata } = parseFrontmatter(raw);
        skills.push({
          name: metadata.name || skillName,
          description: metadata.description || '',
          whenToUse: metadata['when-to-use'] || metadata.whenToUse || '',
          source: 'builtin',
          sourceUrl: '',
          sourceRepo: 'DeepSeek Harness Built-in',
          installedAt: null,
          updatedAt: null,
          path: skillDir,
          hasBody: true,
        });
      } catch {}
    }
  } catch {}

  // Sort alphabetically by name
  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}

export async function getSkillDetail(skillName) {
  const home = homedir();
  const agentsDir = join(home, '.agents');
  const userSkillFile = join(agentsDir, 'skills', skillName, 'SKILL.md');
  const officeSkillFile = join('/Applications/DeepSeek Harness.app/Contents/Resources/runtime/office-skills', skillName, 'SKILL.md');

  let raw = null;
  let filePath = '';
  let source = 'third-party';

  try {
    raw = await readFile(userSkillFile, 'utf8');
    filePath = userSkillFile;
  } catch {
    try {
      raw = await readFile(officeSkillFile, 'utf8');
      filePath = officeSkillFile;
      source = 'builtin';
    } catch {
      return null;
    }
  }

  const { metadata, body } = parseFrontmatter(raw);

  let lockInfo = {};
  if (source === 'third-party') {
    try {
      const lockRaw = await readFile(join(agentsDir, '.skill-lock.json'), 'utf8');
      const parsed = JSON.parse(lockRaw);
      lockInfo = (parsed.skills && parsed.skills[skillName]) || {};
    } catch {}
  }

  return {
    name: metadata.name || skillName,
    description: metadata.description || '',
    whenToUse: metadata['when-to-use'] || metadata.whenToUse || '',
    source,
    sourceUrl: lockInfo.sourceUrl || (lockInfo.source ? `https://github.com/${lockInfo.source}` : ''),
    sourceRepo: lockInfo.source || (source === 'builtin' ? 'DeepSeek Harness Built-in' : 'Local / Custom'),
    installedAt: lockInfo.installedAt || null,
    updatedAt: lockInfo.updatedAt || null,
    filePath,
    rawContent: raw,
    body,
    metadata,
  };
}
