/**
 * Same visual language as the Connectors / Scheduled pages: quiet surfaces separated by hairlines,
 * one inverted accent for primary actions, color only where it carries meaning, tabular numerals.
 * Every color is a DSH theme token, so dark mode follows.
 */
const T = {
  base: 'var(--dsw-alias-bg-base)', l1: 'var(--dsw-alias-bg-layer-1)', l2: 'var(--dsw-alias-bg-layer-2)', overlay: 'var(--dsw-alias-bg-overlay)',
  line: 'var(--dsw-alias-border-l1)', line2: 'var(--dsw-alias-border-l2)',
  fg: 'var(--dsw-alias-label-primary)', fg2: 'var(--dsw-alias-label-secondary)', fg3: 'var(--dsw-alias-label-tertiary, var(--dsw-alias-label-secondary))',
  ok: 'var(--dsw-alias-state-success-primary)', err: 'var(--dsw-alias-state-error-primary)',
};
const mix = (color, pct, into = 'transparent') => `color-mix(in srgb, ${color} ${pct}%, ${into})`;
const mono = 'ui-monospace,SFMono-Regular,Menlo,monospace';

export const CSS = `
.sk-page { height:100%; overflow:auto; color:${T.fg}; font-size:13px; line-height:1.5; -webkit-font-smoothing:antialiased; }
.sk-inner { max-width:1040px; margin:0 auto; padding:44px 36px 96px; display:flex; flex-direction:column; gap:28px; }
.sk-head { display:flex; align-items:flex-end; justify-content:space-between; gap:24px; flex-wrap:wrap; }
.sk-head h1 { margin:0; font-size:28px; font-weight:650; letter-spacing:-.025em; line-height:1.15; }
.sk-head p { margin:8px 0 0; max-width:540px; color:${T.fg2}; font-size:13.5px; line-height:1.6; }
.sk-stats { display:flex; gap:28px; }
.sk-stat b { display:block; font-size:24px; font-weight:600; letter-spacing:-.03em; line-height:1.1; font-variant-numeric:tabular-nums; }
.sk-stat span { font-size:12px; color:${T.fg3}; }

.sk-toolbar { display:flex; align-items:center; justify-content:space-between; gap:12px; flex-wrap:wrap; }
.sk-seg { display:flex; gap:2px; padding:3px; border-radius:10px; background:${T.l2}; }
.sk-seg button { display:inline-flex; align-items:center; gap:6px; height:28px; padding:0 11px; border:none; border-radius:7px; background:transparent; color:${T.fg2}; font:inherit; font-size:12.5px; font-weight:500; white-space:nowrap; cursor:pointer; transition:background .12s, color .12s; }
.sk-seg button:hover { color:${T.fg}; }
.sk-seg button.on { background:${T.overlay}; color:${T.fg}; box-shadow:0 1px 2px rgba(0,0,0,.07), 0 0 0 .5px ${T.line2}; }
.sk-seg button:focus-visible { outline:none; box-shadow:0 0 0 2px ${mix(T.fg, 25)}; }
.sk-seg em { font-style:normal; color:${T.fg3}; font-variant-numeric:tabular-nums; }
.sk-search { position:relative; width:300px; max-width:100%; }
.sk-search svg { position:absolute; left:10px; top:50%; transform:translateY(-50%); color:${T.fg3}; pointer-events:none; }
.sk-search input { width:100%; height:34px; box-sizing:border-box; padding:0 11px 0 31px; border:none; border-radius:8px; box-shadow:inset 0 0 0 1px ${T.line2}; background:${T.base}; color:inherit; font:inherit; transition:box-shadow .12s; }
.sk-search input::placeholder { color:${T.fg3}; opacity:.8; }
.sk-search input:hover { box-shadow:inset 0 0 0 1px ${mix(T.fg, 22)}; }
.sk-search input:focus { outline:none; box-shadow:inset 0 0 0 1px ${mix(T.fg, 45)}, 0 0 0 3px ${mix(T.fg, 9)}; }

.sk-section { display:flex; flex-direction:column; gap:12px; }
.sk-section-head { display:flex; align-items:baseline; gap:8px; }
.sk-section-head h2 { margin:0; font-size:13px; font-weight:600; letter-spacing:-.005em; }
.sk-aside { margin-left:auto; font-size:12px; color:${T.fg3}; }
.sk-count { font-size:12px; color:${T.fg3}; font-variant-numeric:tabular-nums; }

/* Cards share one rhythm — identity, two-line description, footer — so the grid stays even. */
.sk-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(300px,1fr)); gap:12px; }
.sk-card { display:flex; flex-direction:column; gap:12px; min-width:0; padding:16px 16px 12px; border:none; border-radius:14px; background:${T.l1}; box-shadow:0 0 0 1px ${T.line}, 0 1px 2px rgba(0,0,0,.03); color:inherit; font:inherit; text-align:left; cursor:pointer; transition:box-shadow .16s, transform .16s; }
.sk-card:hover { box-shadow:0 0 0 1px ${T.line2}, 0 8px 24px -10px rgba(0,0,0,.14); }
.sk-card:active { transform:translateY(.5px); }
.sk-card:focus-visible { outline:none; box-shadow:0 0 0 1px ${T.line2}, 0 0 0 4px ${mix(T.fg, 12)}; }
.sk-card-title { flex:1; min-width:0; }
.sk-name { overflow:hidden; font-size:14.5px; font-weight:600; letter-spacing:-.01em; text-overflow:ellipsis; white-space:nowrap; }
.sk-sub { display:flex; align-items:center; gap:5px; margin-top:3px; overflow:hidden; font-size:12px; color:${T.fg2}; white-space:nowrap; }
.sk-sub span { overflow:hidden; text-overflow:ellipsis; }
.sk-desc { height:calc(12.5px * 1.55 * 2); margin:0; overflow:hidden; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; color:${T.fg2}; font-size:12.5px; line-height:1.55; }
.sk-desc.none { color:${T.fg3}; }
.sk-card-foot { display:flex; align-items:center; gap:8px; min-height:28px; margin-top:auto; padding-top:10px; border-top:1px solid ${T.line}; font-size:12px; color:${T.fg3}; }
.sk-card-foot .sk-grow { flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }

.sk-tag { display:inline-flex; align-items:center; height:20px; padding:0 7px; border-radius:6px; background:${T.l2}; color:${T.fg2}; font-size:11px; font-weight:500; white-space:nowrap; }

.sk-btn { display:inline-flex; align-items:center; justify-content:center; gap:5px; height:28px; padding:0 10px; border:none; border-radius:7px; background:transparent; color:${T.fg2}; font:inherit; font-size:12.5px; font-weight:500; white-space:nowrap; cursor:pointer; transition:background .12s, color .12s, box-shadow .12s; }
.sk-btn:hover { background:${T.l2}; color:${T.fg}; }
.sk-btn.outline { box-shadow:inset 0 0 0 1px ${T.line2}; background:${T.l1}; color:${T.fg}; }
.sk-btn.outline:hover { background:${T.l2}; }
.sk-btn.primary { height:32px; padding:0 12px; background:${T.fg}; color:${T.base}; box-shadow:0 1px 2px rgba(0,0,0,.12); }
.sk-btn.primary:hover { background:${mix(T.fg, 84, T.base)}; }
.sk-btn.icon { width:28px; padding:0; }
.sk-btn.done, .sk-btn.done:hover { color:${T.ok}; }
.sk-btn:focus-visible { outline:none; box-shadow:0 0 0 3px ${mix(T.fg, 16)}; }

.sk-empty { display:flex; flex-direction:column; align-items:center; gap:4px; padding:48px 20px; border-radius:14px; box-shadow:inset 0 0 0 1px ${T.line}; color:${T.fg2}; text-align:center; }
.sk-empty b { color:${T.fg}; font-size:14px; font-weight:600; }
.sk-empty.err b { color:${T.err}; }
.sk-skel { height:146px; border-radius:14px; background:${T.l1}; box-shadow:0 0 0 1px ${T.line}; animation:sk-pulse 1.2s ease-in-out infinite; }

/* Detail sheet */
.sk-scrim { position:fixed; inset:0; z-index:1000; display:flex; align-items:flex-start; justify-content:center; padding:7vh 16px 4vh; overflow:auto; background:rgba(12,12,16,.34); backdrop-filter:blur(4px); animation:sk-fade .14s ease-out; }
.sk-modal { display:flex; flex-direction:column; width:min(760px,100%); max-height:86vh; overflow:hidden; border-radius:16px; background:${T.overlay}; color:${T.fg}; box-shadow:0 0 0 1px ${T.line}, 0 24px 70px -14px rgba(0,0,0,.35); animation:sk-rise .2s cubic-bezier(.2,.8,.3,1); }
.sk-modal-head { flex:none; display:flex; align-items:flex-start; gap:14px; padding:20px 16px 16px 22px; }
.sk-modal-head h2 { margin:0; font-size:17px; font-weight:650; letter-spacing:-.015em; line-height:1.3; word-break:break-word; }
.sk-modal-head p { margin:4px 0 0; color:${T.fg2}; font-size:13px; line-height:1.55; }
.sk-modal-actions { display:flex; align-items:center; gap:6px; flex:none; }
.sk-facts { flex:none; display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:1px; margin:0 22px; border-radius:10px; overflow:hidden; background:${T.line}; box-shadow:0 0 0 1px ${T.line}; }
.sk-fact { display:flex; flex-direction:column; gap:2px; min-width:0; padding:9px 12px; background:${T.l1}; }
.sk-fact span { font-size:11.5px; color:${T.fg3}; }
.sk-fact b { overflow:hidden; font-size:12.5px; font-weight:500; text-overflow:ellipsis; white-space:nowrap; }
.sk-fact a { color:inherit; text-decoration:none; box-shadow:inset 0 -1px 0 ${mix(T.fg, 30)}; }
.sk-fact a:hover { box-shadow:inset 0 -1px 0 ${T.fg}; }
.sk-fact.wide { grid-column:1 / -1; }
.sk-fact.wide b { font-weight:400; white-space:normal; color:${T.fg2}; line-height:1.55; }
.sk-path { font-family:${mono}; font-size:11.5px !important; font-weight:400 !important; direction:rtl; text-align:left; }
.sk-doc-bar { flex:none; display:flex; align-items:center; gap:8px; padding:18px 22px 10px; }
.sk-doc-bar h3 { margin:0; font-size:12.5px; font-weight:600; color:${T.fg2}; }
.sk-doc-bar .sk-seg { margin-left:auto; padding:2px; border-radius:8px; }
.sk-doc-bar .sk-seg button { height:24px; padding:0 9px; font-size:12px; border-radius:6px; }
.sk-doc { flex:1; min-height:120px; overflow:auto; margin:0 22px 22px; padding:4px 20px 18px; border-radius:12px; background:${T.l1}; box-shadow:inset 0 0 0 1px ${T.line}; }
.sk-doc.raw { margin:0; padding:14px 16px; font-family:${mono}; font-size:12px; line-height:1.65; white-space:pre-wrap; word-break:break-word; }
.sk-doc-loading { padding:18px 0; color:${T.fg3}; }

/* Rendered SKILL.md */
.sk-md { font-size:13px; line-height:1.7; color:${T.fg}; word-break:break-word; }
.sk-md h1, .sk-md h2, .sk-md h3, .sk-md h4 { margin:1.3em 0 .45em; font-weight:620; letter-spacing:-.01em; line-height:1.35; }
.sk-md h1 { font-size:17px; } .sk-md h2 { font-size:15px; } .sk-md h3 { font-size:13.5px; } .sk-md h4 { font-size:13px; color:${T.fg2}; }
.sk-md p { margin:.6em 0; }
.sk-md ul, .sk-md ol { margin:.5em 0; padding-left:1.4em; }
.sk-md li { margin:.2em 0; }
.sk-md li::marker { color:${T.fg3}; }
.sk-md code { padding:1px 5px; border-radius:5px; background:${T.l2}; font-family:${mono}; font-size:.88em; }
.sk-md pre { margin:.8em 0; padding:11px 13px; overflow:auto; border-radius:9px; background:${T.l2}; font-family:${mono}; font-size:12px; line-height:1.6; }
.sk-md pre code { padding:0; background:none; font-size:inherit; }
.sk-md a { color:inherit; text-decoration:none; box-shadow:inset 0 -1px 0 ${mix(T.fg, 30)}; }
.sk-md blockquote { margin:.8em 0; padding:2px 0 2px 12px; border-left:2px solid ${T.line2}; color:${T.fg2}; }
.sk-md hr { margin:1.2em 0; border:none; border-top:1px solid ${T.line}; }
.sk-md table { margin:.8em 0; border-collapse:collapse; font-size:12.5px; }
.sk-md th, .sk-md td { padding:5px 10px; border:1px solid ${T.line}; text-align:left; vertical-align:top; }
.sk-md th { background:${T.l2}; font-weight:600; }

@keyframes sk-fade { from { opacity:0; } }
@keyframes sk-rise { from { opacity:0; transform:translateY(8px) scale(.985); } }
@keyframes sk-pulse { 50% { opacity:.5; } }
@media (prefers-reduced-motion:reduce) { .sk-scrim, .sk-modal, .sk-skel { animation:none; } }
`;
