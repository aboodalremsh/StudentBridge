import React, { useEffect, useRef, useState } from 'react';
import DashboardLayout from '../../components/common/DashboardLayout';
import { studentAPI } from '../../services';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [sending,  setSending]  = useState(false);
  const [loading,  setLoading]  = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    studentAPI.getChat().then(({ data }) => {
      if (!data.messages || data.messages.length === 0) {
        setMessages([{
          id: 0,
          role: 'assistant',
          message: "Hello! 👋 I'm your AI Career Advisor. Ask me about jobs, CV tips, skills, or career paths!",
          created_at: new Date().toISOString()
        }]);
      } else {
        setMessages(data.messages);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSend(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || sending) return;

    setInput('');
    setSending(true);

    const userMsg  = { id: Date.now(),     role: 'user',      message: text,  created_at: new Date().toISOString() };
    const typingId = Date.now() + 1;

    setMessages(prev => [
      ...prev,
      userMsg,
      { id: typingId, role: 'assistant', message: '...', typing: true, created_at: new Date().toISOString() }
    ]);

    try {
      // ✅ FIX: only pass message — backend fetches student profile itself
      const { data } = await studentAPI.sendChat(text);

      setMessages(prev =>
        prev.filter(m => m.id !== typingId).concat({
          id: typingId + 1,
          role: 'assistant',
          message: data.reply,
          created_at: new Date().toISOString()
        })
      );
    } catch {
      setMessages(prev =>
        prev.filter(m => m.id !== typingId).concat({
          id: typingId + 1,
          role: 'assistant',
          message: 'Sorry, I had trouble responding. Please try again!',
          created_at: new Date().toISOString()
        })
      );
    } finally {
      setSending(false);
    }
  }

  async function clearChat() {
    if (!window.confirm('Clear all chat history?')) return;
    await studentAPI.clearChat().catch(() => {});
    setMessages([{
      id: 0,
      role: 'assistant',
      message: "Chat cleared! 👋 How can I help you today?",
      created_at: new Date().toISOString()
    }]);
  }

  const quickPrompts = [
    'How do I improve my CV?',
    'What jobs match my skills?',
    'Interview tips',
    'What should I learn next?'
  ];

  return (
    <DashboardLayout>
      <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 64px)' }}>

        <div style={{ paddingBottom: 16, borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ marginBottom: 2 }}>🧠 AI Career Chat</h1>
            <p style={{ fontSize: '0.83rem', color: 'var(--text-muted)' }}>
              Powered by Groq AI · History saved
            </p>
          </div>
          <button className="btn btn-ghost btn-sm" onClick={clearChat}>🗑️ Clear</button>
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {loading
            ? <div style={{ textAlign: 'center', padding: 40 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
            : messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>

                {msg.role === 'assistant' && (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: 'var(--primary-glow)', border: '1px solid var(--accent-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.9rem', marginRight: 10, flexShrink: 0, alignSelf: 'flex-end'
                  }}>🧠</div>
                )}

                <div style={{
                  maxWidth: '72%', padding: '11px 15px',
                  borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-card)',
                  border: msg.role === 'user' ? 'none' : '1px solid var(--border)',
                  color: msg.role === 'user' ? '#fff' : 'var(--text-main)',
                  fontSize: '0.9rem', lineHeight: 1.6, whiteSpace: 'pre-wrap'
                }}>
                  {msg.typing
                    ? <span style={{ display: 'flex', gap: 4 }}>
                        {[0, 1, 2].map(i => (
                          <span key={i} style={{
                            width: 6, height: 6, borderRadius: '50%',
                            background: 'var(--text-muted)',
                            animation: `bounce 1.2s ${i * 0.2}s infinite`
                          }} />
                        ))}
                      </span>
                    : msg.message
                  }
                </div>

                {msg.role === 'user' && (
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%', background: 'var(--accent-primary)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginLeft: 10, flexShrink: 0, alignSelf: 'flex-end',
                    color: '#fff', fontSize: '0.72rem', fontWeight: 700, fontFamily: 'var(--font-display)'
                  }}>Me</div>
                )}

              </div>
            ))
          }
          <div ref={bottomRef} />
        </div>

        {messages.length <= 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 12 }}>
            {quickPrompts.map(p => (
              <button key={p} className="btn btn-ghost btn-sm" onClick={() => setInput(p)}>
                {p}
              </button>
            ))}
          </div>
        )}

        <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: 10 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask me anything about your career…"
              disabled={sending}
              style={{ flex: 1 }}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
            />
            <button type="submit" className="btn btn-primary" disabled={sending || !input.trim()}>
              {sending ? '…' : '➤'}
            </button>
          </form>
        </div>

      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-5px); }
        }
      `}</style>
    </DashboardLayout>
  );
}
