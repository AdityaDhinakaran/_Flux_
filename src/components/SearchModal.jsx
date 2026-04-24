import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Clock, FileText, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';
import './SearchModal.css';

export default function SearchModal() {
  const { pages, setSearchOpen, setActivePageId } = useApp();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const inputRef = useRef(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') setSearchOpen(false); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchOpen]);

  const filtered = query
    ? pages.filter(p =>
        p.title?.toLowerCase().includes(query.toLowerCase()) ||
        p.tags?.some(t => t.includes(query.toLowerCase())) ||
        p.blocks?.some(b => b.content?.toLowerCase().includes(query.toLowerCase()))
      )
    : pages.slice(0, 8);

  const navigate_to = (pageId) => {
    setActivePageId(pageId);
    navigate(`/page/${pageId}`);
    setSearchOpen(false);
  };

  const recent = pages.filter(p => p.updatedAt).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, 4);

  return (
    <div className="search-overlay" onClick={() => setSearchOpen(false)}>
      <div className="search-modal fade-in" onClick={e => e.stopPropagation()}>
        <div className="search-input-row">
          <Search size={18} className="search-icon-left" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search pages, blocks, tags..."
            className="search-input"
          />
          <button className="search-close-btn" onClick={() => setSearchOpen(false)}>
            <X size={16} />
          </button>
        </div>

        <div className="search-results">
          {!query && (
            <div className="search-section-label">
              <Clock size={12} /> Recent
            </div>
          )}
          {query && <div className="search-section-label">Results ({filtered.length})</div>}
          {filtered.map(page => (
            <button key={page.id} className="search-result-item" onClick={() => navigate_to(page.id)}>
              <span className="result-emoji">{page.emoji || '📄'}</span>
              <div className="result-info">
                <span className="result-title">{page.title || 'Untitled'}</span>
                <span className="result-meta">
                  {page.isFavorite && <Star size={10} />}
                  {page.tags?.slice(0, 2).map(t => <span key={t} className="result-tag">{t}</span>)}
                  <span className="result-words">{page.wordCount || 0} words</span>
                </span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="no-results-msg">
              <Search size={32} />
              <p>No pages found for "{query}"</p>
              <span>Try searching with different keywords</span>
            </div>
          )}
        </div>

        <div className="search-footer">
          <span><kbd>↑↓</kbd> Navigate</span>
          <span><kbd>Enter</kbd> Open</span>
          <span><kbd>Esc</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
