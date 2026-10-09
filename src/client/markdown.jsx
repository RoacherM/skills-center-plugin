import React from 'react';

/**
 * A small Markdown renderer for SKILL.md bodies: headings, paragraphs, lists, fenced code,
 * block quotes, rules, pipe tables and inline code / bold / italic / links. It builds React
 * elements directly, so skill content is never injected as HTML.
 */

const INLINE = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\[[^\]]+\]\([^)\s]+\))|(\*[^*\s][^*]*\*)/g;

function inline(text, keyBase) {
  const out = [];
  let last = 0;
  let i = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const tok = m[0];
    const key = `${keyBase}-${i++}`;
    if (m[1]) out.push(<code key={key}>{tok.slice(1, -1)}</code>);
    else if (m[2]) out.push(<strong key={key}>{inline(tok.slice(2, -2), key)}</strong>);
    else if (m[3]) {
      const [, label, href] = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(tok);
      const safe = /^(https?:|mailto:)/i.test(href);
      out.push(safe ? <a key={key} href={href} target="_blank" rel="noreferrer">{label}</a> : <span key={key}>{label}</span>);
    } else out.push(<em key={key}>{tok.slice(1, -1)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

const LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const splitRow = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

export function Markdown({ source }) {
  const lines = String(source ?? '').replace(/\r\n?/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  const key = () => `b${blocks.length}`;

  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }

    const fence = /^\s*(```|~~~)(.*)$/.exec(line);
    if (fence) {
      const body = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith(fence[1])) body.push(lines[i++]);
      i++;
      blocks.push(<pre key={key()}><code>{body.join('\n')}</code></pre>);
      continue;
    }

    const heading = /^(#{1,6})\s+(.*?)\s*#*$/.exec(line);
    if (heading) {
      const Tag = `h${Math.min(heading[1].length, 4)}`;
      blocks.push(<Tag key={key()}>{inline(heading[2], key())}</Tag>);
      i++;
      continue;
    }

    if (/^\s*([-*_])(\s*\1){2,}\s*$/.test(line)) { blocks.push(<hr key={key()} />); i++; continue; }

    if (line.trim().startsWith('|') && i + 1 < lines.length && /^\s*\|?[\s:-]+\|/.test(lines[i + 1])) {
      const head = splitRow(line);
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) rows.push(splitRow(lines[i++]));
      const k = key();
      blocks.push(
        <table key={k}>
          <thead><tr>{head.map((c, j) => <th key={j}>{inline(c, `${k}h${j}`)}</th>)}</tr></thead>
          <tbody>{rows.map((r, ri) => <tr key={ri}>{r.map((c, j) => <td key={j}>{inline(c, `${k}r${ri}c${j}`)}</td>)}</tr>)}</tbody>
        </table>,
      );
      continue;
    }

    if (line.trimStart().startsWith('>')) {
      const body = [];
      while (i < lines.length && lines[i].trimStart().startsWith('>')) body.push(lines[i++].trimStart().replace(/^>\s?/, ''));
      blocks.push(<blockquote key={key()}><Markdown source={body.join('\n')} /></blockquote>);
      continue;
    }

    const item = LIST.exec(line);
    if (item) {
      const ordered = /\d/.test(item[2]);
      const items = [];
      while (i < lines.length) {
        const m = LIST.exec(lines[i]);
        if (m) { items.push(m[3]); i++; continue; }
        // A wrapped continuation of the previous item.
        if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length) { items[items.length - 1] += ` ${lines[i].trim()}`; i++; continue; }
        break;
      }
      const k = key();
      const Tag = ordered ? 'ol' : 'ul';
      blocks.push(<Tag key={k}>{items.map((t, j) => <li key={j}>{inline(t, `${k}-${j}`)}</li>)}</Tag>);
      continue;
    }

    const para = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,6}\s|\s*(```|~~~)|\s*>|\s*\|)/.test(lines[i]) && !LIST.exec(lines[i])) para.push(lines[i++].trim());
    if (!para.length) para.push(lines[i++].trim());
    blocks.push(<p key={key()}>{inline(para.join(' '), key())}</p>);
  }

  return <div className="sk-md">{blocks}</div>;
}
