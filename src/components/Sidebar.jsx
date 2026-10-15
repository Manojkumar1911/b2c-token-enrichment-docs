import { useState } from 'react';
import { ChevronDown, ChevronRight, Search, BookOpen, PanelLeftClose } from 'lucide-react';
import { navigation, pages } from '../data/docs';

export default function Sidebar({ activeId, onSelect, search, setSearch, mobileOpen, onClose, activeAudience }) {
  const [collapsed, setCollapsed] = useState({});
  const query = search.trim().toLowerCase();
  const filtered = navigation.map(group => ({ ...group, items: group.items.filter(item => {
    const page = pages[item.id];
    return !query || `${item.title} ${group.group} ${page?.title || ''} ${page?.subtitle || ''} ${page?.sections?.map(s => `${s.title} ${s.body || ''}`).join(' ') || ''}`.toLowerCase().includes(query);
  })})).filter(group => group.items.length);

  return <>
    {mobileOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={onClose}/>}
    <aside className={`sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
      <div className="sidebar-top"><div className="sidebar-heading"><BookOpen size={16}/><span>Documentation</span></div><button className="sidebar-collapse" title="Navigation panel" aria-label="Navigation panel"><PanelLeftClose size={16}/></button></div>
      <label className="sidebar-search"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find by title"/><kbd>/</kbd></label>
      {query && <div className="search-count">{filtered.reduce((n, g) => n + g.items.length, 0)} matching pages</div>}
      <nav className="nav-tree" aria-label="Documentation navigation">
        {filtered.map(group => <section className="nav-group" key={group.group}>
          <button className="nav-group-label" onClick={() => setCollapsed(old => ({...old, [group.group]: !old[group.group]}))}>
            <span>{group.group}</span>{collapsed[group.group] ? <ChevronRight size={15}/> : <ChevronDown size={15}/>}
          </button>
          {!collapsed[group.group] && <div className="nav-items">{group.items.map(item => <button key={item.id} className={`nav-item ${activeId === item.id ? 'selected' : ''}`} onClick={() => {onSelect(item.id); onClose?.();}} title={item.title}><span className="nav-item-dot"/>{item.title}</button>)}</div>}
        </section>)}
        {filtered.length === 0 && <div className="no-results">No pages found. Try another search.</div>}
      </nav>
      <div className="sidebar-footer">
        <span className="footer-dot"/>
        {activeAudience === 'client' ? 'Client integration guide' : 'Internal engineering guide'}
        <span className="footer-version">v1.0</span>
      </div>
    </aside>
  </>;
}
