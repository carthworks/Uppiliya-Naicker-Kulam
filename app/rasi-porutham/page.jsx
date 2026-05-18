'use client';

import { useState, useEffect } from 'react';
import rasiData from '../../data/rasi-porutham.json';

/* ─────────────────────────────────────────────
   Helpers
───────────────────────────────────────────── */
function getPosition(fromId, toId) {
  // 1-indexed circular distance
  return ((toId - fromId + 12) % 12) + 1;
}

function checkSadashtaka(maleId, femaleId) {
  const pos1 = getPosition(femaleId, maleId);
  const pos2 = getPosition(maleId, femaleId);
  return pos1 === 8 || pos2 === 8;
}

function checkSixEight(maleId, femaleId) {
  const pos1 = getPosition(femaleId, maleId);
  const pos2 = getPosition(maleId, femaleId);
  return pos1 === 6 || pos2 === 6;
}

function getResult(maleId, femaleId) {
  const compat = rasiData.compatibility[String(maleId)];
  const isIdeal = compat.ideal.includes(femaleId);
  const isAvoid = compat.avoid.includes(femaleId);
  const sadashtaka = checkSadashtaka(maleId, femaleId);
  const sixEight = checkSixEight(maleId, femaleId);

  if (sadashtaka) return { level: 'danger', score: 0, label: 'சாதஷ்டக தோஷம்', sublabel: 'மிகவும் பொருத்தமற்றது', icon: '⚠️' };
  if (isAvoid)    return { level: 'avoid',  score: 1, label: 'பொருத்தமற்றது',   sublabel: 'தவிர்க்கவும்',       icon: '❌' };
  if (sixEight)   return { level: 'warn',   score: 2, label: 'சாதாரண பொருத்தம்', sublabel: '6/8 விதி கவனிக்கவும்', icon: '⚡' };
  if (isIdeal)    return { level: 'ideal',  score: 4, label: 'மிகவும் நல்ல பொருத்தம்', sublabel: 'சிறந்த சேர்க்கை',  icon: '✨' };
  return           { level: 'good',  score: 3, label: 'நல்ல பொருத்தம்',    sublabel: 'பொருந்தும்',       icon: '💚' };
}

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function RasiSelect({ id, label, sublabel, value, onChange }) {
  return (
    <div className="rp-select-wrapper">
      <label htmlFor={id} className="rp-label">
        {sublabel && <span className="rp-sublabel">{sublabel}</span>}
        {label}
      </label>
      <div className="rp-select-box">
        <select id={id} value={value} onChange={e => onChange(Number(e.target.value))}>
          <option value={0}>-- ராசியைத் தேர்ந்தெடுக்கவும் --</option>
          {rasiData.rasiList.map(r => (
            <option key={r.id} value={r.id}>
              {r.symbol} {r.name} ({r.nameEn})
            </option>
          ))}
        </select>
        {value > 0 && (
          <div className="rp-rasi-badge">
            <span className="rp-rasi-symbol">{rasiData.rasiList[value - 1].symbol}</span>
            <span className="rp-rasi-lord">அதிபதி: {rasiData.rasiList[value - 1].lord}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function ScoreBar({ score }) {
  const maxScore = 4;
  const percent = (score / maxScore) * 100;
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#10b981'];
  const color = colors[score] ?? colors[0];
  return (
    <div className="rp-score-bar-track">
      <div
        className="rp-score-bar-fill"
        style={{ width: `${percent}%`, background: color }}
      />
    </div>
  );
}

function ResultCard({ result, maleRasi, femaleRasi }) {
  const levelColors = {
    ideal:  { bg: 'rgba(16,185,129,0.12)', border: '#10b981', text: '#6ee7b7' },
    good:   { bg: 'rgba(34,197,94,0.10)',  border: '#22c55e', text: '#86efac' },
    warn:   { bg: 'rgba(234,179,8,0.12)',  border: '#eab308', text: '#fde047' },
    avoid:  { bg: 'rgba(249,115,22,0.12)', border: '#f97316', text: '#fdba74' },
    danger: { bg: 'rgba(239,68,68,0.12)',  border: '#ef4444', text: '#fca5a5' },
  };
  const c = levelColors[result.level];
  return (
    <div className="rp-result-card" style={{ background: c.bg, borderColor: c.border }}>
      <div className="rp-result-icon">{result.icon}</div>
      <div className="rp-result-main">
        <div className="rp-result-label" style={{ color: c.text }}>{result.label}</div>
        <div className="rp-result-sublabel">{result.sublabel}</div>
        <div className="rp-result-pair">
          <span>{maleRasi.symbol} {maleRasi.name}</span>
          <span className="rp-pair-arrow">↔</span>
          <span>{femaleRasi.symbol} {femaleRasi.name}</span>
        </div>
        <ScoreBar score={result.score} />
      </div>
    </div>
  );
}

function RuleCard({ rule, icon }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rp-rule-card ${open ? 'rp-rule-open' : ''}`} onClick={() => setOpen(o => !o)}>
      <div className="rp-rule-header">
        <span>{icon}</span>
        <span>{rule.ta}</span>
        <span className="rp-rule-chevron">{open ? '▲' : '▼'}</span>
      </div>
      {open && <div className="rp-rule-body">{rule.en}</div>}
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function RasiPoruthamPage() {
  const [maleRasiId,   setMaleRasiId]   = useState(0);
  const [femaleRasiId, setFemaleRasiId] = useState(0);
  const [result, setResult] = useState(null);
  const [animKey, setAnimKey] = useState(0);

  useEffect(() => {
    if (maleRasiId > 0 && femaleRasiId > 0) {
      setResult(getResult(maleRasiId, femaleRasiId));
      setAnimKey(k => k + 1);
    } else {
      setResult(null);
    }
  }, [maleRasiId, femaleRasiId]);

  const maleRasi   = maleRasiId   > 0 ? rasiData.rasiList[maleRasiId - 1]   : null;
  const femaleRasi = femaleRasiId > 0 ? rasiData.rasiList[femaleRasiId - 1] : null;

  return (
    <>
      <style suppressHydrationWarning>{`
        /* ── Page shell ── */
        .rp-page {
          min-height: 80vh;
          padding: 3rem 1rem 5rem;
          font-family: 'Noto Sans Tamil', 'Segoe UI', sans-serif;
        }
        .rp-container { max-width: 780px; margin: 0 auto; }

        /* ── Hero ── */
        .rp-hero { text-align: center; margin-bottom: 3rem; }
        .rp-hero-badge {
          display: inline-flex; align-items: center; gap: .5rem;
          padding: .35rem 1rem; border-radius: 999px;
          background: rgba(192,132,252,0.12); border: 1px solid rgba(192,132,252,0.35);
          color: #c084fc; font-size: .85rem; margin-bottom: 1.2rem;
        }
        .rp-hero h1 {
          font-size: clamp(1.8rem, 5vw, 2.8rem);
          font-weight: 800; line-height: 1.2;
          background: linear-gradient(135deg, #c084fc 0%, #60a5fa 50%, #34d399 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; margin: 0 0 .75rem;
        }
        .rp-hero-sub {
          color: var(--text-muted, #94a3b8);
          font-size: 1rem; max-width: 520px; margin: 0 auto;
          line-height: 1.7;
        }

        /* ── Card ── */
        .rp-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.25rem;
          padding: 2.5rem 2rem;
          backdrop-filter: blur(12px);
          margin-bottom: 1.5rem;
        }

        /* ── Selectors ── */
        .rp-selectors {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;
          align-items: start;
        }
        @media(max-width:560px) { .rp-selectors { grid-template-columns: 1fr; } }

        .rp-vs-divider {
          display: flex; flex-direction: column; align-items: center;
          justify-content: center; color: #c084fc; font-size: 1.6rem;
          font-weight: 900; gap: .25rem; padding-top: 1.8rem;
        }
        .rp-vs-text { font-size: .7rem; color: var(--text-muted,#94a3b8); letter-spacing: .1em; }

        /* On mobile hide the vs divider – it's between the two selects */
        @media(max-width:560px) { .rp-vs-divider { display: none; } }

        .rp-select-wrapper { display: flex; flex-direction: column; gap: .6rem; }
        .rp-label {
          font-size: .9rem; font-weight: 600; color: var(--text-light,#e2e8f0);
          display: flex; flex-direction: column; gap: .15rem;
        }
        .rp-sublabel {
          font-size: .75rem; color: var(--text-muted,#94a3b8); font-weight: 400;
        }
        .rp-select-box select {
          width: 100%; padding: .75rem 1rem;
          background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.15);
          border-radius: .75rem; color: var(--text-light,#e2e8f0);
          font-size: 1rem; cursor: pointer;
          font-family: inherit;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%2394a3b8' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 1rem center;
          transition: border-color .2s, box-shadow .2s;
        }
        .rp-select-box select:focus {
          outline: none; border-color: #c084fc;
          box-shadow: 0 0 0 3px rgba(192,132,252,0.2);
        }
        .rp-rasi-badge {
          display: flex; align-items: center; gap: .5rem;
          margin-top: .5rem; padding: .5rem .75rem;
          background: rgba(192,132,252,0.1); border-radius: .5rem;
          border: 1px solid rgba(192,132,252,0.2);
        }
        .rp-rasi-symbol { font-size: 1.4rem; }
        .rp-rasi-lord   { font-size: .8rem; color: var(--text-muted,#94a3b8); }

        /* ── CTA ── */
        .rp-cta-row { display: flex; justify-content: center; margin-top: 2rem; }
        .rp-cta-hint { font-size: .88rem; color: var(--text-muted,#94a3b8); text-align: center; margin-top: 1.25rem; }

        /* ── Result ── */
        .rp-result-section {
          animation: rpFadeUp .45s ease both;
        }
        @keyframes rpFadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .rp-result-card {
          border-radius: 1.25rem; border: 1.5px solid;
          padding: 2rem; display: flex; gap: 1.5rem; align-items: flex-start;
          margin-bottom: 1.5rem;
        }
        .rp-result-icon { font-size: 3rem; flex-shrink: 0; line-height: 1; }
        .rp-result-main { flex: 1; }
        .rp-result-label { font-size: 1.5rem; font-weight: 800; margin-bottom: .25rem; }
        .rp-result-sublabel { font-size: .9rem; color: var(--text-muted,#94a3b8); margin-bottom: .75rem; }
        .rp-result-pair {
          display: inline-flex; align-items: center; gap: .75rem;
          font-size: 1rem; font-weight: 600; color: var(--text-light,#e2e8f0);
          background: rgba(255,255,255,0.06); border-radius: .5rem;
          padding: .4rem .85rem; margin-bottom: .85rem;
        }
        .rp-pair-arrow { color: #c084fc; font-size: 1.1rem; }

        /* Score bar */
        .rp-score-bar-track {
          height: 6px; border-radius: 999px;
          background: rgba(255,255,255,0.08); overflow: hidden;
        }
        .rp-score-bar-fill {
          height: 100%; border-radius: 999px;
          transition: width .6s cubic-bezier(.34,1.56,.64,1);
        }

        /* ── Detail note ── */
        .rp-detail-note {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.09);
          border-radius: 1rem; padding: 1.25rem 1.5rem;
          font-size: .92rem; color: var(--text-light,#e2e8f0);
          line-height: 1.75;
        }
        .rp-detail-note strong { color: #c084fc; }

        /* ── Rules ── */
        .rp-rules-title {
          font-size: 1.1rem; font-weight: 700; color: var(--text-light,#e2e8f0);
          margin-bottom: 1rem; display: flex; align-items: center; gap: .5rem;
        }
        .rp-rule-card {
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: .85rem; margin-bottom: .75rem;
          cursor: pointer; overflow: hidden;
          transition: border-color .2s;
        }
        .rp-rule-card:hover { border-color: rgba(192,132,252,0.4); }
        .rp-rule-open { border-color: rgba(192,132,252,0.5); }
        .rp-rule-header {
          display: flex; align-items: flex-start; gap: .75rem;
          padding: .9rem 1.1rem; font-size: .9rem;
          color: var(--text-light,#e2e8f0); line-height: 1.5;
        }
        .rp-rule-chevron { margin-left: auto; color: #c084fc; flex-shrink: 0; }
        .rp-rule-body {
          padding: 0 1.1rem 1rem 2.6rem; font-size: .83rem;
          color: var(--text-muted,#94a3b8); line-height: 1.65;
          border-top: 1px solid rgba(255,255,255,0.07);
          padding-top: .75rem;
        }

        /* ── Disclaimer ── */
        .rp-disclaimer {
          margin-top: 2rem; padding: 1rem 1.25rem;
          border-radius: .85rem; background: rgba(234,179,8,0.07);
          border: 1px solid rgba(234,179,8,0.2);
          font-size: .82rem; color: rgba(253,224,71,0.85); line-height: 1.6;
        }

        /* ── Rasi grid ── */
        .rp-grid-title {
          font-size: 1.1rem; font-weight: 700; color: var(--text-light,#e2e8f0);
          margin-bottom: 1rem;
        }
        .rp-rasi-grid {
          display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          gap: .75rem;
        }
        .rp-rasi-tile {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: .85rem; padding: .75rem .5rem;
          text-align: center; transition: transform .2s, border-color .2s;
        }
        .rp-rasi-tile:hover { transform: translateY(-3px); border-color: rgba(192,132,252,0.4); }
        .rp-tile-symbol { font-size: 1.6rem; margin-bottom: .2rem; }
        .rp-tile-name   { font-size: .8rem; font-weight: 600; color: var(--text-light,#e2e8f0); }
        .rp-tile-lord   { font-size: .7rem; color: var(--text-muted,#94a3b8); margin-top: .15rem; }
      `}</style>

      <main className="rp-page">
        <div className="rp-container">

          {/* ── Hero ── */}
          <div className="rp-hero">
            <div className="rp-hero-badge">⭐ ஜோதிடம் &nbsp;|&nbsp; Astrology</div>
            <h1>திருமண ராசி பொருத்தம்</h1>
            <p className="rp-hero-sub">
              மணமகன் மற்றும் மணமகளின் ராசிகளை தேர்வு செய்து திருமண பொருத்தத்தை அறிந்து கொள்ளுங்கள்.
              <br />
              <em style={{ fontSize: '.88rem', opacity: .75 }}>Select the groom & bride's rasi to check Thirumana Porutham.</em>
            </p>
          </div>

          {/* ── Selector card ── */}
          <div className="rp-card">
            <div className="rp-selectors">
              <RasiSelect
                id="male-rasi"
                label="மணமகன் ராசி (Groom)"
                sublabel="மணமகன்"
                value={maleRasiId}
                onChange={setMaleRasiId}
              />

              <RasiSelect
                id="female-rasi"
                label="மணமகள் ராசி (Bride)"
                sublabel="மணமகள்"
                value={femaleRasiId}
                onChange={setFemaleRasiId}
              />
            </div>

            {(!maleRasiId || !femaleRasiId) && (
              <p className="rp-cta-hint">
                🔮 இரண்டு ராசிகளையும் தேர்ந்தெடுத்தவுடன் பொருத்தம் தானாகவே காட்டப்படும்.
              </p>
            )}
          </div>

          {/* ── Result ── */}
          {result && maleRasi && femaleRasi && (
            <div className="rp-result-section" key={animKey}>
              <ResultCard result={result} maleRasi={maleRasi} femaleRasi={femaleRasi} />

              {/* Detail note from data */}
              <div className="rp-detail-note">
                <strong>குறிப்பு (மணமகன் – {maleRasi.name}):</strong>{' '}
                {rasiData.compatibility[String(maleRasiId)].note}
              </div>
            </div>
          )}

          {/* ── Rules card ── */}
          <div className="rp-card" style={{ marginTop: '2rem' }}>
            <div className="rp-rules-title">📜 முக்கியமான விதிகள் (Important Rules)</div>
            <RuleCard rule={rasiData.rules.sadashtaka} icon="⚠️" />
            <RuleCard rule={rasiData.rules.sixEight}   icon="⚡" />
            <RuleCard rule={rasiData.rules.nakshatra}  icon="🌟" />
          </div>

          {/* ── All 12 rasi tiles ── */}
          <div className="rp-card">
            <div className="rp-grid-title">🪐 12 ராசிகள் (12 Rasis)</div>
            <div className="rp-rasi-grid">
              {rasiData.rasiList.map(r => (
                <div key={r.id} className="rp-rasi-tile">
                  <div className="rp-tile-symbol">{r.symbol}</div>
                  <div className="rp-tile-name">{r.name}</div>
                  <div className="rp-tile-lord">{r.lord}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Disclaimer ── */}
          <div className="rp-disclaimer">
            ⚠️ <strong>குறிப்பு:</strong> இந்த கருவி பொதுவான ஜோதிட தகவல்களை வழங்குகிறது. திருமண முடிவுகளுக்கு தகுதியான ஜோதிடரை அணுகவும். AI பதில்களில் தவறுகள் இருக்கலாம்.
            <br />
            <em style={{ opacity: .75 }}>This tool provides general astrological guidance only. Consult a qualified Tamil astrologer for marriage decisions.</em>
          </div>

        </div>
      </main>
    </>
  );
}
