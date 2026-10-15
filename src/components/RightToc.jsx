import { useEffect, useState, useRef } from 'react';
import { List, ExternalLink } from 'lucide-react';

export default function RightToc({ sections, activeId }) {
  const [activeSection, setActiveSection] = useState('');
  const isClickScrolling = useRef(false);
  const clickTimeout = useRef(null);

  useEffect(() => {
    // Default active section to the first section on page change
    if (sections && sections.length > 0) {
      setActiveSection(sections[0].id);
    } else {
      setActiveSection('');
    }

    const handleScroll = () => {
      if (isClickScrolling.current) return;
      if (!sections || sections.length === 0) return;

      const offsetThreshold = 140; // Accounts for sticky top header
      let current = sections[0].id;

      for (const section of sections) {
        const el = document.getElementById(section.id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offsetThreshold) {
            current = section.id;
          } else {
            break;
          }
        }
      }

      // If at bottom of window, activate the last section
      const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (atBottom && sections.length > 0) {
        current = sections[sections.length - 1].id;
      }

      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // Run initial check after render
    const initialTimer = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(initialTimer);
      if (clickTimeout.current) clearTimeout(clickTimeout.current);
    };
  }, [activeId, sections]);

  const jumpTo = id => {
    setActiveSection(id);
    isClickScrolling.current = true;
    if (clickTimeout.current) clearTimeout(clickTimeout.current);

    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

    clickTimeout.current = setTimeout(() => {
      isClickScrolling.current = false;
    }, 800);
  };

  return (
    <aside className="right-toc">
      <div className="toc-title">
        <List size={16} />
        <span>On this page</span>
      </div>
      <nav className="toc-links" aria-label="On this page">
        {sections.map(section => (
          <button
            key={section.id}
            className={`toc-link ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => jumpTo(section.id)}
          >
            {section.title.replace(/^\d+\.\s*/, '').replace(/^Step \d+ — /, '')}
          </button>
        ))}
      </nav>
      <div className="toc-divider" />
      <a
        className="toc-action"
        href="https://learn.microsoft.com/en-us/azure/active-directory-b2c/identity-provider-generic-openid-connect"
        target="_blank"
        rel="noreferrer"
      >
        <ExternalLink size={15} /> Official Microsoft guide
      </a>
    </aside>
  );
}
