'use client';

import { useState, useEffect } from 'react';

const EVENT_TYPES = [
  {
    id: 'b2b',
    icon: '💼',
    title: 'வணிகக் களம்',
    titleEn: 'B2B Networking',
    desc: 'தொழில் முனைவோர் நெட்வொர்க், கூட்டு வியாபாரம் & புதிய வாய்ப்புகள்',
    tag: 'மாதம் 2 முறை',
    accent: '#38bdf8',
    gradient: 'linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(59, 130, 246, 0.08))',
  },
  {
    id: 'career',
    icon: '🎓',
    title: 'கல்வி & வேலைவாய்ப்பு',
    titleEn: 'Career Guidance',
    desc: 'TNPSC, UPSC, கல்லூரி வழிகாட்டல், மென்பொருள் & வெளிநாட்டு வேலைவாய்ப்பு',
    tag: 'வார இறுதி',
    accent: '#a855f7',
    gradient: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(236, 72, 153, 0.08))',
  },
  {
    id: 'heritage',
    icon: '📜',
    title: 'வரலாறு & வாழ்வியல்',
    titleEn: 'Cultural Heritage',
    desc: 'குல வரலாறு, கல்வெட்டு சான்றுகள், பண்பாடு மற்றும் குடும்ப நல்வாழ்வு',
    tag: 'மாதாந்திர சந்திப்பு',
    accent: '#fbbf24',
    gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15), rgba(245, 158, 11, 0.08))',
  },
];

const ADMIN_STATIC_PASSCODE = 'uppiliya2026';

const TAMIL_MONTHS = ['ஜன', 'பிப்', 'மார்', 'ஏப்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆக', 'செப்', 'அக்', 'நவ', 'டிச'];
const TAMIL_DAYS = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];

function formatTamilDate(dateStr) {
  if (!dateStr) return 'வரவிருக்கும் தேதி';
  try {
    const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, '0');
    const month = TAMIL_MONTHS[d.getMonth()];
    const weekday = TAMIL_DAYS[d.getDay()];
    return `${month} ${day}, ${weekday}`;
  } catch {
    return dateStr;
  }
}

function formatTamilTime(timeStr) {
  if (!timeStr) return '';
  // Parse standard ISO datetime like createdAt (e.g. "2026-02-09T19:00:00.000Z")
  if (timeStr.includes('T') || (timeStr.includes('-') && !isNaN(Date.parse(timeStr)))) {
    const d = new Date(timeStr);
    if (!isNaN(d.getTime())) {
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      let periodTamil = 'காலை';
      if (hours >= 12 && hours < 16) periodTamil = 'பிற்பகல்';
      else if (hours >= 16 && hours < 20) periodTamil = 'மாலை';
      else if (hours >= 20 || hours < 4) periodTamil = 'இரவு';
      const displayHours = hours % 12 || 12;
      return `${periodTamil} ${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`;
    }
  }

  // Parse standard 24hr "19:00" format
  if (/^\d{1,2}:\d{2}/.test(timeStr)) {
    const parts = timeStr.split(':');
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1] ? parts[1].slice(0, 2) : '00';
    const ampm = hours >= 12 ? 'PM' : 'AM';
    let periodTamil = 'காலை';
    if (hours >= 12 && hours < 16) periodTamil = 'பிற்பகல்';
    else if (hours >= 16 && hours < 20) periodTamil = 'மாலை';
    else if (hours >= 20 || hours < 4) periodTamil = 'இரவு';
    const displayHours = hours % 12 || 12;
    return `${periodTamil} ${String(displayHours).padStart(2, '0')}:${minutes} ${ampm}`;
  }

  return timeStr;
}

