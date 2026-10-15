import { BookOpenText, Search, Github, Menu, X, Command, ChevronDown } from 'lucide-react';

export default function Topbar({ search, setSearch, activeAudience, setActiveAudience, onMenu, mobileOpen }) {
  return <header className="topbar">
    <button className="icon-button mobile-menu" aria-label="Toggle navigation" onClick={onMenu}>{mobileOpen ? <X size={19}/> : <Menu size={19}/>}</button>
    <a className="brand" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }} aria-label="iNextLabs documentation home">
      <img src={`${import.meta.env.BASE_URL}images/inextlabs-logo-NtEQwFAf.png`} alt="iNextLabs" className="brand-logo" />
      <span className="brand-divider" />
      <strong>OIDC Configuration Docs</strong>
    </a>
    <nav className="audience-tabs" aria-label="Documentation audience">
      <button className={activeAudience === 'internal' ? 'audience-tab active' : 'audience-tab'} onClick={() => setActiveAudience('internal')}><span className="tab-dot blue"/>Internal Docs</button>
      <button className={activeAudience === 'client' ? 'audience-tab active' : 'audience-tab'} onClick={() => setActiveAudience('client')}><span className="tab-dot green"/>Client Docs</button>
    </nav>
    <div className="top-actions">
      <label className="search-box" aria-label="Search documentation"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search docs..." /><kbd><Command size={11}/> K</kbd></label>
      <span className="version-pill">v1.0</span>
      <a className="github-link" href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18}/></a>
    </div>
  </header>;
}
