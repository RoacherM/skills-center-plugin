import test from 'node:test';
import assert from 'node:assert/strict';
import { loadSkills, getSkillDetail } from '../src/host/scanner.js';

test('loadSkills returns installed skills', async () => {
  const skills = await loadSkills();
  assert(Array.isArray(skills));
  assert(skills.length > 0, 'Should find at least some skills');
  
  const sample = skills[0];
  assert(sample.name);
  assert(typeof sample.description === 'string');
  assert(['third-party', 'builtin'].includes(sample.source));
});

test('getSkillDetail returns full skill markdown and metadata', async () => {
  const skills = await loadSkills();
  const target = skills[0].name;
  const detail = await getSkillDetail(target);
  assert(detail !== null);
  assert.equal(detail.name, target);
  assert(typeof detail.rawContent === 'string');
  assert(detail.filePath);
});
