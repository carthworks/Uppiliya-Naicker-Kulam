'use client';

import { useState, useEffect } from 'react';

export default function SiteFooter() {
  const [visitorStats, setVisitorStats] = useState({
    totalVisits: 0,
    uniqueVisits: 0,
    clientIp: '',
  });

  useEffect(() => {
    fetch('/api/events')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.stats) {
          setVisitorStats(data.stats);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="global-site-footer">
      <style>{`
        .global-site-footer {
          margin-top: 4rem;
          padding: clamp(2rem, 5vw, 3.5rem) clamp(1rem, 5vw, 2.5rem);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(10, 14, 20, 0.95);
          text-align: center;
          position: relative;
        }

        .footer-analytics-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 1.5rem;
        }

        .footer-visitor-pill {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          background: rgba(22, 27, 34, 0.9);
          border: 1px solid rgba(56, 189, 248, 0.25);
          padding: 0.5rem 1.15rem;
          border-radius: 999px;
          font-size: clamp(0.72rem, 2vw, 0.82rem);
          color: #cbd5e1;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
          flex-wrap: wrap;
          justify-content: center;
        }

        .footer-pulse-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #38bdf8;
          box-shadow: 0 0 10px #38bdf8;
          animation: footerLivePulse 1.8s infinite;
        }

        @keyframes footerLivePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.35); opacity: 0.5; }
        }

        .footer-ip-code {
          background: rgba(56, 189, 248, 0.12);
          color: #38bdf8;
          padding: 0.15rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
          border: 1px solid rgba(56, 189, 248, 0.3);
        }

        .footer-contacts-row {
          display: flex;
          justify-content: center;
          gap: clamp(1rem, 4vw, 2.5rem);
          font-size: clamp(0.82rem, 2.2vw, 0.92rem);
          color: #94a3b8;
          flex-wrap: wrap;
          margin-bottom: 1.25rem;
        }

        .footer-contact-item {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          color: #cbd5e1;
          text-decoration: none;
          transition: color 0.2s;
        }
        .footer-contact-item:hover {
          color: #38bdf8;
        }

        .footer-copyright {
          font-size: 0.76rem;
          color: #64748b;
          margin: 0;
        }
      `}</style>

      {/* ── Live Visitors & IP Tracking Pill ── */}
      <div className="footer-analytics-wrap">
        <div className="footer-visitor-pill">
          <span className="footer-pulse-dot" />
          <span>👥 மொத்த பார்வைகள்: <strong style={{ color: '#fff' }}>{visitorStats.totalVisits || 1}</strong></span>
          <span style={{ color: '#475569' }}>|</span>
          <span>🌐 தனித்துவ ஐபி (Unique IPs): <strong style={{ color: '#fff' }}>{visitorStats.uniqueVisits || 1}</strong></span>
          {visitorStats.clientIp && (
            <>
              <span style={{ color: '#475569' }}>|</span>
              <span>📍 உங்கள் IP: <code className="footer-ip-code">{visitorStats.clientIp}</code></span>
            </>
          )}
        </div>
      </div>

      {/* ── Community Administration Contact Info ── */}
      <div className="footer-contacts-row">
        <a href="tel:+919486772206" className="footer-contact-item">
          <span>📞</span>
          <span>+91 94867 72206 (நிர்வாக ஒருங்கிணைப்பாளர்)</span>
        </a>
        <a href="mailto:admin@uppiliya.community" className="footer-contact-item">
          <span>✉️</span>
          <span>admin@uppiliya.community</span>
        </a>
      </div>

      <p className="footer-copyright">
        © {new Date().getFullYear()} உப்பிலிய நாயக்கர் குல அடையாள தளம் (Uppiliyar Kalam). All rights reserved.
      </p>
    </footer>
  );
}
