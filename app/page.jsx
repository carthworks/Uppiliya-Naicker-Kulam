'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import communityLogo from '../images/uppliakulam.png';

/* ── Ticker ── */
const TICKER_ITEMS = [
  '🌟 உப்பிலிய நாயக்கர் குல அடையாள தளத்திற்கு வரவேற்கிறோம்!',
  '⭐ ராசி பொருத்தம் — உங்கள் திருமண பொருத்தத்தை அறிந்து கொள்ளுங்கள்',
  '🪐 ஓரை கணிப்பு — இன்றைய சுப / அசுப நேரங்களை கண்டறியுங்கள்',
  '🌙 புதிய: தினசரி ஜோதிடம் — 12 ராசிகளுக்கான ராசிபலன்',
  '🔍 உங்கள் குலம், குலதெய்வம் மற்றும் பங்காளிகளை இங்கே தேடுங்கள்',
];

const FEATURES = [
  { href:'/history',       icon:'📜', title:'வரலாறு',        titleEn:'History',        desc:'சமூக வரலாறு & பண்பாடு',              c1:'#f59e0b', c2:'#f97316' },
  { href:'/thought',       icon:'💡', title:'சிந்தனைகள்',    titleEn:'Thoughts',       desc:'5 முக்கிய லட்சியங்கள்',              c1:'#fbbf24', c2:'#f59e0b' },
  { href:'/rasi-porutham', icon:'✨', title:'ராசி பொருத்தம்',titleEn:'Rasi Matching',  desc:'திருமண பொருத்தம் காணல்',             c1:'#c084fc', c2:'#60a5fa' },
  { href:'/horai',         icon:'🪐', title:'ஓரை',           titleEn:'Horai',          desc:'கிரக ஓரைகள் & ராகு காலம்',           c1:'#a855f7', c2:'#ec4899' },
  { href:'/jothidam',      icon:'🌙', title:'ஜோதிடம்',       titleEn:'Horoscope',      desc:'தினசரி ராசிபலன் · வாரம் · மாதம்',    c1:'#c084fc', c2:'#38bdf8', isNew: true },
];

function NewsTicker({ dark }) {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIdx(i => (i + 1) % TICKER_ITEMS.length); setFade(true); }, 350);
    }, 4000);
    return () => clearInterval(t);
  }, []);
  return (
    <div style={{
      background: dark ? 'rgba(251,191,36,0.08)' : 'rgba(245,158,11,0.12)',
      borderTop: `1px solid rgba(245,158,11,${dark ? '.2' : '.35'})`,
      borderBottom: `1px solid rgba(245,158,11,${dark ? '.2' : '.35'})`,
      padding: '.4rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem',
      overflow: 'hidden', minHeight: '38px',
    }}>
      <span style={{
        background: 'linear-gradient(90deg,#fbbf24,#f97316)', WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent', fontWeight: 800, fontSize: '.72rem',
        letterSpacing: '.12em', flexShrink: 0,
      }}>LIVE</span>
      <span style={{
        fontSize: '.84rem', color: dark ? '#fde68a' : '#92400e',
        transition: 'opacity .35s', opacity: fade ? 1 : 0, lineHeight: 1.4,
      }}>{TICKER_ITEMS[idx]}</span>
    </div>
  );
}

