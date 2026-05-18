'use client';

import { useState, useEffect, useCallback } from 'react';
import horaiData from '../../data/horai.json';

/* ─────────────────────────────────────────────
   Horai Engine
   sequence: Sun→Venus→Mercury→Moon→Saturn→Jupiter→Mars
   dayLord start indices in sequence:
     Sun=0, Venus=1, Mercury=2, Moon=3, Saturn=4, Jupiter=5, Mars=6
───────────────────────────────────────────── */
const SEQ = horaiData.sequence; // ['sun','venus','mercury','moon','saturn','jupiter','mars']

function getStartIndex(dayOfWeek) {
  const lord = horaiData.dayLords[String(dayOfWeek)];
  return SEQ.indexOf(lord);
}

function getPlanetForHour(dayOfWeek, hourIndex) {
  const start = getStartIndex(dayOfWeek);
  return SEQ[(start + hourIndex) % 7];
}

function buildDaySchedule(date, sunriseHour = 6, sunriseMin = 0) {
  const day = date.getDay();
  const hours = [];
  for (let i = 0; i < 24; i++) {
    const totalMins = sunriseHour * 60 + sunriseMin + i * 60;
    const startH = Math.floor(totalMins / 60) % 24;
    const startM = totalMins % 60;
    const endTotal = totalMins + 60;
    const endH = Math.floor(endTotal / 60) % 24;
    const endM = endTotal % 60;
    const planet = getPlanetForHour(day, i);
    hours.push({
      index: i,
      startH, startM,
      endH, endM,
      planet,
      label: `${String(startH).padStart(2,'0')}:${String(startM).padStart(2,'0')} – ${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`,
    });
  }
  return hours;
}

function getCurrentHoraiIndex(now, sunriseHour = 6, sunriseMin = 0) {
  const nowMins = now.getHours() * 60 + now.getMinutes();
  const sunriseMins = sunriseHour * 60 + sunriseMin;
  if (nowMins < sunriseMins) return -1; // before sunrise
  return Math.floor((nowMins - sunriseMins) / 60);
}

function fmt12(h, m) {
  const ampm = h < 12 ? 'AM' : 'PM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2,'0')} ${ampm}`;
}

