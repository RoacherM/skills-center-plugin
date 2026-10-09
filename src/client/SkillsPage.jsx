import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useI18n } from './i18n.jsx';
import { Markdown } from './markdown.jsx';

const Icon = ({ d, size = 14, sw = 1.8, children }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {d ? <path d={d} /> : children}
  </svg>
);
const SearchIcon = () => <Icon><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></Icon>;
const CopyIcon = () => <Icon size={13}><rect x="9" y="9" width="11" height="11" rx="2.5" /><path d="M5 15V6a2 2 0 0 1 2-2h9" /></Icon>;
const CheckIcon = () => <Icon size={13} sw={2.2} d="M5 12.5l4.5 4.5L19 7.5" />;
const CloseIcon = () => <Icon size={15} d="M6 6l12 12M18 6L6 18" />;
const RepoIcon = () => <Icon size={12}><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z" /><path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19" /></Icon>;
const BoxIcon = () => <Icon size={12}><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /></Icon>;

function useCopy() {
  const [copied, setCopied] = useState(null);
  const copy = useCallback((id, text) => {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied((c) => (c === id ? null : c)), 1600);
  }, []);
  return [copied, copy];
}

function CopyButton({ name, copied, onCopy, className = '' }) {
  const { t } = useI18n();
  const done = copied === name;
  return (
    <button
      type="button"
      className={`sk-btn ${className}${done ? ' done' : ''}`}
      title={t('copyHint')}
      onClick={(e) => { e.stopPropagation(); onCopy(name, t('copyPrompt', { name })); }}
    >
      {done ? <CheckIcon /> : <CopyIcon />}
      {done ? t('copiedBtn') : t('copyBtn')}
    </button>
  );
}

function SkillCard({ skill, onOpen, copied, onCopy }) {
  const { t, lang } = useI18n();
  const date = skill.updatedAt ?? skill.installedAt;
  return (
    <button type="button" className="sk-card" onClick={() => onOpen(skill)}>
      <div className="sk-card-title">
        <div className="sk-name">{skill.name}</div>
        <div className="sk-sub">
          {skill.sourceRepo ? <RepoIcon /> : <BoxIcon />}
          <span>{skill.sourceRepo || t(`g_${skill.source}`)}</span>
        </div>
      </div>
      <p className={`sk-desc${skill.description ? '' : ' none'}`}>{skill.description || t('noDesc')}</p>
      <div className="sk-card-foot">
        <span className="sk-grow">
          {date ? t('updated', { date: new Date(date).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US') }) : t(`g_${skill.source}`)}
        </span>
        <CopyButton name={skill.name} copied={copied} onCopy={onCopy} />
      </div>
    </button>
  );
}

function SkillSheet({ skill, onClose, copied, onCopy }) {
  const { t, lang } = useI18n();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('rendered');

  useEffect(() => {
    let live = true;
    fetch('/api/skills/detail', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: skill.name }) })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => live && setDetail(d?.skill ?? null))
      .catch(() => {})
      .finally(() => live && setLoading(false));
    return () => { live = false; };
  }, [skill.name]);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const date = skill.updatedAt ?? skill.installedAt;
  const body = detail?.body ?? '';

  return (
    <div className="sk-scrim" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sk-modal" role="dialog" aria-modal="true" aria-label={skill.name}>
        <div className="sk-modal-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>{skill.name}</h2>
            <p>{skill.description || t('noDesc')}</p>
          </div>
          <div className="sk-modal-actions">
            <CopyButton name={skill.name} copied={copied} onCopy={onCopy} className="outline" />
            <button type="button" className="sk-btn icon" aria-label={t('close')} onClick={onClose}><CloseIcon /></button>
          </div>
        </div>

        <div className="sk-facts">
          <div className="sk-fact">
            <span>{t('repo')}</span>
            <b>{skill.sourceUrl ? <a href={skill.sourceUrl} target="_blank" rel="noreferrer">{skill.sourceRepo} ↗</a> : skill.sourceRepo || t(`g_${skill.source}`)}</b>
          </div>
          <div className="sk-fact">
            <span>{t('loadedFrom')}</span>
            <b title={t(`h_${skill.source}`)}>{t(`g_${skill.source}`)}</b>
          </div>
          {date && (
            <div className="sk-fact">
              <span>{t('updatedLabel')}</span>
              <b>{new Date(date).toLocaleString(lang === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}</b>
            </div>
          )}
          {detail?.filePath && (
            <div className="sk-fact wide">
              <span>{t('localPath')}</span>
              <b className="sk-path" title={detail.filePath}>{detail.filePath}</b>
            </div>
          )}
          {skill.whenToUse && (
            <div className="sk-fact wide">
              <span>{t('whenToUse')}</span>
              <b>{skill.whenToUse}</b>
            </div>
          )}
        </div>

        <div className="sk-doc-bar">
          <h3>SKILL.md</h3>
          <div className="sk-seg" role="group">
            <button type="button" className={view === 'rendered' ? 'on' : ''} onClick={() => setView('rendered')}>{t('viewRendered')}</button>
            <button type="button" className={view === 'raw' ? 'on' : ''} onClick={() => setView('raw')}>{t('viewRaw')}</button>
          </div>
        </div>
        {loading ? (
          <div className="sk-doc"><div className="sk-doc-loading">{t('loadingDoc')}</div></div>
        ) : !detail ? (
          <div className="sk-doc"><div className="sk-doc-loading">{t('noDoc')}</div></div>
        ) : view === 'raw' ? (
          <pre className="sk-doc raw" style={{ margin: '0 22px 22px' }}>{detail.rawContent}</pre>
        ) : (
          <div className="sk-doc">{body.trim() ? <Markdown source={body} /> : <div className="sk-doc-loading">{t('noDoc')}</div>}</div>
        )}
      </div>
    </div>
  );
}

