import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Plus, Star, Clock, FileText, Zap, TrendingUp } from 'lucide-react';
import './Home.css';

const COVER_GRADIENTS = {
  '#6c63ff': 'linear-gradient(135deg, #6c63ff, #a78bfa)',
  '#ff6b6b': 'linear-gradient(135deg, #ff6b6b, #fca5a5)',
  '#06d6a0': 'linear-gradient(135deg, #06d6a0, #6ee7b7)',
  '#f8c94c': 'linear-gradient(135deg, #f8c94c, #fde68a)',
  '#c77dff': 'linear-gradient(135deg, #c77dff, #e9d5ff)',
  '#4ecdc4': 'linear-gradient(135deg, #4ecdc4, #a7f3d0)',
  null: 'linear-gradient(135deg, #e0e0e0, #f5f5f5)',
};

function PageCard({ page, onClick }) {
  const bg = COVER_GRADIENTS[page.coverColor] || COVER_GRADIENTS[null];
  return (
    <div className="page-card" onClick={() => onClick(page.id)}>
      <div className="card-cover" style={{ background: bg }}>
        <span className="card-emoji">{page.emoji || '📄'}</span>
      </div>
      <div className="card-body">
        <div className="card-title">{page.title || 'Untitled'}</div>
        <div className="card-meta">
          {page.isFavorite && <Star size={11} className="fav-star" />}
          <span>{page.wordCount || 0} words</span>
          <span>·</span>
          <span>{new Date(page.updatedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const { pages, createPage, setActivePageId } = useApp();
  const navigate = useNavigate();

  const handleOpen = (pageId) => {
    setActivePageId(pageId);
    navigate(`/page/${pageId}`);
  };

  const favorites = pages.filter(p => p.isFavorite);
  const recent = [...pages].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 6);

  const handleNew = () => {
    const id = createPage();
    navigate(`/page/${id}`);
  };

  const totalWords = pages.reduce((s, p) => s + (p.wordCount || 0), 0);
  const locked = pages.filter(p => p.isLocked).length;

  return (
    <div className="home fade-in">
      <div className="home-hero">
        <div className="home-hero-content">
          <div className="hero-logo"><Zap size={28} strokeWidth={2.5} /></div>
          <div>
            <h1 className="hero-title">Good to see you ✨</h1>
            <p className="hero-sub">Your thinking space is ready. {pages.length} pages, {totalWords.toLocaleString()} words.</p>
          </div>
        </div>
        <button className="flux-btn flux-btn-primary hero-cta" onClick={handleNew}>
          <Plus size={16} /> New page
        </button>
      </div>

      <div className="home-stats">
        <div className="stat-card">
          <div className="stat-num">{pages.length}</div>
          <div className="stat-label"><FileText size={13} /> Total pages</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{favorites.length}</div>
          <div className="stat-label"><Star size={13} /> Favorites</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{totalWords.toLocaleString()}</div>
          <div className="stat-label"><TrendingUp size={13} /> Words written</div>
        </div>
        <div className="stat-card">
          <div className="stat-num">{locked}</div>
          <div className="stat-label">🔒 Locked</div>
        </div>
      </div>

      {favorites.length > 0 && (
        <section className="home-section">
          <div className="section-header">
            <Star size={16} className="section-icon" />
            <h2>Favorites</h2>
          </div>
          <div className="cards-grid">
            {favorites.map(page => <PageCard key={page.id} page={page} onClick={handleOpen} />)}
          </div>
        </section>
      )}

      <section className="home-section">
        <div className="section-header">
          <Clock size={16} className="section-icon" />
          <h2>Recently updated</h2>
        </div>
        <div className="cards-grid">
          {recent.map(page => <PageCard key={page.id} page={page} onClick={handleOpen} />)}
        </div>
      </section>

      <section className="home-section">
        <div className="section-header">
          <Plus size={16} className="section-icon" />
          <h2>Quick actions</h2>
        </div>
        <div className="quick-actions">
          <button className="quick-action-btn" onClick={handleNew}>
            <span className="qa-icon">📝</span>
            <span>New page</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/templates')}>
            <span className="qa-icon">🗂️</span>
            <span>Templates</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/database')}>
            <span className="qa-icon">🗄️</span>
            <span>Database</span>
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/ai-assist')}>
            <span className="qa-icon">🤖</span>
            <span>AI Assist</span>
          </button>
        </div>
      </section>
    </div>
  );
}
