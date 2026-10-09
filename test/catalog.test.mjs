import test from 'node:test';
import assert from 'node:assert/strict';
import { groupOf, listCatalog, catalogDetail } from '../src/host/catalog.js';

test('groupOf maps DSH skill sources to page groups', () => {
  assert.equal(groupOf('user-agents'), 'shared');
  assert.equal(groupOf('user-dsh'), 'dsh');
  assert.equal(groupOf('project-agents'), 'project');
  assert.equal(groupOf('project-dsh'), 'project');
  assert.equal(groupOf('bundled'), 'builtin');
  assert.equal(groupOf('custom'), 'builtin');
});

const fakeCtx = (summaries, content = 'Body') => ({
  get: (key) => key === 'skills' ? {
    list: async () => summaries,
    get: async (name) => ({ ...summaries.find((s) => s.name === name), content }),
  } : undefined,
});

test('listCatalog reports exactly the service catalog, tagged by origin', async () => {
  const ctx = fakeCtx([
    { name: 'a', description: 'A', source: 'user-agents', invocation: { modelInvocable: true, userInvocable: true }, provider: 'filesystem' },
    { name: 'b', description: 'B', source: 'bundled', invocation: { modelInvocable: false, userInvocable: true }, provider: 'filesystem' },
  ]);
  const list = await listCatalog(ctx);
  assert.deepEqual(list.map((s) => [s.name, s.source, s.modelInvocable]), [['a', 'shared', true], ['b', 'builtin', false]]);
});

test('catalogDetail returns the body and null for unknown skills', async () => {
  const ctx = fakeCtx([{ name: 'a', description: 'A', source: 'user-dsh', invocation: {}, provider: 'filesystem' }], '# Hi');
  const detail = await catalogDetail(ctx, 'a');
  assert.equal(detail.body, '# Hi');
  assert.equal(detail.source, 'dsh');
  assert.equal(await catalogDetail(ctx, 'missing'), null);
});

test('without the skills service it falls back to the directory scan', async () => {
  const list = await listCatalog({ get: () => undefined });
  assert(Array.isArray(list));
  for (const s of list) assert(['shared', 'builtin'].includes(s.source));
});
