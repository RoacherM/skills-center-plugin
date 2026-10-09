// src/host/catalog.js
import { readFile as readFile2 } from "node:fs/promises";
import { join as join2, dirname, basename } from "node:path";
import { homedir as homedir2 } from "node:os";

// src/host/scanner.js
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { homedir } from "node:os";
function parseFrontmatter(markdown) {
  if (!markdown.startsWith("---")) return { metadata: {}, body: markdown };
  const end = markdown.indexOf("\n---", 3);
  if (end === -1) return { metadata: {}, body: markdown };
  const frontmatterRaw = markdown.slice(3, end).trim();
  const body = markdown.slice(end + 4).trim();
  const metadata = {};
  for (const line of frontmatterRaw.split("\n")) {
    const colon = line.indexOf(":");
    if (colon > 0) {
      const key = line.slice(0, colon).trim();
      let value = line.slice(colon + 1).trim();
      if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
        value = value.slice(1, -1);
      }
      metadata[key] = value;
    }
  }
  return { metadata, body };
}
async function loadSkills(options = {}) {
  const skills = [];
  const home = homedir();
  const agentsDir = join(home, ".agents");
  const lockPath = join(agentsDir, ".skill-lock.json");
  let lockMap2 = {};
  try {
    const lockRaw = await readFile(lockPath, "utf8");
    const parsed = JSON.parse(lockRaw);
    lockMap2 = parsed.skills || {};
  } catch {
  }
  const userSkillsDir = join(agentsDir, "skills");
  try {
    const entries = await readdir(userSkillsDir, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory() && !ent.isSymbolicLink()) continue;
      const skillName = ent.name;
      const skillDir = join(userSkillsDir, skillName);
      const skillFile2 = join(skillDir, "SKILL.md");
      try {
        const raw = await readFile(skillFile2, "utf8");
        const { metadata, body } = parseFrontmatter(raw);
        const lockInfo = lockMap2[skillName] || {};
        skills.push({
          name: metadata.name || skillName,
          description: metadata.description || "",
          whenToUse: metadata["when-to-use"] || metadata.whenToUse || "",
          source: "third-party",
          sourceUrl: lockInfo.sourceUrl || (lockInfo.source ? `https://github.com/${lockInfo.source}` : ""),
          sourceRepo: lockInfo.source || "Local / Custom",
          installedAt: lockInfo.installedAt || null,
          updatedAt: lockInfo.updatedAt || null,
          path: skillDir,
          hasBody: true
        });
      } catch {
      }
    }
  } catch {
  }
  const officeSkillsDir = "/Applications/DeepSeek Harness.app/Contents/Resources/runtime/office-skills";
  try {
    const entries = await readdir(officeSkillsDir, { withFileTypes: true });
    for (const ent of entries) {
      if (!ent.isDirectory()) continue;
      const skillName = ent.name;
      if (skillName === "scripts") continue;
      const skillDir = join(officeSkillsDir, skillName);
      const skillFile2 = join(skillDir, "SKILL.md");
      try {
        const raw = await readFile(skillFile2, "utf8");
        const { metadata } = parseFrontmatter(raw);
        skills.push({
          name: metadata.name || skillName,
          description: metadata.description || "",
          whenToUse: metadata["when-to-use"] || metadata.whenToUse || "",
          source: "builtin",
          sourceUrl: "",
          sourceRepo: "DeepSeek Harness Built-in",
          installedAt: null,
          updatedAt: null,
          path: skillDir,
          hasBody: true
        });
      } catch {
      }
    }
  } catch {
  }
  skills.sort((a, b) => a.name.localeCompare(b.name));
  return skills;
}
async function getSkillDetail(skillName) {
  const home = homedir();
  const agentsDir = join(home, ".agents");
  const userSkillFile = join(agentsDir, "skills", skillName, "SKILL.md");
  const officeSkillFile = join("/Applications/DeepSeek Harness.app/Contents/Resources/runtime/office-skills", skillName, "SKILL.md");
  let raw = null;
  let filePath = "";
  let source = "third-party";
  try {
    raw = await readFile(userSkillFile, "utf8");
    filePath = userSkillFile;
  } catch {
    try {
      raw = await readFile(officeSkillFile, "utf8");
      filePath = officeSkillFile;
      source = "builtin";
    } catch {
      return null;
    }
  }
  const { metadata, body } = parseFrontmatter(raw);
  let lockInfo = {};
  if (source === "third-party") {
    try {
      const lockRaw = await readFile(join(agentsDir, ".skill-lock.json"), "utf8");
      const parsed = JSON.parse(lockRaw);
      lockInfo = parsed.skills && parsed.skills[skillName] || {};
    } catch {
    }
  }
  return {
    name: metadata.name || skillName,
    description: metadata.description || "",
    whenToUse: metadata["when-to-use"] || metadata.whenToUse || "",
    source,
    sourceUrl: lockInfo.sourceUrl || (lockInfo.source ? `https://github.com/${lockInfo.source}` : ""),
    sourceRepo: lockInfo.source || (source === "builtin" ? "DeepSeek Harness Built-in" : "Local / Custom"),
    installedAt: lockInfo.installedAt || null,
    updatedAt: lockInfo.updatedAt || null,
    filePath,
    rawContent: raw,
    body,
    metadata
  };
}

