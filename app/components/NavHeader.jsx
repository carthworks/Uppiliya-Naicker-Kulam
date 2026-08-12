'use client';

import { useState, useEffect, Fragment } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/',              label: 'Home',               ta: 'Home',                  special: false },
  { href: '/history',       label: 'வரலாறு (History)',   ta: 'வரலாறு',              special: true  },
  { href: '/rasi-porutham', label: 'ராசி பொருத்தம்',    ta: 'ராசி பொருத்தம்',     special: false },
  { href: '/horai',         label: 'ஓரை',               ta: 'ஓரை',                 special: false },
];

export default function NavHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // close menu on route change
  useEffect(() => { setOpen(false); }, [pathname]);
  // close on outside click / Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open]);

  return (
    <>
      <style suppressHydrationWarning>{`
        .nav-header {
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--border-color);
          display: flex; justify-content: space-between; align-items: center;
          background: rgba(15,23,42,0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          position: sticky; top: 0; z-index: 200;
        }

        /* ── Brand ── */
        .nav-brand {
          text-decoration: none; font-weight: 800; font-size: 1.15rem;
          background: linear-gradient(to right, #60a5fa, #c084fc);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          flex-shrink: 0;
        }

        /* ── Desktop nav ── */
        .nav-links {
          display: flex; gap: 0.25rem; align-items: center; list-style: none;
        }
        .nav-link {
          text-decoration: none; font-size: 0.92rem; font-weight: 500;
          color: var(--text-muted);
          padding: 0.4rem 0.75rem; border-radius: 8px;
          transition: color .2s, background .2s;
          white-space: nowrap;
        }
        .nav-link:hover       { color: var(--text-light); background: rgba(255,255,255,0.06); }
        .nav-link.active      { color: var(--text-light); background: rgba(255,255,255,0.1); }
        .nav-link.special {
          font-weight: 700;
          background: linear-gradient(90deg,#f59e0b,#f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .nav-link.special:hover,
        .nav-link.special.active { background-color: rgba(245,158,11,0.1); }

        /* ── Hamburger button ── */
        .nav-toggle {
          display: none;
          flex-direction: column; justify-content: center; align-items: center;
          gap: 5px; width: 38px; height: 38px;
          background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12);
          border-radius: 8px; cursor: pointer; padding: 0;
          transition: background .2s;
        }
        .nav-toggle:hover { background: rgba(255,255,255,0.1); }
        .nav-toggle span {
          display: block; width: 20px; height: 2px;
          background: var(--text-light); border-radius: 2px;
          transition: transform .3s, opacity .3s;
          transform-origin: center;
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
          padding: 1.5rem;
          gap: 0.5rem;
          animation: drawerIn .22s ease;
          overflow-y: auto;
        }
        .nav-drawer.open { display: flex; }
        @keyframes drawerIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .nav-drawer .nav-link {
          font-size: 1.1rem; padding: 0.85rem 1rem; border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.07);
          display: block;
        }
        .nav-drawer .nav-link.special {
          border-color: rgba(245,158,11,0.25);
          background-color: rgba(245,158,11,0.07);
          -webkit-text-fill-color: unset;
          background: linear-gradient(90deg,#f59e0b,#f97316);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .nav-drawer-divider {
          height: 1px; background: rgba(255,255,255,0.07); margin: 0.5rem 0;
        }

        @media (max-width: 700px) {
          .nav-toggle { display: flex; }
          .nav-links   { display: none; }
          .nav-header  { padding: 0.85rem 1.1rem; }
        }
      `}</style>

      <header className="nav-header">
        {/* Brand */}
        <Link href="/" className="nav-brand">Uppiliya.community</Link>

        {/* Desktop links */}
        <ul className="nav-links" role="navigation" aria-label="Main navigation">
          {NAV_LINKS.map(({ href, label, special }) => (
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

        {/* Hamburger */}
        <button
          className={`nav-toggle ${open ? 'open' : ''}`}
          aria-label="Toggle navigation"
          aria-expanded={open}
          onClick={() => setOpen(o => !o)}
        >
          <span /><span /><span />
        </button>
      </header>

      {/* Mobile drawer */}
      <div className={`nav-drawer ${open ? 'open' : ''}`} role="dialog" aria-label="Mobile navigation">
        {NAV_LINKS.map(({ href, label, special }, i) => (
          <Fragment key={href}>
            {i > 0 && <div className="nav-drawer-divider" />}
            <Link
              href={href}
              className={[
                'nav-link',
                special ? 'special' : '',
                pathname === href ? 'active' : '',
              ].join(' ').trim()}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          </Fragment>
        ))}
      </div>
    </>
  );
}
