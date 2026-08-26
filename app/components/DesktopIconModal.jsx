'use client';

import { useState, useEffect } from 'react';

export default function DesktopIconModal({ isOpen, onClose }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [activeTab, setActiveTab] = useState('desktop'); // 'desktop' | 'android' | 'ios'
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    // Detect if already installed / standalone
    if (typeof window !== 'undefined') {
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        window.navigator.standalone === true;
      setIsInstalled(isStandalone);

      // Auto-detect device to set initial tab
      const ua = navigator.userAgent || '';
      if (/android/i.test(ua)) {
        setActiveTab('android');
      } else if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) {
        setActiveTab('ios');
      } else {
        setActiveTab('desktop');
      }

      // Listen for PWA beforeinstallprompt
      const handleBeforeInstall = (e) => {
        e.preventDefault();
        setDeferredPrompt(e);
      };

      window.addEventListener('beforeinstallprompt', handleBeforeInstall);
      window.addEventListener('appinstalled', () => {
        setIsInstalled(true);
        setDeferredPrompt(null);
      });

      return () => {
        window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      };
    }
  }, []);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
    }
  };

  // Download a Windows .url desktop shortcut file
  const handleDownloadShortcut = () => {
    const currentUrl = typeof window !== 'undefined' ? window.location.origin : 'https://uppiliya-naicker-kulam.vercel.app';
    const shortcutContent = `[InternetShortcut]\nURL=${currentUrl}\nIconIndex=0\nIconFile=${currentUrl}/favicon.ico\n`;
    const blob = new Blob([shortcutContent], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'Uppiliya_Naicker_Community.url';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 4000);
  };

  return (
    <div
      className="dim-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dim-title"
    >
      <style>{`
        .dim-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          animation: dimFadeIn 0.2s ease-out;
        }

        @keyframes dimFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .dim-card {
          background: #0f172a;
          color: #f8fafc;
          border: 1px solid rgba(192, 132, 252, 0.35);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(192, 132, 252, 0.2);
          border-radius: 18px;
          max-width: 540px;
          width: 100%;
          padding: 1.5rem;
          position: relative;
          max-height: 90vh;
          overflow-y: auto;
        }

        [data-theme="light"] .dim-card {
          background: #ffffff;
          color: #0f172a;
          border-color: rgba(0, 0, 0, 0.15);
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.15);
        }

        .dim-close {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: rgba(255, 255, 255, 0.1);
          border: none;
          color: inherit;
          width: 32px;
          height: 32px;
          border-radius: 50%;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background 0.2s;
        }
        .dim-close:hover {
          background: rgba(255, 255, 255, 0.2);
        }
        [data-theme="light"] .dim-close {
          background: rgba(0, 0, 0, 0.06);
        }
        [data-theme="light"] .dim-close:hover {
          background: rgba(0, 0, 0, 0.12);
        }

        .dim-header {
          display: flex;
          align-items: center;
          gap: 0.85rem;
          margin-bottom: 1rem;
          padding-right: 2rem;
        }

        .dim-icon-preview {
          width: 52px;
          height: 52px;
          border-radius: 12px;
          object-fit: cover;
          border: 2px solid rgba(192, 132, 252, 0.4);
          background: #1e293b;
          flex-shrink: 0;
          box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        }

        .dim-title {
          font-size: 1.15rem;
          font-weight: 800;
          line-height: 1.3;
          background: linear-gradient(90deg, #60a5fa, #c084fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .dim-subtitle {
          font-size: 0.82rem;
          color: #94a3b8;
          margin-top: 0.15rem;
        }
        [data-theme="light"] .dim-subtitle {
          color: #64748b;
        }

        .dim-tabs {
          display: flex;
          gap: 0.4rem;
          margin: 1rem 0;
          background: rgba(255, 255, 255, 0.05);
          padding: 0.25rem;
          border-radius: 10px;
        }
        [data-theme="light"] .dim-tabs {
          background: rgba(0, 0, 0, 0.04);
        }

        .dim-tab-btn {
          flex: 1;
          padding: 0.45rem 0.6rem;
          border-radius: 8px;
          border: none;
          background: transparent;
          color: #94a3b8;
          font-size: 0.82rem;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.35rem;
        }
        [data-theme="light"] .dim-tab-btn {
          color: #64748b;
        }
        .dim-tab-btn.active {
          background: #2563eb;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(37, 99, 235, 0.4);
        }

        .dim-action-box {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 12px;
          padding: 1rem;
          margin-bottom: 1rem;
        }
        [data-theme="light"] .dim-action-box {
          background: rgba(0, 0, 0, 0.02);
          border-color: rgba(0, 0, 0, 0.08);
        }

        .dim-btn-primary {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: #ffffff;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          transition: transform 0.15s, box-shadow 0.15s;
          box-shadow: 0 4px 14px rgba(59, 130, 246, 0.35);
          font-family: inherit;
        }
        .dim-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
        }

        .dim-btn-secondary {
          width: 100%;
          padding: 0.65rem 1rem;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.06);
          color: inherit;
          font-weight: 600;
          font-size: 0.88rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 0.6rem;
          transition: background 0.15s;
          font-family: inherit;
        }
        .dim-btn-secondary:hover {
          background: rgba(255, 255, 255, 0.12);
        }
        [data-theme="light"] .dim-btn-secondary {
          border-color: rgba(0, 0, 0, 0.15);
          background: rgba(0, 0, 0, 0.04);
        }
        [data-theme="light"] .dim-btn-secondary:hover {
          background: rgba(0, 0, 0, 0.08);
        }

        .dim-steps {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.65rem;
        }

        .dim-step-item {
          display: flex;
          align-items: flex-start;
          gap: 0.65rem;
          font-size: 0.88rem;
          line-height: 1.45;
        }

        .dim-step-badge {
          background: rgba(192, 132, 252, 0.2);
          color: #c084fc;
          font-weight: 800;
          font-size: 0.75rem;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }
        [data-theme="light"] .dim-step-badge {
          background: rgba(124, 58, 237, 0.12);
          color: #7c3aed;
        }

        .dim-success-msg {
          padding: 0.6rem;
          border-radius: 8px;
          background: rgba(34, 197, 94, 0.15);
          border: 1px solid rgba(34, 197, 94, 0.35);
          color: #4ade80;
          font-size: 0.85rem;
          text-align: center;
          margin-top: 0.6rem;
          animation: dimFadeIn 0.2s ease;
        }
        [data-theme="light"] .dim-success-msg {
          color: #15803d;
          background: rgba(34, 197, 94, 0.12);
        }
      `}</style>

      <div className="dim-card" onClick={(e) => e.stopPropagation()}>
        <button
          className="dim-close"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ✕
        </button>

        {/* Header */}
        <div className="dim-header">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/uppliakulam.png"
            alt="Uppiliya Emblem"
            className="dim-icon-preview"
            onError={(e) => {
              e.currentTarget.src = '/images/uppliya_2.png';
            }}
          />
          <div>
            <div className="dim-title" id="dim-title">
              டெஸ்க்டாப் / முகப்பு ஐகான்
            </div>
            <div className="dim-subtitle">
              Add Shortcut Icon / Install Web App
            </div>
          </div>
        </div>

        {/* Device Switcher Tabs */}
        <div className="dim-tabs">
          <button
            className={`dim-tab-btn ${activeTab === 'desktop' ? 'active' : ''}`}
            onClick={() => setActiveTab('desktop')}
          >
            💻 கணினி (Desktop)
          </button>
          <button
            className={`dim-tab-btn ${activeTab === 'android' ? 'active' : ''}`}
            onClick={() => setActiveTab('android')}
          >
            🤖 Android
          </button>
          <button
            className={`dim-tab-btn ${activeTab === 'ios' ? 'active' : ''}`}
            onClick={() => setActiveTab('ios')}
          >
            🍏 iPhone / iPad
          </button>
        </div>

        {/* TAB 1: DESKTOP */}
        {activeTab === 'desktop' && (
          <div className="dim-content">
            <div className="dim-action-box">
              {deferredPrompt && !isInstalled ? (
                <button className="dim-btn-primary" onClick={handleNativeInstall}>
                  <span>⬇️</span> ஆப் ஆக நிறுவுக (Install Web App)
                </button>
              ) : null}

              <button
                className={deferredPrompt && !isInstalled ? 'dim-btn-secondary' : 'dim-btn-primary'}
                onClick={handleDownloadShortcut}
              >
                <span>📥</span> கணினி குறுக்குவழி (.url) பதிவிறக்குக
              </button>

              {downloadSuccess && (
                <div className="dim-success-msg">
                  ✓ பதிவிறக்கம் செய்யப்பட்டது! கோப்பை உங்கள் Desktop-ல் Drag அல்லது Copy செய்து வைக்கவும்.
                </div>
              )}
            </div>

            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#60a5fa' }}>
              Chrome / Edge பிரவுசரில் குறுக்குவழி உருவாக்க:
            </div>
            <ul className="dim-steps">
              <li className="dim-step-item">
                <span className="dim-step-badge">1</span>
                <div>பிரவுசரின் மேல் வலது மூலையில் உள்ள <strong>மூன்று புள்ளிகளை (⋮ அல்லது …)</strong> கிளிக் செய்யவும்.</div>
              </li>
              <li className="dim-step-item">
                <span className="dim-step-badge">2</span>
                <div>
                  <strong>Cast, save and share</strong> (அல்லது <strong>More Tools</strong>) ➔ <strong>Create Shortcut...</strong> (குறுக்குவழி உருவாக்குக) என்பதை தேர்ந்தெடுக்கவும்.
                </div>
              </li>
              <li className="dim-step-item">
                <span className="dim-step-badge">3</span>
                <div>
                  <strong>&quot;Open as window&quot;</strong> தேர்வு செய்து <strong>Create</strong> கொடுக்கவும். உடனே கணினி டெஸ்க்டாப்பில் ஐகான் உருவாகும்!
                </div>
              </li>
            </ul>
          </div>
        )}

        {/* TAB 2: ANDROID */}
        {activeTab === 'android' && (
          <div className="dim-content">
            {deferredPrompt && !isInstalled ? (
              <div className="dim-action-box">
                <button className="dim-btn-primary" onClick={handleNativeInstall}>
                  <span>📲</span> நேரடியாக ஆப் நிறுவுக (Install App)
                </button>
              </div>
            ) : null}

            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#60a5fa' }}>
              Android Chrome வழிகாட்டுதல்:
            </div>
            <ul className="dim-steps">
              <li className="dim-step-item">
                <span className="dim-step-badge">1</span>
                <div>Chrome பிரவுசரின் மேல் வலதுபுறம் உள்ள <strong>மூன்று புள்ளிகளை (⋮)</strong> கிளிக் செய்யவும்.</div>
              </li>
              <li className="dim-step-item">
                <span className="dim-step-badge">2</span>
                <div>
                  <strong>&quot;Add to Home screen&quot;</strong> (அல்லது <strong>&quot;Install app&quot;</strong> / முகப்புத் திரையில் சேர்) என்பதைத் தொடவும்.
                </div>
              </li>
              <li className="dim-step-item">
                <span className="dim-step-badge">3</span>
                <div><strong>&quot;Add&quot;</strong> என்பதை உறுதிப்படுத்தவும். உங்கள் மொபைல் முகப்புத் திரையில் ஐகான் தோன்றும்!</div>
              </li>
            </ul>
          </div>
        )}

        {/* TAB 3: IOS */}
        {activeTab === 'ios' && (
          <div className="dim-content">
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.5rem', color: '#60a5fa' }}>
              Apple iPhone / iPad (Safari) வழிகாட்டுதல்:
            </div>
            <ul className="dim-steps">
              <li className="dim-step-item">
                <span className="dim-step-badge">1</span>
                <div>Safari பிரவுசரின் கீழே உள்ள <strong>பகிர்வு ஐகானை (Share Button 📤)</strong> தட்டவும்.</div>
              </li>
              <li className="dim-step-item">
                <span className="dim-step-badge">2</span>
                <div>கீழே ஸ்க்ரோல் செய்து <strong>&quot;Add to Home Screen&quot; (முகப்புத் திரையில் சேர் ➕)</strong> என்பதைத் தேர்ந்தெடுக்கவும்.</div>
              </li>
              <li className="dim-step-item">
                <span className="dim-step-badge">3</span>
                <div>மேல் வலது மூலையில் உள்ள <strong>&quot;Add&quot;</strong> என்பதை அழுத்தவும். இப்போது ஆப் போன்று பயன்படுத்தலாம்!</div>
              </li>
            </ul>
          </div>
        )}

        <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
          <button
            className="dim-btn-secondary"
            onClick={onClose}
            style={{ width: 'auto', padding: '0.45rem 1.5rem', display: 'inline-flex' }}
          >
            சரி (Close)
          </button>
        </div>
      </div>
    </div>
  );
}
