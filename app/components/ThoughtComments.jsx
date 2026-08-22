'use client';

import { useState, useEffect } from 'react';

export default function ThoughtComments() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [text, setText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyName, setReplyName] = useState('');
  const [replyText, setReplyText] = useState('');

  // Fetch comments from backend API on mount
  useEffect(() => {
    fetchComments();
  }, []);

  const fetchComments = async () => {
    try {
      const res = await fetch('/api/comments');
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (e) {
      console.error('Failed to load comments:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;

    const colors = ['#f59e0b', '#3b82f6', '#ec4899', '#10b981', '#a855f7', '#06b6d4'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newComment = {
      id: Date.now(),
      name: name.trim(),
      role: role.trim() || 'சமூக உறுப்பினர்',
      avatarColor: randomColor,
      time: 'Just now',
      text: text.trim(),
      likes: 1,
      liked: true,
      replies: []
    };

    // Optimistic UI update
    const updated = [newComment, ...comments];
    setComments(updated);
    setName('');
    setRole('');
    setText('');

    // Persist to server API
    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', comment: newComment })
      });
    } catch (e) {
      console.error('Failed to persist comment:', e);
    }
  };

  const handleToggleLike = async (id) => {
    const updated = comments.map(c => {
      if (c.id === id) {
        return {
          ...c,
          likes: c.liked ? c.likes - 1 : c.likes + 1,
          liked: !c.liked
        };
      }
      return c;
    });
    setComments(updated);

    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'like', commentId: id })
      });
    } catch (e) {
      console.error('Failed to save like:', e);
    }
  };

  const handleAddReply = async (commentId, e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newReply = {
      id: Date.now(),
      name: replyName.trim() || 'சமூக உறுப்பினர்',
      time: 'Just now',
      text: replyText.trim()
    };

    const updated = comments.map(c => {
      if (c.id === commentId) {
        return {
          ...c,
          replies: [...(c.replies || []), newReply]
        };
      }
      return c;
    });

    setComments(updated);
    setReplyingTo(null);
    setReplyName('');
    setReplyText('');

    try {
      await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reply', commentId, reply: newReply })
      });
    } catch (e) {
      console.error('Failed to save reply:', e);
    }
  };

  const handleShareWhatsApp = (comment) => {
    const shareText = `*உப்பிலிய நாயக்கர் சிந்தனைகள் - கருத்து:*
"${comment.text}"
- ${comment.name} (${comment.role})

மேலும் அறிய: ${window.location.origin}/thought`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  return (
    <section className="comments-section" style={{ marginTop: '3.5rem' }}>
      {/* Section Title */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '1.5rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem',
        flexWrap: 'wrap', gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.8rem' }}>💬</span>
          <h2 style={{ fontSize: 'clamp(1.15rem, 3.5vw, 1.6rem)', color: '#ffffff', margin: 0, fontWeight: '800' }}>
            சமூக மக்களின் சிந்தனைகள் & விவாதங்கள்
          </h2>
        </div>
        <span style={{
          background: 'rgba(59,130,246,0.15)', color: '#60a5fa',
          border: '1px solid rgba(59,130,246,0.3)', padding: '0.25rem 0.75rem',
          borderRadius: '9999px', fontSize: '0.85rem', fontWeight: '600'
        }}>
          {comments.length} கருத்துகள்
        </span>
      </div>

      {/* Add New Comment Form (Facebook-style Post Box) */}
      <div style={{
        background: 'rgba(15, 23, 42, 0.85)',
        border: '1px solid rgba(245,158,11,0.3)',
        borderRadius: '1.25rem',
        padding: 'clamp(1rem, 3vw, 1.5rem)',
        marginBottom: '2.5rem',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        backdropFilter: 'blur(12px)'
      }}>
        <h3 style={{ fontSize: 'clamp(1rem, 2.5vw, 1.2rem)', color: '#f59e0b', marginTop: 0, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✍️ உங்கள் சிந்தனையையும் கருத்துகளையும் பகிர்க (Add Your Thought)
        </h3>

        <form onSubmit={handleAddComment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '0.75rem' }}>
            <input
              type="text"
              placeholder="உங்கள் பெயர் (எ.கா: கே. பாலசுப்பிரமணியன்)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
            <input
              type="text"
              placeholder="குலம் / ஊர் (எ.கா: அரியபட்டம், நாமக்கல்)"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: '0.75rem',
                padding: '0.75rem 1rem',
                color: '#ffffff',
                fontSize: '0.95rem',
                outline: 'none'
              }}
            />
          </div>

          <textarea
            placeholder="சமூக முன்னேற்றம், தொழில்வழிகாட்டல் அல்லது கல்வி குறித்த உங்கள் சிந்தனையை எழுதுங்கள்..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            required
            style={{
              width: '100%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '0.75rem',
              padding: '0.75rem 1rem',
              color: '#ffffff',
              fontSize: '0.95rem',
              outline: 'none',
              resize: 'vertical'
            }}
          />

          <button
            type="submit"
            style={{
              alignSelf: 'flex-end',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '0.75rem',
              padding: '0.75rem 1.75rem',
              fontSize: '1rem',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: '0 4px 15px rgba(245,158,11,0.3)',
              transition: 'all 0.2s'
            }}
          >
            🚀 சிந்தனையைப் பதியவும் (Post Thought)
          </button>
        </form>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
          ⏳ கருத்துகள் ஏற்றப்படுகின்றன...
        </div>
      ) : (
        /* Facebook-style Comments List */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {comments.map((comment) => (
            <div key={comment.id} style={{
              background: 'rgba(15, 23, 42, 0.7)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '1.25rem',
              padding: '1.25rem 1.5rem',
              backdropFilter: 'blur(12px)',
              transition: 'border-color 0.2s'
            }}>
              {/* User Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '0.75rem' }}>
                {/* Avatar Circle */}
                <div style={{
                  width: '45px', height: '45px', borderRadius: '50%',
                  background: comment.avatarColor || '#3b82f6',
                  color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '800', fontSize: '1.1rem', flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
                }}>
                  {comment.name ? comment.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h4 style={{ margin: 0, fontSize: '1.05rem', color: '#f8fafc', fontWeight: '700' }}>
                      {comment.name}
                    </h4>
                    <span style={{ fontSize: '0.8rem', color: '#60a5fa', background: 'rgba(96,165,250,0.15)', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>
                      ✓ சமூக உறுப்பினர்
                    </span>
                  </div>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
                    {comment.role} • <span style={{ color: '#64748b' }}>{comment.time}</span>
                  </p>
                </div>
              </div>

              {/* Comment Text */}
              <p style={{
                color: '#e2e8f0', fontSize: '1.02rem', lineHeight: '1.6',
                margin: '0 0 1rem 0', whiteSpace: 'pre-line'
              }}>
                {comment.text}
              </p>

              {/* Facebook Action Buttons (Like, Reply, Share) */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '1.25rem',
                borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '0.75rem',
                fontSize: '0.9rem'
              }}>
                {/* Like Button */}
                <button
                  onClick={() => handleToggleLike(comment.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: comment.liked ? '#3b82f6' : '#94a3b8',
                    fontWeight: comment.liked ? '700' : '500',
                    display: 'flex', alignItems: 'center', gap: '0.4rem',
                    transition: 'color 0.2s'
                  }}
                >
                  <span>{comment.liked ? '👍 பிடிக்கும்' : '👍 லைக்'}</span>
                  <span style={{
                    background: comment.liked ? 'rgba(59,130,246,0.2)' : 'rgba(255,255,255,0.08)',
                    padding: '0.1rem 0.5rem', borderRadius: '9999px', fontSize: '0.8rem'
                  }}>
                    {comment.likes}
                  </span>
                </button>

                {/* Reply Button */}
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: replyingTo === comment.id ? '#f59e0b' : '#94a3b8',
                    fontWeight: '500', display: 'flex', alignItems: 'center', gap: '0.4rem'
                  }}
                >
                  💬 பதில் அளி ({comment.replies ? comment.replies.length : 0})
                </button>

                {/* WhatsApp Share Button */}
                <button
                  onClick={() => handleShareWhatsApp(comment)}
                  style={{
                    background: 'none', border: 'none', cursor: 'pointer',
                    color: '#22c55e', fontWeight: '500',
                    display: 'flex', alignItems: 'center', gap: '0.4rem'
                  }}
                >
                  📲 பகிர்க
                </button>
              </div>

              {/* Nested Replies */}
              {comment.replies && comment.replies.length > 0 && (
                <div style={{
                  marginTop: '1rem', paddingLeft: '1.25rem',
                  borderLeft: '2px solid rgba(59,130,246,0.3)',
                  display: 'flex', flexDirection: 'column', gap: '0.75rem'
                }}>
                  {comment.replies.map(reply => (
                    <div key={reply.id} style={{
                      background: 'rgba(255,255,255,0.03)',
                      padding: '0.75rem 1rem', borderRadius: '0.75rem',
                      border: '1px solid rgba(255,255,255,0.05)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
                        <span style={{ color: '#60a5fa', fontWeight: '700', fontSize: '0.9rem' }}>{reply.name}</span>
                        <span style={{ color: '#64748b', fontSize: '0.78rem' }}>{reply.time}</span>
                      </div>
                      <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem', lineHeight: '1.5' }}>{reply.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Inline Reply Form */}
              {replyingTo === comment.id && (
                <form onSubmit={(e) => handleAddReply(comment.id, e)} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <input
                    type="text"
                    placeholder="உங்கள் பெயர் (விரும்பினால்)"
                    value={replyName}
                    onChange={(e) => setReplyName(e.target.value)}
                    style={{
                      background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '0.5rem', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.9rem'
                    }}
                  />
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="பதில் கருத்து எழுதுங்கள்..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      required
                      style={{
                        flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                        borderRadius: '0.5rem', padding: '0.5rem 0.75rem', color: '#fff', fontSize: '0.9rem'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        background: '#3b82f6', color: '#fff', border: 'none',
                        borderRadius: '0.5rem', padding: '0.5rem 1rem', fontWeight: '700', cursor: 'pointer'
                      }}
                    >
                      அனுப்பு
                    </button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
