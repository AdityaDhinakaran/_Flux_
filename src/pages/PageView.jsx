import React, { useState, useCallback, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import BlockEditor from '../components/BlockEditor';
import {
  Star, Lock, Unlock, Trash2, Copy, MoreHorizontal,
  ChevronRight, Clock, Hash, Smile
} from 'lucide-react';
import './PageView.css';

const EMOJIS = ['📄','📝','📚','🗺️','🎨','🚀','💡','⚙️','🌿','📊','🔬','🎯','💼','🌟','⚡','🔥','🎭','🌈','🏆','🔮'];
const COVER_COLORS = ['#6c63ff','#ff6b6b','#06d6a0','#f8c94c','#c77dff','#4ecdc4','#ff8b94','#a8e6cf','#ffd3b6','#d4e4ff'];

function EmojiPicker({ onSelect, onClose }) {
  return (
    <div className="emoji-picker fade-in">
      <div className="overlay" onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 99 }} />
      <div className="emoji-grid" style={{ zIndex: 100, position: 'relative' }}>
        {EMOJIS.map(e => (
          <button key={e} className="emoji-btn" onClick={() => { onSelect(e); onClose(); }}>{e}</button>
        ))}
      </div>
    </div>
  );
}

export default function PageView() {
  const { pageId } = useParams();
  const { pages, updatePage, updatePageBlocks, toggleFavorite, toggleLock, deletePage, duplicatePage, setActivePageId } = useApp();
  const navigate = useNavigate();
  const page = pages.find(p => p.id === pageId);

  const [showMenu, setShowMenu] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved');

  useEffect(() => {
    if (page) setActivePageId(page.id);
  }, [page, setActivePageId]);

  const handleBlocksChange = useCallback((blocks) => {
    setSaveStatus('saving');
    updatePageBlocks(pageId, blocks);
    setTimeout(() => setSaveStatus('saved'), 800);
  }, [pageId, updatePageBlocks]);

  const handleTitleChange = useCallback((e) => {
    const title = e.currentTarget.textContent;
    updatePage(pageId, { title });
    setSaveStatus('saving');
    setTimeout(() => setSaveStatus('saved'), 800);
  }, [pageId, updatePage]);

  if (!page) return (
    <div className="page-not-found">
      <span style={{ fontSize: 48 }}>🌌</span>
      <h2>Page not found</h2>
      <p>This page may have been deleted or moved.</p>
      <button className="flux-btn flux-btn-primary" onClick={() => navigate('/')}>Go home</button>
    </div>
  );

  const parent = pages.find(p => p.id === page.parentId);

  return (
    <div className="page-view">
      {page.coverColor && (
        <div className="page-cover" style={{ background: page.coverColor }}>
          <button className="change-cover-btn" onClick={() => setShowCoverPicker(!showCoverPicker)}>
            Change cover
          </button>
          {showCoverPicker && (
            <div className="cover-picker fade-in">
              {COVER_COLORS.map(c => (
                <button
                  key={c}
                  className="cover-color-btn"
                  style={{ background: c, border: page.coverColor === c ? '3px solid white' : 'none' }}
                  onClick={() => { updatePage(pageId, { coverColor: c }); setShowCoverPicker(false); }}
                />
              ))}
              <button className="remove-cover-btn" onClick={() => { updatePage(pageId, { coverColor: null }); setShowCoverPicker(false); }}>
                Remove
              </button>
            </div>
          )}
        </div>
      )}

      <div className="page-content-wrap">
        {parent && (
          <div className="breadcrumb">
            <span className="bc-item" onClick={() => navigate(`/page/${parent.id}`)}>
              {parent.emoji} {parent.title}
            </span>
            <ChevronRight size={14} />
            <span className="bc-current">{page.emoji} {page.title}</span>
          </div>
        )}

        <div className="page-header-row">
          <div className="page-emoji-picker" onClick={() => setShowEmoji(!showEmoji)}>
            <span className="page-big-emoji">{page.emoji || '📄'}</span>
            {showEmoji && <EmojiPicker onSelect={e => updatePage(pageId, { emoji: e, icon: e })} onClose={() => setShowEmoji(false)} />}
          </div>

          <div className="page-header-actions">
            <div className="save-indicator">
              <span className={`save-dot ${saveStatus}`} />
              {saveStatus === 'saving' ? 'Saving...' : 'Saved'}
            </div>
            {!page.coverColor && (
              <button className="action-btn" onClick={() => updatePage(pageId, { coverColor: COVER_COLORS[0] })}>
                Add cover
              </button>
            )}
            <button className="action-btn" onClick={() => toggleFavorite(pageId)} title={page.isFavorite ? 'Remove from favorites' : 'Add to favorites'}>
              <Star size={15} fill={page.isFavorite ? 'currentColor' : 'none'} className={page.isFavorite ? 'starred' : ''} />
            </button>
            <button className="action-btn" onClick={() => toggleLock(pageId)} title={page.isLocked ? 'Unlock page' : 'Lock page'}>
              {page.isLocked ? <Unlock size={15} /> : <Lock size={15} />}
            </button>
            <button className="action-btn" onClick={() => setShowMenu(!showMenu)}>
              <MoreHorizontal size={15} />
            </button>

            {showMenu && (
              <>
                <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowMenu(false)} />
                <div className="page-menu fade-in">
                  <div className="menu-meta">
                    <div className="meta-row"><Clock size={12} /> Last edited {new Date(page.updatedAt).toLocaleDateString()}</div>
                    <div className="meta-row"><Hash size={12} /> {page.wordCount || 0} words</div>
                    {page.tags?.length > 0 && (
                      <div className="meta-row">
                        {page.tags.map(t => <span key={t} className="tag-chip">{t}</span>)}
                      </div>
                    )}
                  </div>
                  <div className="menu-divider" />
                  <button onClick={() => { duplicatePage(pageId); setShowMenu(false); }}><Copy size={13} /> Duplicate page</button>
                  <button className="danger" onClick={() => { deletePage(pageId); navigate('/'); setShowMenu(false); }}>
                    <Trash2 size={13} /> Delete page
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {page.isLocked && (
          <div className="locked-banner">
            🔒 This page is locked. <button onClick={() => toggleLock(pageId)}>Click to unlock</button>
          </div>
        )}

        <h1
          className="page-title-input"
          contentEditable={!page.isLocked}
          suppressContentEditableWarning
          onBlur={handleTitleChange}
          data-placeholder="Untitled"
        >
          {page.title}
        </h1>

        <BlockEditor
          key={pageId}
          blocks={page.blocks || []}
          onChange={handleBlocksChange}
          isLocked={page.isLocked}
        />
      </div>
    </div>
  );
}
