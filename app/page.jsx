'use client';
import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';

/* ── News ticker items ── */
const TICKER_ITEMS = [
  '🌟 உப்பிலிய நாயக்கர் குல அடையாள தளத்திற்கு வரவேற்கிறோம்!',
  '⭐ இப்போது: ராசி பொருத்தம் — உங்கள் திருமண பொருத்தத்தை அறிந்து கொள்ளுங்கள்',
  '🪐 புதிய அம்சம்: ஓரை கணிப்பு — இன்றைய சுப / அசுப நேரங்களை கண்டறியுங்கள்',
  '📜 வரலாறு பக்கம்: உப்பிலிய நாயக்கர் சமூகத்தின் பெருமையான வரலாற்றை அறிந்து கொள்ளுங்கள்',
  '🔍 உங்கள் குலம், குலதெய்வம் மற்றும் பங்காளிகளை இங்கே தேடுங்கள்',
];

const FEATURES = [
  {
    href: '/history',
    icon: '📜',
    title: 'வரலாறு',
    titleEn: 'Community History',
    desc: 'உப்பிலிய நாயக்கர் சமூகத்தின் பெருமையான வரலாறு, மரபு மற்றும் பண்பாட்டு பின்னணியை அறிந்து கொள்ளுங்கள்.',
    descEn: 'Explore the glorious heritage, traditions and cultural background of the Uppiliya Naicker community.',
    gradient: 'linear-gradient(135deg,#f59e0b,#f97316)',
    glow: 'rgba(245,158,11,0.2)',
    border: 'rgba(245,158,11,0.35)',
    badge: 'வரலாறு',
  },
  {
    href: '/rasi-porutham',
    icon: '✨',
    title: 'ராசி பொருத்தம்',
    titleEn: 'Rasi Matching',
    desc: 'மணமகன் மற்றும் மணமகளின் ராசிகளை தேர்வு செய்து திருமண பொருத்தத்தை உடனே அறிந்து கொள்ளுங்கள்.',
    descEn: 'Check Tamil astrology (Thirumana Porutham) — select groom & bride rasi for instant compatibility.',
    gradient: 'linear-gradient(135deg,#c084fc,#60a5fa)',
    glow: 'rgba(192,132,252,0.2)',
    border: 'rgba(192,132,252,0.35)',
    badge: 'ஜோதிடம்',
  },
  {
    href: '/horai',
    icon: '🪐',
    title: 'ஓரை கணிப்பு',
    titleEn: 'Horai Calculator',
    desc: 'இன்றைய கிரக ஓரைகள் — சுப மற்றும் அசுப நேரங்கள், உங்கள் ஜன்ம ராசிக்கு சிறந்த நேரங்களை அறிந்து கொள்ளுங்கள்.',
    descEn: 'Find today\'s planetary hours — best & worst times tailored to your Janma Rasi for every activity.',
    gradient: 'linear-gradient(135deg,#fbbf24,#ec4899)',
    glow: 'rgba(251,191,36,0.2)',
    border: 'rgba(251,191,36,0.35)',
    badge: 'ஓரை',
  },
];

function NewsTicker() {
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
      background: 'rgba(251,191,36,0.08)', borderTop: '1px solid rgba(251,191,36,0.2)',
      borderBottom: '1px solid rgba(251,191,36,0.2)', padding: '.5rem 1.5rem',
      display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden',
      minHeight: '40px',
    }}>
      <span style={{
        background: 'linear-gradient(90deg,#fbbf24,#f97316)', WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent', fontWeight: 800, fontSize: '.78rem',
        letterSpacing: '.1em', flexShrink: 0,
      }}>LIVE</span>
      <span style={{
        fontSize: '.88rem', color: '#fde68a', transition: 'opacity .35s',
        opacity: fade ? 1 : 0, lineHeight: 1.5,
      }}>{TICKER_ITEMS[idx]}</span>
    </div>
  );
}