export default function Home() {
  const [dark, setDark]                       = useState(true);
  const [data, setData]                       = useState([]);
  const [searchQuery, setSearchQuery]         = useState('');
  const [selectedEntity, setSelectedEntity]   = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeMapQuery, setActiveMapQuery]   = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('uppiliya_theme');
      if (saved) setDark(saved === 'dark');
    } catch {}
    const themeListener = e => {
      if (e.detail?.theme) setDark(e.detail.theme === 'dark');
    };
    window.addEventListener('uppiliya_theme_change', themeListener);
    import('../data.json').then(m => setData(m.default));
    const handler = e => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchFocused(false);
    };
    document.addEventListener('mousedown', handler);
    return () => {
      window.removeEventListener('uppiliya_theme_change', themeListener);
      document.removeEventListener('mousedown', handler);
    };
  }, []);

  const filteredData = useMemo(() => {
    if (!searchQuery) return data;
    const q = searchQuery.toLowerCase();
    return data.filter(i =>
      i.name.toLowerCase().includes(q) ||
      i.category.toLowerCase().includes(q) ||
      (i.kulatheivam && i.kulatheivam.some(k => k.toLowerCase().includes(q))) ||
      (i.relationships && i.relationships.toLowerCase().includes(q))
    );
  }, [searchQuery, data]);

  const handleSelect = entity => {
    setSelectedEntity(entity); setSearchQuery(''); setIsSearchFocused(false);
    setActiveMapQuery(entity.kulatheivam?.[0] || '');
  };

  const handleShare = () => {
    if (!selectedEntity) return;
    const templesText = selectedEntity.kulatheivam?.length
      ? selectedEntity.kulatheivam.map(t => `- ${t}\n  📍 https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t)}`).join('\n\n')
      : 'குறிப்பிடப்படவில்லை';
    const text = `*உப்பிலிய நாயக்கர் குலம்*\n\n*குலம்/பட்டம்:* ${selectedEntity.name}\n*பிரிவு:* ${selectedEntity.category}\n\n*உறவுகள்:*\n${selectedEntity.relationships || 'குறிப்பிடப்படவில்லை'}\n\n*குலதெய்வம்:*\n${templesText}\n\n---\n🌐 https://uppiliya-naicker-kulam.vercel.app`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const relatedEntities = useMemo(() => {
    if (!selectedEntity?.relationships) return [];
    return data.filter(i => i.id !== selectedEntity.id && (
      selectedEntity.relationships.includes(i.name.split(' ')[0]) ||
      (i.relationships && i.relationships.includes(selectedEntity.name.split(' ')[0]))
    )).slice(0, 3);
  }, [selectedEntity, data]);

  // ── theme tokens ──
  const D = dark;
  const card        = D ? 'rgba(15,23,42,0.72)'        : 'rgba(255,255,255,0.88)';
  const cardBorder  = D ? 'rgba(255,255,255,0.1)'       : 'rgba(0,0,0,0.1)';
  const text        = D ? '#f8fafc'                     : '#0f172a';
  const textSub     = D ? '#cbd5e1'                     : '#334155';
  const textMuted   = D ? '#94a3b8'                     : '#64748b';
  const inputBg     = D ? 'rgba(15,23,42,0.9)'          : 'rgba(255,255,255,0.95)';
  const resultBg    = D ? 'rgba(15,23,42,0.97)'         : 'rgba(255,255,255,0.98)';
  const itemHov     = D ? 'rgba(255,255,255,0.05)'      : 'rgba(0,0,0,0.04)';
  const infoBg      = D ? 'rgba(0,0,0,0.18)'            : 'rgba(0,0,0,0.04)';
  const nodeBg      = D ? 'rgba(255,255,255,0.05)'      : 'rgba(0,0,0,0.04)';
  const emptyBg     = D ? 'rgba(255,255,255,0.03)'      : 'rgba(0,0,0,0.03)';
  const badgeBg     = D ? 'rgba(0,0,0,0.3)'             : 'rgba(0,0,0,0.07)';
  const accentGlow  = D ? 'rgba(192,132,252,0.25)'      : 'rgba(139,92,246,0.12)';
  const featCardBg  = D ? 'rgba(255,255,255,0.04)'      : 'rgba(255,255,255,0.72)';
  const heroH1      = D ? 'linear-gradient(135deg,#ffffff 30%,#c084fc 65%,#60a5fa 100%)' : 'linear-gradient(135deg,#1e1b4b 0%,#7c3aed 60%,#2563eb 100%)';
  const statNum     = D ? 'linear-gradient(135deg,#60a5fa,#c084fc)' : 'linear-gradient(135deg,#7c3aed,#2563eb)';
  const bgGrad      = D
    ? 'radial-gradient(circle at 25% 0%,rgba(120,40,200,0.22) 0%,transparent 55%),radial-gradient(circle at 80% 100%,rgba(249,115,22,0.14) 0%,transparent 50%),#0c0f1a'
    : 'radial-gradient(circle at 25% 0%,rgba(196,181,253,0.35) 0%,transparent 55%),radial-gradient(circle at 80% 100%,rgba(253,186,116,0.25) 0%,transparent 50%),#eef2f7';
  const shadow      = D ? '0 12px 40px rgba(0,0,0,0.5)' : '0 8px 30px rgba(0,0,0,0.1)';

  return (
    <>
      <style suppressHydrationWarning>{`
        .hp {
          font-family:'Outfit','Noto Sans Tamil',sans-serif;
          overflow-x:hidden; min-height:100vh;
          background:${bgGrad}; transition:background .35s;
        }

        /* ── Grid layout ── */
        .hp-grid {
          max-width:1280px; margin:0 auto;
          padding:1.5rem 1.25rem 2.5rem;
          display:grid; grid-template-columns:1fr 1fr;
          gap:1.25rem; align-items:start;
        }
        @media(max-width:960px){
          .hp-grid { grid-template-columns:1fr; padding:1.1rem 1rem 2rem; }
        }

        /* ── Left ── */
        .hp-left { display:flex; flex-direction:column; gap:1.1rem; }

        .hp-hero {
          background:${card}; border:1px solid rgba(192,132,252,${D?'.3':'.35'});
          border-radius:1.5rem; padding:1.65rem 1.5rem;
          position:relative; overflow:hidden;
          backdrop-filter:blur(20px); box-shadow:${shadow};
        }
        .hp-hero-glow {
          position:absolute; top:-60px; left:45%; transform:translateX(-50%);
          width:380px; height:280px; border-radius:50%;
          background:radial-gradient(ellipse,${accentGlow} 0%,transparent 70%);
          pointer-events:none; filter:blur(40px); z-index:0;
        }
        .hp-hero-inner {
          position:relative; z-index:1;
          display:flex; gap:1.15rem; align-items:center; flex-wrap:wrap;
        }
        .hp-hero-text { flex:1; min-width:190px; }
        .hp-badge {
          display:inline-flex; align-items:center; gap:.4rem;
          padding:.26rem .85rem; border-radius:999px; margin-bottom:.85rem;
          background:rgba(192,132,252,${D?'.15':'.1'}); border:1px solid rgba(192,132,252,${D?'.4':'.35'});
          color:${D?'#c084fc':'#7c3aed'}; font-size:.74rem; font-weight:700;
        }
        .hp-h1 {
          font-size:clamp(1.55rem,3.2vw,2.3rem); font-weight:900; line-height:1.2;
          background:${heroH1};
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          margin:0 0 .7rem;
        }
        .hp-sub { font-size:.88rem; color:${textSub}; line-height:1.7; margin:0; }
        .hp-logo {
          width:90px; height:90px; flex-shrink:0; border-radius:1rem; overflow:hidden;
          border:2px solid rgba(192,132,252,${D?'.45':'.4'});
          box-shadow:0 6px 20px ${accentGlow};
          background:${D?'rgba(15,23,42,0.8)':'rgba(240,244,248,0.9)'};
          display:flex; align-items:center; justify-content:center; padding:.3rem;
        }

        /* Stats */
        .hp-stats {
          display:grid; grid-template-columns:repeat(4,1fr); gap:.6rem;
          background:${card}; border:1px solid ${cardBorder};
          border-radius:1.25rem; padding:.95rem;
          backdrop-filter:blur(16px); box-shadow:${shadow};
        }
        @media(max-width:480px){.hp-stats{grid-template-columns:repeat(2,1fr);}}
        .hp-stat-num {
          font-size:1.35rem; font-weight:800; text-align:center;
          background:${statNum};
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
        }
        .hp-stat-lbl { font-size:.7rem; color:${textMuted}; text-align:center; margin-top:.1rem; }

        /* Feature Grid */
        .hp-feat-hd { font-size:.83rem; font-weight:700; color:${text}; margin-bottom:.6rem; opacity:.88; }
        .hp-feat-grid { display:grid; grid-template-columns:1fr 1fr; gap:.7rem; }
        @media(max-width:520px){.hp-feat-grid{grid-template-columns:1fr;}}
        .hp-feat-card {
          display:flex; align-items:center; gap:.8rem;
          padding:.9rem; border-radius:1rem; text-decoration:none;
          background:${featCardBg}; border:1px solid ${cardBorder};
          transition:all .22s ease; cursor:pointer; position:relative; overflow:hidden;
        }
        .hp-feat-card:hover { transform:translateY(-2px); }
        /* last card full-width */
        .hp-feat-card:last-child { grid-column:1/-1; }
        .hp-feat-icon { font-size:1.8rem; line-height:1; flex-shrink:0; }
        .hp-feat-info { flex:1; min-width:0; }
        .hp-feat-title { font-size:.95rem; font-weight:800; }
        .hp-feat-sub { font-size:.72rem; color:${textMuted}; margin-top:.1rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .hp-new-badge {
          position:absolute; top:.5rem; right:.6rem;
          font-size:.58rem; font-weight:800; padding:.1rem .42rem;
          border-radius:999px; border:1px solid; letter-spacing:.04em;
        }

        /* ── Right ── */
        .hp-right {
          background:${card}; border:1px solid ${cardBorder};
          border-radius:1.5rem; padding:1.5rem;
          backdrop-filter:blur(20px); box-shadow:${shadow};
        }
        .hp-right-title { font-size:1.15rem; font-weight:800; color:${text}; margin-bottom:.2rem; }
        .hp-right-sub { font-size:.8rem; color:${textMuted}; margin-bottom:1.1rem; }

        /* Search */
        .hp-sw { position:relative; margin-bottom:1.15rem; z-index:50; }
        .hp-sb { position:relative; }
        .hp-input {
          width:100%; padding:.9rem 1.1rem .9rem 2.7rem;
          font-size:.95rem; font-family:'Outfit','Noto Sans Tamil',sans-serif;
          color:${text}; background:${inputBg};
          border:1.5px solid ${D?'rgba(255,255,255,0.12)':'rgba(0,0,0,0.15)'}; border-radius:.85rem; outline:none;
          transition:all .25s;
        }
        .hp-input:focus { border-color:#7c3aed; box-shadow:0 0 0 3px rgba(124,58,237,0.18); }
        .hp-si { position:absolute; left:.85rem; top:50%; transform:translateY(-50%); color:${textMuted}; }
        .hp-results {
          position:absolute; top:100%; left:0; right:0; margin-top:.4rem;
          background:${resultBg}; backdrop-filter:blur(16px);
          border:1px solid ${cardBorder}; border-radius:.85rem;
          max-height:270px; overflow-y:auto;
          box-shadow:0 10px 30px rgba(0,0,0,${D?'.5':'.15'});
        }
        .hp-ri {
          padding:.8rem 1.15rem; cursor:pointer;
          border-bottom:1px solid ${cardBorder};
          display:flex; justify-content:space-between; align-items:center;
          transition:background .15s;
        }
        .hp-ri:last-child { border-bottom:none; }
        .hp-ri:hover { background:${itemHov}; }
        .hp-rn { font-weight:700; color:${text}; font-size:.92rem; }
        .hp-rc { font-size:.75rem; color:${textMuted}; background:${badgeBg}; padding:.15rem .5rem; border-radius:.35rem; }

        /* Result card */
        .hp-card {
          margin-top:.9rem; padding:1.1rem;
          border-radius:1rem; border:1px solid ${cardBorder};
          background:${infoBg}; animation:scaleIn .35s ease;
        }
        .hp-ch { display:flex; justify-content:space-between; align-items:center; margin-bottom:.9rem; padding-bottom:.75rem; border-bottom:1px solid ${cardBorder}; flex-wrap:wrap; gap:.65rem; }
        .hp-ct { font-size:1.4rem; font-weight:800; color:${text}; }
        .hp-cb { background:linear-gradient(135deg,#7c3aed,#2563eb); color:#fff; padding:.3rem .8rem; border-radius:999px; font-size:.78rem; font-weight:700; }
        .hp-ig { display:grid; grid-template-columns:1fr; gap:.85rem; margin-bottom:.85rem; }
        @media(min-width:580px){.hp-ig{grid-template-columns:1fr 1fr;}}
        .hp-is { background:${infoBg}; padding:1rem; border-radius:.75rem; }
        .hp-il { font-size:.75rem; text-transform:uppercase; color:${textMuted}; margin-bottom:.5rem; font-weight:700; }
        .hp-ic { font-size:.95rem; line-height:1.6; color:${text}; }
        .hp-tl { list-style:none; display:flex; flex-direction:column; gap:.5rem; }
        .hp-tl li { position:relative; padding-left:1.25rem; padding-bottom:.4rem; border-bottom:1px solid ${cardBorder}; cursor:pointer; color:${text}; transition:color .15s; }
        .hp-tl li:last-child { border-bottom:none; }
        .hp-tl li::before { content:'✦'; position:absolute; left:0; color:#10b981; }
        .hp-map-tag { font-size:.72rem; margin-left:.45rem; opacity:.65; background:${badgeBg}; padding:1px 5px; border-radius:.35rem; }
        .hp-graph { background:${infoBg}; border-radius:.75rem; padding:1rem; text-align:center; overflow-x:auto; margin-bottom:.85rem; }
        .hp-gw { display:flex; align-items:center; justify-content:center; gap:.75rem; min-width:max-content; }
        .hp-node { padding:.65rem .9rem; border-radius:.6rem; background:${nodeBg}; border:1px solid ${cardBorder}; min-width:120px; }
        .hp-node.hp-active { background:${D?'rgba(79,70,229,0.2)':'rgba(124,58,237,0.1)'}; border-color:#7c3aed; box-shadow:0 0 12px rgba(124,58,237,0.25); transform:scale(1.04); }
        .hp-nt { font-weight:700; font-size:.92rem; color:${text}; }
        .hp-ns { font-size:.74rem; color:${textMuted}; margin-top:.1rem; }
        .hp-edge { display:flex; align-items:center; color:${textMuted}; font-size:.78rem; }
        .hp-edge::before,.hp-edge::after { content:''; display:block; width:22px; height:2px; background:${textMuted}; margin:0 7px; }
        .hp-actions { display:flex; justify-content:flex-end; padding-top:.85rem; border-top:1px solid ${cardBorder}; }
        .hp-wa { display:inline-flex; align-items:center; gap:.45rem; background:#25D366; color:#fff; padding:.65rem 1.25rem; border-radius:.7rem; font-weight:700; border:none; cursor:pointer; font-family:inherit; font-size:.88rem; transition:all .2s; }
        .hp-wa:hover { background:#1ebe5d; transform:translateY(-1px); box-shadow:0 5px 15px rgba(37,211,102,0.35); }
        .hp-empty { margin-top:1.5rem; padding:1.75rem 1rem; text-align:center; background:${emptyBg}; border-radius:.85rem; border:1px dashed ${cardBorder}; }
        .hp-empty-icon { font-size:2rem; margin-bottom:.45rem; opacity:.7; }
        .hp-empty-t { font-size:.92rem; color:${text}; font-weight:700; margin-bottom:.28rem; }
        .hp-empty-s { font-size:.78rem; color:${textMuted}; }

        /* Theme toggle FAB */
        .hp-fab {
          position:fixed; bottom:1.4rem; right:1.4rem; z-index:500;
          display:flex; align-items:center; gap:.45rem;
          padding:.5rem .95rem; border-radius:999px;
          background:${D?'rgba(15,23,42,0.92)':'rgba(255,255,255,0.92)'};
          border:1px solid ${cardBorder}; color:${text};
          font-size:.8rem; font-weight:700; cursor:pointer; font-family:inherit;
          backdrop-filter:blur(14px); box-shadow:${shadow};
          transition:all .2s;
        }
        .hp-fab:hover { transform:translateY(-2px); }

        /* ── Mobile Enhancements ── */
        @media(max-width: 600px) {
          .hp-grid { padding: 1rem 0.75rem 4rem; gap: 1rem; }
          .hp-hero { padding: 1.25rem 1rem; border-radius: 1.1rem; }
          .hp-hero-inner { flex-direction: column-reverse; align-items: flex-start; gap: 0.85rem; }
          .hp-logo { width: 70px; height: 70px; }
          .hp-right { padding: 1.25rem 1rem; border-radius: 1.1rem; }
          .hp-card { padding: 1rem 0.85rem; }
          .hp-ch { flex-direction: column; align-items: flex-start; }
          .hp-fab { bottom: 1rem; right: 1rem; padding: 0.42rem 0.8rem; font-size: 0.75rem; }
        }

        @keyframes scaleIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
        @keyframes fadeInUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div className="hp">
        <NewsTicker dark={dark} />

        <div className="hp-grid">

          {/* ── LEFT ── */}
          <div className="hp-left">

            {/* Hero */}
            <div className="hp-hero">
              <div className="hp-hero-glow" />
              <div className="hp-hero-inner">
                <div className="hp-hero-text">
                  <div className="hp-badge">🏛️ உப்பிலிய நாயக்கர் &nbsp;|&nbsp; Community Portal</div>
                  <h1 className="hp-h1">உப்பிலிய நாயக்கர்<br />குல அடையாளம்</h1>
                  <p className="hp-sub">
                    குலம், குலதெய்வம், பங்காளிகள் மற்றும் திருமண பொருத்தம் — அனைத்தும் ஒரே தளத்தில்.
                    <br />
                    <em style={{ color: D ? '#c084fc' : '#7c3aed', fontSize: '.82rem', opacity: .9 }}>
                      Kulam Search · Astrology · Horoscope · Horai
                    </em>
                  </p>
                </div>
                <div className="hp-logo">
                  <Image src={communityLogo} alt="Uppiliya Naicker" style={{ width: '100%', height: '100%', objectFit: 'contain' }} priority />
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="hp-stats">
              {[
                { num:'100+', lbl:'குலங்கள்' },
                { num:'12',   lbl:'ராசிகள்' },
                { num:'7',    lbl:'கிரக ஓரைகள்' },
                { num:'1',    lbl:'சமூக தளம்' },
              ].map(s => (
                <div key={s.lbl}>
                  <div className="hp-stat-num">{s.num}</div>
                  <div className="hp-stat-lbl">{s.lbl}</div>
                </div>
              ))}
            </div>

            {/* Features */}
            <div>
              <div className="hp-feat-hd">🌟 சேவைகள் &amp; கருவிகள் (Services)</div>
              <div className="hp-feat-grid">
                {FEATURES.map(f => (
                  <Link key={f.href} href={f.href} className="hp-feat-card"
                    onMouseEnter={e => { e.currentTarget.style.borderColor = f.c1 + '99'; e.currentTarget.style.boxShadow = `0 6px 22px ${f.c1}2e`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = ''; }}
                  >
                    <span className="hp-feat-icon">{f.icon}</span>
                    <div className="hp-feat-info">
                      <div className="hp-feat-title"
                        style={{ background: `linear-gradient(135deg,${f.c1},${f.c2})`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
                        {f.title}
                      </div>
                      <div className="hp-feat-sub">{f.titleEn} · {f.desc}</div>
                    </div>
                    {f.isNew && <span className="hp-new-badge" style={{ color: f.c1, borderColor: f.c1 + '77' }}>NEW ✨</span>}
                  </Link>
                ))}
              </div>
            </div>

          </div>

          {/* ── RIGHT ── */}
          <div className="hp-right" id="kulam-search">
            <div className="hp-right-title">🔍 குலம் அடையாளம் கண்டறியுங்கள்</div>
            <div className="hp-right-sub">உங்கள் குலம் அல்லது குலதெய்வத்தை தேடுங்கள் · Search Kulam or Kulatheivam</div>

            <div className="hp-sw" ref={searchRef}>
              <div className="hp-sb">
                <svg className="hp-si" xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input type="text" className="hp-input"
                  placeholder="குலம், குலதெய்வம், உறவு தேடுங்கள்..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setIsSearchFocused(true); }}
                  onFocus={() => setIsSearchFocused(true)}
                />
              </div>

              {isSearchFocused && (searchQuery || data.length > 0) && (
                <div className="hp-results">
                  {filteredData.length > 0 ? filteredData.map(item => (
                    <div key={item.id} className="hp-ri" onClick={() => handleSelect(item)}>
                      <span className="hp-rn">{item.name}</span>
                      <span className="hp-rc">{item.category}</span>
                    </div>
                  )) : (
                    <div className="hp-ri" style={{ color: textMuted }}>
                      "{searchQuery}" கண்டுபிடிக்கப்படவில்லை
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedEntity ? (
              <div className="hp-card">
                <div className="hp-ch">
                  <h2 className="hp-ct">{selectedEntity.name}</h2>
                  <span className="hp-cb">{selectedEntity.category}</span>
                </div>
                <div className="hp-ig">
                  <div className="hp-is">
                    <div className="hp-il">👥 பங்காளிகள் / உறவுமுறைகள்</div>
                    <div className="hp-ic">
                      {selectedEntity.relationships
                        ? <p>{selectedEntity.relationships}</p>
                        : <p style={{ color: textMuted }}>குறிப்பிடப்படவில்லை</p>}
                    </div>
                  </div>
                  <div className="hp-is">
                    <div className="hp-il">📍 குலதெய்வம் &amp; இடங்கள்</div>
                    <div className="hp-ic">
                      {selectedEntity.kulatheivam?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '.85rem' }}>
                          <ul className="hp-tl">
                            {selectedEntity.kulatheivam.map((temple, i) => (
                              <li key={i} onClick={() => setActiveMapQuery(temple)}
                                style={{ color: activeMapQuery === temple ? '#10b981' : text, fontWeight: activeMapQuery === temple ? 700 : 400 }}>
                                {temple}
                                {activeMapQuery !== temple && <span className="hp-map-tag">📍 Map</span>}
                              </li>
                            ))}
                          </ul>
                          {activeMapQuery && (
                            <div style={{ animation: 'fadeInUp .3s ease' }}>
                              <iframe width="100%" height="180"
                                style={{ border: `1px solid ${cardBorder}`, borderRadius: '10px' }}
                                loading="lazy" allowFullScreen
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(activeMapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                              />
                              <div style={{ textAlign: 'right', marginTop: '.3rem' }}>
                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeMapQuery)}`}
                                  target="_blank" rel="noopener noreferrer"
                                  style={{ color: '#10b981', fontSize: '.78rem', textDecoration: 'none', fontWeight: 700 }}>
                                  Google Maps-ல் திறக்கவும் ↗
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : <p style={{ color: textMuted }}>குறிப்பிடப்படவில்லை</p>}
                    </div>
                  </div>
                </div>

                {relatedEntities.length > 0 && (
                  <div className="hp-graph">
                    <h3 style={{ marginBottom: '.75rem', fontSize: '.9rem', color: text }}>🔗 Pangali Network</h3>
                    <div className="hp-gw">
                      <div className="hp-node hp-active">
                        <div className="hp-nt">{selectedEntity.name}</div>
                        <div className="hp-ns">நீங்கள்</div>
                      </div>
                      {relatedEntities.map(rel => (
                        <div key={rel.id} style={{ display: 'flex', alignItems: 'center' }}>
                          <div className="hp-edge">பங்காளி</div>
                          <div className="hp-node" onClick={() => handleSelect(rel)} style={{ cursor: 'pointer' }}>
                            <div className="hp-nt">{rel.name}</div>
                            <div className="hp-ns">{rel.category}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="hp-actions">
                  <button className="hp-wa" onClick={handleShare}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                    </svg>
                    WhatsApp-ல் பகிர்
                  </button>
                </div>
              </div>
            ) : (
              <div className="hp-empty">
                <div className="hp-empty-icon">🔎</div>
                <div className="hp-empty-t">தேடல் பெட்டியில் உங்கள் குலத்தை தட்டச்சு செய்க</div>
                <div className="hp-empty-s">Type your Kulam or Deity name to view lineage, temples &amp; map</div>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
