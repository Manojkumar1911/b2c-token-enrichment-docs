import { useEffect, useMemo, useState } from 'react';
import { Menu, X, Search, BookOpenText, Command } from 'lucide-react';
import Topbar from './components/Topbar';
import Sidebar from './components/Sidebar';
import RightToc from './components/RightToc';
import DocContent from './components/DocContent';
import { navigation, pages } from './data/docs';

export default function App() {
  const [activeId, setActiveId] = useState('introduction');
  const [search, setSearch] = useState('');
  const [activeAudience, setActiveAudience] = useState('internal');
  const [mobileOpen, setMobileOpen] = useState(false);
  const page = pages[activeId] || pages.introduction;
  const totalPages = useMemo(() => navigation.reduce((n, group) => n + group.items.length, 0), []);

  useEffect(() => {
    document.title = `${page.title} | iNextLabs OIDC Docs`;
    if (window.location.hash === '#top') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [activeId, page.title]);

  useEffect(() => {
    const handleShortcut = event => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        document.querySelector('.search-box input')?.focus();
      }
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  const selectPage = id => {
    setActiveId(id);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return <div className="app-shell">
    <Topbar search={search} setSearch={setSearch} activeAudience={activeAudience} setActiveAudience={setActiveAudience} onMenu={() => setMobileOpen(v => !v)} mobileOpen={mobileOpen}/>
    {search.trim() && <div className="search-results-popover"><div className="search-results-title"><Search size={15}/> Search results <span>{navigation.flatMap(g => g.items).filter(item => `${item.title} ${pages[item.id]?.title} ${pages[item.id]?.subtitle} ${pages[item.id]?.sections?.map(s => `${s.title} ${s.body || ''} ${(s.bullets || []).join(' ')} ${(s.steps || []).flat().join(' ')}`).join(' ')}`.toLowerCase().includes(search.toLowerCase())).length}</span></div><div className="search-results-list">{navigation.flatMap(g => g.items.map(item => ({...item, group: g.group}))).filter(item => `${item.title} ${item.group} ${pages[item.id]?.title} ${pages[item.id]?.subtitle} ${pages[item.id]?.sections?.map(s => `${s.title} ${s.body || ''} ${(s.bullets || []).join(' ')} ${(s.steps || []).flat().join(' ')}`).join(' ')}`.toLowerCase().includes(search.toLowerCase())).slice(0, 12).map(item => <button key={item.id} onClick={() => {selectPage(item.id); setSearch('');}}><span className="result-title">{item.title}</span><span className="result-group">{item.group}</span></button>)}{!navigation.flatMap(g => g.items).some(item => `${item.title} ${pages[item.id]?.title} ${pages[item.id]?.subtitle} ${pages[item.id]?.sections?.map(s => `${s.title} ${s.body || ''}`).join(' ')}`.toLowerCase().includes(search.toLowerCase())) && <div className="search-empty">No matching pages found.</div>}</div></div>}
    <div className="layout-grid">
      <Sidebar activeId={activeId} onSelect={selectPage} search={search} setSearch={setSearch} mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} activeAudience={activeAudience}/>
      <main className="main-column"><DocContent pageId={activeId} onSelect={selectPage} activeAudience={activeAudience}/></main>
      <RightToc sections={page.sections} activeId={activeId}/>
    </div>
    <div className="mobile-bottom-bar"><span><BookOpenText size={14}/> {totalPages} pages</span><button onClick={() => setMobileOpen(v => !v)}>{mobileOpen ? <X size={16}/> : <Menu size={16}/>} Contents</button></div>
  </div>;
}
