import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { TEMPLATES } from '../data/initialData';
import { v4 as uuidv4 } from 'uuid';
import { LayoutTemplate, Search, ArrowRight } from 'lucide-react';
import './Templates.css';

const CATEGORIES = ['All', 'Work', 'Personal', 'Engineering'];

export default function Templates() {
  const { createPage } = useApp();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('All');
  const [query, setQuery] = useState('');

  const filtered = TEMPLATES.filter(t => {
    const matchCat = activeCategory === 'All' || t.category === activeCategory;
    const matchQ = !query || t.title.toLowerCase().includes(query.toLowerCase()) || t.description.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  const useTemplate = (template) => {
    const blocks = template.blocks.map(b => ({ ...b, id: `b-${uuidv4().slice(0, 8)}` }));
    const id = createPage(null, blocks);
    // Update title separately
    navigate(`/page/${id}`);
  };

  return (
    <div className="templates-view fade-in">
      <div className="templates-header">
        <div className="templates-title-row">
          <LayoutTemplate size={28} className="tpl-icon" />
          <div>
            <h1 className="tpl-heading">Templates</h1>
            <p className="tpl-sub">Jumpstart your work with pre-built page structures</p>
          </div>
        </div>
        <div className="templates-search">
          <Search size={15} />
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search templates..."
            className="tpl-search-input"
          />
        </div>
      </div>

      <div className="category-tabs">
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            className={`cat-tab ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="templates-grid">
        {filtered.map(template => (
          <div key={template.id} className="template-card">
            <div className="tpl-card-header">
              <span className="tpl-emoji">{template.icon}</span>
              <span className="tpl-category-badge">{template.category}</span>
            </div>
            <div className="tpl-card-body">
              <h3 className="tpl-title">{template.title}</h3>
              <p className="tpl-desc">{template.description}</p>
            </div>
            <div className="tpl-card-preview">
              {template.blocks.slice(0, 4).map((block, i) => (
                <div key={i} className={`preview-line preview-${block.type}`}>
                  {block.type === 'heading1' && <span className="preview-h1">{block.content}</span>}
                  {block.type === 'heading2' && <span className="preview-h2">{block.content}</span>}
                  {block.type === 'paragraph' && <span className="preview-p">{block.content.slice(0, 50)}...</span>}
                  {block.type === 'bullet' && <span className="preview-bullet">• {block.content}</span>}
                  {block.type === 'todo' && <span className="preview-todo">☐ {block.content}</span>}
                  {block.type === 'numbered' && <span className="preview-numbered">{i}. {block.content}</span>}
                </div>
              ))}
            </div>
            <button className="use-template-btn" onClick={() => useTemplate(template)}>
              Use template <ArrowRight size={14} />
            </button>
          </div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="no-templates">
          <span style={{ fontSize: 48 }}>🔍</span>
          <p>No templates match your search</p>
        </div>
      )}
    </div>
  );
}
