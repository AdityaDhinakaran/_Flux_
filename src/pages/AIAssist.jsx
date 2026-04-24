import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { Send, Zap, Sparkles, FileText, RefreshCw, Copy, Check, ChevronDown } from 'lucide-react';
import './AIAssist.css';

const PROMPTS = [
  { icon: '✍️', label: 'Draft a blog post', prompt: 'Write a compelling blog post about the future of remote work and how teams can stay productive.' },
  { icon: '📋', label: 'Summarize key points', prompt: 'Summarize the top 5 productivity strategies for knowledge workers into bullet points.' },
  { icon: '🧠', label: 'Brainstorm ideas', prompt: 'Give me 10 creative ideas for a team-building activity for a remote software engineering team.' },
  { icon: '📧', label: 'Write an email', prompt: 'Write a professional email to a client explaining a 2-week project delay due to unexpected technical issues.' },
  { icon: '🔍', label: 'Explain a concept', prompt: 'Explain React hooks (useState, useEffect, useContext) in simple terms with practical examples.' },
  { icon: '📊', label: 'Create a plan', prompt: 'Create a 30-60-90 day plan for a new software engineer joining a startup.' },
];

function Message({ msg }) {
  const [copied, setCopied] = useState(false);
  const isAI = msg.role === 'assistant';

  const copy = () => {
    navigator.clipboard.writeText(msg.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`message ${isAI ? 'ai' : 'user'}`}>
      {isAI && (
        <div className="ai-avatar">
          <Zap size={14} strokeWidth={2.5} />
        </div>
      )}
      <div className="message-bubble">
        <div className="message-text">
          {msg.content.split('\n').map((line, i) => {
            if (line.startsWith('# ')) return <h2 key={i} className="msg-h2">{line.slice(2)}</h2>;
            if (line.startsWith('## ')) return <h3 key={i} className="msg-h3">{line.slice(3)}</h3>;
            if (line.startsWith('- ') || line.startsWith('• ')) return <div key={i} className="msg-bullet">• {line.slice(2)}</div>;
            if (line.match(/^\d+\./)) return <div key={i} className="msg-numbered">{line}</div>;
            if (line.startsWith('**') && line.endsWith('**')) return <strong key={i}>{line.slice(2, -2)}</strong>;
            if (line.trim() === '') return <br key={i} />;
            return <p key={i} className="msg-p">{line}</p>;
          })}
        </div>
        {isAI && (
          <div className="message-actions">
            <button className="msg-action-btn" onClick={copy}>
              {copied ? <Check size={12} /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}
      </div>
      {!isAI && (
        <div className="user-avatar">A</div>
      )}
    </div>
  );
}

export default function AIAssist() {
  const { pages, createPage } = useApp();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm Flux AI — your intelligent writing assistant. I can help you draft documents, brainstorm ideas, summarize content, and more. What would you like to create today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState('');
  const [showPagePicker, setShowPagePicker] = useState(false);
  const bottomRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (content = input) => {
    if (!content.trim() || loading) return;
    const userMsg = { role: 'user', content };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    // Build system context from selected page
    let systemPrompt = `You are Flux AI, a helpful, smart, and creative writing assistant embedded in a modern note-taking and workspace app called Flux. You help users write, brainstorm, summarize, explain, and plan. Format your responses clearly with markdown-style headings and bullet points where appropriate. Be concise but thorough.`;

    if (selectedPage) {
      const page = pages.find(p => p.id === selectedPage);
      if (page) {
        const pageText = page.blocks?.map(b => b.content).filter(Boolean).join('\n') || '';
        systemPrompt += `\n\nContext — the user has shared the following page from their workspace titled "${page.title}":\n\n${pageText}\n\nUse this context when relevant to their question.`;
      }
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const aiText = data.content?.[0]?.text || 'Sorry, I could not generate a response. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: aiText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please check your connection and try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const saveAsPage = async () => {
    const lastAI = [...messages].reverse().find(m => m.role === 'assistant' && m.content.length > 50);
    if (!lastAI) return;
    const lines = lastAI.content.split('\n').filter(Boolean);
    const blocks = lines.map((line, i) => {
      const id = `b-${i}-${Date.now()}`;
      if (line.startsWith('# ')) return { id, type: 'heading1', content: line.slice(2) };
      if (line.startsWith('## ')) return { id, type: 'heading2', content: line.slice(3) };
      if (line.startsWith('- ') || line.startsWith('• ')) return { id, type: 'bullet', content: line.slice(2) };
      if (line.match(/^\d+\./)) return { id, type: 'numbered', content: line };
      return { id, type: 'paragraph', content: line };
    });
    const id = createPage(null, blocks);
    navigate(`/page/${id}`);
  };

  const clearChat = () => {
    setMessages([{
      role: 'assistant',
      content: "Chat cleared! What would you like to work on?"
    }]);
  };

  return (
    <div className="ai-assist fade-in">
      <div className="ai-header">
        <div className="ai-title-row">
          <div className="ai-logo"><Zap size={20} strokeWidth={2.5} /></div>
          <div>
            <h1 className="ai-heading">Flux AI</h1>
            <p className="ai-sub">Your intelligent writing & thinking assistant</p>
          </div>
        </div>
        <div className="ai-header-actions">
          <div className="page-context-picker">
            <button className="context-btn" onClick={() => setShowPagePicker(!showPagePicker)}>
              <FileText size={14} />
              {selectedPage ? pages.find(p => p.id === selectedPage)?.title || 'Page' : 'Add context'}
              <ChevronDown size={12} />
            </button>
            {showPagePicker && (
              <>
                <div className="picker-overlay" onClick={() => setShowPagePicker(false)} />
                <div className="page-picker-dropdown fade-in">
                  <div className="picker-label">Use page as context</div>
                  <button className="picker-item" onClick={() => { setSelectedPage(''); setShowPagePicker(false); }}>
                    No context
                  </button>
                  {pages.map(p => (
                    <button key={p.id} className={`picker-item ${selectedPage === p.id ? 'selected' : ''}`}
                      onClick={() => { setSelectedPage(p.id); setShowPagePicker(false); }}>
                      {p.emoji} {p.title || 'Untitled'}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
          {messages.length > 2 && (
            <>
              <button className="ai-action-btn" onClick={saveAsPage} title="Save AI response as new page">
                <FileText size={14} /> Save as page
              </button>
              <button className="ai-action-btn" onClick={clearChat} title="Clear chat">
                <RefreshCw size={14} /> Clear
              </button>
            </>
          )}
        </div>
      </div>

      {messages.length <= 1 && (
        <div className="prompt-suggestions">
          <div className="prompts-label"><Sparkles size={14} /> Quick prompts</div>
          <div className="prompts-grid">
            {PROMPTS.map((p, i) => (
              <button key={i} className="prompt-chip" onClick={() => sendMessage(p.prompt)}>
                <span className="prompt-icon">{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="messages-area">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && (
          <div className="message ai">
            <div className="ai-avatar"><Zap size={14} strokeWidth={2.5} /></div>
            <div className="message-bubble">
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="ai-input-area">
        {selectedPage && (
          <div className="context-indicator">
            <FileText size={12} />
            Using "{pages.find(p => p.id === selectedPage)?.title}" as context
            <button onClick={() => setSelectedPage('')}>✕</button>
          </div>
        )}
        <div className="ai-input-row">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Flux AI anything... (Shift+Enter for new line)"
            className="ai-textarea"
            rows={1}
            style={{ height: 'auto', minHeight: '44px' }}
            onInput={e => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 150) + 'px';
            }}
          />
          <button
            className={`send-btn ${input.trim() && !loading ? 'active' : ''}`}
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="ai-footer-note">Flux AI powered by Claude · Responses may not always be accurate</div>
      </div>
    </div>
  );
}
