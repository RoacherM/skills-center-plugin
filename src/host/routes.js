import { listCatalog, catalogDetail } from './catalog.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  });
}

async function parseBody(request) {
  try {
    const text = await request.text();
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

export function registerRoutes(ctx) {
  const connection = ctx.get('connection');
  if (!connection) {
    ctx.logger?.warn?.('dsh-skills: ctx.connection not available');
    return;
  }
  const routes = [
    ['GET', '/api/skills/list', async () => {
      const skills = await listCatalog(ctx);
      return json({ skills, total: skills.length });
    }],
    ['POST', '/api/skills/detail', async (request) => {
      const { name } = await parseBody(request);
      if (!name) return json({ error: 'Skill name required' }, 400);
      const detail = await catalogDetail(ctx, name);
      if (!detail) return json({ error: 'Skill not found' }, 404);
      return json({ skill: detail });
    }],
  ];

  for (const [method, path, fn] of routes) {
    ctx.effect(() => connection.fetch.register({
      path,
      methods: [method],
      requestBody: 'buffered',
      fetch: async (request) => {
        try {
          return await fn(request);
        } catch (error) {
          return json({ error: error?.message || String(error) }, 500);
        }
      },
    }), 'dsh-skills: ' + path);
  }
}