function FeatureCard({ f }) {
  const [hov, setHov] = useState(false);
  return (
    <Link href={f.href} style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={{
        background: hov ? `rgba(255,255,255,0.07)` : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hov ? f.border : 'rgba(255,255,255,0.09)'}`,
        borderRadius: '1.25rem', padding: '2rem 1.75rem',
        boxShadow: hov ? `0 0 40px ${f.glow}` : 'none',
        transform: hov ? 'translateY(-4px)' : 'none',
        transition: 'all .25s ease',
        height: '100%', display: 'flex', flexDirection: 'column', gap: '1rem',
        cursor: 'pointer',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '2.5rem', lineHeight: 1 }}>{f.icon}</span>
          <span style={{
            fontSize: '.72rem', fontWeight: 700, padding: '.25rem .75rem',
            borderRadius: '999px', background: f.glow, border: `1px solid ${f.border}`,
            background: 'linear-gradient(135deg,' + f.gradient.match(/#[a-f0-9]+/gi)?.[0] + '22,' + f.gradient.match(/#[a-f0-9]+/gi)?.[1] + '22)',
            color: f.gradient.match(/#[a-f0-9]+/gi)?.[0],
            letterSpacing: '.05em',
          }}>{f.badge}</span>
        </div>
        <div>
          <div style={{
            fontSize: '1.3rem', fontWeight: 800,
            background: f.gradient, WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            marginBottom: '.25rem',
          }}>{f.title}</div>
          <div style={{ fontSize: '.8rem', color: '#94a3b8', marginBottom: '.65rem' }}>{f.titleEn}</div>
          <p style={{ fontSize: '.88rem', color: '#cbd5e1', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
        </div>
        <div style={{
          marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '.4rem',
          fontSize: '.82rem', fontWeight: 600,
          background: f.gradient, WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          திறக்கவும் <span style={{ WebkitTextFillColor: 'unset', color: 'inherit', background: f.gradient, WebkitBackgroundClip: 'text' }}>→</span>
        </div>
      </div>
    </Link>
  );
}

export default function Home() {
  const [data, setData]           = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEntity, setSelectedEntity] = useState(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeMapQuery, setActiveMapQuery]   = useState('');
  const searchRef = useRef(null);

  useEffect(() => {
    import('../data.json').then(m => setData(m.default));
    const handler = e => { if (searchRef.current && !searchRef.current.contains(e.target)) setIsSearchFocused(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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
    const text = `*உப்பிலிய நாயக்கர் குலம்*\n\n*குலம்/பட்டம்:* ${selectedEntity.name}\n*பிரிவு:* ${selectedEntity.category}\n\n*உறவுகள்:*\n${selectedEntity.relationships || 'குறிப்பிடப்படவில்லை'}\n\n*குலதெய்வம்:*\n${templesText}\n\n---\nT. Karthikeyan | 📞 +91 94867 72206`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const relatedEntities = useMemo(() => {
    if (!selectedEntity?.relationships) return [];
    return data.filter(i => i.id !== selectedEntity.id && (
      selectedEntity.relationships.includes(i.name.split(' ')[0]) ||
      (i.relationships && i.relationships.includes(selectedEntity.name.split(' ')[0]))
    )).slice(0, 3);
  }, [selectedEntity, data]);

  return (
    <>
      <style suppressHydrationWarning>{`
        .hp-page { font-family:'Outfit','Noto Sans Tamil',sans-serif; overflow-x:hidden; }

        /* Hero */
        .hp-hero {
          position:relative; text-align:center;
          padding: clamp(3rem,8vw,6rem) clamp(1rem,5vw,2rem) clamp(2rem,5vw,4rem);
          overflow:hidden;
        }
        .hp-hero-glow {
          position:absolute; top:-40%; left:50%; transform:translateX(-50%);
          width:700px; height:500px; border-radius:50%;
          background: radial-gradient(ellipse,rgba(192,132,252,.18) 0%,rgba(96,165,250,.12) 40%,transparent 70%);
          pointer-events:none; filter:blur(40px);
        }
        .hp-hero-badge {
          display:inline-flex; align-items:center; gap:.5rem;
          padding:.35rem 1.1rem; border-radius:999px; margin-bottom:1.5rem;
          background:rgba(192,132,252,.1); border:1px solid rgba(192,132,252,.35);
          color:#c084fc; font-size:.82rem; font-weight:600;
        }
        .hp-hero h1 {
          font-size:clamp(2rem,6vw,3.5rem); font-weight:900; line-height:1.15;
          background:linear-gradient(135deg,#f8fafc 30%,#c084fc 65%,#60a5fa 100%);
          -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text;
          margin:0 0 1rem;
        }
        .hp-hero-sub {
          font-size:clamp(.95rem,2.5vw,1.15rem); color:#94a3b8;
          max-width:580px; margin:0 auto 2.5rem; line-height:1.75;
        }
        .hp-hero-cta {
          display:inline-flex; align-items:center; gap:.6rem;
          padding:.8rem 2rem; border-radius:999px; font-weight:700; font-size:1rem;
          background:linear-gradient(135deg,#c084fc,#60a5fa);
          color:#fff; text-decoration:none; border:none; cursor:pointer;
          transition:transform .2s,box-shadow .2s;
        }
        .hp-hero-cta:hover { transform:translateY(-3px); box-shadow:0 8px 30px rgba(192,132,252,.4); }

        /* Stats strip */
        .hp-stats {
          display:flex; justify-content:center; gap:clamp(1.5rem,5vw,3.5rem);
          flex-wrap:wrap; padding:1.5rem clamp(1rem,5vw,2rem);
          border-top:1px solid rgba(255,255,255,.07);
          border-bottom:1px solid rgba(255,255,255,.07);
          background:rgba(255,255,255,.02);
        }
        .hp-stat { text-align:center; }
        .hp-stat-num { font-size:clamp(1.4rem,4vw,2rem); font-weight:800; background:linear-gradient(135deg,#60a5fa,#c084fc); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .hp-stat-lbl { font-size:.78rem; color:#94a3b8; margin-top:.15rem; }

        /* Section */
        .hp-section { padding:clamp(2rem,5vw,3.5rem) clamp(1rem,5vw,2rem); max-width:1100px; margin:0 auto; }
        .hp-section-title { font-size:clamp(1.2rem,3vw,1.6rem); font-weight:800; color:#f1f5f9; margin-bottom:.5rem; }
        .hp-section-sub { font-size:.9rem; color:#94a3b8; margin-bottom:2rem; }

        /* Feature grid */
        .hp-feat-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
        @media(max-width:860px){ .hp-feat-grid{ grid-template-columns:repeat(2,1fr); } }
        @media(max-width:520px){ .hp-feat-grid{ grid-template-columns:1fr; } }

        /* Search section */
        .hp-search-wrap { max-width:860px; margin:0 auto; padding:0 clamp(1rem,5vw,2rem) clamp(2rem,5vw,4rem); }
        .hp-search-card {
          background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.1);
          border-radius:1.5rem; padding:clamp(1.5rem,4vw,2.5rem);
          backdrop-filter:blur(12px);
        }
        .hp-search-title { font-size:clamp(1.1rem,3vw,1.4rem); font-weight:800; color:#f1f5f9; margin-bottom:.4rem; }
        .hp-search-sub { font-size:.88rem; color:#94a3b8; margin-bottom:1.5rem; }
      `}</style>

      <div className="hp-page">
        <NewsTicker />

        {/* ── Hero ── */}
        <section className="hp-hero">
          <div className="hp-hero-glow" />
          <div className="hp-hero-badge">🏛️ உப்பிலிய நாயக்கர் &nbsp;|&nbsp; Community Portal</div>
          <h1>உப்பிலிய நாயக்கர்<br />குல அடையாளம்</h1>
          <p className="hp-hero-sub">
            உங்கள் குலம், குலதெய்வம், பங்காளிகள் மற்றும் திருமண பொருத்தம் —
            அனைத்தும் ஒரே இடத்தில்.
            <br /><em style={{ opacity: .7, fontSize: '.9rem' }}>Your clan, deity, relationships & astrology tools — all in one place.</em>
          </p>
          <a href="#kulam-search" className="hp-hero-cta">
            🔍 குலம் தேடு &nbsp; <span>↓</span>
          </a>
        </section>

        {/* ── Stats ── */}
        <div className="hp-stats">
          {[
            { num: '100+', lbl: 'குலங்கள் பதிவு செய்யப்பட்டுள்ளன' },
            { num: '12',   lbl: 'ராசி பொருத்தம் வகைகள்' },
            { num: '7',    lbl: 'கிரக ஓரைகள்' },
            { num: '1',    lbl: 'சமூக தளம்' },
          ].map(s => (
            <div key={s.lbl} className="hp-stat">
              <div className="hp-stat-num">{s.num}</div>
              <div className="hp-stat-lbl">{s.lbl}</div>
            </div>
          ))}
        </div>

        {/* ── Feature Banners ── */}
        <section className="hp-section">
          <div className="hp-section-title">🌟 அனைத்து சேவைகளும்</div>
          <div className="hp-section-sub">எங்கள் அனைத்து கருவிகள் மற்றும் தகவல்களை இங்கே காணலாம் · Explore all features</div>
          <div className="hp-feat-grid">
            {FEATURES.map(f => <FeatureCard key={f.href} f={f} />)}
          </div>
        </section>

        {/* ── Kulam Search ── */}
        <div className="hp-search-wrap" id="kulam-search">
          <div className="hp-search-card">
            <div className="hp-search-title">🔍 குலம் அடையாளம் கண்டறியுங்கள்</div>
            <div className="hp-search-sub">உங்கள் குலம் அல்லது குலதெய்வத்தை தேடுங்கள் · Search your Kulam or Kulatheivam</div>

            <div className="search-container" ref={searchRef}>
              <div className="search-input-wrapper">
                <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input type="text" className="search-input"
                  placeholder="குலம், குலதெய்வம், உறவு தேடுங்கள்..."
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setIsSearchFocused(true); }}
                  onFocus={() => setIsSearchFocused(true)}
                />
              </div>

              {isSearchFocused && (searchQuery || data.length > 0) && (
                <div className="search-results">
                  {filteredData.length > 0 ? filteredData.map(item => (
                    <div key={item.id} className="search-item" onClick={() => handleSelect(item)}>
                      <span className="search-item-name">{item.name}</span>
                      <span className="search-item-category">{item.category}</span>
                    </div>
                  )) : (
                    <div className="search-item" style={{ color: 'var(--text-muted)' }}>
                      "{searchQuery}" கண்டுபிடிக்கப்படவில்லை
                    </div>
                  )}
                </div>
              )}
            </div>

            {selectedEntity && (
              <div className="result-card">
                <div className="result-header">
                  <h2 className="result-title">{selectedEntity.name}</h2>
                  <span className="category-badge">{selectedEntity.category}</span>
                </div>
                <div className="info-grid">
                  <div className="info-section">
                    <div className="info-label">👥 பங்காளிகள் / உறவுமுறைகள்</div>
                    <div className="info-content">
                      {selectedEntity.relationships
                        ? <p>{selectedEntity.relationships}</p>
                        : <p style={{ color: 'var(--text-muted)' }}>குறிப்பிடப்படவில்லை</p>}
                    </div>
                  </div>
                  <div className="info-section">
                    <div className="info-label">📍 குலதெய்வம் & இடங்கள்</div>
                    <div className="info-content">
                      {selectedEntity.kulatheivam?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          <ul className="temple-list">
                            {selectedEntity.kulatheivam.map((temple, idx) => (
                              <li key={idx} onClick={() => setActiveMapQuery(temple)}
                                style={{ cursor: 'pointer', color: activeMapQuery === temple ? 'var(--accent)' : 'inherit', fontWeight: activeMapQuery === temple ? 'bold' : 'normal', transition: 'all .2s' }}>
                                {temple}
                                {activeMapQuery !== temple && (
                                  <span style={{ fontSize: '.8rem', marginLeft: '10px', opacity: .6, background: 'rgba(0,0,0,.3)', padding: '2px 8px', borderRadius: '10px' }}>📍 Map</span>
                                )}
                              </li>
                            ))}
                          </ul>
                          {activeMapQuery && (
                            <div style={{ animation: 'fadeInUp .3s ease' }}>
                              <iframe width="100%" height="220"
                                style={{ border: '1px solid rgba(255,255,255,.1)', borderRadius: '12px' }}
                                loading="lazy" allowFullScreen
                                src={`https://maps.google.com/maps?q=${encodeURIComponent(activeMapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                              />
                              <div style={{ textAlign: 'right', marginTop: '.5rem' }}>
                                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeMapQuery)}`}
                                  target="_blank" rel="noopener noreferrer"
                                  style={{ color: 'var(--accent)', fontSize: '.85rem', textDecoration: 'none', fontWeight: 'bold' }}>
                                  Google Maps-ல் திறக்கவும் ↗
                                </a>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : <p style={{ color: 'var(--text-muted)' }}>குறிப்பிடப்படவில்லை</p>}
                    </div>
                  </div>
                </div>

                {relatedEntities.length > 0 && (
                  <div className="graph-container">
                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>🔗 Pangali Network</h3>
                    <div className="graph-wrapper">
                      <div className="graph-node current">
                        <div className="graph-node-title">{selectedEntity.name}</div>
                        <div className="graph-node-sub">நீங்கள்</div>
                      </div>
                      {relatedEntities.map(rel => (
                        <div key={rel.id} style={{ display: 'flex', alignItems: 'center' }}>
                          <div className="graph-edge">பங்காளி</div>
                          <div className="graph-node" onClick={() => handleSelect(rel)} style={{ cursor: 'pointer' }}>
                            <div className="graph-node-title">{rel.name}</div>
                            <div className="graph-node-sub">{rel.category}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="actions-bar">
                  <button className="btn-whatsapp" onClick={handleShare}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>
                    WhatsApp-ல் பகிர்
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