const GROUPS = ['dsh', 'project', 'shared', 'builtin'];

function Grid({ title, hint, items, ...rest }) {
  return (
    <section className="sk-section">
      {(title || hint) && (
        <div className="sk-section-head">
          {title && <h2>{title}</h2>}
          {title && <span className="sk-count">{items.length}</span>}
          {hint && <span className="sk-aside">{hint}</span>}
        </div>
      )}
      <div className="sk-grid">
        {items.map((s) => <SkillCard key={`${s.source}:${s.name}`} skill={s} {...rest} />)}
      </div>
    </section>
  );
}

export function SkillsPage() {
  const { lang, t } = useI18n();
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [open, setOpen] = useState(null);
  const [copied, copy] = useCopy();

  useEffect(() => {
    fetch('/api/skills/list')
      .then((res) => { if (!res.ok) throw new Error(`HTTP ${res.status}`); return res.json(); })
      .then((data) => setSkills(data.skills || []))
      .catch((err) => setError(err.message || String(err)))
      .finally(() => setLoading(false));
  }, []);

  const q = search.trim().toLowerCase();
  const matches = useMemo(() => skills.filter((s) => !q || [s.name, s.description, s.whenToUse, s.sourceRepo].some((v) => v?.toLowerCase().includes(q))), [skills, q]);
  const groups = GROUPS.map((id) => ({ id, all: skills.filter((s) => s.source === id), items: matches.filter((s) => s.source === id) })).filter((g) => g.all.length);
  const shown = filter === 'all' ? matches : groups.find((g) => g.id === filter)?.items ?? [];
  const gridProps = { onOpen: setOpen, copied, onCopy: copy };

  return (
    <div className="sk-page" lang={lang === 'zh' ? 'zh-CN' : 'en'}>
      <div className="sk-inner">
        <header className="sk-head">
          <div>
            <h1>{t('title')}</h1>
            <p>{t('intro')}</p>
          </div>
          <div className="sk-stats">
            <div className="sk-stat"><b>{skills.length}</b><span>{t('totalInstalled')}</span></div>
            {groups.map((g) => <div key={g.id} className="sk-stat"><b>{g.all.length}</b><span>{t(`g_${g.id}`)}</span></div>)}
          </div>
        </header>

        <div className="sk-toolbar">
          <div className="sk-seg" role="group" aria-label={t('filter')}>
            {[['all', t('all'), skills.length], ...groups.map((g) => [g.id, t(`g_${g.id}`), g.all.length])].map(([id, label, n]) => (
              <button key={id} type="button" className={filter === id ? 'on' : ''} onClick={() => setFilter(id)}>
                {label}<em>{n}</em>
              </button>
            ))}
          </div>
          <label className="sk-search">
            <SearchIcon />
            <input type="search" placeholder={t('searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} />
          </label>
        </div>

        {loading ? (
          <div className="sk-grid">{[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="sk-skel" />)}</div>
        ) : error ? (
          <div className="sk-empty err"><b>{t('loadFailed')}</b><span>{error}</span></div>
        ) : shown.length === 0 ? (
          <div className="sk-empty"><b>{t('emptyTitle')}</b><span>{t('emptyHint')}</span></div>
        ) : filter === 'all' ? (
          groups.filter((g) => g.items.length).map((g) => <Grid key={g.id} title={t(`g_${g.id}`)} hint={t(`h_${g.id}`)} items={g.items} {...gridProps} />)
        ) : (
          <Grid hint={t(`h_${filter}`)} items={shown} {...gridProps} />
        )}
      </div>
      {open && <SkillSheet skill={open} onClose={() => setOpen(null)} copied={copied} onCopy={copy} />}
    </div>
  );
}
