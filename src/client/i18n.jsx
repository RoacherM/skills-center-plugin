import React from 'react';

export const DICT = {
  zh: {
    panel: 'Skills',
    title: 'Skills',
    intro: 'DSH Agent 当前能用的全部技能，按来源分组。点开查看 SKILL.md，或复制一句调用指令。',
    totalInstalled: '已安装',
    thirdParty: '社区技能',
    builtin: '内置技能',
    builtinRepo: 'DeepSeek Harness',
    all: '全部',
    filter: '筛选',
    searchPlaceholder: '搜索名称、描述或仓库',
    loadFailed: '加载失败',
    emptyTitle: '没有匹配的技能',
    emptyHint: '换个关键词或筛选条件试试',
    noDesc: '暂无描述',
    local: '本地技能',
    updated: '更新于 {date}',
    updatedLabel: '更新时间',
    repo: '来源',
    type: '类型',
    localPath: '文件路径',
    whenToUse: '适用场景',
    viewRendered: '预览',
    viewRaw: '源文件',
    loadingDoc: '正在载入…',
    noDoc: '没有文档内容',
    copyBtn: '复制调用',
    copiedBtn: '已复制',
    copyHint: '复制一句让 Agent 使用该技能的指令',
    close: '关闭',
    copyPrompt: '请加载并使用 skill: {name}',
    g_dsh: 'DSH 技能',
    g_project: '项目技能',
    g_shared: '共享技能',
    g_builtin: '内置技能',
    h_dsh: '~/.dsh/skills，只给 DSH 用',
    h_project: '当前项目里的 .dsh/skills 或 .agents/skills',
    h_shared: '~/.agents/skills，与 Claude Code、Codex 等 Agent 共用',
    h_builtin: '随 DeepSeek Harness 一起提供',
    loadedFrom: '加载自',
  },
  en: {
    panel: 'Skills',
    title: 'Skills',
    intro: 'Every skill the DSH agent can use right now, grouped by where it loads from. Open one to read its SKILL.md, or copy an invocation.',
    totalInstalled: 'Installed',
    thirdParty: 'Community',
    builtin: 'Built-in',
    builtinRepo: 'DeepSeek Harness',
    all: 'All',
    filter: 'Filter',
    searchPlaceholder: 'Search name, description or repo',
    loadFailed: 'Failed to load',
    emptyTitle: 'No matching skills',
    emptyHint: 'Try another keyword or filter',
    noDesc: 'No description',
    local: 'Local skill',
    updated: 'Updated {date}',
    updatedLabel: 'Updated',
    repo: 'Source',
    type: 'Type',
    localPath: 'File',
    whenToUse: 'When to use',
    viewRendered: 'Preview',
    viewRaw: 'Source',
    loadingDoc: 'Loading…',
    noDoc: 'No document content',
    copyBtn: 'Copy',
    copiedBtn: 'Copied',
    copyHint: 'Copy an instruction that tells the agent to use this skill',
    close: 'Close',
    copyPrompt: 'Load and use skill: {name}',
    g_dsh: 'DSH',
    g_project: 'Project',
    g_shared: 'Shared',
    g_builtin: 'Built-in',
    h_dsh: '~/.dsh/skills, used by DSH only',
    h_project: '.dsh/skills or .agents/skills in the current project',
    h_shared: '~/.agents/skills, shared with Claude Code, Codex and other agents',
    h_builtin: 'Ships with DeepSeek Harness',
    loadedFrom: 'Loaded from',
  },
};

export const langOf = (active) => (String(active ?? '').toLowerCase().startsWith('zh') ? 'zh' : 'en');

export function translator(lang) {
  const dict = DICT[lang] ?? DICT.en;
  return (key, values = {}) =>
    String(dict[key] ?? DICT.zh[key] ?? key).replace(/\{(\w+)\}/g, (_, name) => (values[name] ?? ''));
}

const I18nContext = React.createContext({ lang: 'zh', t: translator('zh') });

export function useI18n() {
  return React.useContext(I18nContext);
}

export function withI18n(locale, Component) {
  const subscribe = (fn) => locale?.subscribe?.(fn) ?? (() => {});
  const snapshot = () => (locale?.getSnapshot?.() ?? locale?.getLocale?.())?.active ?? (typeof navigator !== 'undefined' ? navigator.language : 'zh');

  return function Localized(props) {
    const active = React.useSyncExternalStore(subscribe, snapshot);
    const lang = langOf(active);
    const value = React.useMemo(() => ({ lang, t: translator(lang) }), [lang]);
    return (
      <I18nContext.Provider value={value}>
        <Component {...props} />
      </I18nContext.Provider>
    );
  };
}