/* getRasiLevel: returns 'best' | 'avoid' | 'neutral' for a planet given a Janma Rasi id */
function getRasiLevel(rasiId, planetKey) {
  if (!rasiId) return 'neutral';
  const compat = horaiData.rasiHoraiCompat[String(rasiId)];
  if (!compat) return 'neutral';
  if (compat.best.includes(planetKey))  return 'best';
  if (compat.avoid.includes(planetKey)) return 'avoid';
  return 'neutral';
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function PlanetPill({ planetKey, size = 'sm' }) {
  const p  = horaiData.planets[planetKey];
  const cl = horaiData.classification[planetKey];
  return (
    <span
      className={`hp-pill hp-pill-${size}`}
      style={{ background: `${p.color}18`, borderColor: `${p.color}55`, color: p.color }}
    >
      {p.symbol} {p.ta}
    </span>
  );
}

function TypeBadge({ planetKey }) {
  const cl = horaiData.classification[planetKey];
  const typeColors = {
    subha:    { bg: 'rgba(16,185,129,0.15)', border: '#10b981', text: '#6ee7b7' },
    madhyama: { bg: 'rgba(234,179,8,0.15)',  border: '#eab308', text: '#fde047' },
    asubha:   { bg: 'rgba(239,68,68,0.15)',  border: '#ef4444', text: '#fca5a5' },
  };
  const c = typeColors[cl.type];
  return (
    <span className="hp-type-badge" style={{ background: c.bg, borderColor: c.border, color: c.text }}>
      {cl.typeLabel}
    </span>
  );
}

function RasiCompatBadge({ level }) {
  if (level === 'neutral') return null;
  const cfg = {
    best:  { bg: 'rgba(16,185,129,0.18)', border: '#10b981', color: '#6ee7b7', label: '⭐ உங்கள் ராசிக்கு சிறந்தது' },
    avoid: { bg: 'rgba(239,68,68,0.18)',  border: '#ef4444', color: '#fca5a5', label: '🚫 உங்கள் ராசிக்கு தவிர்க்கவும்' },
  }[level];
  return (
    <span className="hrc-badge" style={{ background: cfg.bg, borderColor: cfg.border, color: cfg.color }}>
      {cfg.label}
    </span>
  );
}

function CurrentHoraiCard({ horaiIndex, schedule, now, sunriseHour, sunriseMin, janmaRasiId }) {
  if (horaiIndex < 0 || horaiIndex >= 24) return (
    <div className="hc-current-card hc-before-sunrise">
      <div className="hc-current-icon">🌙</div>
      <div>
        <div className="hc-current-title">சூரிய உதயத்திற்கு முன்</div>
        <div className="hc-current-sub">Before Sunrise — Horai begins at {fmt12(sunriseHour, sunriseMin)}</div>
      </div>
    </div>
  );

  const slot   = schedule[horaiIndex];
  const p      = horaiData.planets[slot.planet];
  const cl     = horaiData.classification[slot.planet];
  const rasiLevel = getRasiLevel(janmaRasiId, slot.planet);

  const elapsedMins = (now.getHours() * 60 + now.getMinutes()) - (sunriseHour * 60 + sunriseMin) - horaiIndex * 60;
  const progressPct = Math.min(100, Math.max(0, (elapsedMins / 60) * 100));
  const minsLeft    = 60 - elapsedMins;

  return (
    <div
      className="hc-current-card"
      style={{ borderColor: p.color, background: `${p.glowColor}` }}
    >
      <div className="hc-current-glow" style={{ background: p.glowColor }} />
      <div className="hc-current-symbol" style={{ color: p.color }}>{p.symbol}</div>
      <div className="hc-current-info">
        <div className="hc-current-label">இப்போது நடைபெறும் ஓரை</div>
        <div className="hc-current-planet" style={{ color: p.color }}>{p.ta} ஓரை</div>
        <div className="hc-current-planet-en">{p.en} Horai · {slot.label}</div>
        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', alignItems: 'center', marginTop: '.4rem' }}>
          <TypeBadge planetKey={slot.planet} />
          <RasiCompatBadge level={rasiLevel} />
        </div>
        <div className="hc-progress-row">
          <div className="hc-progress-track">
            <div className="hc-progress-fill" style={{ width: `${progressPct}%`, background: p.color }} />
          </div>
          <span className="hc-progress-label">{minsLeft} நிமிடம் மீதம்</span>
        </div>
        <p className="hc-current-note">{cl.note}</p>
      </div>
    </div>
  );
}

function ScheduleRow({ slot, isCurrent, janmaRasiId }) {
  const p  = horaiData.planets[slot.planet];
  const cl = horaiData.classification[slot.planet];
  const typeIcon = { subha: '✨', madhyama: '⚡', asubha: '❌' }[cl.type];
  const rasiLevel = getRasiLevel(janmaRasiId, slot.planet);

  const rasiRowStyle = janmaRasiId ? {
    best:    { background: 'rgba(16,185,129,0.07)' },
    avoid:   { background: 'rgba(239,68,68,0.07)', opacity: .7 },
    neutral: {},
  }[rasiLevel] : {};

  const borderColor = isCurrent ? p.color
    : rasiLevel === 'best'  ? '#10b981'
    : rasiLevel === 'avoid' ? '#ef4444'
    : 'transparent';

  return (
    <div
      className={`hs-row ${isCurrent ? 'hs-row-current' : ''}`}
      style={{ borderLeftColor: borderColor, ...rasiRowStyle }}
    >
      <div className="hs-time">
        {fmt12(slot.startH, slot.startM)}
        <span className="hs-time-sep">–</span>
        {fmt12(slot.endH, slot.endM)}
      </div>
      <div className="hs-planet-col">
        <span className="hs-symbol" style={{ color: p.color }}>{p.symbol}</span>
        <span className="hs-name" style={{ color: p.color }}>{p.ta}</span>
        <span className="hs-name-en">{p.en}</span>
      </div>
      <div className="hs-type">
        {typeIcon} <span style={{ color: cl.type === 'subha' ? '#6ee7b7' : cl.type === 'madhyama' ? '#fde047' : '#fca5a5' }}>
          {cl.typeLabel}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '.35rem', alignItems: 'center' }}>
        {isCurrent && <div className="hs-now-badge">இப்போது</div>}
        {janmaRasiId > 0 && rasiLevel === 'best'  && <span className="hs-rasi-best">⭐</span>}
        {janmaRasiId > 0 && rasiLevel === 'avoid' && <span className="hs-rasi-avoid">🚫</span>}
      </div>
    </div>
  );
}

