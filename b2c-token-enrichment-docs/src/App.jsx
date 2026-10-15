import React, { useEffect, useMemo, useState, useRef } from 'react';
import {
  Search,
  ChevronRight,
  ChevronDown,
  Copy,
  Check,
  Info,
  AlertTriangle,
  ExternalLink,
  BookOpen,
  Menu,
  X,
  PanelLeftClose,
  List,
  Command,
  Code2,
  CheckCircle2,
  Lightbulb,
  ListChecks
} from 'lucide-react';
import { docs as internalDocs } from './content.js';
import { clientDocs } from './clientContent.js';
import './styles.css';

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

export default function App() {
  const [activeAudience, setActiveAudience] = useState('internal');
  const [activeInternalId, setActiveInternalId] = useState('intro');
  const [activeClientId, setActiveClientId] = useState('client-intro');
  const [query, setQuery] = useState('');
  const [fold, setFold] = useState({});
  const [mobile, setMobile] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeHeading, setActiveHeading] = useState('');
  const isClickScrolling = useRef(false);
  const clickTimeout = useRef(null);

  // Active dataset depending on selected audience
  const currentDocs = activeAudience === 'client' ? clientDocs : internalDocs;
  const activeId = activeAudience === 'client' ? activeClientId : activeInternalId;

  const current = currentDocs.find(d => d.id === activeId) || currentDocs[0];
  const groups = useMemo(() => [...new Set(currentDocs.map(d => d.group))], [currentDocs]);

  const filtered = useMemo(() => {
    return groups
      .map(g => ({
        g,
        items: currentDocs.filter(
          d =>
            d.group === g &&
            (!query ||
              (d.title + ' ' + d.group + ' ' + (d.subtitle || '') + ' ' + JSON.stringify(d.blocks))
                .toLowerCase()
                .includes(query.toLowerCase()))
        )
      }))
      .filter(x => x.items.length);
  }, [groups, currentDocs, query]);

  // Extract sections for TOC from current document
  const tocSections = useMemo(() => {
    const list = [];
    current.blocks.forEach((b, idx) => {
      if (b[0] === 'h2') {
        const id = `heading-${slugify(b[1])}-${idx}`;
        list.push({ id, title: b[1] });
      }
    });
    return list;
  }, [current]);

  useEffect(() => {
    const audiencePrefix = activeAudience === 'client' ? 'Client Docs' : 'Internal Docs';
    document.title = `${current.title} | ${audiencePrefix} | B2C Token Enrichment`;
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [current, activeAudience]);

  // Keyboard shortcut Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        document.querySelector('.search-box input')?.focus();
      }
      if (e.key === 'Escape') setMobile(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Dynamic Scroll Spy for Right TOC
  useEffect(() => {
    if (tocSections.length > 0) {
      setActiveHeading(tocSections[0].id);
    } else {
      setActiveHeading('');
    }

    const handleScroll = () => {
      if (isClickScrolling.current) return;
      if (!tocSections.length) return;

      const offsetThreshold = 140;
      let currentId = tocSections[0].id;

      for (const sec of tocSections) {
        const el = document.getElementById(sec.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offsetThreshold) {
            currentId = sec.id;
          } else {
            break;
          }
        }
      }

      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 50;
      if (atBottom && tocSections.length > 0) {
        currentId = tocSections[tocSections.length - 1].id;
      }

      setActiveHeading(currentId);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
      if (clickTimeout.current) clearTimeout(clickTimeout.current);
    };
  }, [activeId, tocSections]);

  const jumpToToc = (id) => {
    setActiveHeading(id);
    isClickScrolling.current = true;
    if (clickTimeout.current) clearTimeout(clickTimeout.current);

    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    clickTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  const go = (id) => {
    if (activeAudience === 'client') {
      setActiveClientId(id);
    } else {
      setActiveInternalId(id);
    }
    setMobile(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAudienceSwitch = (aud) => {
    if (aud === activeAudience) return;
    setActiveAudience(aud);
    setQuery('');
    setMobile(false);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const copy = async () => {
    try {
      const text = `${current.title}\n\n${current.subtitle || ''}\n\n${document.getElementById(current.id)?.innerText || ''}`;
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1300);
    } catch {}
  };

  const currentIndex = currentDocs.findIndex(d => d.id === current.id);
  const previous = currentDocs[currentIndex - 1];
  const next = currentDocs[currentIndex + 1];

  return (
    <div className="app-shell">
      {/* TOPBAR */}
      <header className="topbar">
        <button
          className="icon-button mobile-menu"
          onClick={() => setMobile(!mobile)}
          aria-label="Toggle Menu"
        >
          {mobile ? <X size={19} /> : <Menu size={19} />}
        </button>

        <a
          className="brand"
          href="#"
          onClick={(e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
        >
          <img
            src="./images/inextlabs-logo-NtEQwFAf.png"
            alt="iNextLabs"
            className="brand-logo"
          />
          <span className="brand-divider" />
          <strong>B2C Token Enrichment Docs</strong>
        </a>

        {/* AUDIENCE TABS */}
        <nav className="audience-tabs" aria-label="Documentation audience">
          <button
            className={activeAudience === 'internal' ? 'audience-tab active' : 'audience-tab'}
            onClick={() => handleAudienceSwitch('internal')}
          >
            <span className="tab-dot blue" />
            Internal Docs
          </button>
          <button
            className={activeAudience === 'client' ? 'audience-tab active' : 'audience-tab'}
            onClick={() => handleAudienceSwitch('client')}
          >
            <span className="tab-dot green" />
            Client Docs
          </button>
        </nav>

        <div className="top-actions">
          <label className="search-box">
            <Search size={17} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search docs..."
            />
            <kbd>
              <Command size={11} /> K
            </kbd>
          </label>
          <span className="version-pill">v1.0</span>
        </div>
      </header>

      {/* SEARCH POPOVER IF QUERY IS ACTIVE */}
      {query.trim() && (
        <div className="search-results-popover">
          <div className="search-results-title">
            <Search size={15} /> Search results ({activeAudience === 'client' ? 'Client' : 'Internal'}){' '}
            <span>{filtered.reduce((n, g) => n + g.items.length, 0)}</span>
          </div>
          <div className="search-results-list">
            {filtered.flatMap(g =>
              g.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => {
                    go(item.id);
                    setQuery('');
                  }}
                >
                  <span className="result-title">{item.title}</span>
                  <span className="result-group">{g.g}</span>
                </button>
              ))
            )}
            {!filtered.length && (
              <div className="search-empty">No matching pages found in {activeAudience === 'client' ? 'Client Docs' : 'Internal Docs'}.</div>
            )}
          </div>
        </div>
      )}

      {/* LAYOUT GRID */}
      <div className="layout-grid">
        {/* MOBILE SCRIM */}
        {mobile && (
          <button
            className="mobile-scrim"
            aria-label="Close navigation"
            onClick={() => setMobile(false)}
          />
        )}

        {/* SIDEBAR */}
        <aside className={`sidebar ${mobile ? 'mobile-open' : ''}`}>
          <div className="sidebar-top">
            <div className="sidebar-heading">
              <BookOpen size={16} />
              <span>{activeAudience === 'client' ? 'Client Documentation' : 'Documentation'}</span>
            </div>
            <button className="sidebar-collapse" title="Navigation panel">
              <PanelLeftClose size={16} />
            </button>
          </div>

          <label className="sidebar-search">
            <Search size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Find by title"
            />
            <kbd>/</kbd>
          </label>

          <nav className="nav-tree" aria-label="Documentation navigation">
            {filtered.map(group => (
              <section className="nav-group" key={group.g}>
                <button
                  className="nav-group-label"
                  onClick={() =>
                    setFold(p => ({ ...p, [group.g]: !p[group.g] }))
                  }
                >
                  <span>{group.g}</span>
                  {fold[group.g] ? (
                    <ChevronRight size={15} />
                  ) : (
                    <ChevronDown size={15} />
                  )}
                </button>

                {!fold[group.g] && (
                  <div className="nav-items">
                    {group.items.map(item => (
                      <button
                        key={item.id}
                        className={`nav-item ${activeId === item.id ? 'selected' : ''}`}
                        onClick={() => go(item.id)}
                        title={item.title}
                      >
                        <span className="nav-item-dot" />
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </section>
            ))}
            {!filtered.length && (
              <div className="no-results">No pages found. Try another search.</div>
            )}
          </nav>

          <div className="sidebar-footer">
            <span className="footer-dot" />
            {activeAudience === 'client'
              ? 'Client integration guide'
              : 'Internal engineering guide'}
            <span className="footer-version">v1.0</span>
          </div>
        </aside>

        {/* MAIN COLUMN */}
        <main className="main-column">
          <article className="doc-content" id={current.id}>
            <div className="breadcrumbs">
              <span>Docs</span>
              <ChevronRight size={14} />
              <span>{activeAudience === 'client' ? 'Client Integration' : 'Azure AD B2C'}</span>
              <ChevronRight size={14} />
              <span>{current.group.toUpperCase()}</span>
            </div>

            <div className="page-title-row">
              <div>
                <span className="eyebrow">
                  {activeAudience === 'client' ? `CLIENT DOCS · ${current.group.toUpperCase()}` : current.group.toUpperCase()}
                </span>
                <h1>{current.title}</h1>
              </div>
              <button className="copy-page-button" onClick={copy}>
                {copied ? <Check size={15} /> : <Copy size={15} />}
                <span>{copied ? 'Copied' : 'Copy page'}</span>
              </button>
            </div>

            {current.subtitle && (
              <p className="page-subtitle">{current.subtitle}</p>
            )}

            <div className="title-divider" />

            <Blocks blocks={current.blocks} />

            {/* PREV / NEXT NAVIGATION */}
            <div className="page-navigation">
              {previous ? (
                <button
                  className="page-nav-card prev"
                  onClick={() => go(previous.id)}
                >
                  <span>
                    <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Previous
                  </span>
                  <strong>{previous.title}</strong>
                </button>
              ) : (
                <div />
              )}
              {next ? (
                <button
                  className="page-nav-card next"
                  onClick={() => go(next.id)}
                >
                  <span>
                    Next <ChevronRight size={14} />
                  </span>
                  <strong>{next.title}</strong>
                </button>
              ) : (
                <div />
              )}
            </div>

            <footer className="doc-footer">
              <span>
                © iNextLabs ·{' '}
                {activeAudience === 'client'
                  ? 'Client Integration Documentation'
                  : 'Internal Engineering Documentation'}
              </span>
              <a
                href="https://learn.microsoft.com/en-us/azure/active-directory-b2c/add-api-connector-token-enrichment"
                target="_blank"
                rel="noreferrer"
              >
                Verify against Microsoft Learn <ExternalLink size={13} />
              </a>
            </footer>
          </article>
        </main>

        {/* RIGHT TOC */}
        <aside className="right-toc">
          <div className="toc-title">
            <List size={16} />
            <span>On this page</span>
          </div>

          <nav className="toc-links" aria-label="On this page">
            {tocSections.map(sec => (
              <button
                key={sec.id}
                className={`toc-link ${activeHeading === sec.id ? 'active' : ''}`}
                onClick={() => jumpToToc(sec.id)}
              >
                {sec.title}
              </button>
            ))}
            {!tocSections.length && (
              <div style={{ fontSize: '11px', color: '#94a3b8', padding: '6px 0 6px 14px' }}>
                {current.title}
              </div>
            )}
          </nav>

          <div className="toc-divider" />

          <a
            className="toc-action"
            href="https://learn.microsoft.com/en-us/azure/active-directory-b2c/add-api-connector-token-enrichment"
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={15} /> Official Microsoft guide
          </a>
        </aside>
      </div>
    </div>
  );
}

function Blocks({ blocks }) {
  // Organize blocks into sections divided by 'h2'
  // and group consecutive 'step' blocks into a single stepsGroup
  const sections = [];
  let currentSec = { id: null, title: null, items: [] };

  blocks.forEach((b, i) => {
    const [t, ...v] = b;
    if (t === 'h2') {
      if (currentSec.items.length || currentSec.title) {
        sections.push(currentSec);
      }
      const headingId = `heading-${slugify(v[0])}-${i}`;
      currentSec = { id: headingId, title: v[0], items: [] };
    } else {
      currentSec.items.push({ block: b, origIndex: i });
    }
  });
  if (currentSec.items.length || currentSec.title) {
    sections.push(currentSec);
  }

  // Helper to render items within a section, grouping consecutive steps
  const renderSectionItems = (items) => {
    const grouped = [];
    let currentStepGroup = null;

    items.forEach(({ block, origIndex }) => {
      const [t, ...v] = block;
      if (t === 'step') {
        if (!currentStepGroup) currentStepGroup = [];
        currentStepGroup.push({ stepNum: v[0], title: v[1], desc: v[2], key: origIndex });
      } else {
        if (currentStepGroup) {
          grouped.push({ type: 'stepsGroup', steps: currentStepGroup, key: `steps-${origIndex}` });
          currentStepGroup = null;
        }
        grouped.push({ type: t, values: v, key: origIndex });
      }
    });
    if (currentStepGroup) {
      grouped.push({ type: 'stepsGroup', steps: currentStepGroup, key: 'steps-end' });
    }

    return grouped.map((el) => {
      if (el.type === 'stepsGroup') {
        return (
          <div className="steps-list" key={el.key}>
            {el.steps.map((s) => (
              <div className="step-row" key={s.key}>
                <div className="step-marker">{s.stepNum}</div>
                <div className="step-content">
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        );
      }

      const t = el.type;
      const v = el.values;
      const i = el.key;

      if (t === 'lead') {
        return (
          <p className="lead section-body" key={i}>
            {v[0]}
          </p>
        );
      }
      if (t === 'p') {
        const text = v[0] || '';
        const lines = text.split('\n');
        return (
          <p className="section-body" key={i}>
            {lines.map((line, lineIdx) => {
              const parts = line.split(/(\*\*[^*]+\*\*)/g);
              return (
                <React.Fragment key={lineIdx}>
                  {parts.map((part, pIdx) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                      return <strong key={pIdx}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                  })}
                  {lineIdx < lines.length - 1 && <br />}
                </React.Fragment>
              );
            })}
          </p>
        );
      }
      if (t === 'ul' || t === 'ol') {
        const Tag = t;
        return (
          <Tag className="content-list" key={i}>
            {v[0].map((x, j) => (
              <li key={j}>{x}</li>
            ))}
          </Tag>
        );
      }
      if (t === 'table') {
        return (
          <div className="table-wrap" key={i}>
            <table>
              <thead>
                <tr>
                  {v[0].map((x) => (
                    <th key={x}>{x}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {v[1].map((r, j) => (
                  <tr key={j}>
                    {r.map((x, k) => (
                      <td key={k}>{x}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      if (t === 'code') {
        return <CodeBlock key={i} lang={v[0]} code={v[1]} />;
      }
      if (t === 'callout') {
        let warn = v[0] === 'warn';
        return (
          <div className={`callout ${warn ? 'warning' : 'info'}`} key={i}>
            <div className="callout-heading">
              {warn ? <AlertTriangle size={18} /> : <Info size={18} />}
              <strong>{v[1]}</strong>
            </div>
            <p>{v[2]}</p>
          </div>
        );
      }
      if (t === 'image') {
        return (
          <figure className="doc-image" key={i}>
            <img src={`.${v[0]}`} alt={v[1]} />
            <figcaption>{v[2]}</figcaption>
          </figure>
        );
      }
      if (t === 'flow') {
        return (
          <div className="steps-list" key={i}>
            {v[0].map((s) => (
              <div className="step-row" key={s[0]}>
                <div className="step-marker">{s[0]}</div>
                <div className="step-content">
                  <h3>{s[1]}</h3>
                  <p>{s[2]}</p>
                </div>
              </div>
            ))}
          </div>
        );
      }
      if (t === 'check') {
        return (
          <ul className="content-list" key={i}>
            {v[0].map((x) => (
              <li key={x}>✓ {x}</li>
            ))}
          </ul>
        );
      }
      if (t === 'links') {
        return (
          <div className="resource-list" key={i}>
            {v[0].map(([a, u]) => (
              <a
                key={u}
                href={u}
                className="resource-link"
                target="_blank"
                rel="noreferrer"
              >
                <span>{a}</span>
                <ExternalLink size={15} />
              </a>
            ))}
          </div>
        );
      }
      if (t === 'interactive') {
        return <Checklist groups={v[0]} key={i} />;
      }
      return null;
    });
  };

  return (
    <div className="blocks">
      {sections.map((sec, secIdx) => {
        if (sec.title) {
          return (
            <section className="doc-section" id={sec.id} key={sec.id}>
              <h2>{sec.title}</h2>
              {renderSectionItems(sec.items)}
            </section>
          );
        }
        return (
          <div className="doc-intro-section" key={`intro-${secIdx}`}>
            {renderSectionItems(sec.items)}
          </div>
        );
      })}
    </div>
  );
}

function CodeBlock({ lang, code }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  return (
    <div className="code-block">
      <div className="code-header">
        <span>
          <Code2 size={14} />
          {lang || 'text'}
        </span>
        <button onClick={copy}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>{code}</code>
      </pre>
    </div>
  );
}

function Checklist({ groups }) {
  const [checked, setChecked] = useState({});
  const total = groups.reduce((acc, g) => acc + g[1].length, 0);
  const totalChecked = Object.values(checked).filter(Boolean).length;

  return (
    <div style={{ marginTop: '24px' }}>
      <div className="checklist-progress">
        <ListChecks size={16} />
        <span>
          {totalChecked} of {total} items completed
        </span>
        <div className="progress-track">
          <div style={{ width: `${(totalChecked / total) * 100}%` }} />
        </div>
      </div>

      <div className="checklist-groups">
        {groups.map(group => (
          <div className="checklist-group" key={group[0]}>
            <h3>{group[0]}</h3>
            {group[1].map(item => (
              <label className="check-row" key={item}>
                <input
                  type="checkbox"
                  checked={!!checked[item]}
                  onChange={e =>
                    setChecked(prev => ({ ...prev, [item]: e.target.checked }))
                  }
                />
                <span>{item}</span>
              </label>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}