import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  Search, Plus, Home, Star, Trash2, ChevronDown, ChevronRight,
  Lock, FileText, Settings, Moon, Sun, Database, LayoutTemplate,
  PanelLeftClose, Zap
} from 'lucide-react';
import './Sidebar.css';

function PageTreeItem({ page, depth = 0, allPages, onNavigate, activePageId }) {
  const [expanded, setExpanded] = useState(false);
  const { deletePage, toggleFavorite, duplicatePage, createPage, toggleLock } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const children = allPages.filter(p => p.parentId === page.id);
  const isActive = activePageId === page.id;

  return (
    <div className="page-tree-item">
      <div
        className={`page-tree-row ${isActive ? 'active' : ''}`}
        style={{ paddingLeft: `${12 + depth * 16}px` }}
        onClick={() => onNavigate(page.id)}
        onContextMenu={e => { e.preventDefault(); setMenuOpen(true); }}
      >
        <button
          className="expand-btn"
          onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
          style={{ opacity: children.length > 0 ? 1 : 0.2 }}
        >
          {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        </button>
        <span className="page-emoji">{page.emoji || page.icon || '📄'}</span>
        <span className="page-title">{page.title || 'Untitled'}</span>
        {page.isLocked && <Lock size={10} className="lock-icon" />}
        <div className="page-actions">
          <button onClick={e => { e.stopPropagation(); createPage(page.id); }} title="New sub-page"><Plus size={12} /></button>
          <button onClick={e => { e.stopPropagation(); setMenuOpen(!menuOpen); }} title="More options">···</button>
        </div>
      </div>
      {menuOpen && (
        <div className="page-context-menu" onClick={() => setMenuOpen(false)}>
          <div className="overlay" onClick={() => setMenuOpen(false)} />
          <div className="menu-dropdown">
            <button onClick={() => toggleFavorite(page.id)}>
              <Star size={13} /> {page.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
            </button>
            <button onClick={() => duplicatePage(page.id)}><FileText size={13} /> Duplicate</button>
            <button onClick={() => toggleLock(page.id)}><Lock size={13} /> {page.isLocked ? 'Unlock' : 'Lock'}</button>
            <div className="menu-divider" />
            <button className="danger" onClick={() => deletePage(page.id)}><Trash2 size={13} /> Delete</button>
          </div>
        </div>
      )}
      {expanded && children.length > 0 && (
        <div className="page-children">
          {children.map(child => (
            <PageTreeItem key={child.id} page={child} depth={depth + 1} allPages={allPages} onNavigate={onNavigate} activePageId={activePageId} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Sidebar() {
  const { pages, theme, toggleTheme, createPage, setSidebarOpen, activePageId, setActivePageId, setSearchOpen } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const rootPages = pages.filter(p => !p.parentId);
  const favorites = pages.filter(p => p.isFavorite);

  const handleNavigate = (pageId) => {
    setActivePageId(pageId);
    navigate(`/page/${pageId}`);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="workspace-info">
          <div className="workspace-logo">
            <Zap size={16} strokeWidth={2.5} />
          </div>
          <div className="workspace-text">
            <span className="workspace-name">Flux Workspace</span>
            <span className="workspace-plan">Free plan</span>
          </div>
        </div>
        <button className="sidebar-close-btn" onClick={() => setSidebarOpen(false)} title="Close sidebar">
          <PanelLeftClose size={16} />
        </button>
      </div>

      <div className="sidebar-nav">
        <button className={`nav-item ${isActive('/') ? 'active' : ''}`} onClick={() => navigate('/')}>
          <Home size={15} /> Home
        </button>
        <button className="nav-item" onClick={() => setSearchOpen(true)}>
          <Search size={15} /> Search
          <span className="shortcut">⌘K</span>
        </button>
        <button className={`nav-item ${isActive('/database') ? 'active' : ''}`} onClick={() => navigate('/database')}>
          <Database size={15} /> Database
        </button>
        <button className={`nav-item ${isActive('/templates') ? 'active' : ''}`} onClick={() => navigate('/templates')}>
          <LayoutTemplate size={15} /> Templates
        </button>
      </div>

      {favorites.length > 0 && (
        <div className="sidebar-section">
          <div className="section-label"><Star size={12} /> Favorites</div>
          {favorites.map(page => (
            <div
              key={page.id}
              className={`fav-item ${activePageId === page.id ? 'active' : ''}`}
              onClick={() => handleNavigate(page.id)}
            >
              <span>{page.emoji || '📄'}</span>
              <span>{page.title || 'Untitled'}</span>
            </div>
          ))}
        </div>
      )}

      <div className="sidebar-section">
        <div className="section-label">
          <FileText size={12} /> Pages
          <button className="add-page-btn" onClick={() => createPage()} title="New page"><Plus size={13} /></button>
        </div>
        <div className="pages-tree">
          {rootPages.map(page => (
            <PageTreeItem
              key={page.id}
              page={page}
              allPages={pages}
              onNavigate={handleNavigate}
              activePageId={activePageId}
            />
          ))}
        </div>
        <button className="new-page-btn" onClick={() => createPage()}>
          <Plus size={14} /> New page
        </button>
      </div>

      <div className="sidebar-footer">
        <button className="footer-btn" onClick={toggleTheme}>
          {theme === 'light' ? <Moon size={15} /> : <Sun size={15} />}
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
        <button className="footer-btn" onClick={() => navigate('/settings')}>
          <Settings size={15} /> Settings
        </button>
      </div>
    </aside>
  );
}
