import { useMemo, useState } from 'react';
import { AlertTriangle, Info, CheckCircle2, Lightbulb, Copy, Check, ExternalLink, ChevronLeft, ChevronRight, ClipboardList, Code2, ListChecks } from 'lucide-react';
import { navigation, pages } from '../data/docs';

function Callout({ tone = 'info', label, body }) {
  const Icon = tone === 'warning' ? AlertTriangle : tone === 'success' ? CheckCircle2 : tone === 'tip' ? Lightbulb : Info;
  return <div className={`callout ${tone}`}><div className="callout-heading"><Icon size={18}/><strong>{label || (tone === 'warning' ? 'Important' : tone === 'success' ? 'Success' : 'Note')}</strong></div><p>{body}</p></div>;
}

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => { try { await navigator.clipboard.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); } };
  return <div className="code-block"><div className="code-header"><span><Code2 size={14}/>{language || 'text'}</span><button onClick={copy} title="Copy code">{copied ? <Check size={14}/> : <Copy size={14}/>} {copied ? 'Copied' : 'Copy'}</button></div><pre><code>{code}</code></pre></div>;
}

function Section({ section, checklistState, setChecklistState }) {
  const s = section;
  return <section className="doc-section" id={s.id}>
    <h2>{s.title}</h2>
    {s.body && s.type !== 'callout' && <p className="section-body">{s.body}</p>}
    {s.bullets && <ul className="content-list">{s.bullets.map((item, i) => <li key={i}>{item.split(/(`[^`]+`)/g).map((part, j) => part.startsWith('`') && part.endsWith('`') ? <code key={j}>{part.slice(1,-1)}</code> : part)}</li>)}</ul>}
    {s.steps && <div className="steps-list">{s.steps.map((step, i) => <div className="step-row" key={i}><div className="step-marker">{i+1}</div><div className="step-content"><h3>{step[0]}</h3><p>{step[1]}</p></div></div>)}</div>}
    {s.type === 'table' && <div className="table-wrap"><table><thead><tr>{s.headers.map((h, i) => <th key={i}>{h}</th>)}</tr></thead><tbody>{s.rows.map((row, i) => <tr key={i}>{row.map((cell, j) => <td key={j}>{cell.split(/(`[^`]+`)/g).map((part, k) => part.startsWith('`') && part.endsWith('`') ? <code key={k}>{part.slice(1,-1)}</code> : part)}</td>)}</tr>)}</tbody></table></div>}
    {s.type === 'callout' && <Callout tone={s.tone} label={s.label} body={s.body}/>}
    {s.type === 'code' && <CodeBlock language={s.language} code={s.code}/>}
    {s.type === 'image' && <figure className="doc-image"><img src={s.src} alt={s.alt || ''}/><figcaption>{s.caption}</figcaption></figure>}
    {s.type === 'link' && <a className="inline-resource" href={s.url} target="_blank" rel="noreferrer">{s.linkLabel || s.url}<ExternalLink size={15}/></a>}
    {s.type === 'links' && <div className="resource-list">{s.links.map(([label, url]) => <a className="resource-link" key={url} href={url} target="_blank" rel="noreferrer"><span>{label}</span><ExternalLink size={15}/></a>)}</div>}
    {s.type === 'checklist' && <div className="checklist-groups">{s.groups.map(group => <div className="checklist-group" key={group.title}><h3>{group.title}</h3>{group.items.map(item => <label className="check-row" key={item}><input type="checkbox" checked={!!checklistState[item]} onChange={e => setChecklistState(old => ({...old, [item]: e.target.checked}))}/><span>{item}</span></label>)}</div>)}</div>}
  </section>;
}

export default function DocContent({ pageId, onSelect, activeAudience }) {
  const page = pages[pageId] || pages.introduction;
  const [checklistState, setChecklistState] = useState({});
  const [copiedPage, setCopiedPage] = useState(false);
  const allItems = navigation.flatMap(g => g.items);
  const index = allItems.findIndex(item => item.id === pageId);
  const previous = allItems[index - 1];
  const next = allItems[index + 1];
  const checklistTotal = useMemo(() => Object.values(checklistState).filter(Boolean).length, [checklistState]);
  const copyPage = async () => {
    const text = `${page.title}\n\n${page.subtitle || ''}\n\n${page.sections.map(s => `${s.title}\n${s.body || ''}${s.bullets ? '\n' + s.bullets.join('\n') : ''}${s.steps ? '\n' + s.steps.map(st => `${st[0]}: ${st[1]}`).join('\n') : ''}${s.code ? '\n' + s.code : ''}`).join('\n\n')}`;
    try { await navigator.clipboard.writeText(text); setCopiedPage(true); setTimeout(() => setCopiedPage(false), 1600); } catch { setCopiedPage(false); }
  };
  return <article className="doc-content" id="top">
    <div className="breadcrumbs"><span>Documentation</span><ChevronRight size={14}/><span>{page.eyebrow || 'GUIDE'}</span></div>
    <div className="page-title-row"><div><span className="eyebrow">{page.eyebrow || 'GUIDE'}</span><h1>{page.title}</h1></div><button className="copy-page-button" onClick={copyPage}>{copiedPage ? <Check size={15}/> : <Copy size={15}/>}<span>{copiedPage ? 'Copied' : 'Copy page'}</span></button></div>
    {page.subtitle && <p className="page-subtitle">{page.subtitle}</p>}
    {page.updated && (
      <div className="page-meta">
        <span className={activeAudience === 'client' ? 'client-badge' : 'internal-badge'}>
          {activeAudience === 'client' ? 'Client Facing' : 'Internal Only'}
        </span>
        <span>{activeAudience === 'client' ? 'Client integration guide · v1.0' : page.updated}</span>
      </div>
    )}
    <div className="title-divider"/>
    {pageId === 'checklist' && <div className="checklist-progress"><ListChecks size={16}/><span>{checklistTotal} items checked</span><div className="progress-track"><div style={{width: `${Math.min(100, checklistTotal / 19 * 100)}%`}}/></div></div>}
    {page.sections.map(section => <Section key={section.id} section={section} checklistState={checklistState} setChecklistState={setChecklistState}/>)}
    <div className="page-navigation">
      {previous ? <button className="page-nav-card prev" onClick={() => onSelect(previous.id)}><span><ChevronLeft size={15}/> Previous</span><strong>{previous.title}</strong></button> : <div/>}
      {next ? <button className="page-nav-card next" onClick={() => onSelect(next.id)}><span>Next <ChevronRight size={15}/></span><strong>{next.title}</strong></button> : <div/>}
    </div>
    <footer className="doc-footer"><span>© iNextLabs · {activeAudience === 'client' ? 'Client integration documentation' : 'Internal engineering documentation'}</span><a href="https://learn.microsoft.com/en-us/azure/active-directory-b2c/identity-provider-generic-openid-connect" target="_blank" rel="noreferrer">Verify against Microsoft Learn <ExternalLink size={13}/></a></footer>
  </article>;
}
