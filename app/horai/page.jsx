'use client';

import { useState, useEffect, useCallback } from 'react';
import horaiData from '../../data/horai.json';

/* ─────────────────────────────────────────────
   Horai Engine
   sequence: Sun→Venus→Mercury→Moon→Saturn→Jupiter→Mars
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

/* ── Build Day Schedule (Equal 60m or Proportional Astro mode) ── */
function buildDaySchedule(date, sunriseHour = 6, sunriseMin = 0, sunsetHour = 18, sunsetMin = 0, mode = 'equal') {
  const day = date.getDay();
  const hours = [];
  const sunriseTotal = sunriseHour * 60 + sunriseMin;
  const sunsetTotal  = sunsetHour * 60 + sunsetMin;
  
  const dayDuration   = sunsetTotal > sunriseTotal ? (sunsetTotal - sunriseTotal) : 720;
  const nightDuration = 1440 - dayDuration;

  const daySlotLen   = mode === 'proportional' ? dayDuration / 12 : 60;
  const nightSlotLen = mode === 'proportional' ? nightDuration / 12 : 60;

  let currentMins = sunriseTotal;

  for (let i = 0; i < 24; i++) {
    const slotLen = (mode === 'proportional' && i >= 12) ? nightSlotLen : daySlotLen;
    const startMinsTotal = currentMins;
    const endMinsTotal   = currentMins + slotLen;
    currentMins          = endMinsTotal;

    const startH = Math.floor((startMinsTotal / 60) % 24);
    const startM = Math.floor(startMinsTotal % 60);
    const endH   = Math.floor((endMinsTotal / 60) % 24);
    const endM   = Math.floor(endMinsTotal % 60);
    const planet = getPlanetForHour(day, i);

    hours.push({
      index: i,
      startMinsTotal,
      endMinsTotal,
      startH, startM,
      endH, endM,
      planet,
      isNight: i >= 12,
      label: `${String(startH).padStart(2,'0')}:${String(startM).padStart(2,'0')} – ${String(endH).padStart(2,'0')}:${String(endM).padStart(2,'0')}`,
    });
  }
  return hours;
}