export default function OnlineEventsSection() {
  const [events, setEvents] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [rsvpState, setRsvpState] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [adminAuthModalOpen, setAdminAuthModalOpen] = useState(false);
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] = useState(null);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [adminPasswordError, setAdminPasswordError] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [loading, setLoading] = useState(true);

  // Form State for creating / editing a meeting
  const [formData, setFormData] = useState({
    title: '',
    titleEn: '',
    category: 'career',
    date: '',
    time: '19:00',
    platform: 'Google Meet',
    joinLink: '',
    host: '',
    hostContact: '',
    description: '',
  });

  // Fetch events from API / JSON on mount
  useEffect(() => {
    fetchEvents();
    try {
      const savedRsvps = localStorage.getItem('uppiliya_events_rsvp');
      if (savedRsvps) setRsvpState(JSON.parse(savedRsvps));

      const isAuthed = sessionStorage.getItem('uppiliya_admin_authed');
      if (isAuthed === 'true') setIsAdminAuthenticated(true);
    } catch {}
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setEvents(data);
        }
      }
    } catch (e) {
      console.warn('Events fetch error:', e);
    } finally {
      setLoading(false);
    }
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 4500);
  };

  // Open Add Meeting flow
  const handleOpenAddMeeting = () => {
    if (!isAdminAuthenticated) {
      setPendingAdminAction({ type: 'add' });
      setAdminPasswordInput('');
      setAdminPasswordError(false);
      setAdminAuthModalOpen(true);
      return;
    }

    setEditingEventId(null);
    setFormData({
      title: '',
      titleEn: '',
      category: 'career',
      date: '',
      time: '19:00',
      platform: 'Google Meet',
      joinLink: '',
      host: '',
      hostContact: '',
      description: '',
    });
    setModalOpen(true);
  };

  // Open Edit Meeting flow
  const handleOpenEditMeeting = (evt) => {
    if (!isAdminAuthenticated) {
      setPendingAdminAction({ type: 'edit', evt });
      setAdminPasswordInput('');
      setAdminPasswordError(false);
      setAdminAuthModalOpen(true);
      return;
    }

    let extractedTime = '19:00';
    if (evt.time) {
      if (evt.time.includes('T')) {
        const d = new Date(evt.time);
        if (!isNaN(d.getTime())) {
          const h = String(d.getHours()).padStart(2, '0');
          const m = String(d.getMinutes()).padStart(2, '0');
          extractedTime = `${h}:${m}`;
        }
      } else if (/^\d{1,2}:\d{2}/.test(evt.time)) {
        extractedTime = evt.time.slice(0, 5);
      }
    }

    setEditingEventId(evt.id);
    setFormData({
      title: evt.title || '',
      titleEn: evt.titleEn || '',
      category: evt.category || 'career',
      date: evt.date || '',
      time: extractedTime,
      platform: evt.platform || 'Google Meet',
      joinLink: evt.joinLink || '',
      host: evt.host || '',
      hostContact: evt.hostContact || '',
      description: evt.description || '',
    });
    setModalOpen(true);
  };

  // Delete Meeting Flow
  const handleDeleteMeeting = async (evtId) => {
    if (!isAdminAuthenticated) {
      setPendingAdminAction({ type: 'delete', evtId });
      setAdminPasswordInput('');
      setAdminPasswordError(false);
      setAdminAuthModalOpen(true);
      return;
    }

    const confirmed = window.confirm('நிச்சயமாக இந்த ஆன்லைன் கூட்டத்தை நீக்க விரும்புகிறீர்களா? (Delete this meeting?)');
    if (!confirmed) return;

    setEvents((prev) => prev.filter((e) => e.id !== evtId));
    showToast('🗑️ கூட்டம் நீக்கப்பட்டது.');

    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', eventId: evtId }),
      });
    } catch (e) {
      console.error('Delete error:', e);
    }
  };

  // Admin Logout Flow
  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      sessionStorage.removeItem('uppiliya_admin_authed');
    } catch {}
    showToast('🔒 நிர்வாகி அமர்வு முடிந்தது (Logged out)');
  };

  // Verify Admin Static Password
  const handleAdminAuthSubmit = (e) => {
    e.preventDefault();
    if (adminPasswordInput.trim() === ADMIN_STATIC_PASSCODE) {
      setIsAdminAuthenticated(true);
      try {
        sessionStorage.setItem('uppiliya_admin_authed', 'true');
      } catch {}
      setAdminAuthModalOpen(false);
      showToast('🔓 நிர்வாகி அனுமதி உறுதியானது!');

      // Execute pending action
      if (pendingAdminAction) {
        if (pendingAdminAction.type === 'add') {
          setEditingEventId(null);
          setFormData({
            title: '',
            titleEn: '',
            category: 'career',
            date: '',
            time: '19:00',
            platform: 'Google Meet',
            joinLink: '',
            host: '',
            hostContact: '',
            description: '',
          });
          setModalOpen(true);
        } else if (pendingAdminAction.type === 'edit' && pendingAdminAction.evt) {
          const evt = pendingAdminAction.evt;
          let extractedTime = '19:00';
          if (evt.time) {
            if (evt.time.includes('T')) {
              const d = new Date(evt.time);
              if (!isNaN(d.getTime())) {
                const h = String(d.getHours()).padStart(2, '0');
                const m = String(d.getMinutes()).padStart(2, '0');
                extractedTime = `${h}:${m}`;
              }
            } else if (/^\d{1,2}:\d{2}/.test(evt.time)) {
              extractedTime = evt.time.slice(0, 5);
            }
          }
          setEditingEventId(evt.id);
          setFormData({
            title: evt.title || '',
            titleEn: evt.titleEn || '',
            category: evt.category || 'career',
            date: evt.date || '',
            time: extractedTime,
            platform: evt.platform || 'Google Meet',
            joinLink: evt.joinLink || '',
            host: evt.host || '',
            hostContact: evt.hostContact || '',
            description: evt.description || '',
          });
          setModalOpen(true);
        } else if (pendingAdminAction.type === 'delete' && pendingAdminAction.evtId) {
          handleDeleteMeeting(pendingAdminAction.evtId);
        }
        setPendingAdminAction(null);
      } else {
        setModalOpen(true);
      }
    } else {
      setAdminPasswordError(true);
    }
  };

  // Direct 1-Click Meeting Join (No password needed)
  const handleDirectJoin = (evt) => {
    if (!evt.joinLink) return;
    const cleanUrl = evt.joinLink.startsWith('http') ? evt.joinLink : `https://${evt.joinLink}`;
    window.open(cleanUrl, '_blank');
  };

  const handleRsvpToggle = async (evtId) => {
    const isCurrentlyRsvpd = !!rsvpState[evtId];
    const newStatus = !isCurrentlyRsvpd;

    setRsvpState((prev) => {
      const next = { ...prev, [evtId]: newStatus };
      try {
        localStorage.setItem('uppiliya_events_rsvp', JSON.stringify(next));
      } catch {}
      return next;
    });

    setEvents((prev) =>
      prev.map((e) => {
        if (e.id === evtId) {
          return {
            ...e,
            attendees: Math.max(0, (e.attendees || 0) + (newStatus ? 1 : -1)),
          };
        }
        return e;
      })
    );

    showToast(newStatus ? '✓ உங்கள் பதிவு உறுதியானது!' : 'பதிவு நீக்கப்பட்டது.');

    try {
      await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'rsvp',
          eventId: evtId,
          increment: newStatus,
        }),
      });
    } catch (e) {
      console.warn('RSVP sync error:', e);
    }
  };

  const handleCreateOrUpdateEvent = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.date || !formData.host.trim() || !formData.joinLink.trim()) {
      alert('தயவுசெய்து தலைப்பு, தேதி, இணைப்பு மற்றும் ஒருங்கிணைப்பாளர் பெயரை உள்ளிடவும்.');
      return;
    }

    const categoryNames = {
      career: 'கல்வி & வேலைவாய்ப்பு',
      b2b: 'வணிகக் களம்',
      heritage: 'வரலாறு & வாழ்வியல்',
      general: 'பொதுக் கலந்துரையாடல்',
    };

    const badgeColors = {
      career: '#a855f7',
      b2b: '#38bdf8',
      heritage: '#fbbf24',
      general: '#34d399',
    };

    let platformIcon = '💻';
    const pLower = (formData.platform || '').toLowerCase();
    if (pLower.includes('meet') || pLower.includes('google')) platformIcon = '🟢';
    else if (pLower.includes('zoom')) platformIcon = '🔵';
    else if (pLower.includes('youtube') || pLower.includes('live')) platformIcon = '🔴';
    else if (pLower.includes('whatsapp')) platformIcon = '🟢';
    else if (pLower.includes('team') || pLower.includes('webex') || pLower.includes('jio')) platformIcon = '🟣';

    let isoTime = new Date().toISOString();
    if (formData.date && formData.time) {
      try {
        const timeVal = formData.time.includes('T') ? formData.time : `${formData.date}T${formData.time.length === 5 ? formData.time + ':00' : formData.time}`;
        const d = new Date(timeVal);
        if (!isNaN(d.getTime())) {
          isoTime = d.toISOString();
        }
      } catch {}
    }

    if (editingEventId) {
      // UPDATE EXISTING EVENT
      const updatedEvent = {
        id: editingEventId,
        category: formData.category,
        categoryName: categoryNames[formData.category] || 'கூட்டம்',
        badgeColor: badgeColors[formData.category] || '#38bdf8',
        title: formData.title.trim(),
        titleEn: formData.titleEn.trim() || 'Community Online Meetup',
        date: formData.date,
        dateFormatted: formatTamilDate(isoTime),
        time: isoTime,
        platform: formData.platform.trim() || 'Online Meet',
        platformIcon: platformIcon,
        host: formData.host.trim(),
        hostContact: formData.hostContact.trim(),
        description: formData.description.trim() || 'அனைவரும் வருக!',
        joinLink: formData.joinLink.trim(),
      };

      setEvents((prev) => prev.map((e) => (e.id === editingEventId ? { ...e, ...updatedEvent } : e)));
      setModalOpen(false);
      setEditingEventId(null);
      showToast('✓ கூட்ட விவரங்கள் வெற்றிகரமாக புதுப்பிக்கப்பட்டது!');

      try {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'update', event: updatedEvent }),
        });
      } catch (err) {
        console.error('Failed to update event:', err);
      }
    } else {
      // CREATE NEW EVENT
      const newEvent = {
        id: `evt-${Date.now()}`,
        category: formData.category,
        categoryName: categoryNames[formData.category] || 'கூட்டம்',
        badgeColor: badgeColors[formData.category] || '#38bdf8',
        title: formData.title.trim(),
        titleEn: formData.titleEn.trim() || 'Community Online Meetup',
        date: formData.date,
        dateFormatted: formatTamilDate(isoTime),
        time: isoTime,
        platform: formData.platform.trim() || 'Online Meet',
        platformIcon: platformIcon,
        host: formData.host.trim(),
        hostContact: formData.hostContact.trim(),
        description: formData.description.trim() || 'அனைவரும் வருக!',
        joinLink: formData.joinLink.trim(),
        attendees: 1,
        createdAt: new Date().toISOString(),
      };

      const updatedEvents = [newEvent, ...events];
      setEvents(updatedEvents);
      setModalOpen(false);
      showToast('🎉 புதிய கூட்டம் வெற்றிகரமாக சேர்க்கப்பட்டது!');

      try {
        await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'add', event: newEvent }),
        });
      } catch (err) {
        console.error('Failed to save to server:', err);
      }
    }

    setFormData({
      title: '',
      titleEn: '',
      category: 'career',
      date: '',
      time: '19:00',
      platform: 'Google Meet',
      joinLink: '',
      host: '',
      hostContact: '',
      description: '',
    });
  };

  const filteredEvents =
    selectedFilter === 'all'
      ? events
      : events.filter((e) => e.category === selectedFilter);

  return (
    <section className="events-section-wrapper" id="online-events" suppressHydrationWarning>
      <style suppressHydrationWarning>{`
        .events-section-wrapper {
          background-color: #0d1117;
          color: #f0f6fc;
          font-family: 'Outfit', 'Noto Sans Tamil', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          padding: clamp(2.5rem, 6vw, 4.5rem) clamp(1rem, 4vw, 2rem);
          border-top: 1px solid #21262d;
          border-bottom: 1px solid #21262d;
          position: relative;
          overflow: hidden;
        }

        .events-ambient-glow {
          position: absolute;
          top: -120px;
          right: 10%;
          width: 500px;
          height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(56, 189, 248, 0.12) 0%, rgba(168, 85, 247, 0.06) 45%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .events-container {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        /* ── Header ── */
        .events-header {
          text-align: center;
          max-width: 820px;
          margin: 0 auto 2.5rem;
        }

        .events-eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          padding: 0.35rem 0.95rem;
          border-radius: 999px;
          background: rgba(56, 189, 248, 0.1);
          border: 1px solid rgba(56, 189, 248, 0.28);
          color: #38bdf8;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.03em;
          margin-bottom: 0.9rem;
          text-transform: uppercase;
        }

        .events-title {
          font-size: clamp(1.45rem, 3.8vw, 2.25rem);
          font-weight: 800;
          line-height: 1.28;
          color: #ffffff;
          margin-bottom: 0.75rem;
          letter-spacing: -0.02em;
        }

        .events-title-gradient {
          background: linear-gradient(135deg, #38bdf8 0%, #a855f7 70%, #ec4899 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .events-desc {
          font-size: clamp(0.92rem, 2.2vw, 1.05rem);
          color: #94a3b8;
          line-height: 1.6;
          margin-bottom: 1.25rem;
        }

        .events-header-actions {
          display: flex;
          justify-content: center;
          gap: 0.75rem;
          flex-wrap: wrap;
        }

        .btn-add-meeting-hero {
          background: linear-gradient(135deg, #38bdf8, #3b82f6);
          color: #0b1120;
          border: none;
          padding: 0.65rem 1.35rem;
          border-radius: 10px;
          font-size: 0.92rem;
          font-weight: 800;
          cursor: pointer;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          box-shadow: 0 4px 18px rgba(56, 189, 248, 0.35);
          transition: all 0.2s;
        }
        .btn-add-meeting-hero:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(56, 189, 248, 0.5);
          background: #ffffff;
          color: #0284c7;
        }

        .btn-admin-logout-hero {
          background: rgba(248, 113, 113, 0.12);
          border: 1px solid rgba(248, 113, 113, 0.35);
          color: #f87171;
          padding: 0.65rem 1.15rem;
          border-radius: 10px;
          font-size: 0.88rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          transition: all 0.2s;
        }
        .btn-admin-logout-hero:hover {
          background: #f87171;
          color: #0b1120;
          box-shadow: 0 4px 14px rgba(248, 113, 113, 0.4);
        }

        .btn-admin-logout-mini {
          background: rgba(248, 113, 113, 0.12);
          border: 1px solid rgba(248, 113, 113, 0.35);
          color: #f87171;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.22rem 0.55rem;
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          transition: all 0.15s;
        }
        .btn-admin-logout-mini:hover {
          background: #f87171;
          color: #0b1120;
        }

        /* ── 3 Event Type Badge Cards ── */
        .event-types-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1.15rem;
          margin-bottom: 2.25rem;
        }

        @media (max-width: 860px) {
          .event-types-grid {
            grid-template-columns: 1fr;
            gap: 0.85rem;
          }
        }

        .event-type-card {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 12px;
          padding: 1.25rem 1.15rem;
          transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .event-type-card:hover {
          transform: translateY(-3px);
          border-color: var(--card-border-hover, #38bdf8);
          box-shadow: 0 12px 28px rgba(0, 0, 0, 0.45), 0 0 20px rgba(56, 189, 248, 0.12);
        }

        .event-type-card.active {
          border-color: #38bdf8;
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.3), 0 12px 28px rgba(0, 0, 0, 0.5);
        }

        .event-type-top {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.85rem;
        }

        .event-type-icon-box {
          width: 44px;
          height: 44px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.45rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .event-type-tag {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.22rem 0.6rem;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.12);
          color: #cbd5e1;
        }

        .event-type-title {
          font-size: 1.05rem;
          font-weight: 800;
          color: #f0f6fc;
          margin-bottom: 0.2rem;
        }

        .event-type-subtitle {
          font-size: 0.78rem;
          font-weight: 600;
          color: #38bdf8;
          margin-bottom: 0.45rem;
        }

        .event-type-desc {
          font-size: 0.83rem;
          color: #8b949e;
          line-height: 1.45;
        }

        /* ── Main Embed App Window Container ── */
        .embed-window-card {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 12px;
          box-shadow: 0 20px 48px rgba(0, 0, 0, 0.65), 0 0 32px rgba(56, 189, 248, 0.07);
          overflow: hidden;
          position: relative;
        }

        .embed-window-bar {
          background: #0d1117;
          border-bottom: 1px solid #30363d;
          padding: 0.85rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        .window-dots-wrap {
          display: flex;
          align-items: center;
          gap: 0.45rem;
        }

        .window-dot {
          width: 11px;
          height: 11px;
          border-radius: 50%;
        }
        .dot-red { background: #ff5f56; }
        .dot-yellow { background: #ffbd2e; }
        .dot-green { background: #27c93f; }

        .window-title-tag {
          display: flex;
          align-items: center;
          gap: 0.45rem;
          font-size: 0.84rem;
          font-weight: 700;
          color: #e6edf3;
          margin-left: 0.5rem;
        }

        .window-live-indicator {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 10px #22c55e;
          animation: livePulse 1.8s infinite;
        }

        @keyframes livePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.6; }
        }

        .admin-status-badge {
          background: rgba(234, 179, 8, 0.12);
          border: 1px solid rgba(234, 179, 8, 0.35);
          color: #facc15;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 0.2rem 0.55rem;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
        }

        .window-right-actions {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          flex-wrap: wrap;
        }

        .embed-filter-tabs {
          display: flex;
          gap: 0.35rem;
          background: #161b22;
          padding: 0.25rem;
          border-radius: 8px;
          border: 1px solid #30363d;
        }

        .embed-filter-btn {
          background: transparent;
          border: none;
          color: #8b949e;
          font-size: 0.78rem;
          font-weight: 600;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
        }

        .embed-filter-btn:hover {
          color: #f0f6fc;
          background: rgba(255, 255, 255, 0.05);
        }

        .embed-filter-btn.active {
          background: #1f6feb;
          color: #ffffff;
          font-weight: 700;
        }

        .btn-quick-add {
          background: rgba(56, 189, 248, 0.15);
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #38bdf8;
          font-size: 0.78rem;
          font-weight: 700;
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          font-family: inherit;
          transition: all 0.2s;
        }
        .btn-quick-add:hover {
          background: #38bdf8;
          color: #0b1120;
        }

        .embed-window-body {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.15rem;
        }

        @media (max-width: 600px) {
          .embed-window-body {
            padding: 1rem;
          }
        }

        .feed-event-item {
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 10px;
          padding: 1.25rem;
          display: grid;
          grid-template-columns: auto 1fr auto;
          gap: 1.25rem;
          align-items: center;
          transition: all 0.2s ease;
          position: relative;
        }

        .feed-event-item:hover {
          border-color: #58a6ff;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.45);
          transform: translateY(-1px);
        }

        @media (max-width: 820px) {
          .feed-event-item {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
        }

        .feed-date-badge {
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 10px;
          padding: 0.75rem 0.95rem;
          text-align: center;
          min-width: 105px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .feed-date-main {
          font-size: 0.95rem;
          font-weight: 800;
          color: #38bdf8;
          line-height: 1.2;
        }

        .feed-date-time {
          font-size: 0.72rem;
          color: #8b949e;
          margin-top: 0.35rem;
          font-weight: 500;
        }

        .feed-info-col {
          min-width: 0;
        }

        .feed-meta-row {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          margin-bottom: 0.45rem;
          flex-wrap: wrap;
        }

        .feed-category-pill {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 0.15rem 0.55rem;
          border-radius: 999px;
          border: 1px solid;
        }

        .feed-platform-pill {
          font-size: 0.72rem;
          color: #cbd5e1;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.15rem 0.55rem;
          border-radius: 6px;
        }

        .feed-attendees {
          font-size: 0.72rem;
          color: #8b949e;
        }

        .feed-event-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: #f0f6fc;
          line-height: 1.35;
          margin-bottom: 0.2rem;
        }

        .feed-event-title-en {
          font-size: 0.8rem;
          color: #7d8590;
          margin-bottom: 0.35rem;
        }

        .feed-event-desc {
          font-size: 0.82rem;
          color: #8b949e;
          line-height: 1.45;
          margin-bottom: 0.45rem;
        }

        .feed-host-text {
          font-size: 0.78rem;
          color: #94a3b8;
          display: flex;
          align-items: center;
          gap: 0.35rem;
          flex-wrap: wrap;
        }

        .admin-item-controls {
          display: flex;
          gap: 0.45rem;
          margin-top: 0.6rem;
          padding-top: 0.45rem;
          border-top: 1px dashed #30363d;
        }

        .btn-admin-edit, .btn-admin-delete {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #30363d;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          font-family: inherit;
          transition: all 0.2s;
        }
        .btn-admin-edit {
          color: #38bdf8;
          border-color: rgba(56, 189, 248, 0.3);
        }
        .btn-admin-edit:hover {
          background: rgba(56, 189, 248, 0.15);
          border-color: #38bdf8;
        }
        .btn-admin-delete {
          color: #f87171;
          border-color: rgba(248, 113, 113, 0.3);
        }
        .btn-admin-delete:hover {
          background: rgba(248, 113, 113, 0.15);
          border-color: #f87171;
        }

        /* Actions Column */
        .feed-action-col {
          display: flex;
          flex-direction: column;
          gap: 0.45rem;
          align-items: stretch;
          min-width: 170px;
        }

        .btn-join-meet {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #ffffff;
          border: none;
          padding: 0.65rem 1rem;
          border-radius: 8px;
          font-size: 0.84rem;
          font-weight: 800;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.4rem;
          box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);
          transition: all 0.2s;
          text-align: center;
          font-family: inherit;
        }
        .btn-join-meet:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
          background: linear-gradient(135deg, #34d399, #10b981);
        }

        .btn-rsvp {
          background: #21262d;
          color: #c9d1d9;
          border: 1px solid #30363d;
          padding: 0.45rem 0.85rem;
          border-radius: 8px;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
          font-family: inherit;
        }
        .btn-rsvp:hover {
          background: #30363d;
          color: #f0f6fc;
        }
        .btn-rsvp.registered {
          background: rgba(35, 134, 54, 0.2);
          border-color: #238636;
          color: #3fb950;
          font-weight: 700;
        }

        .feed-secondary-actions {
          display: flex;
          gap: 0.35rem;
        }

        .btn-cal-add, .btn-wa-share {
          flex: 1;
          background: transparent;
          border: 1px solid #30363d;
          color: #8b949e;
          padding: 0.38rem 0.5rem;
          border-radius: 6px;
          font-size: 0.72rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.15s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.25rem;
          text-decoration: none;
        }
        .btn-cal-add:hover {
          color: #c9d1d9;
          border-color: #8b949e;
          background: rgba(255, 255, 255, 0.04);
        }
        .btn-wa-share:hover {
          color: #25D366;
          border-color: rgba(37, 211, 102, 0.4);
          background: rgba(37, 211, 102, 0.08);
        }

        .feed-empty-state {
          text-align: center;
          padding: 3rem 1.5rem;
          color: #8b949e;
        }

        .embed-window-footer {
          background: #0d1117;
          border-top: 1px solid #30363d;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.84rem;
          color: #8b949e;
        }

        .host-meeting-prompt {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-host-suggest {
          background: linear-gradient(135deg, rgba(56, 189, 248, 0.15), rgba(168, 85, 247, 0.15));
          border: 1px solid rgba(56, 189, 248, 0.4);
          color: #38bdf8;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-size: 0.82rem;
          font-weight: 700;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }
        .btn-host-suggest:hover {
          background: #38bdf8;
          color: #0b1120;
          box-shadow: 0 4px 14px rgba(56, 189, 248, 0.35);
        }

        /* ── Modals (Create Event & Admin Auth) ── */
        .event-modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.82);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: modalFadeIn 0.2s ease-out;
        }

        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .event-modal-card {
          background: #161b22;
          border: 1px solid #30363d;
          border-radius: 16px;
          max-width: 580px;
          width: 100%;
          padding: 1.75rem;
          color: #f0f6fc;
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(56, 189, 248, 0.15);
        }

        .admin-modal-card {
          max-width: 440px;
          text-align: center;
        }

        .event-modal-close {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          background: rgba(255, 255, 255, 0.08);
          border: none;
          color: #8b949e;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.1rem;
        }
        .event-modal-close:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #fff;
        }

        .event-form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.85rem;
        }
        @media (max-width: 540px) {
          .event-form-grid {
            grid-template-columns: 1fr;
          }
        }

        .form-group {
          margin-bottom: 0.9rem;
        }
        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          display: block;
          font-size: 0.8rem;
          font-weight: 700;
          color: #cbd5e1;
          margin-bottom: 0.35rem;
          text-align: left;
        }

        .form-input, .form-select, .form-textarea {
          width: 100%;
          background: #0d1117;
          border: 1px solid #30363d;
          border-radius: 8px;
          padding: 0.65rem 0.85rem;
          color: #f0f6fc;
          font-size: 0.88rem;
          font-family: inherit;
          outline: none;
          transition: border-color 0.2s;
        }
        .form-input:focus, .form-select:focus, .form-textarea:focus {
          border-color: #38bdf8;
          box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
        }

        .form-input[type="date"], .form-input[type="time"], .form-input[type="datetime-local"] {
          color-scheme: dark;
          cursor: pointer;
        }

        .form-input[type="date"]::-webkit-calendar-picker-indicator,
        .form-input[type="time"]::-webkit-calendar-picker-indicator,
        .form-input[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(0.85) brightness(1.2);
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background 0.15s;
        }

        .form-input[type="date"]::-webkit-calendar-picker-indicator:hover,
        .form-input[type="time"]::-webkit-calendar-picker-indicator:hover,
        .form-input[type="datetime-local"]::-webkit-calendar-picker-indicator:hover {
          background: rgba(56, 189, 248, 0.25);
        }

        .btn-submit-event {
          width: 100%;
          padding: 0.8rem;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #38bdf8, #3b82f6);
          color: #0b1120;
          font-size: 0.95rem;
          font-weight: 800;
          cursor: pointer;
          font-family: inherit;
          box-shadow: 0 4px 16px rgba(56, 189, 248, 0.4);
          transition: all 0.2s;
        }
        .btn-submit-event:hover {
          background: #ffffff;
          color: #0284c7;
          transform: translateY(-2px);
        }

        .passcode-box {
          background: rgba(56, 189, 248, 0.08);
          border: 1px solid rgba(56, 189, 248, 0.25);
          border-radius: 12px;
          padding: 1.25rem;
          margin: 1.25rem 0;
        }

        .passcode-hint {
          font-size: 0.78rem;
          color: #94a3b8;
          margin-top: 0.65rem;
          line-height: 1.4;
        }

        .events-toast {
          position: fixed;
          bottom: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: #161b22;
          color: #38bdf8;
          border: 1px solid rgba(56, 189, 248, 0.4);
          padding: 0.75rem 1.35rem;
          border-radius: 999px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.7);
          font-size: 0.88rem;
          font-weight: 700;
          z-index: 10000;
          animation: toastIn 0.25s ease-out;
        }
        @keyframes toastIn {
          from { opacity: 0; transform: translate(-50%, 15px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
      `}</style>

      <div className="events-ambient-glow" />

      {toastMsg && <div className="events-toast">{toastMsg}</div>}

      <div className="events-container">
        {/* ── Section Header ── */}
        <header className="events-header">
          <div className="events-eyebrow">
            <span>🔴</span> நேரலை சந்திப்புகள் &amp; வெபினார்
          </div>
          <h2 className="events-title">
            🌐 இணையவழி கூட்டங்கள் &amp; நிகழ்வுகள்<br />
            <span className="events-title-gradient">(Community Online Meets)</span>
          </h2>
          <p className="events-desc">
            நம் சமூக முன்னேற்றத்திற்கான கல்வி, வேலைவாய்ப்பு மற்றும் வாழ்வியல் ஆலோசனை கூட்டங்கள். இணைந்து பயன் பெறுங்கள்!
          </p>

          <div className="events-header-actions">
            <button
              className="btn-add-meeting-hero"
              onClick={handleOpenAddMeeting}
            >
              <span>➕</span>
              <span>புதிய கூட்டம் சேர்க்க (Admin)</span>
            </button>
            {isAdminAuthenticated && (
              <button
                className="btn-admin-logout-hero"
                onClick={handleAdminLogout}
                title="நிர்வாகி அமர்வை முடி (Logout)"
              >
                <span>🔒</span>
                <span>வெளியேறு (Logout)</span>
              </button>
            )}
          </div>
        </header>

        {/* ── 3 Event Type Preview Cards ── */}
        <div className="event-types-grid">
          {EVENT_TYPES.map((type) => (
            <div
              key={type.id}
              className={`event-type-card ${selectedFilter === type.id ? 'active' : ''}`}
              style={{
                '--card-border-hover': type.accent,
                background: selectedFilter === type.id ? type.gradient : '#161b22',
              }}
              onClick={() => setSelectedFilter(selectedFilter === type.id ? 'all' : type.id)}
              role="button"
              tabIndex={0}
            >
              <div>
                <div className="event-type-top">
                  <div className="event-type-icon-box">{type.icon}</div>
                  <span className="event-type-tag">{type.tag}</span>
                </div>
                <div className="event-type-title">{type.title}</div>
                <div className="event-type-subtitle">{type.titleEn}</div>
                <p className="event-type-desc">{type.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main Embed App Window Container ── */}
        <div className="embed-window-card">
          {/* App Window Top Bar */}
          <div className="embed-window-bar">
            <div className="window-dots-wrap">
              <span className="window-dot dot-red" />
              <span className="window-dot dot-yellow" />
              <span className="window-dot dot-green" />
              <div className="window-title-tag">
                <span className="window-live-indicator" />
                <span>உப்பிலியர் களம் · நேரலை நிகழ்வுகள் ({events.length})</span>
              </div>
              {isAdminAuthenticated && (
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginLeft: '0.5rem' }}>
                  <span className="admin-status-badge">
                    <span>👑</span> Admin Mode
                  </span>
                  <button
                    className="btn-admin-logout-mini"
                    onClick={handleAdminLogout}
                    title="நிர்வாகி அமர்வை முடி (Logout)"
                  >
                    <span>🔒 வெளியேறு</span>
                  </button>
                </div>
              )}
            </div>

            <div className="window-right-actions">
              {/* Filter Tabs */}
              <div className="embed-filter-tabs">
                <button
                  className={`embed-filter-btn ${selectedFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('all')}
                >
                  அனைத்தும் ({events.length})
                </button>
                <button
                  className={`embed-filter-btn ${selectedFilter === 'career' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('career')}
                >
                  🎓 கல்வி
                </button>
                <button
                  className={`embed-filter-btn ${selectedFilter === 'b2b' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('b2b')}
                >
                  💼 வணிகம்
                </button>
                <button
                  className={`embed-filter-btn ${selectedFilter === 'heritage' ? 'active' : ''}`}
                  onClick={() => setSelectedFilter('heritage')}
                >
                  📜 வரலாறு
                </button>
              </div>

              <button
                className="btn-quick-add"
                onClick={handleOpenAddMeeting}
                title="நிர்வாகி: புதிய ஆன்லைன் கூட்டம் பதிவு செய்க"
              >
                <span>➕</span>
                <span>கூட்டம் சேர் (Admin)</span>
              </button>
            </div>
          </div>

          {/* Window Feed Content */}
          <div className="embed-window-body">
            {loading ? (
              <div className="feed-empty-state">
                <p>ஏற்றப்படுகிறது (Loading events...)</p>
              </div>
            ) : filteredEvents.length === 0 ? (
              <div className="feed-empty-state">
                <div style={{ fontSize: '2.5rem', marginBottom: '0.6rem' }}>📅</div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0f6fc', marginBottom: '0.4rem' }}>
                  தற்போது கூட்டங்கள் எதுவும் திட்டமிடப்படவில்லை
                </h4>
                <p style={{ fontSize: '0.85rem', color: '#8b949e', maxWidth: '480px', margin: '0 auto 1.25rem' }}>
                  நிர்வாகிகள் புதிய கல்வி, வேலைவாய்ப்பு அல்லது வணிக ஆலோசனைக் கூட்டங்களை உடனே இங்கு சேர்க்கலாம்.
                </p>
                <button
                  className="btn-host-suggest"
                  onClick={handleOpenAddMeeting}
                >
                  <span>➕</span>
                  <span>முதல் கூட்டத்தை பதிவு செய்க (Add First Meet)</span>
                </button>
              </div>
            ) : (
              filteredEvents.map((evt) => {
                const isRegistered = !!rsvpState[evt.id];
                const cleanUrl = evt.joinLink && evt.joinLink.startsWith('http')
                  ? evt.joinLink
                  : `https://${evt.joinLink || 'meet.google.com'}`;

                return (
                  <div key={evt.id} className="feed-event-item">
                    {/* Date Badge */}
                    <div className="feed-date-badge">
                      <div className="feed-date-main">{formatTamilDate(evt.time || evt.date)}</div>
                      <div className="feed-date-time">{formatTamilTime(evt.time)}</div>
                    </div>

                    {/* Info Column */}
                    <div className="feed-info-col">
                      <div className="feed-meta-row">
                        <span
                          className="feed-category-pill"
                          style={{
                            color: evt.badgeColor || '#38bdf8',
                            borderColor: `${evt.badgeColor || '#38bdf8'}55`,
                            backgroundColor: `${evt.badgeColor || '#38bdf8'}15`,
                          }}
                        >
                          {evt.categoryName || 'கூட்டம்'}
                        </span>

                        <span className="feed-platform-pill">
                          <span>{evt.platformIcon || '💻'}</span>
                          <span>{evt.platform || 'Online'}</span>
                        </span>

                        <span className="feed-attendees">
                          👥 {evt.attendees || 1} பேர் பதிவு
                        </span>
                      </div>

                      <h3 className="feed-event-title">{evt.title}</h3>
                      {evt.titleEn && <div className="feed-event-title-en">{evt.titleEn}</div>}
                      {evt.description && <p className="feed-event-desc">{evt.description}</p>}

                      <div className="feed-host-text">
                        <span>🎙️ ஒருங்கிணைப்பாளர்:</span>
                        <strong style={{ color: '#e6edf3' }}>{evt.host}</strong>
                        {evt.hostContact && (
                          <span style={{ color: '#64748b' }}>({evt.hostContact})</span>
                        )}
                      </div>

                      {/* Admin Controls (Edit / Delete) */}
                      <div className="admin-item-controls">
                        <button
                          className="btn-admin-edit"
                          onClick={() => handleOpenEditMeeting(evt)}
                          title="நிர்வாகி: கூட்ட விவரங்களை திருத்து"
                        >
                          <span>✏️</span>
                          <span>திருத்து (Edit)</span>
                        </button>
                        <button
                          className="btn-admin-delete"
                          onClick={() => handleDeleteMeeting(evt.id)}
                          title="நிர்வாகி: கூட்டத்தை நீக்கு"
                        >
                          <span>🗑️</span>
                          <span>நீக்கு (Delete)</span>
                        </button>
                      </div>
                    </div>

                    {/* Actions Column (Direct Join without password) */}
                    <div className="feed-action-col">
                      <button
                        className="btn-join-meet"
                        onClick={() => handleDirectJoin(evt)}
                        title="கூட்டத்தில் உடனடியாக இணைக (Direct Join)"
                      >
                        <span>🟢 கூட்டத்தில் இணைக</span>
                        <span>➔</span>
                      </button>

                      {/* RSVP toggle */}
                      <button
                        className={`btn-rsvp ${isRegistered ? 'registered' : ''}`}
                        onClick={() => handleRsvpToggle(evt.id)}
                      >
                        <span>{isRegistered ? '✓ பதிவு உறுதியானது' : '👍 நான் கலந்து கொள்கிறேன்'}</span>
                      </button>

                      {/* Secondary buttons */}
                      <div className="feed-secondary-actions">
                        <button
                          className="btn-cal-add"
                          onClick={() => {
                            const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
                              evt.title
                            )}&details=${encodeURIComponent(
                              `${evt.titleEn || ''}\n\nஹோஸ்ட்: ${evt.host}\nகூட்ட இணைப்பு: ${cleanUrl}\n\nஉப்பிலியர் களம்: https://uppiliya-naicker-kulam.vercel.app`
                            )}&location=${encodeURIComponent(cleanUrl)}`;
                            window.open(googleCalUrl, '_blank');
                          }}
                          title="Google Calendar-ல் சேர்க்க"
                        >
                          <span>📅 Cal</span>
                        </button>

                        <a
                          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                            `*உப்பிலியர் களம் — இணையவழி கூட்டம்*\n\n📌 *தலைப்பு:* ${evt.title}\n📅 *தேதி:* ${formatTamilDate(evt.time || evt.date)}\n⏰ *நேரம்:* ${formatTamilTime(evt.time)}\n🎙️ *ஒருங்கிணைப்பாளர்:* ${evt.host}\n🔗 *இணைப்பு:* ${cleanUrl}\n\nஉப்பிலியர் களம் தளத்தில் இணையுங்கள்: https://uppiliya-naicker-kulam.vercel.app/#online-events`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-wa-share"
                          title="WhatsApp-ல் பகிர"
                        >
                          <span>📱 பகிர</span>
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Window Footer Banner */}
          <div className="embed-window-footer">
            <div className="host-meeting-prompt">
              <span>💡</span>
              <span>புதிய ஆன்லைன் கூட்டங்களை பதிவு செய்ய நிர்வாகிகளை அணுகவும்.</span>
            </div>
            <button
              className="btn-host-suggest"
              onClick={handleOpenAddMeeting}
            >
              <span>+</span>
              <span>கூட்டம் பதிவு செய்ய (Admin)</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── ADMIN PASSCODE AUTH MODAL ── */}
      {adminAuthModalOpen && (
        <div
          className="event-modal-overlay"
          onClick={() => {
            setAdminAuthModalOpen(false);
            setPendingAdminAction(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="event-modal-card admin-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="event-modal-close"
              onClick={() => {
                setAdminAuthModalOpen(false);
                setPendingAdminAction(null);
              }}
              aria-label="Close"
            >
              ✕
            </button>

            <div style={{ fontSize: '2.5rem', marginBottom: '0.4rem' }}>🔐</div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#38bdf8', marginBottom: '0.35rem' }}>
              நிர்வாகி கடவுச்சொல் உள்ளிடவும்
            </h3>
            <p style={{ fontSize: '0.84rem', color: '#94a3b8', marginBottom: '1rem' }}>
              கூட்டங்களை சேர்க்க, திருத்த மற்றும் நீக்க நிர்வாகி அனுமதி தேவை.
            </p>

            <form onSubmit={handleAdminAuthSubmit}>
              <div className="passcode-box">
                <input
                  type="password"
                  required
                  autoFocus
                  className="form-input"
                  placeholder="நிர்வாகி கடவுச்சொல்..."
                  style={{ textAlign: 'center', fontSize: '1rem', letterSpacing: '0.1em' }}
                  value={adminPasswordInput}
                  onChange={(e) => {
                    setAdminPasswordInput(e.target.value);
                    setAdminPasswordError(false);
                  }}
                />

                {adminPasswordError && (
                  <div style={{ color: '#f87171', fontSize: '0.78rem', marginTop: '0.5rem', fontWeight: 700 }}>
                    ⚠️ தவறான கடவுச்சொல்! மீண்டும் முயற்சிக்கவும்.
                  </div>
                )}

                <div className="passcode-hint">
                  💡 நிர்வாகி கடவுச்சொல்: <strong>uppiliya2026</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.65rem' }}>
                <button
                  type="button"
                  className="btn-rsvp"
                  onClick={() => {
                    setAdminAuthModalOpen(false);
                    setPendingAdminAction(null);
                  }}
                  style={{ flex: 1 }}
                >
                  ரத்து (Cancel)
                </button>
                <button
                  type="submit"
                  className="btn-submit-event"
                  style={{ flex: 1.5 }}
                >
                  அனுமதி பெறுக (Login) ➔
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── CREATE / EDIT MEETING MODAL (ADMIN ONLY) ── */}
      {modalOpen && (
        <div
          className="event-modal-overlay"
          onClick={() => {
            setModalOpen(false);
            setEditingEventId(null);
          }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="event-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="event-modal-close"
              onClick={() => {
                setModalOpen(false);
                setEditingEventId(null);
              }}
              aria-label="Close"
            >
              ✕
            </button>

            <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.25rem', color: '#38bdf8' }}>
              {editingEventId ? '✏️ கூட்ட விவரங்களை திருத்து (Edit Meet)' : '➕ புதிய ஆன்லைன் கூட்டம் சேர்க்க (Admin)'}
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              {editingEventId
                ? 'கூட்டத்தின் தலைப்பு, நேரம், இணைப்பு விவரங்களை மாற்றி புதுப்பிக்கவும்.'
                : 'நமது உப்பிலியர் சமூக மக்களுக்கு பயன்படும் கல்வி, வணிகம் மற்றும் ஆலோசனை கூட்டத்தை உடனே பதிவு செய்யுங்கள்.'}
            </p>

            <form onSubmit={handleCreateOrUpdateEvent}>
              <div className="event-form-grid">
                {/* Title */}
                <div className="form-group full-width">
                  <label className="form-label">கூட்டத்தின் தலைப்பு (Title in Tamil) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="எ.கா: UPSC / TNPSC தேர்வுக்கான சிறப்பு வழிகாட்டல்"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  />
                </div>

                {/* Subtitle / Topic in English */}
                <div className="form-group full-width">
                  <label className="form-label">ஆங்கில தலைப்பு / Topic (English)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Career Mentorship for College Students"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                  />
                </div>

                {/* Category */}
                <div className="form-group">
                  <label className="form-label">பிரிவு (Category) *</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="career">🎓 கல்வி &amp; வேலைவாய்ப்பு</option>
                    <option value="b2b">💼 வணிகக் களம்</option>
                    <option value="heritage">📜 வரலாறு &amp; வாழ்வியல்</option>
                    <option value="general">🌟 பொதுக் கலந்துரையாடல்</option>
                  </select>
                </div>

                {/* Platform Input */}
                <div className="form-group">
                  <label className="form-label">இணையவழி தளம் (Platform) *</label>
                  <input
                    type="text"
                    required
                    list="platform-options"
                    className="form-input"
                    placeholder="எ.கா: Google Meet / Zoom / YouTube"
                    value={formData.platform}
                    onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                  />
                  <datalist id="platform-options">
                    <option value="Google Meet" />
                    <option value="Zoom Video" />
                    <option value="YouTube Live" />
                    <option value="Microsoft Teams" />
                    <option value="WhatsApp Group" />
                    <option value="JioMeet" />
                    <option value="Cisco Webex" />
                    <option value="நேரடி அரங்கம் (In-Person Venue)" />
                  </datalist>
                </div>

                {/* Date */}
                <div className="form-group">
                  <label className="form-label">தேதி (Date) *</label>
                  <input
                    type="date"
                    required
                    className="form-input"
                    value={formData.date}
                    onClick={(e) => {
                      if (e.target && typeof e.target.showPicker === 'function') {
                        try { e.target.showPicker(); } catch {}
                      }
                    }}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>

                {/* Time */}
                <div className="form-group">
                  <label className="form-label">நேரம் (Time) *</label>
                  <input
                    type="time"
                    required
                    className="form-input"
                    value={formData.time}
                    onClick={(e) => {
                      if (e.target && typeof e.target.showPicker === 'function') {
                        try { e.target.showPicker(); } catch {}
                      }
                    }}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>

                {/* Direct Meeting URL */}
                <div className="form-group full-width">
                  <label className="form-label">கூட்ட இணைப்பு / Link (Google Meet / Zoom URL) *</label>
                  <input
                    type="url"
                    required
                    className="form-input"
                    placeholder="https://meet.google.com/abc-defg-hij"
                    value={formData.joinLink}
                    onChange={(e) => setFormData({ ...formData, joinLink: e.target.value })}
                  />
                </div>

                {/* Host Name */}
                <div className="form-group">
                  <label className="form-label">ஒருங்கிணைப்பாளர் (Host Name) *</label>
                  <input
                    type="text"
                    required
                    className="form-input"
                    placeholder="உங்கள் பெயர் அல்லது சங்கம்"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                  />
                </div>

                {/* Host Contact */}
                <div className="form-group">
                  <label className="form-label">தொடர்பு எண் / WhatsApp</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="+91 94867 72206"
                    value={formData.hostContact}
                    onChange={(e) => setFormData({ ...formData, hostContact: e.target.value })}
                  />
                </div>

                {/* Description */}
                <div className="form-group full-width">
                  <label className="form-label">விளக்கம் / அஜெண்டா (Description / Agenda)</label>
                  <textarea
                    rows={3}
                    className="form-textarea"
                    placeholder="கூட்டத்தின் முக்கிய நோக்கங்கள் மற்றும் பங்கேற்பாளர்களுக்கான குறிப்புகள்..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn-rsvp"
                  onClick={() => {
                    setModalOpen(false);
                    setEditingEventId(null);
                  }}
                  style={{ flex: 1 }}
                >
                  ரத்து செய்க (Cancel)
                </button>
                <button
                  type="submit"
                  className="btn-submit-event"
                  style={{ flex: 2 }}
                >
                  {editingEventId ? 'புதுப்பிக்க (Update Meet) ➔' : 'கூட்டத்தை வெளியிடுக (Publish Meet) ➔'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