// src/host/catalog.js
function groupOf(source) {
  if (source === "user-agents") return "shared";
  if (source === "user-dsh") return "dsh";
  if (String(source).startsWith("project")) return "project";
  return "builtin";
}
async function lockMap() {
  try {
    return JSON.parse(await readFile2(join2(homedir2(), ".agents", ".skill-lock.json"), "utf8")).skills ?? {};
  } catch {
    return {};
  }
}
var skillFile = (s) => {
  const p = s.path ?? (s.resourceBase?.kind === "directory" ? s.resourceBase.path : void 0);
  if (!p) return void 0;
  return basename(p).toLowerCase() === "skill.md" ? p : join2(p, "SKILL.md");
};
function withOrigin(summary, lock) {
  const group = groupOf(summary.source);
  const file = skillFile(summary);
  const dirName = file ? basename(dirname(file)) : summary.name;
  const info = group === "shared" ? lock[dirName] ?? lock[summary.name] ?? {} : {};
  return {
    name: summary.name,
    description: summary.description ?? "",
    whenToUse: summary.whenToUse ?? "",
    source: group,
    dshSource: summary.source,
    modelInvocable: summary.invocation?.modelInvocable !== false,
    sourceRepo: info.source ?? "",
    sourceUrl: info.source && info.sourceType === "github" ? `https://github.com/${info.source}` : "",
    installedAt: info.installedAt ?? null,
    updatedAt: info.updatedAt ?? null,
    filePath: file ?? ""
  };
}
async function listCatalog(ctx) {
  const skills = ctx.get("skills");
  if (!skills) return legacyList();
  const [summaries, lock] = await Promise.all([skills.list(), lockMap()]);
  return summaries.map((s) => withOrigin(s, lock));
}
async function catalogDetail(ctx, name2) {
  const skills = ctx.get("skills");
  if (!skills) {
    const d = await getSkillDetail(name2);
    return d && { ...d, source: d.source === "builtin" ? "builtin" : "shared" };
  }
  const [summaries, lock] = await Promise.all([skills.list(), lockMap()]);
  const summary = summaries.find((s) => s.name === name2);
  if (!summary) return null;
  const item = withOrigin(summary, lock);
  const def = await skills.get(name2);
  let rawContent = def?.content ?? "";
  if (item.filePath) rawContent = await readFile2(item.filePath, "utf8").catch(() => rawContent);
  const body = def?.content ?? rawContent.replace(/^---\n[\s\S]*?\n---\n?/, "");
  return { ...item, rawContent, body };
}
async function legacyList() {
  const skills = await loadSkills();
  return skills.map((s) => ({ ...s, source: s.source === "builtin" ? "builtin" : "shared", filePath: join2(s.path, "SKILL.md") }));
}

// src/host/routes.js
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8" }
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
function registerRoutes(ctx) {
  const connection = ctx.get("connection");
  if (!connection) {
    ctx.logger?.warn?.("dsh-skills: ctx.connection not available");
    return;
  }
  const routes = [
    ["GET", "/api/skills/list", async () => {
      const skills = await listCatalog(ctx);
      return json({ skills, total: skills.length });
    }],
    ["POST", "/api/skills/detail", async (request) => {
      const { name: name2 } = await parseBody(request);
      if (!name2) return json({ error: "Skill name required" }, 400);
      const detail = await catalogDetail(ctx, name2);
      if (!detail) return json({ error: "Skill not found" }, 404);
      return json({ skill: detail });
    }]
  ];
  for (const [method, path, fn] of routes) {
    ctx.effect(() => connection.fetch.register({
      path,
      methods: [method],
      requestBody: "buffered",
      fetch: async (request) => {
        try {
          return await fn(request);
        } catch (error) {
          return json({ error: error?.message || String(error) }, 500);
        }
      }
    }), "dsh-skills: " + path);
  }
}

// src/host/index.js
var name = "dsh-skills";
var inject = ["connection", "tools"];
function apply(ctx) {
  registerRoutes(ctx);
}
export {
  apply,
  inject,
  name
};