function getCurrentHoraiIndex(now, schedule) {
  const nowMins = now.getHours() * 60 + now.getMinutes();
  for (let i = 0; i < schedule.length; i++) {
    const slot = schedule[i];
    if (nowMins >= slot.startMinsTotal && nowMins < slot.endMinsTotal) {
      return i;
    }
  }
  if (nowMins < schedule[0].startMinsTotal) return -1; // before sunrise
  return 23; // after last slot
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
   Panchangam Calculations (Rahu, Yama, Gulika)
───────────────────────────────────────────── */
function calculatePanchangam(date, sunriseHour = 6, sunriseMin = 0, sunsetHour = 18, sunsetMin = 0) {
  const dayIndex = date.getDay(); // 0=Sun..6=Sat
  const sunriseMins = sunriseHour * 60 + sunriseMin;
  const sunsetMins  = sunsetHour * 60 + sunsetMin;
  const dayMins = sunsetMins > sunriseMins ? (sunsetMins - sunriseMins) : 720;
  const partMins = dayMins / 8;

  // 1-indexed day parts (0..7)
  const rahuParts = [7, 1, 6, 4, 5, 3, 2]; // Sun=8th(7), Mon=2nd(1), Tue=7th(6), Wed=5th(4), Thu=6th(5), Fri=4th(3), Sat=3rd(2)
  const yamaParts = [4, 3, 2, 1, 0, 6, 5]; // Sun=5th(4), Mon=4th(3), Tue=3rd(2), Wed=2nd(1), Thu=1st(0), Fri=7th(6), Sat=6th(5)
  const guliParts = [6, 5, 4, 3, 2, 1, 0]; // Sun=7th(6), Mon=6th(5), Tue=5th(4), Wed=4th(3), Thu=3rd(2), Fri=2nd(1), Sat=1st(0)

  const getSlotTiming = (partIndex) => {
    const sMins = Math.round(sunriseMins + partIndex * partMins);
    const eMins = Math.round(sunriseMins + (partIndex + 1) * partMins);
    const sH = Math.floor((sMins / 60) % 24);
    const sM = Math.floor(sMins % 60);
    const eH = Math.floor((eMins / 60) % 24);
    const eM = Math.floor(eMins % 60);
    return { sMins, eMins, text: `${fmt12(sH, sM)} – ${fmt12(eH, eM)}` };
  };

  return {
    rahu: getSlotTiming(rahuParts[dayIndex]),
    yama: getSlotTiming(yamaParts[dayIndex]),
    guli: getSlotTiming(guliParts[dayIndex]),
  };
}

/* ─────────────────────────────────────────────
   Task Recommender Categories
───────────────────────────────────────────── */
const TASK_CATEGORIES = [
  { id: 'all', name: 'அனைத்தும்', icon: '✨', planets: [] },
  { id: 'money', name: 'பணம் / நிதி', icon: '💰', planets: ['venus', 'jupiter', 'mercury'] },
  { id: 'travel', name: 'பயணம்', icon: '🚗', planets: ['venus', 'mercury'] },
  { id: 'health', name: 'மருத்துவம்', icon: '🏥', planets: ['sun', 'mars'] },
  { id: 'education', name: 'கல்வி / தேர்வு', icon: '📚', planets: ['mercury', 'jupiter'] },
  { id: 'business', name: 'தொழில் / வேலை', icon: '🏢', planets: ['jupiter', 'sun', 'mercury'] },
  { id: 'property', name: 'வீடு / சொத்து', icon: '🏠', planets: ['mars', 'venus'] },
  { id: 'legal', name: 'வழக்கு / விவாதம்', icon: '⚖️', planets: ['mars', 'sun'] },
];

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
function PlanetPill({ planetKey, size = 'sm' }) {
  const p  = horaiData.planets[planetKey];
  if (!p) return null;
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
  if (!cl) return null;
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

function CurrentHoraiCard({ horaiIndex, schedule, now, janmaRasiId }) {
  if (horaiIndex < 0 || horaiIndex >= schedule.length) return (
    <div className="hc-current-card hc-before-sunrise">
      <div className="hc-current-icon">🌙</div>
      <div>
        <div className="hc-current-title">சூரிய உதயத்திற்கு முன்</div>
        <div className="hc-current-sub">Before Sunrise — Horai starts at Sunrise</div>
      </div>
    </div>
  );

  const slot   = schedule[horaiIndex];
  const p      = horaiData.planets[slot.planet];
  const cl     = horaiData.classification[slot.planet];
  const rasiLevel = getRasiLevel(janmaRasiId, slot.planet);

  const nowSecsTotal   = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  const slotStartSecs  = Math.round(slot.startMinsTotal * 60);
  const slotEndSecs    = Math.round(slot.endMinsTotal * 60);
  const slotLenSecs    = Math.max(1, slotEndSecs - slotStartSecs);
  const elapsedSecs    = Math.max(0, nowSecsTotal - slotStartSecs);
  const remainingSecs  = Math.max(0, slotEndSecs - nowSecsTotal);

  const minsLeft = Math.floor(remainingSecs / 60);
  const secsLeft = Math.floor(remainingSecs % 60);
  const progressPct = Math.min(100, Math.max(0, (elapsedSecs / slotLenSecs) * 100));

  const nextSlot   = schedule[horaiIndex + 1];
  const nextPlanet = nextSlot ? horaiData.planets[nextSlot.planet] : null;

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
          <div className="hc-ticker">
            <span className="hc-ticker-time">
              ⏱️ நேரலை சுழற்சி: <strong>{minsLeft}</strong> நிமி <strong>{String(secsLeft).padStart(2, '0')}</strong> வினாடி மீதம்
            </span>
            {nextPlanet && (
              <span className="hc-next-horai">
                அடுத்து: <strong style={{ color: nextPlanet.color }}>{nextPlanet.symbol} {nextPlanet.ta}</strong>
              </span>
            )}
          </div>
        </div>
        <p className="hc-current-note">{cl.note}</p>
      </div>
    </div>
  );
}

function ScheduleRow({ slot, isCurrent, janmaRasiId, isTaskMatch }) {
  const p  = horaiData.planets[slot.planet];
  const cl = horaiData.classification[slot.planet];
  const typeIcon = { subha: '✨', madhyama: '⚡', asubha: '❌' }[cl.type];
  const rasiLevel = getRasiLevel(janmaRasiId, slot.planet);

  const rasiRowStyle = janmaRasiId ? {
    best:    { background: 'rgba(16,185,129,0.07)' },
    avoid:   { background: 'rgba(239,68,68,0.07)', opacity: .7 },
    neutral: {},
  }[rasiLevel] : {};

  const taskStyle = isTaskMatch ? { background: 'rgba(251,191,36,0.12)', boxShadow: 'inset 0 0 0 1px rgba(251,191,36,0.4)' } : {};

  const borderColor = isCurrent ? p.color
    : isTaskMatch ? '#fbbf24'
    : rasiLevel === 'best'  ? '#10b981'
    : rasiLevel === 'avoid' ? '#ef4444'
    : 'transparent';

  return (
    <div
      className={`hs-row ${isCurrent ? 'hs-row-current' : ''}`}
      style={{ borderLeftColor: borderColor, ...rasiRowStyle, ...taskStyle }}
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
        {slot.isNight && <span className="hs-night-tag">🌙 இரவு</span>}
      </div>
      <div className="hs-type">
        {typeIcon} <span style={{ color: cl.type === 'subha' ? '#6ee7b7' : cl.type === 'madhyama' ? '#fde047' : '#fca5a5' }}>
          {cl.typeLabel}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '.35rem', alignItems: 'center' }}>
        {isCurrent && <div className="hs-now-badge">இப்போது</div>}
        {isTaskMatch && <span className="hs-task-badge">🎯 காரியம்</span>}
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

const CITIES = [
  { name: 'சென்னை (Chennai)', lat: 13.0827, lng: 80.2707 },
  { name: 'மதுரை (Madurai)', lat: 9.9252, lng: 78.1198 },
  { name: 'கோவை (Coimbatore)', lat: 11.0168, lng: 76.9558 },
  { name: 'திருச்சி (Tiruchirappalli)', lat: 10.7905, lng: 78.7047 },
  { name: 'சேலம் (Salem)', lat: 11.6643, lng: 78.1460 },
  { name: 'திருநெல்வேலி (Tirunelveli)', lat: 8.7139, lng: 77.7567 },
  { name: 'வேலூர் (Vellore)', lat: 12.9165, lng: 79.1325 },
  { name: 'ஈரோடு (Erode)', lat: 11.3410, lng: 77.7172 },
  { name: 'தஞ்சாவூர் (Thanjavur)', lat: 10.7870, lng: 79.1378 },
  { name: 'புதுச்சேரி (Puducherry)', lat: 11.9416, lng: 79.8083 },
  { name: 'நாகர்கோவில் (Nagercoil)', lat: 8.1833, lng: 77.4119 },
  { name: 'காஞ்சீபுரம் (Kanchipuram)', lat: 12.8342, lng: 79.7036 },
  { name: 'பெங்களூரு (Bengaluru)', lat: 12.9716, lng: 77.5946 },
  { name: 'சிங்கப்பூர் (Singapore)', lat: 1.3521, lng: 103.8198 },
  { name: 'யாழ்ப்பாணம் (Jaffna)', lat: 9.6615, lng: 80.0255 },
  { name: 'கொழும்பு (Colombo)', lat: 6.9271, lng: 79.8612 },
  { name: 'மலேசியா (Kuala Lumpur)', lat: 3.1390, lng: 101.6869 },
  { name: 'துபாய் (Dubai)', lat: 25.2048, lng: 55.2708 },
  { name: 'லண்டன் (London)', lat: 51.5074, lng: -0.1278 },
  { name: 'நியூயார்க் (New York)', lat: 40.7128, lng: -74.0060 },
];

/* ─────────────────────────────────────────────
   Main Page Component
───────────────────────────────────────────── */
export default function HoraiPage() {
  const [now, setNow]                 = useState(null);
  const [sunriseHour, setSunriseHour] = useState(6);
  const [sunriseMin,  setSunriseMin]  = useState(0);
  const [sunsetHour,  setSunsetHour]  = useState(18);
  const [sunsetMin,   setSunsetMin]   = useState(0);

  const [showAll, setShowAll]         = useState(false);
  const [activeTab, setActiveTab]     = useState('today');
  const [janmaRasiId, setJanmaRasiId] = useState(0);
  const [horaiMode, setHoraiMode]     = useState('equal'); // 'equal' | 'proportional'
  const [activeTask, setActiveTask]   = useState('all');

  const [locationName, setLocationName]   = useState('தானியங்கி இருப்பிடம்');
  const [coords, setCoords]               = useState({ lat: 13.0827, lng: 80.2707 });
  const [isLocating, setIsLocating]       = useState(false);
  const [isFetchingApi, setIsFetchingApi] = useState(false);
  const [apiError, setApiError]           = useState(null);
  const [selectedCity, setSelectedCity]   = useState('');
  const [copyNotice, setCopyNotice]       = useState(false);

  /* ── 6. Local Storage Persistence (Restore) ── */
  useEffect(() => {
    setNow(new Date());
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('uppiliya_horai_prefs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (parsed.rasiId) setJanmaRasiId(parsed.rasiId);
          if (parsed.city) setSelectedCity(parsed.city);
          if (parsed.horaiMode) setHoraiMode(parsed.horaiMode);
          if (parsed.lat && parsed.lng) {
            setCoords({ lat: parsed.lat, lng: parsed.lng });
            if (parsed.locName) setLocationName(parsed.locName);
          }
        }
      } catch (e) {
        console.error('Failed to load Horai prefs from localStorage:', e);
      }
    }
  }, []);

  /* ── Local Storage Save ── */
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const prefs = {
          rasiId: janmaRasiId,
          city: selectedCity,
          horaiMode,
          lat: coords.lat,
          lng: coords.lng,
          locName: locationName,
        };
        localStorage.setItem('uppiliya_horai_prefs', JSON.stringify(prefs));
      } catch (e) {}
    }
  }, [janmaRasiId, selectedCity, horaiMode, coords, locationName]);

  /* ── API Fetch Sunrise & Sunset ── */
  const fetchSunrise = useCallback(async (lat, lng) => {
    setIsFetchingApi(true);
    setApiError(null);
    try {
      const res = await fetch(`https://api.sunrisesunset.io/json?lat=${lat}&lng=${lng}&formatted=0`);
      const data = await res.json();
      if (data && data.status === 'OK' && data.results) {
        if (data.results.sunrise) {
          const timePart = data.results.sunrise.split('T')[1];
          if (timePart) {
            const [hStr, mStr] = timePart.split(':');
            setSunriseHour(parseInt(hStr, 10));
            setSunriseMin(parseInt(mStr, 10));
          }
        }
        if (data.results.sunset) {
          const timePart = data.results.sunset.split('T')[1];
          if (timePart) {
            const [hStr, mStr] = timePart.split(':');
            setSunsetHour(parseInt(hStr, 10));
            setSunsetMin(parseInt(mStr, 10));
          }
        }
      } else {
        setApiError('சூரிய உதயத் தரவு பெற முடியவில்லை');
      }
    } catch (err) {
      console.error('Error fetching sunrise/sunset:', err);
      setApiError('API இணைப்புத் தோல்வி');
    } finally {
      setIsFetchingApi(false);
    }
  }, []);

  /* ── Geolocation ── */
  const detectLocation = useCallback(() => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      fetchSunrise(13.0827, 80.2707);
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));
        setCoords({ lat, lng });
        setLocationName('தானியங்கி இருப்பிடம்');
        setSelectedCity('');
        setIsLocating(false);
        fetchSunrise(lat, lng);
      },
      (err) => {
        console.warn('Geolocation error or denied:', err);
        setIsLocating(false);
        setCoords({ lat: 13.0827, lng: 80.2707 });
        setLocationName('சென்னை (Chennai)');
        fetchSunrise(13.0827, 80.2707);
      },
      { timeout: 8000 }
    );
  }, [fetchSunrise]);

  useEffect(() => {
    detectLocation();
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, [detectLocation]);

  const handleCityChange = (e) => {
    const cityName = e.target.value;
    setSelectedCity(cityName);
    if (!cityName) return;
    const city = CITIES.find(c => c.name === cityName);
    if (city) {
      setCoords({ lat: city.lat, lng: city.lng });
      setLocationName(city.name);
      fetchSunrise(city.lat, city.lng);
    }
  };

  if (!now) return null; // avoid SSR mismatch

  const schedule     = buildDaySchedule(now, sunriseHour, sunriseMin, sunsetHour, sunsetMin, horaiMode);
  const currentIndex = getCurrentHoraiIndex(now, schedule);
  const panchangam   = calculatePanchangam(now, sunriseHour, sunriseMin, sunsetHour, sunsetMin);
  const dayInfo      = horaiData.dayNames[String(now.getDay())];
  const dayLord      = horaiData.dayLords[String(now.getDay())];
  const visibleSlots = showAll ? schedule : schedule.slice(0, 14);

  // Active Task filter planet list
  const selectedTaskObj = TASK_CATEGORIES.find(t => t.id === activeTask);
  const taskPlanets     = selectedTaskObj ? selectedTaskObj.planets : [];

  /* ── 7. WhatsApp & Social Sharing ── */
  const handleShare = () => {
    const bestSlots = schedule.filter(s => horaiData.classification[s.planet].type === 'subha').slice(0, 5);
    const bestText  = bestSlots.map(s => `• ${horaiData.planets[s.planet].symbol} ${horaiData.planets[s.planet].ta}: ${fmt12(s.startH, s.startM)} – ${fmt12(s.endH, s.endM)}`).join('\n');

    const shareText = 
`🪐 *இன்றைய கிரக ஓரை & பஞ்சாங்கம்*
📅 நாள்: ${dayInfo.ta} (${dayInfo.en}) · ${now.toLocaleDateString('ta-IN')}
📍 இருப்பிடம்: ${locationName} (${coords.lat}°, ${coords.lng}°)
🌅 சூரிய உதயம்: ${fmt12(sunriseHour, sunriseMin)} | 🌇 அஸ்தமனம்: ${fmt12(sunsetHour, sunsetMin)}

🚫 *ராகு காலம்:* ${panchangam.rahu.text}
⚡ *எமகண்டம்:* ${panchangam.yama.text}
✨ *குளிகை காலம்:* ${panchangam.guli.text}

⭐ *இன்றைய சுப ஓரைகள்:*
${bestText}

ஆதாரம்: Uppiliya Naicker Community App`;

    if (navigator.share) {
      navigator.share({ title: 'இன்றைய ஓரை & பஞ்சாங்கம்', text: shareText }).catch(() => {});
    } else {
      const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
      window.open(url, '_blank');
    }
  };

  return (
    <>
      <style suppressHydrationWarning>{`
        /* ── Page ── */
        .ho-page { min-height: 80vh; padding: 3rem 1rem 5rem; font-family: 'Noto Sans Tamil','Segoe UI',sans-serif; }
        .ho-container { max-width: 840px; margin: 0 auto; }

        /* ── Hero ── */
        .ho-hero { text-align: center; margin-bottom: 2.5rem; }
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
        .ho-hero-sub { color: var(--text-muted,#94a3b8); font-size: 1rem; max-width: 540px; margin: 0 auto; line-height: 1.7; }

        /* ── Card shell ── */
        .ho-card {
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 1.25rem; padding: 1.75rem; margin-bottom: 1.5rem;
          backdrop-filter: blur(12px);
        }

        /* ── Day bar ── */
        .ho-day-bar { display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.5rem; }
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
        .hc-progress-row { display: flex; flex-direction: column; gap: .5rem; margin: .85rem 0 .75rem; }
        .hc-progress-track { width: 100%; height: 6px; border-radius: 999px; background: rgba(255,255,255,0.08); overflow: hidden; }
        .hc-progress-fill { height: 100%; border-radius: 999px; transition: width .5s linear; }
        .hc-ticker { display: flex; align-items: center; justify-content: space-between; gap: .5rem; flex-wrap: wrap; font-size: .82rem; color: #94a3b8; }
        .hc-ticker-time strong { color: #fbbf24; font-size: .95rem; font-variant-numeric: tabular-nums; }
        .hc-next-horai { color: #cbd5e1; font-size: .8rem; }
        .hc-current-note { font-size: .88rem; color: var(--text-muted,#94a3b8); line-height: 1.65; margin: 0; }

        /* ── Location & Sunrise Control ── */
        .ho-location-box {
          background: rgba(15, 23, 42, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 1rem;
          padding: 1.25rem;
        }
        .ho-loc-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          flex-wrap: wrap;
          margin-bottom: .75rem;
        }
        .ho-loc-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #fbbf24;
          display: flex;
          align-items: center;
          gap: .4rem;
        }
        .ho-loc-actions {
          display: flex;
          align-items: center;
          gap: .65rem;
          flex-wrap: wrap;
        }
        .ho-loc-btn {
          padding: .5rem 1rem;
          background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          color: #ffffff;
          border: none;
          border-radius: .75rem;
          font-size: .85rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 2px 8px rgba(249,115,22,0.3);
          transition: transform .15s, opacity .15s;
        }
        .ho-loc-btn:hover:not(:disabled) { transform: translateY(-1px); }
        .ho-loc-btn:disabled { opacity: .6; cursor: not-allowed; }
        .ho-city-select {
          padding: .5rem .85rem;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: .75rem;
          color: #e2e8f0;
          font-size: .88rem;
          font-family: inherit;
          cursor: pointer;
        }
        .ho-loc-status {
          font-size: 1.05rem;
          font-weight: 800;
          color: #f8fafc;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: .4rem;
          flex-wrap: wrap;
        }
        .ho-coords { font-size: .88rem; color: #94a3b8; font-weight: 400; }
        .ho-sunrise-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          flex-wrap: wrap;
          padding-top: .85rem;
          border-top: 1px solid rgba(255, 255, 255, 0.08);
        }
        .ho-sunrise-info { display: flex; align-items: center; gap: .75rem; flex-wrap: wrap; }
        .ho-sunrise-time { font-size: 1.05rem; color: #e2e8f0; }
        .ho-sunrise-time strong { color: #fbbf24; font-size: 1.2rem; }
        .ho-sunset-time strong  { color: #f97316; font-size: 1.2rem; }
        .ho-api-badge {
          font-size: .72rem; padding: .2rem .55rem; border-radius: .4rem;
          background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); color: #94a3b8;
        }
        .ho-manual-controls { display: flex; align-items: center; gap: .4rem; }
        .ho-manual-label { font-size: .82rem; color: #94a3b8; }
        .ho-sunrise-input {
          padding: .4rem .6rem; background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.15); border-radius: .6rem;
          color: var(--text-light,#e2e8f0); font-size: .9rem; font-family: inherit;
          width: 55px; text-align: center;
        }

        /* ── 1. Panchangam Grid ── */
        .pk-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem; margin-bottom: 1.5rem; }
        .pk-card {
          padding: 1.1rem 1.25rem; border-radius: 1rem; border: 1px solid;
          background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(8px);
        }
        .pk-card-rahu { border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.06); }
        .pk-card-yama { border-color: rgba(234,179,8,0.35);  background: rgba(234,179,8,0.06); }
        .pk-card-guli { border-color: rgba(16,185,129,0.35); background: rgba(16,185,129,0.06); }
        .pk-title { font-size: .88rem; font-weight: 700; margin-bottom: .35rem; display: flex; align-items: center; justify-content: space-between; }
        .pk-time { font-size: 1.15rem; font-weight: 800; letter-spacing: .02em; }
        .pk-badge { font-size: .7rem; font-weight: 700; padding: .15rem .5rem; border-radius: 999px; }

        /* ── 3. Task Recommender Bar ── */
        .tr-box { margin-bottom: 1.5rem; background: rgba(167,139,250,0.06); border: 1px solid rgba(167,139,250,0.25); }
        .tr-header { font-size: 1rem; font-weight: 700; color: #e2e8f0; margin-bottom: .85rem; display: flex; align-items: center; gap: .5rem; }
        .tr-chips { display: flex; gap: .5rem; flex-wrap: wrap; }
        .tr-chip {
          padding: .45rem .85rem; border-radius: 999px; font-size: .85rem; font-weight: 600;
          border: 1px solid rgba(255,255,255,0.15); background: rgba(0,0,0,0.3); color: #94a3b8;
          cursor: pointer; transition: all .15s; font-family: inherit;
        }
        .tr-chip:hover { border-color: #a78bfa; color: #e2e8f0; }
        .tr-chip-active { background: rgba(167,139,250,0.25); border-color: #a78bfa; color: #ffffff; box-shadow: 0 0 12px rgba(167,139,250,0.3); }

        /* ── 4. Mode Toggle & Share Bar ── */
        .ho-mode-bar { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; margin-bottom: 1.25rem; }
        .ho-mode-toggle { display: flex; gap: .3rem; background: rgba(0,0,0,0.4); border-radius: .75rem; padding: .25rem; border: 1px solid rgba(255,255,255,0.1); }
        .ho-mode-btn {
          padding: .4rem .85rem; border-radius: .6rem; border: none; background: none;
          color: #94a3b8; font-size: .82rem; font-weight: 600; cursor: pointer; font-family: inherit; transition: all .15s;
        }
        .ho-mode-btn-active { background: rgba(255,255,255,0.12); color: #fbbf24; font-weight: 700; }
        .ho-share-btn {
          display: inline-flex; align-items: center; gap: .5rem; padding: .5rem 1.1rem;
          background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%); color: #ffffff;
          border: none; border-radius: .75rem; font-size: .85rem; font-weight: 700; cursor: pointer;
          font-family: inherit; box-shadow: 0 2px 8px rgba(34,197,94,0.3); transition: transform .15s;
        }
        .ho-share-btn:hover { transform: translateY(-1px); }

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
          border-left: 3px solid transparent; transition: background .15s;
        }
        .hs-row:hover { background: rgba(255,255,255,0.04); }
        .hs-row-current { border-left-width: 3px !important; }
        .hs-night-tag { font-size: .7rem; padding: .1rem .4rem; border-radius: .4rem; background: rgba(167,139,250,0.15); color: #c084fc; margin-left: .4rem; }
        @media(max-width:560px) {
          .hs-row { grid-template-columns: 1fr 1fr; row-gap: .25rem; }
          .hs-type { grid-column: 1; }
          .hs-now-badge { grid-column: 2; justify-self: end; }
        }
        .hs-time { font-size: .8rem; color: var(--text-muted,#94a3b8); font-variant-numeric: tabular-nums; white-space: nowrap; }
        .hs-time-sep { margin: 0 .2rem; }
        .hs-planet-col { display: flex; align-items: center; gap: .4rem; flex-wrap: wrap; }
        .hs-symbol { font-size: 1.1rem; }
        .hs-name   { font-size: .9rem; font-weight: 700; }
        .hs-name-en { font-size: .75rem; color: var(--text-muted,#94a3b8); }
        .hs-type   { font-size: .78rem; color: var(--text-muted,#94a3b8); }
        .hs-now-badge {
          font-size: .7rem; font-weight: 700; padding: .2rem .55rem;
          border-radius: 999px; background: rgba(251,191,36,0.2);
          border: 1px solid rgba(251,191,36,0.5); color: #fbbf24; white-space: nowrap;
        }
        .hs-task-badge {
          font-size: .7rem; font-weight: 700; padding: .2rem .55rem;
          border-radius: 999px; background: rgba(251,191,36,0.25);
          border: 1px solid #fbbf24; color: #fbbf24; white-space: nowrap;
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

        /* ── Janma Rasi selector ── */
        .jrs-card { background: rgba(192,132,252,0.06); border: 1px solid rgba(192,132,252,0.25); }
        .jrs-title { font-size: 1rem; font-weight: 700; color: var(--text-light,#e2e8f0); margin-bottom: .85rem; display: flex; align-items: center; gap: .5rem; }
        .jrs-row { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
        .jrs-select {
          flex: 1; min-width: 200px; padding: .6rem 1rem;
          background: rgba(0,0,0,0.4); border: 1px solid rgba(192,132,252,0.3);
          border-radius: .75rem; color: var(--text-light,#e2e8f0);
          font-size: .95rem; font-family: inherit; cursor: pointer;
        }
        .jrs-lord-chip { display: inline-flex; align-items: center; gap: .4rem; padding: .4rem .85rem; border-radius: 999px; font-size: .82rem; font-weight: 600; border: 1px solid rgba(192,132,252,0.3); background: rgba(192,132,252,0.1); color: #c084fc; }

        .hrc-badge { display: inline-block; padding: .2rem .7rem; border-radius: 999px; border: 1px solid; font-size: .78rem; font-weight: 700; }
        .hs-rasi-best  { font-size: 1rem; }
        .hs-rasi-avoid { font-size: 1rem; opacity: .8; }

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

        .gr-card { background: rgba(251,191,36,0.05); border: 1px solid rgba(251,191,36,0.2); }
        .gr-title { font-size: 1rem; font-weight: 700; color: var(--text-light,#e2e8f0); margin-bottom: .85rem; }
        .gr-rule { display: flex; gap: .65rem; padding: .7rem 0; border-bottom: 1px solid rgba(255,255,255,0.06); font-size: .88rem; color: var(--text-muted,#94a3b8); line-height: 1.65; }
        .gr-rule:last-child { border-bottom: none; }
        .gr-icon { flex-shrink: 0; font-size: 1.1rem; }

        .ho-disclaimer { margin-top: 2rem; padding: 1rem 1.25rem; border-radius: .85rem; background: rgba(234,179,8,0.07); border: 1px solid rgba(234,179,8,0.2); font-size: .82rem; color: rgba(253,224,71,0.85); line-height: 1.6; }
      `}</style>

      <main className="ho-page">
        <div className="ho-container">

          {/* ── Hero ── */}
          <div className="ho-hero">
            <div className="ho-hero-badge">🪐 ஜோதிடம் &nbsp;|&nbsp; Jyotish Horai &amp; Panchangam</div>
            <h1>ஓரை கணிப்பு &amp; பஞ்சாங்கம்</h1>
            <p className="ho-hero-sub">
              இன்றைய கிரக ஓரைகள், ராகு காலம், எமகண்டம் மற்றும் சுப / அசுப நேரங்களை அறிந்து கொள்ளுங்கள்.
              <br />
              <em style={{ fontSize: '.88rem', opacity: .75 }}>Find today's planetary hours, Rahu Kalam, Yamagandam &amp; auspicious timings.</em>
            </p>
          </div>

          {/* ── Main Day Card ── */}
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
              janmaRasiId={janmaRasiId}
            />

            {/* ── Location & Sunrise/Sunset Controls ── */}
            <div className="ho-location-box">
              <div className="ho-loc-header">
                <div className="ho-loc-title">
                  📍 இருப்பிடம் &amp; சூரிய உதய / அஸ்தமன நேரம்
                </div>
                <div className="ho-loc-actions">
                  <button 
                    type="button" 
                    className="ho-loc-btn" 
                    onClick={detectLocation}
                    disabled={isLocating}
                  >
                    {isLocating ? '⌛ கண்டறிகிறது...' : '📍 இருப்பிடத்தைக் கண்டறி'}
                  </button>
                  <select 
                    className="ho-city-select"
                    value={selectedCity}
                    onChange={handleCityChange}
                  >
                    <option value="">-- நகரம் தேர்ந்தெடுக்கவும் --</option>
                    {CITIES.map(c => (
                      <option key={c.name} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="ho-loc-status">
                📍 <strong>{locationName}</strong>
                {coords && <span className="ho-coords">({coords.lat}°, {coords.lng}°)</span>}
              </div>

              <div className="ho-sunrise-bar">
                <div className="ho-sunrise-info">
                  <span className="ho-sunrise-time">🌅 உதயம்: <strong>{fmt12(sunriseHour, sunriseMin)}</strong></span>
                  <span className="ho-sunset-time" style={{ color: '#e2e8f0' }}>🌇 அஸ்தமனம்: <strong>{fmt12(sunsetHour, sunsetMin)}</strong></span>
                  <span className="ho-api-badge">sunrisesunset.io API</span>
                  {isFetchingApi && <span style={{ color: '#fbbf24', fontSize: '.8rem' }}>⌛ புதுப்பிக்கிறது...</span>}
                  {apiError && <span style={{ color: '#fca5a5', fontSize: '.8rem' }}>⚠️ {apiError}</span>}
                </div>

                <div className="ho-manual-controls">
                  <span className="ho-manual-label">கைமுறை உதயம்:</span>
                  <input
                    className="ho-sunrise-input"
                    type="number" min="0" max="23" value={sunriseHour}
                    onChange={e => setSunriseHour(Number(e.target.value))}
                    title="Sunrise hour"
                  />
                  <span style={{ color: '#94a3b8' }}>:</span>
                  <input
                    className="ho-sunrise-input"
                    type="number" min="0" max="59" value={sunriseMin}
                    onChange={e => setSunriseMin(Number(e.target.value))}
                    title="Sunrise minute"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ── 1. Panchangam Timings (Rahu Kalam, Yamagandam, Gulika) ── */}
          <div className="pk-grid">
            <div className="pk-card pk-card-rahu">
              <div className="pk-title" style={{ color: '#fca5a5' }}>
                <span>🚫 ராகு காலம் (Rahu Kalam)</span>
                <span className="pk-badge" style={{ background: 'rgba(239,68,68,0.2)', color: '#fca5a5' }}>தவிர்க்கவும்</span>
              </div>
              <div className="pk-time" style={{ color: '#f8fafc' }}>{panchangam.rahu.text}</div>
            </div>

            <div className="pk-card pk-card-yama">
              <div className="pk-title" style={{ color: '#fde047' }}>
                <span>⚡ எமகண்டம் (Yamagandam)</span>
                <span className="pk-badge" style={{ background: 'rgba(234,179,8,0.2)', color: '#fde047' }}>எச்சரிக்கை</span>
              </div>
              <div className="pk-time" style={{ color: '#f8fafc' }}>{panchangam.yama.text}</div>
            </div>

            <div className="pk-card pk-card-guli">
              <div className="pk-title" style={{ color: '#6ee7b7' }}>
                <span>✨ குளிகை காலம் (Gulika Kalam)</span>
                <span className="pk-badge" style={{ background: 'rgba(16,185,129,0.2)', color: '#6ee7b7' }}>சுப நேரம்</span>
              </div>
              <div className="pk-time" style={{ color: '#f8fafc' }}>{panchangam.guli.text}</div>
            </div>
          </div>

          {/* ── 3. Task Recommender Filter Bar ── */}
          <div className="ho-card tr-box">
            <div className="tr-header">
              🎯 எந்த காரியத்திற்கு உகந்த ஓரை? (Task-based Horai Filter)
            </div>
            <div className="tr-chips">
              {TASK_CATEGORIES.map(t => (
                <button
                  key={t.id}
                  type="button"
                  className={`tr-chip ${activeTask === t.id ? 'tr-chip-active' : ''}`}
                  onClick={() => setActiveTask(t.id)}
                >
                  {t.icon} {t.name}
                </button>
              ))}
            </div>
          </div>

          {/* ── 4. Mode Toggle & 7. Social Share Bar ── */}
          <div className="ho-mode-bar">
            <div className="ho-mode-toggle">
              <button
                type="button"
                className={`ho-mode-btn ${horaiMode === 'equal' ? 'ho-mode-btn-active' : ''}`}
                onClick={() => setHoraiMode('equal')}
              >
                ⏱️ 60 நிமிட ஓரை
              </button>
              <button
                type="button"
                className={`ho-mode-btn ${horaiMode === 'proportional' ? 'ho-mode-btn-active' : ''}`}
                onClick={() => setHoraiMode('proportional')}
              >
                🌌 வானியல் ஓரை (Astro)
              </button>
            </div>

            <button type="button" className="ho-share-btn" onClick={handleShare}>
              📲 வாட்ஸ்அப்பில் பகிர (Share)
            </button>
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

          {/* ── Today Schedule ── */}
          {activeTab === 'today' && (
            <div className="ho-card" style={{ padding: '1.5rem 1rem' }}>
              {visibleSlots.map((slot, i) => {
                const isTaskMatch = activeTask !== 'all' && taskPlanets.includes(slot.planet);
                return (
                  <ScheduleRow
                    key={i}
                    slot={slot}
                    isCurrent={i === currentIndex}
                    janmaRasiId={janmaRasiId}
                    isTaskMatch={isTaskMatch}
                  />
                );
              })}
              <button className="ho-show-more" onClick={() => setShowAll(s => !s)}>
                {showAll ? '▲ குறைவாக காட்டு' : `▼ அனைத்தும் காட்டு (${schedule.length} ஓரைகள்)`}
              </button>
            </div>
          )}

          {/* ── Planet Details ── */}
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
            ⚠️ <strong>குறிப்பு:</strong> இந்த கணிப்பு பொதுவான ஜோதிட வழிகாட்டுதலாகும். உங்கள் ஊரின் சூரிய உதய மற்றும் அஸ்தமன நேரத்தை சரிபார்க்கவும்.
            <br />
            <em style={{ opacity: .75 }}>Adjust sunrise/sunset time to match your location. Consult a qualified astrologer for important decisions.</em>
          </div>

        </div>
      </main>
    </>
  );
}
