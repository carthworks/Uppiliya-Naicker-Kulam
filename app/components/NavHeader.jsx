'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import DesktopIconModal from './DesktopIconModal';

const COMMUNITY_SUBMENU = [
  { href: '/#kulam-search', icon: '🔍', label: 'குலங்கள் தேடல்', labelEn: 'Kulam Search', desc: 'குலம், குலதெய்வம், பங்காளிகள்' },
  { href: '/history',       icon: '📜', label: 'வரலாறு',        labelEn: 'History',      desc: 'சமூக மரபு & பண்பாட்டு பின்னணி' },
  { href: '/thought',       icon: '💡', label: 'சிந்தனைகள்',    labelEn: 'Thought',      desc: '5 முக்கிய லட்சியங்கள் & பார்வை' },
];

const MAIN_NAV_LINKS = [
  { href: '/',              label: 'Home',            ta: 'முகப்பு',       special: false },
  { href: '/rasi-porutham', label: 'ராசி பொருத்தம்',  ta: 'ராசி பொருத்தம்', special: false },
  { href: '/horai',         label: 'ஓரை',             ta: 'ஓரை',           special: false },
  { href: '/jothidam',      label: '🌙 ஜோதிடம்',      ta: 'ஜோதிடம்',       special: true  },
];

export default function NavHeader() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileSubmenuOpen, setMobileSubmenuOpen] = useState(true);
  const [theme, setTheme] = useState('dark');
  const [installModalOpen, setInstallModalOpen] = useState(false);
  const pathname = usePathname();
  const dropdownRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 280);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Listen for global open_install_modal event
  useEffect(() => {
    const handleOpenModal = () => setInstallModalOpen(true);
    window.addEventListener('open_install_modal', handleOpenModal);
    return () => window.removeEventListener('open_install_modal', handleOpenModal);
  }, []);

  // Initialize theme from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('uppiliya_theme');
      const initial = saved === 'light' ? 'light' : 'dark';
      setTheme(initial);
      document.documentElement.setAttribute('data-theme', initial);
      document.body.setAttribute('data-theme', initial);
    } catch {
      // fallback
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try {
      localStorage.setItem('uppiliya_theme', next);
      document.documentElement.setAttribute('data-theme', next);
      document.body.setAttribute('data-theme', next);
      window.dispatchEvent(new CustomEvent('uppiliya_theme_change', { detail: { theme: next } }));
    } catch {
      // fallback
    }
  };

  // close on route change
  useEffect(() => {
    setOpen(false);
    setDropdownOpen(false);
  }, [pathname]);

  // close desktop dropdown on outside click or Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setDropdownOpen(false);
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const isCommunityActive = pathname === '/history' || pathname === '/thought';

  return (
    <>
      <style suppressHydrationWarning>{`
        .nav-header {
          padding: 0.85rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(15,23,42,0.88);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          position: sticky; top: 0; z-index: 200;
          transition: background-color .3s, border-color .3s;
        }

        [data-theme="light"] .nav-header {
          background: rgba(255, 255, 255, 0.92);
          border-bottom-color: rgba(0, 0, 0, 0.1);
        }

        /* ── Brand ── */
        .nav-brand {
          text-decoration: none; font-weight: 800; font-size: 1.15rem;
          background: linear-gradient(to right, #60a5fa, #c084fc);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          flex-shrink: 0; display: flex; align-items: center; gap: 0.4rem;
        }

        /* ── Desktop nav ── */
        .nav-right-wrap {
          display: flex; align-items: center; gap: 0.75rem;
        }

        .nav-links {
          display: flex; gap: 0.35rem; align-items: center; list-style: none;
        }
        .nav-link {
          text-decoration: none; font-size: 0.92rem; font-weight: 500;
          color: var(--text-muted);
          padding: 0.42rem 0.75rem; border-radius: 8px;
          transition: color .2s, background .2s;
          white-space: nowrap;
          display: inline-flex; align-items: center; gap: 0.35rem;
        }
        .nav-link:hover       { color: var(--text-light); background: rgba(255,255,255,0.06); }
        .nav-link.active      { color: var(--text-light); background: rgba(255,255,255,0.1); }
        
        [data-theme="light"] .nav-link:hover { color: #0f172a; background: rgba(0,0,0,0.05); }
        [data-theme="light"] .nav-link.active { color: #0f172a; background: rgba(0,0,0,0.08); font-weight: 700; }

        .nav-link.special {
          font-weight: 700;
          background: linear-gradient(90deg,#f59e0b,#f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .nav-link.special:hover,
        .nav-link.special.active { background-color: rgba(245,158,11,0.1); }

        /* ── Submenu Dropdown Container ── */
        .nav-dropdown-wrap {
          position: relative;
        }
        .nav-dropdown-btn {
          background: transparent; border: none; font-family: inherit;
          cursor: pointer; font-size: 0.92rem; font-weight: 500;
          color: var(--text-muted);
          padding: 0.42rem 0.75rem; border-radius: 8px;
          display: inline-flex; align-items: center; gap: 0.35rem;
          transition: color .2s, background .2s;
        }
        .nav-dropdown-btn:hover,
        .nav-dropdown-btn.active,
        .nav-dropdown-wrap:hover .nav-dropdown-btn {
          color: var(--text-light);
          background: rgba(255,255,255,0.06);
        }
        [data-theme="light"] .nav-dropdown-btn:hover,
        [data-theme="light"] .nav-dropdown-btn.active,
        [data-theme="light"] .nav-dropdown-wrap:hover .nav-dropdown-btn {
          color: #0f172a;
          background: rgba(0,0,0,0.05);
        }
        .nav-dropdown-arrow {
          font-size: 0.7rem; transition: transform .2s ease;
        }
        .nav-dropdown-btn.open .nav-dropdown-arrow {
          transform: rotate(180deg);
        }

        /* ── Dropdown Menu Menu ── */
        .nav-dropdown-menu {
          position: absolute; top: calc(100% + 4px); left: 0;
          min-width: 260px;
          background: rgba(15, 23, 42, 0.96);
          border: 1px solid rgba(192,132,252,0.3);
          border-radius: 14px;
          padding: 0.5rem;
          box-shadow: 0 16px 36px rgba(0,0,0,0.5), 0 0 20px rgba(192,132,252,0.15);
          backdrop-filter: blur(20px);
          display: flex; flex-direction: column; gap: 0.3rem;
          animation: dropIn .18s ease-out;
          z-index: 250;
        }
        /* Invisible hover bridge to prevent menu from disappearing during mouse movement */
        .nav-dropdown-menu::before {
          content: '';
          position: absolute;
          top: -14px;
          left: 0;
          right: 0;
          height: 14px;
          background: transparent;
        }
        [data-theme="light"] .nav-dropdown-menu {
          background: rgba(255, 255, 255, 0.98);
          border-color: rgba(0, 0, 0, 0.12);
          box-shadow: 0 16px 36px rgba(0,0,0,0.15);
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-dropdown-item {
          text-decoration: none;
          padding: 0.65rem 0.85rem;
          border-radius: 10px;
          display: flex; align-items: flex-start; gap: 0.75rem;
          transition: background .15s, transform .15s;
          border: 1px solid transparent;
        }
        .nav-dropdown-item:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.08);
          transform: translateX(2px);
        }
        [data-theme="light"] .nav-dropdown-item:hover {
          background: rgba(0, 0, 0, 0.04);
          border-color: rgba(0, 0, 0, 0.06);
        }
        .nav-dropdown-item.active {
          background: rgba(192,132,252,0.12);
          border-color: rgba(192,132,252,0.3);
        }
        .nav-dropdown-icon {
          font-size: 1.25rem; line-height: 1; flex-shrink: 0; margin-top: 0.1rem;
        }
        .nav-dropdown-text {
          flex: 1; min-width: 0;
        }
        .nav-dropdown-title {
          font-size: 0.9rem; font-weight: 700; color: #f8fafc;
          display: flex; align-items: center; justify-content: space-between;
        }
        [data-theme="light"] .nav-dropdown-title {
          color: #0f172a;
        }
        .nav-dropdown-desc {
          font-size: 0.75rem; color: #94a3b8; margin-top: 0.15rem; line-height: 1.35;
        }

        /* ── Top Theme Button (Navbar) ── */
        .nav-theme-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.42rem 0.85rem; border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.18);
          color: var(--text-light); font-size: 0.82rem; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: all 0.2s; white-space: nowrap;
        }
        .nav-theme-btn:hover {
          background: rgba(255, 255, 255, 0.15);
          transform: translateY(-1px);
        }
        [data-theme="light"] .nav-theme-btn {
          background: rgba(0, 0, 0, 0.05);
          border-color: rgba(0, 0, 0, 0.15);
          color: #0f172a;
        }
        [data-theme="light"] .nav-theme-btn:hover {
          background: rgba(0, 0, 0, 0.1);
        }

        /* ── Install / Desktop Icon Button ── */
        .nav-install-btn {
          display: inline-flex; align-items: center; gap: 0.4rem;
          padding: 0.42rem 0.85rem; border-radius: 999px;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(168, 85, 247, 0.2));
          border: 1px solid rgba(168, 85, 247, 0.45);
          color: var(--text-light); font-size: 0.82rem; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: all 0.2s; white-space: nowrap;
        }
        .nav-install-btn:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.35), rgba(168, 85, 247, 0.35));
          border-color: rgba(168, 85, 247, 0.75);
          transform: translateY(-1px);
          box-shadow: 0 2px 12px rgba(168, 85, 247, 0.25);
        }
        [data-theme="light"] .nav-install-btn {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.12));
          border-color: rgba(124, 58, 237, 0.3);
          color: #6d28d9;
        }
        [data-theme="light"] .nav-install-btn:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.18), rgba(168, 85, 247, 0.2));
        }

        .nav-drawer-install-btn {
          display: flex; align-items: center; justify-content: center; gap: 0.5rem;
          padding: 0.8rem 1rem; border-radius: 10px;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          border: none; color: #ffffff;
          font-size: 0.95rem; font-weight: 700;
          cursor: pointer; font-family: inherit;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
          transition: transform 0.15s;
        }
        .nav-drawer-install-btn:active {
          transform: scale(0.98);
        }

        /* ── Hamburger button ── */
        .nav-toggle {
          display: none;
          flex-direction: column; justify-content: center; align-items: center;
          gap: 5px; width: 38px; height: 38px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px; cursor: pointer; padding: 0;
          transition: background .2s;
        }
        [data-theme="light"] .nav-toggle {
          background: rgba(0,0,0,0.05); border-color: rgba(0,0,0,0.12);
        }
        .nav-toggle:hover { background: rgba(255,255,255,0.1); }
        .nav-toggle span {
          display: block; width: 20px; height: 2px;
          background: var(--text-light); border-radius: 2px;
          transition: transform .3s, opacity .3s;
          transform-origin: center;
        }
        [data-theme="light"] .nav-toggle span {
          background: #0f172a;
        }
        .nav-toggle.open span:nth-child(1) { transform: translateY(7px) rotate(45deg); }
        .nav-toggle.open span:nth-child(2) { opacity: 0; }
        .nav-toggle.open span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }

        /* ── Mobile drawer ── */
        .nav-drawer {
          display: none;
          position: fixed; top: 57px; left: 0; right: 0; bottom: 0;
          background: rgba(10,16,30,0.98);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          z-index: 199;
          flex-direction: column;
          padding: 1.25rem;
          gap: 0.5rem;
          animation: drawerIn .22s ease;
          overflow-y: auto;
        }
        [data-theme="light"] .nav-drawer {
          background: rgba(245, 248, 252, 0.98);
        }
        .nav-drawer.open { display: flex; }
        @keyframes drawerIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-drawer .nav-link {
          font-size: 1.05rem; padding: 0.75rem 1rem; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          display: flex; align-items: center; justify-content: space-between;
        }
        [data-theme="light"] .nav-drawer .nav-link {
          border-color: rgba(0,0,0,0.08);
        }
        .nav-drawer .nav-link.special {
          border-color: rgba(245,158,11,0.25);
          background-color: rgba(245,158,11,0.07);
          -webkit-text-fill-color: unset;
          background: linear-gradient(90deg,#f59e0b,#f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        
        /* Mobile Submenu Box */
        .nav-drawer-submenu-box {
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(192,132,252,0.2);
          border-radius: 12px;
          padding: 0.5rem;
          display: flex; flex-direction: column; gap: 0.35rem;
        }
        [data-theme="light"] .nav-drawer-submenu-box {
          background: rgba(0,0,0,0.03);
          border-color: rgba(0,0,0,0.1);
        }
        .nav-drawer-submenu-header {
          display: flex; justify-content: space-between; align-items: center;
          padding: 0.5rem 0.75rem;
          font-size: 0.85rem; font-weight: 700; color: #c084fc;
          cursor: pointer; user-select: none;
        }
        [data-theme="light"] .nav-drawer-submenu-header {
          color: #7c3aed;
        }
        .nav-drawer-sub-item {
          text-decoration: none;
          padding: 0.6rem 0.8rem;
          border-radius: 8px;
          display: flex; align-items: center; gap: 0.65rem;
          color: #e2e8f0; font-size: 0.95rem; font-weight: 500;
          background: rgba(255,255,255,0.02);
          transition: background .15s;
        }
        [data-theme="light"] .nav-drawer-sub-item {
          color: #0f172a;
          background: rgba(0,0,0,0.02);
        }
        .nav-drawer-sub-item:hover,
        .nav-drawer-sub-item.active {
          background: rgba(192,132,252,0.15);
          color: #fff;
        }
        [data-theme="light"] .nav-drawer-sub-item:hover,
        [data-theme="light"] .nav-drawer-sub-item.active {
          background: rgba(124, 58, 237, 0.12);
          color: #7c3aed;
        }
        .nav-drawer-divider {
          height: 1px; background: rgba(255,255,255,0.07); margin: 0.25rem 0;
        }
        [data-theme="light"] .nav-drawer-divider {
          background: rgba(0,0,0,0.08);
        }

        @media (max-width: 820px) {
          .nav-toggle { display: flex; }
          .nav-links   { display: none; }
          .nav-header  { padding: 0.8rem 1rem; }
        }
      `}</style>

      <header className="nav-header">
        {/* Brand */}
        <Link href="/" className="nav-brand">
          <span>🏛️</span> Uppiliya.community
        </Link>

        {/* Right side wrap */}
        <div className="nav-right-wrap">
          {/* Desktop links */}
          <ul className="nav-links" role="navigation" aria-label="Main navigation">
            {/* Home */}
            <li>
              <Link
                href="/"
                className={`nav-link ${pathname === '/' ? 'active' : ''}`}
              >
                முகப்பு
              </Link>
            </li>

            {/* Submenu: சமூகம் (Community) */}
            <li
              className="nav-dropdown-wrap"
              ref={dropdownRef}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <button
                className={`nav-dropdown-btn ${isCommunityActive ? 'active' : ''} ${dropdownOpen ? 'open' : ''}`}
                onClick={() => setDropdownOpen(o => !o)}
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <span>🏛️ சமூகம்</span>
                <span className="nav-dropdown-arrow">▼</span>
              </button>

              {dropdownOpen && (
                <div className="nav-dropdown-menu">
                  {COMMUNITY_SUBMENU.map(item => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`nav-dropdown-item ${pathname === item.href ? 'active' : ''}`}
                      onClick={() => setDropdownOpen(false)}
                    >
                      <span className="nav-dropdown-icon">{item.icon}</span>
                      <div className="nav-dropdown-text">
                        <div className="nav-dropdown-title">
                          {item.label}
                        </div>
                        <div className="nav-dropdown-desc">{item.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </li>

            {/* Other main links */}
            {MAIN_NAV_LINKS.slice(1).map(({ href, label, special }) => (
              <li key={href}>
                <Link
                  href={href}
                  className={[
                    'nav-link',
                    special ? 'special' : '',
                    pathname === href ? 'active' : '',
                  ].join(' ').trim()}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop Icon / Install Button */}
          <button
            className="nav-install-btn"
            onClick={() => setInstallModalOpen(true)}
            aria-label="Add Desktop Icon / Install Web App"
            title="டெஸ்க்டாப் / முகப்பு ஐகான் (Add Desktop Icon)"
          >
            <span>💻</span>
            <span>டெஸ்க்டாப் ஐகான்</span>
          </button>

          {/* Global Theme Toggle Button @ Top Navbar (All Pages) */}
          <button
            className="nav-theme-btn"
            onClick={toggleTheme}
            aria-label="Toggle dark/light theme"
            title="கருப்பொருள் மாற்றம் (Dark / Light Theme)"
          >
            <span>{theme === 'dark' ? '☀️' : '🌙'}</span>
            <span>{theme === 'dark' ? 'ஒளி' : 'இருள்'}</span>
          </button>

          {/* Hamburger (Mobile) */}
          <button
            className={`nav-toggle ${open ? 'open' : ''}`}
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen(o => !o)}
          >
            <span /><span /><span />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      <div className={`nav-drawer ${open ? 'open' : ''}`} role="dialog" aria-label="Mobile navigation">
        {/* Home */}
        <Link
          href="/"
          className={`nav-link ${pathname === '/' ? 'active' : ''}`}
          onClick={() => setOpen(false)}
        >
          <span>🏠 முகப்பு (Home)</span>
        </Link>

        {/* Submenu Accordion for Community */}
        <div className="nav-drawer-submenu-box">
          <div
            className="nav-drawer-submenu-header"
            onClick={() => setMobileSubmenuOpen(o => !o)}
          >
            <span>🏛️ சமூகம் &amp; குலங்கள் (Community)</span>
            <span>{mobileSubmenuOpen ? '▲' : '▼'}</span>
          </div>

          {mobileSubmenuOpen && (
            <>
              {COMMUNITY_SUBMENU.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`nav-drawer-sub-item ${pathname === item.href ? 'active' : ''}`}
                  onClick={() => setOpen(false)}
                >
                  <span>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 600 }}>{item.label}</div>
                    <div style={{ fontSize: '.74rem', color: '#94a3b8' }}>{item.desc}</div>
                  </div>
                </Link>
              ))}
            </>
          )}
        </div>

        {/* Other main links in mobile drawer */}
        {MAIN_NAV_LINKS.slice(1).map(({ href, label, special }) => (
          <Link
            key={href}
            href={href}
            className={[
              'nav-link',
              special ? 'special' : '',
              pathname === href ? 'active' : '',
            ].join(' ').trim()}
            onClick={() => setOpen(false)}
          >
            <span>{label}</span>
            <span>→</span>
          </Link>
        ))}

        <div className="nav-drawer-divider" />

        {/* Desktop / Mobile shortcut button in drawer */}
        <button
          className="nav-drawer-install-btn"
          onClick={() => {
            setOpen(false);
            setInstallModalOpen(true);
          }}
        >
          <span>📲 டெஸ்க்டாப் / முகப்பு ஐகான் சேர்க்க</span>
        </button>

        {/* Theme toggle in mobile drawer */}
        <button
          className="nav-theme-btn"
          style={{ width: '100%', justifyContent: 'center', padding: '0.75rem' }}
          onClick={toggleTheme}
        >
          <span>{theme === 'dark' ? '☀️ ஒளி தீம் (Light Theme)' : '🌙 இருள் தீம் (Dark Theme)'}</span>
        </button>
      </div>

      {/* Desktop / Mobile shortcut modal */}
      <DesktopIconModal
        isOpen={installModalOpen}
        onClose={() => setInstallModalOpen(false)}
      />
    </>
  );
}
