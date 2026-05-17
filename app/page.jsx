'use client';

import { useState, useEffect, useMemo, useRef } from 'react';

export default function Home() {
    const [data, setData] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [activeMapQuery, setActiveMapQuery] = useState('');
    const searchRef = useRef(null);

    useEffect(() => {
        import('../data.json').then((module) => {
            setData(module.default);
        });

        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filteredData = useMemo(() => {
        if (!searchQuery) return data;
        const lowerQuery = searchQuery.toLowerCase();
        return data.filter(item => {
            return (
                item.name.toLowerCase().includes(lowerQuery) ||
                item.category.toLowerCase().includes(lowerQuery) ||
                (item.kulatheivam && item.kulatheivam.some(k => k.toLowerCase().includes(lowerQuery))) ||
                (item.relationships && item.relationships.toLowerCase().includes(lowerQuery))
            );
        });
    }, [searchQuery, data]);

    const handleSelect = (entity) => {
        setSelectedEntity(entity);
        setSearchQuery('');
        setIsSearchFocused(false);

        // Default the map to the first temple
        if (entity.kulatheivam && entity.kulatheivam.length > 0) {
            setActiveMapQuery(entity.kulatheivam[0]);
        } else {
            setActiveMapQuery('');
        }
    };

    const handleShare = () => {
        if (!selectedEntity) return;

        const templesText = selectedEntity.kulatheivam?.length
            ? selectedEntity.kulatheivam.map(t => `- ${t}\n  📍 வரைபடம் (Map): https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(t)}`).join('\n\n')
            : 'குறிப்பிடப்படவில்லை';

        const text = `*உப்பிலிய நாயக்கர் குலம்*\n\n` +
            `*குலம்/பட்டம்:* ${selectedEntity.name}\n` +
            `*பிரிவு:* ${selectedEntity.category}\n\n` +
            `*உறவுகள் (பங்காளிகள்/மாமன் மச்சான்):*\n` +
            `${selectedEntity.relationships || 'குறிப்பிடப்படவில்லை'}\n\n` +
            `*குலதெய்வம் அமைந்துள்ள இடங்கள்:*\n` +
            `${templesText}\n\n` +
            `---\n` +
            `*உருவாக்கம் (Created by):*\n` +
            `T. Karthikeyan\n` +
            `🌐 https://carthworks.vercel.app/\n` +
            `📞 +91 94867 72206\n` +
            `✉️ tkarthikeyan@gmail.com`;

        const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(url, '_blank');
    };

    const getRelatedEntities = () => {
        if (!selectedEntity || !selectedEntity.relationships) return [];

        const related = data.filter(item => {
            if (item.id === selectedEntity.id) return false;

            const thisMentionsItem = selectedEntity.relationships.includes(item.name.split(' ')[0]);
            const itemMentionsThis = item.relationships && item.relationships.includes(selectedEntity.name.split(' ')[0]);

            return thisMentionsItem || itemMentionsThis;
        });
        return related.slice(0, 3);
    };

    const relatedEntities = useMemo(() => getRelatedEntities(), [selectedEntity, data]);

    return (
        <main className="container">
            <div style={{ textAlign: 'center', marginBottom: '3rem', animation: 'fadeInDown 1s ease-out' }}>
                <h1>உப்பிலிய நாயக்கர் குலம்</h1>
                <p className="subtitle">Discover your Category, Kulatheivam & Pangali Relationships</p>
            </div>

                <div className="glass-panel">

                    <div className="search-container" ref={searchRef}>
                        <div className="search-input-wrapper">
                            <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="11" cy="11" r="8"></circle>
                                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                            </svg>
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search by Kulam, Temple, Location or Relationship..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setIsSearchFocused(true);
                                }}
                                onFocus={() => setIsSearchFocused(true)}
                            />
                        </div>

                        {isSearchFocused && (searchQuery || data.length > 0) && (
                            <div className="search-results">
                                {filteredData.length > 0 ? (
                                    filteredData.map(item => (
                                        <div key={item.id} className="search-item" onClick={() => handleSelect(item)}>
                                            <span className="search-item-name">{item.name}</span>
                                            <span className="search-item-category">{item.category}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="search-item" style={{ color: 'var(--text-muted)' }}>
                                        No results found for "{searchQuery}"
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
                                    <div className="info-label">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
                                        பங்காளிகள் / உறவுமுறைகள்
                                    </div>
                                    <div className="info-content">
                                        {selectedEntity.relationships ? (
                                            <p>{selectedEntity.relationships}</p>
                                        ) : (
                                            <p style={{ color: 'var(--text-muted)' }}>குறிப்பிடப்படவில்லை</p>
                                        )}
                                    </div>
                                </div>

                                <div className="info-section">
                                    <div className="info-label">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                                        குலதெய்வம் & இடங்கள்
                                    </div>
                                    <div className="info-content">
                                        {selectedEntity.kulatheivam && selectedEntity.kulatheivam.length > 0 ? (
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                                <ul className="temple-list">
                                                    {selectedEntity.kulatheivam.map((temple, idx) => (
                                                        <li
                                                            key={idx}
                                                            onClick={() => setActiveMapQuery(temple)}
                                                            style={{
                                                                cursor: 'pointer',
                                                                color: activeMapQuery === temple ? 'var(--accent)' : 'inherit',
                                                                fontWeight: activeMapQuery === temple ? 'bold' : 'normal',
                                                                transition: 'all 0.2s ease'
                                                            }}
                                                        >
                                                            {temple}
                                                            {activeMapQuery !== temple && (
                                                                <span style={{ fontSize: '0.8rem', marginLeft: '10px', opacity: 0.6, background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '10px' }}>
                                                                    📍 Map
                                                                </span>
                                                            )}
                                                        </li>
                                                    ))}
                                                </ul>

                                                {activeMapQuery && (
                                                    <div style={{ animation: 'fadeInUp 0.3s ease' }}>
                                                        <iframe
                                                            width="100%"
                                                            height="250"
                                                            style={{ border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                            loading="lazy"
                                                            allowFullScreen
                                                            src={`https://maps.google.com/maps?q=${encodeURIComponent(activeMapQuery)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                                                        ></iframe>
                                                        <div style={{ textAlign: 'right', marginTop: '0.5rem' }}>
                                                            <a
                                                                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(activeMapQuery)}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{ color: 'var(--accent)', fontSize: '0.85rem', textDecoration: 'none', fontWeight: 'bold' }}
                                                            >
                                                                Open in Google Maps App ↗
                                                            </a>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <p style={{ color: 'var(--text-muted)' }}>குறிப்பிடப்படவில்லை</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {relatedEntities.length > 0 && (
                                <div className="graph-container">
                                    <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>Pangali Network Graph</h3>
                                    <div className="graph-wrapper">
                                        <div className="graph-node current">
                                            <div className="graph-node-title">{selectedEntity.name}</div>
                                            <div className="graph-node-sub">You</div>
                                        </div>

                                        {relatedEntities.map((related, idx) => (
                                            <div key={related.id} style={{ display: 'flex', alignItems: 'center' }}>
                                                <div className="graph-edge">Related</div>
                                                <div className="graph-node" onClick={() => handleSelect(related)} style={{ cursor: 'pointer' }}>
                                                    <div className="graph-node-title">{related.name}</div>
                                                    <div className="graph-node-sub">{related.category}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="actions-bar">
                                <button className="btn-whatsapp" onClick={handleShare}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                                    Share via WhatsApp
                                </button>
                            </div>

                        </div>
                    )}
                </div>
        </main>
    );
}