function PlanetInfoCard({ planetKey }) {
  const p  = horaiData.planets[planetKey];
  const cl = horaiData.classification[planetKey];
  return (
    <div className="hpi-card" style={{ borderColor: `${p.color}44`, background: `${p.color}0d` }}>
      <div className="hpi-header">
        <span className="hpi-symbol" style={{ color: p.color }}>{p.symbol}</span>
        <div>
          <div className="hpi-name" style={{ color: p.color }}>{p.ta} ({p.en})</div>
          <TypeBadge planetKey={planetKey} />
        </div>
      </div>
      {cl.goodFor.length > 0 && (
        <div className="hpi-section">
          <div className="hpi-section-title" style={{ color: '#6ee7b7' }}>✅ நல்லது</div>
          <ul className="hpi-list">
            {cl.goodFor.map((g, i) => <li key={i}>{g}</li>)}
          </ul>
        </div>
      )}
      {cl.avoid.length > 0 && (
        <div className="hpi-section">
          <div className="hpi-section-title" style={{ color: '#fca5a5' }}>🚫 தவிர்க்கவும்</div>
          <ul className="hpi-list">
            {cl.avoid.map((a, i) => <li key={i}>{a}</li>)}
          </ul>
        </div>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function HoraiPage() {
  const [now, setNow]             = useState(null);
  const [sunriseHour, setSunriseHour] = useState(6);
  const [sunriseMin,  setSunriseMin]  = useState(0);
  const [showAll, setShowAll]         = useState(false);
  const [activeTab, setActiveTab]     = useState('today');
  const [janmaRasiId, setJanmaRasiId] = useState(0);

  useEffect(() => {
    setNow(new Date());
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  if (!now) return null; // avoid SSR/client mismatch

  const schedule     = buildDaySchedule(now, sunriseHour, sunriseMin);
  const currentIndex = getCurrentHoraiIndex(now, sunriseHour, sunriseMin);
  const dayInfo      = horaiData.dayNames[String(now.getDay())];
  const dayLord      = horaiData.dayLords[String(now.getDay())];
  const dayPlanet    = horaiData.planets[dayLord];
  const visibleSlots = showAll ? schedule : schedule.slice(0, 14);

  return (
    <>
      <style suppressHydrationWarning>{`
        /* ── Page ── */
        .ho-page { min-height: 80vh; padding: 3rem 1rem 5rem; font-family: 'Noto Sans Tamil','Segoe UI',sans-serif; }
        .ho-container { max-width: 820px; margin: 0 auto; }

        /* ── Hero ── */
        .ho-hero { text-align: center; margin-bottom: 3rem; }
        .ho-hero-badge {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .35rem 1rem; border-radius: 999px;
          background: rgba(251,191,36,0.12); border: 1px solid rgba(251,191,36,0.35);
          color: #fbbf24; font-size: .85rem; margin-bottom: 1.2rem;
        }
        .ho-hero h1 {
          font-size: clamp(1.8rem,5vw,2.8rem); font-weight: 800;
          background: linear-gradient(135deg,#fbbf24 0%,#ec4899 50%,#a78bfa 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
          margin: 0 0 .75rem;
        }
        .ho-hero-sub { color: var(--text-muted,#94a3b8); font-size: 1rem; max-width: 520px; margin: 0 auto; line-height: 1.7; }

        /* ── Card shell ── */
        .ho-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.25rem; padding: 2rem 1.75rem; margin-bottom: 1.5rem;
          backdrop-filter: blur(12px);
        }

        /* ── Day bar ── */
        .ho-day-bar { display: flex; align-items: center; gap: 1.25rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
        .ho-day-name { font-size: 1.35rem; font-weight: 800; color: var(--text-light,#e2e8f0); }
        .ho-day-ta   { font-size: .95rem; color: var(--text-muted,#94a3b8); }
        .ho-day-lord { display: flex; align-items: center; gap: .4rem; }
        .ho-day-lord-label { font-size: .8rem; color: var(--text-muted,#94a3b8); }

        /* ── Current Horai card ── */
        .hc-current-card {
          position: relative; border: 1.5px solid; border-radius: 1.1rem;
          padding: 1.5rem; display: flex; gap: 1.25rem; align-items: flex-start;
          margin-bottom: 1.5rem; overflow: hidden;
        }
        .hc-before-sunrise { border-color: rgba(167,139,250,0.4); background: rgba(167,139,250,0.06); }
        .hc-current-glow { position: absolute; top: -40px; right: -40px; width: 180px; height: 180px; border-radius: 50%; opacity: .35; filter: blur(50px); pointer-events: none; }
        .hc-current-symbol { font-size: 3.5rem; flex-shrink: 0; line-height: 1; }
        .hc-current-info { flex: 1; }
        .hc-current-label { font-size: .78rem; text-transform: uppercase; letter-spacing: .1em; color: var(--text-muted,#94a3b8); margin-bottom: .2rem; }
        .hc-current-planet { font-size: 1.8rem; font-weight: 800; line-height: 1.1; }
        .hc-current-planet-en { font-size: .85rem; color: var(--text-muted,#94a3b8); margin: .2rem 0 .6rem; }
        .hc-current-title { font-size: 1.2rem; font-weight: 700; color: var(--text-light,#e2e8f0); }
        .hc-current-sub { color: var(--text-muted,#94a3b8); font-size: .88rem; margin-top: .25rem; }
        .hc-progress-row { display: flex; align-items: center; gap: .75rem; margin: .85rem 0 .75rem; }
        .hc-progress-track { flex: 1; height: 6px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
        .hc-progress-fill { height: 100%; border-radius: 999px; transition: width 1s ease; }
        .hc-progress-label { font-size: .78rem; color: var(--text-muted,#94a3b8); white-space: nowrap; }
        .hc-current-note { font-size: .88rem; color: var(--text-muted,#94a3b8); line-height: 1.65; margin: 0; }

        /* ── Sunrise control ── */
        .ho-sunrise-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .ho-sunrise-label { font-size: .9rem; font-weight: 600; color: var(--text-light,#e2e8f0); }
        .ho-sunrise-input {
          padding: .4rem .75rem; background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.15); border-radius: .6rem;
          color: var(--text-light,#e2e8f0); font-size: .9rem; font-family: inherit;
          width: 80px; text-align: center;
        }
        .ho-sunrise-input:focus { outline: none; border-color: #fbbf24; box-shadow: 0 0 0 2px rgba(251,191,36,0.2); }

        /* ── Tabs ── */
        .ho-tabs { display: flex; gap: .5rem; margin-bottom: 1.5rem; background: rgba(0,0,0,0.3); border-radius: .85rem; padding: .3rem; }
        .ho-tab {
          flex: 1; padding: .55rem 1rem; border-radius: .65rem; border: none;
          background: none; color: var(--text-muted,#94a3b8); font-size: .9rem; font-weight: 600;
          cursor: pointer; font-family: inherit; transition: background .2s, color .2s;
        }
        .ho-tab-active { background: rgba(255,255,255,0.08); color: var(--text-light,#e2e8f0); }

        /* ── Schedule rows ── */
        .hs-row {
          display: grid; grid-template-columns: 150px 1fr 1fr auto;
          align-items: center; gap: .75rem;
          padding: .7rem 1rem; border-radius: .65rem; margin-bottom: .35rem;
          border-left: 3px solid transparent;
          transition: background .15s;
        }
        .hs-row:hover { background: rgba(255,255,255,0.04); }
        .hs-row-current { border-left-width: 3px !important; }
        @media(max-width:560px) {
          .hs-row { grid-template-columns: 1fr 1fr; row-gap: .25rem; }
          .hs-type { grid-column: 1; }
          .hs-now-badge { grid-column: 2; justify-self: end; }
        }
        .hs-time { font-size: .8rem; color: var(--text-muted,#94a3b8); font-variant-numeric: tabular-nums; white-space: nowrap; }
        .hs-time-sep { margin: 0 .2rem; }
        .hs-planet-col { display: flex; align-items: center; gap: .4rem; }
        .hs-symbol { font-size: 1.1rem; }
        .hs-name   { font-size: .9rem; font-weight: 700; }
        .hs-name-en { font-size: .75rem; color: var(--text-muted,#94a3b8); }
        .hs-type   { font-size: .78rem; color: var(--text-muted,#94a3b8); }
        .hs-now-badge {
          font-size: .7rem; font-weight: 700; padding: .2rem .55rem;
          border-radius: 999px; background: rgba(251,191,36,0.2);
          border: 1px solid rgba(251,191,36,0.5); color: #fbbf24;
          white-space: nowrap;
        }

        /* ── Show more ── */
        .ho-show-more {
          display: block; width: 100%; padding: .65rem;
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          border-radius: .65rem; color: var(--text-muted,#94a3b8); font-size: .88rem;
          cursor: pointer; font-family: inherit; transition: background .2s, color .2s; margin-top: .75rem;
        }
        .ho-show-more:hover { background: rgba(255,255,255,0.09); color: var(--text-light,#e2e8f0); }

        /* ── Planet info cards ── */
        .hpi-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px,1fr)); gap: 1rem; }
        .hpi-card { border: 1px solid; border-radius: 1rem; padding: 1.1rem; }
        .hpi-header { display: flex; align-items: center; gap: .75rem; margin-bottom: .85rem; }
        .hpi-symbol { font-size: 2rem; line-height: 1; }
        .hpi-name   { font-size: 1rem; font-weight: 700; }
        .hpi-section { margin-top: .65rem; }
        .hpi-section-title { font-size: .78rem; font-weight: 700; letter-spacing: .05em; margin-bottom: .35rem; }
        .hpi-list { margin: 0; padding-left: 1.1rem; font-size: .82rem; color: var(--text-muted,#94a3b8); line-height: 1.8; }

        /* ── Pills ── */
        .hp-pill { display: inline-flex; align-items: center; gap: .25rem; border: 1px solid; border-radius: 999px; font-size: .8rem; font-weight: 600; }
        .hp-pill-sm { padding: .2rem .65rem; }
        .hp-pill-lg { padding: .35rem 1rem; font-size: .9rem; }
        .hp-type-badge { display: inline-block; margin-top: .45rem; font-size: .75rem; font-weight: 700; padding: .2rem .7rem; border-radius: 999px; border: 1px solid; }

        /* ── Disclaimer ── */
        .ho-disclaimer { margin-top: 2rem; padding: 1rem 1.25rem; border-radius: .85rem; background: rgba(234,179,8,0.07); border: 1px solid rgba(234,179,8,0.2); font-size: .82rem; color: rgba(253,224,71,0.85); line-height: 1.6; }

        /* ── Janma Rasi selector ── */
        .jrs-card { background: rgba(192,132,252,0.06); border: 1px solid rgba(192,132,252,0.25); }
        .jrs-title { font-size: 1rem; font-weight: 700; color: var(--text-light,#e2e8f0); margin-bottom: .85rem; display: flex; align-items: center; gap: .5rem; }
        .jrs-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .jrs-select {
          flex: 1; min-width: 200px; padding: .6rem 1rem;
          background: rgba(0,0,0,0.4); border: 1px solid rgba(192,132,252,0.3);
          border-radius: .75rem; color: var(--text-light,#e2e8f0);
          font-size: .95rem; font-family: inherit; cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 1rem center;
        }
        .jrs-select:focus { outline: none; border-color: #c084fc; box-shadow: 0 0 0 2px rgba(192,132,252,0.2); }
        .jrs-lord-chip { display: inline-flex; align-items: center; gap: .4rem; padding: .4rem .85rem; border-radius: 999px; font-size: .82rem; font-weight: 600; border: 1px solid rgba(192,132,252,0.3); background: rgba(192,132,252,0.1); color: #c084fc; }

        /* ── Rasi compat badge on current horai ── */
        .hrc-badge { display: inline-block; padding: .2rem .7rem; border-radius: 999px; border: 1px solid; font-size: .78rem; font-weight: 700; }

        /* ── Rasi compat on schedule rows ── */
        .hs-rasi-best  { font-size: 1rem; }
        .hs-rasi-avoid { font-size: 1rem; opacity: .8; }

        /* ── Best Horais panel ── */
        .bh-panel { margin-bottom: 1.5rem; }
        .bh-title { font-size: .95rem; font-weight: 700; color: var(--text-light,#e2e8f0); margin-bottom: .75rem; display: flex; align-items: center; gap: .4rem; }
        .bh-slots { display: flex; flex-wrap: wrap; gap: .5rem; }
        .bh-slot {
          display: flex; align-items: center; gap: .4rem;
          padding: .35rem .85rem; border-radius: .65rem;
          font-size: .82rem; font-weight: 600; border: 1px solid;
          transition: transform .15s;
        }
        .bh-slot:hover { transform: translateY(-2px); }
        .bh-slot-best  { background: rgba(16,185,129,0.12); border-color: rgba(16,185,129,0.4); color: #6ee7b7; }
        .bh-slot-avoid { background: rgba(239,68,68,0.10); border-color: rgba(239,68,68,0.3); color: #fca5a5; opacity: .75; }

        /* ── Golden rules ── */
        .gr-card { background: rgba(251,191,36,0.05); border: 1px solid rgba(251,191,36,0.2); }
        .gr-title { font-size: 1rem; font-weight: 700; color: var(--text-light,#e2e8f0); margin-bottom: .85rem; }
        .gr-rule { display: flex; gap: .65rem; padding: .7rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: .88rem; color: var(--text-muted,#94a3b8); line-height: 1.65; }
        .gr-rule:last-child { border-bottom: none; }
        .gr-icon { flex-shrink: 0; font-size: 1.1rem; }
      `}</style>

      <main className="ho-page">
        <div className="ho-container">

          {/* ── Hero ── */}
          <div className="ho-hero">
            <div className="ho-hero-badge">🪐 ஜோதிடம் &nbsp;|&nbsp; Jyotish Horai</div>
            <h1>ஓரை கணிப்பு</h1>
            <p className="ho-hero-sub">
              இன்றைய கிரக ஓரைகள் (கோள் நேர) மற்றும் சுப / அசுப நேரங்களை அறிந்து கொள்ளுங்கள்.
              <br />
              <em style={{ fontSize: '.88rem', opacity: .75 }}>Find today's planetary hours — auspicious & inauspicious times.</em>
            </p>
          </div>

          {/* ── Day info + current horai ── */}
          <div className="ho-card">
            <div className="ho-day-bar">
              <div>
                <div className="ho-day-name">{dayInfo.ta}</div>
                <div className="ho-day-ta">{dayInfo.en} · {now.toLocaleDateString('ta-IN', { day:'numeric', month:'long', year:'numeric' })}</div>
              </div>
              <div className="ho-day-lord">
                <span className="ho-day-lord-label">இன்று அதிபதி:</span>
                <PlanetPill planetKey={dayLord} size="lg" />
              </div>
            </div>

            <CurrentHoraiCard
              horaiIndex={currentIndex}
              schedule={schedule}
              now={now}
              sunriseHour={sunriseHour}
              sunriseMin={sunriseMin}
              janmaRasiId={janmaRasiId}
            />

            {/* Sunrise config */}
            <div className="ho-sunrise-row">
              <span className="ho-sunrise-label">🌅 சூரிய உதய நேரம்:</span>
              <input
                className="ho-sunrise-input"
                type="number" min="4" max="8" value={sunriseHour}
                onChange={e => setSunriseHour(Number(e.target.value))}
                title="Sunrise hour"
              />
              <span style={{ color: 'var(--text-muted,#94a3b8)' }}>மணி</span>
              <input
                className="ho-sunrise-input"
                type="number" min="0" max="59" value={sunriseMin}
                onChange={e => setSunriseMin(Number(e.target.value))}
                title="Sunrise minute"
              />
              <span style={{ color: 'var(--text-muted,#94a3b8)' }}>நிமிடம்</span>
            </div>
          </div>

          {/* ── Janma Rasi Selector ── */}
          <div className="ho-card jrs-card">
            <div className="jrs-title">🌙 உங்கள் ஜன்ம ராசி (Janma Rasi)</div>
            <div className="jrs-row">
              <select
                id="janma-rasi-select"
                className="jrs-select"
                value={janmaRasiId}
                onChange={e => setJanmaRasiId(Number(e.target.value))}
              >
                <option value={0}>-- ராசியைத் தேர்ந்தெடுக்கவும் --</option>
                {horaiData.rasiList.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.nameEn})
                  </option>
                ))}
              </select>
              {janmaRasiId > 0 && (() => {
                const rasi = horaiData.rasiList[janmaRasiId - 1];
                const lord = horaiData.planets[rasi.lord];
                return (
                  <span className="jrs-lord-chip">
                    {lord.symbol} ராசி அதிபதி: {lord.ta}
                  </span>
                );
              })()}
            </div>

            {/* Best/Avoid horais for selected rasi */}
            {janmaRasiId > 0 && (() => {
              const compat = horaiData.rasiHoraiCompat[String(janmaRasiId)];
              const bestSlots  = schedule.filter(s => compat.best.includes(s.planet) && (s.startH > now.getHours() || (s.startH === now.getHours() && s.startM >= now.getMinutes()))).slice(0, 6);
              const avoidSlots = schedule.filter(s => compat.avoid.includes(s.planet) && (s.startH > now.getHours() || (s.startH === now.getHours() && s.startM >= now.getMinutes()))).slice(0, 4);
              return (
                <div style={{ marginTop: '1.25rem' }}>
                  {bestSlots.length > 0 && (
                    <div className="bh-panel">
                      <div className="bh-title">⭐ உங்களுக்கு இன்று சிறந்த ஓரை நேரங்கள்</div>
                      <div className="bh-slots">
                        {bestSlots.map((s, i) => {
                          const p = horaiData.planets[s.planet];
                          return (
                            <div key={i} className="bh-slot bh-slot-best">
                              <span style={{ color: p.color }}>{p.symbol}</span>
                              <span>{p.ta}</span>
                              <span style={{ opacity: .7 }}>{fmt12(s.startH, s.startM)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {avoidSlots.length > 0 && (
                    <div className="bh-panel">
                      <div className="bh-title" style={{ color: '#fca5a5' }}>🚫 தவிர்க்க வேண்டிய ஓரை நேரங்கள்</div>
                      <div className="bh-slots">
                        {avoidSlots.map((s, i) => {
                          const p = horaiData.planets[s.planet];
                          return (
                            <div key={i} className="bh-slot bh-slot-avoid">
                              <span style={{ color: p.color }}>{p.symbol}</span>
                              <span>{p.ta}</span>
                              <span style={{ opacity: .7 }}>{fmt12(s.startH, s.startM)}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>

          {/* ── Tabs ── */}
          <div className="ho-tabs">
            <button className={`ho-tab ${activeTab === 'today' ? 'ho-tab-active' : ''}`} onClick={() => setActiveTab('today')}>
              📅 இன்றைய அட்டவணை
            </button>
            <button className={`ho-tab ${activeTab === 'planets' ? 'ho-tab-active' : ''}`} onClick={() => setActiveTab('planets')}>
              🪐 கிரக விவரம்
            </button>
          </div>

          {/* ── Today schedule ── */}
          {activeTab === 'today' && (
            <div className="ho-card" style={{ padding: '1.5rem 1rem' }}>
              {visibleSlots.map((slot, i) => (
                <ScheduleRow key={i} slot={slot} isCurrent={i === currentIndex} janmaRasiId={janmaRasiId} />
              ))}
              <button className="ho-show-more" onClick={() => setShowAll(s => !s)}>
                {showAll ? '▲ குறைவாக காட்டு' : `▼ அனைத்தும் காட்டு (${schedule.length} ஓரைகள்)`}
              </button>
            </div>
          )}

          {/* ── Planet details ── */}
          {activeTab === 'planets' && (
            <>
              <div className="hpi-grid">
                {SEQ.map(pk => <PlanetInfoCard key={pk} planetKey={pk} />)}
              </div>

              {/* Golden Rules */}
              <div className="ho-card gr-card" style={{ marginTop: '1.5rem' }}>
                <div className="gr-title">📜 ராசி-ஓரை தங்க விதிகள் (Golden Rules)</div>
                {horaiData.goldenRules.map((r, i) => (
                  <div key={i} className="gr-rule">
                    <span className="gr-icon">{r.icon}</span>
                    <div>
                      <div style={{ color: 'var(--text-light,#e2e8f0)', marginBottom: '.25rem' }}>{r.ta}</div>
                      <div style={{ fontSize: '.8rem', opacity: .7 }}>{r.en}</div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── Disclaimer ── */}
          <div className="ho-disclaimer">
            ⚠️ <strong>குறிப்பு:</strong> இந்த கணிப்பு பொதுவான ஜோதிட வழிகாட்டுதலாகும். உங்கள் ஊரின் சூரிய உதய நேரத்தை மேலே சரிசெய்யவும். ஆலோசனைகளுக்கு தகுதியான ஜோதிடரை அணுகவும்.
            <br />
            <em style={{ opacity: .75 }}>Adjust sunrise time to match your location. Consult a qualified astrologer for important decisions.</em>
          </div>

        </div>
      </main>
    </>
  );
}
