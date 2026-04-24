import React, { useState, useRef, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import './BlockEditor.css';

const BLOCK_TYPES = [
  { type: 'paragraph', label: 'Text', icon: '¶', desc: 'Just start writing' },
  { type: 'heading1', label: 'Heading 1', icon: 'H1', desc: 'Big section heading' },
  { type: 'heading2', label: 'Heading 2', icon: 'H2', desc: 'Medium heading' },
  { type: 'heading3', label: 'Heading 3', icon: 'H3', desc: 'Small heading' },
  { type: 'bullet', label: 'Bullet List', icon: '•', desc: 'Unordered list item' },
  { type: 'numbered', label: 'Numbered List', icon: '1.', desc: 'Ordered list item' },
  { type: 'todo', label: 'To-do', icon: '☐', desc: 'Trackable todo item' },
  { type: 'callout', label: 'Callout', icon: '💡', desc: 'Highlight a note' },
  { type: 'code', label: 'Code', icon: '<>', desc: 'Code block' },
  { type: 'divider', label: 'Divider', icon: '—', desc: 'Horizontal separator' },
  { type: 'quote', label: 'Quote', icon: '"', desc: 'Block quotation' },
];

function CommandMenu({ onSelect, onClose, position }) {
  const [query, setQuery] = useState('');
  const filtered = BLOCK_TYPES.filter(b =>
    b.label.toLowerCase().includes(query.toLowerCase()) ||
    b.type.includes(query.toLowerCase())
  );

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <div className="command-menu" style={{ top: position.top, left: position.left }}>
      <input
        autoFocus
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder="Search blocks..."
        className="command-search"
      />
      <div className="command-list">
        {filtered.map(b => (
          <button key={b.type} className="command-item" onClick={() => onSelect(b.type)}>
            <span className="cmd-icon">{b.icon}</span>
            <div>
              <div className="cmd-label">{b.label}</div>
              <div className="cmd-desc">{b.desc}</div>
            </div>
          </button>
        ))}
        {filtered.length === 0 && <div className="no-results">No results found</div>}
      </div>
    </div>
  );
}

function Block({ block, index, blocks, onUpdate, onDelete, onInsertAfter, onKeyDown, isLocked, numberedIndex }) {
  const ref = useRef(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showCmd, setShowCmd] = useState(false);
  const [cmdPos, setCmdPos] = useState({ top: 0, left: 0 });

  const handleInput = (e) => {
    const content = e.currentTarget.textContent;
    if (content === '/' && !showCmd) {
      const rect = e.currentTarget.getBoundingClientRect();
      setCmdPos({ top: rect.bottom + 4, left: rect.left });
      setShowCmd(true);
      return;
    }
    onUpdate(block.id, { content });
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onInsertAfter(index);
    } else if (e.key === 'Backspace' && (block.content === '' || block.content === undefined)) {
      e.preventDefault();
      onDelete(block.id);
    }
    onKeyDown && onKeyDown(e, block.id);
  };

  const handleCmdSelect = (type) => {
    onUpdate(block.id, { type, content: '' });
    setShowCmd(false);
    setTimeout(() => ref.current?.focus(), 50);
  };

  const renderBlock = () => {
    const commonProps = {
      ref,
      contentEditable: !isLocked,
      suppressContentEditableWarning: true,
      onInput: handleInput,
      onKeyDown: handleKey,
      className: 'block-content',
      'data-placeholder': block.type === 'paragraph' ? "Type '/' for commands..." : 'Write something...',
    };

    switch (block.type) {
      case 'heading1': return <h1 {...commonProps} className="block-content h1">{block.content}</h1>;
      case 'heading2': return <h2 {...commonProps} className="block-content h2">{block.content}</h2>;
      case 'heading3': return <h3 {...commonProps} className="block-content h3">{block.content}</h3>;
      case 'bullet': return (
        <div className="block-bullet-row">
          <span className="bullet-dot">•</span>
          <div {...commonProps}>{block.content}</div>
        </div>
      );
      case 'numbered': return (
        <div className="block-bullet-row">
          <span className="bullet-dot numbered">{numberedIndex}.</span>
          <div {...commonProps}>{block.content}</div>
        </div>
      );
      case 'todo': return (
        <div className="block-todo-row">
          <input
            type="checkbox"
            checked={block.checked || false}
            onChange={e => onUpdate(block.id, { checked: e.target.checked })}
            disabled={isLocked}
            className="todo-check"
          />
          <div {...commonProps} className={`block-content ${block.checked ? 'done' : ''}`}>{block.content}</div>
        </div>
      );
      case 'callout': return (
        <div className="block-callout">
          <span className="callout-icon">💡</span>
          <div {...commonProps}>{block.content}</div>
        </div>
      );
      case 'code': return (
        <div className="block-code-wrap">
          <div className="code-label">Code</div>
          <pre><code {...commonProps} className="block-content code-content">{block.content}</code></pre>
        </div>
      );
      case 'divider': return <hr className="block-divider" />;
      case 'quote': return (
        <blockquote className="block-quote">
          <div {...commonProps}>{block.content}</div>
        </blockquote>
      );
      default: return <p {...commonProps}>{block.content}</p>;
    }
  };

  return (
    <div
      className={`block-wrapper ${showMenu ? 'show-actions' : ''}`}
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => { setShowMenu(false); }}
    >
      {!isLocked && (
        <div className="block-actions">
          <button className="block-action-btn" onClick={() => onInsertAfter(index)} title="Add block">
            <Plus size={13} />
          </button>
          <button className="block-action-btn drag-handle" title="Drag to reorder">
            <GripVertical size={13} />
          </button>
        </div>
      )}
      <div className="block-inner">
        {renderBlock()}
      </div>
      {!isLocked && (
        <div className="block-del-btn">
          <button onClick={() => onDelete(block.id)} title="Delete block">
            <Trash2 size={12} />
          </button>
        </div>
      )}
      {showCmd && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setShowCmd(false)} />
          <CommandMenu onSelect={handleCmdSelect} onClose={() => setShowCmd(false)} position={cmdPos} />
        </>
      )}
    </div>
  );
}

export default function BlockEditor({ blocks, onChange, isLocked }) {
  const [bks, setBks] = useState(blocks || []);

  useEffect(() => {
    setBks(blocks || []);
  }, [blocks]);

  const update = useCallback((id, updates) => {
    const next = bks.map(b => b.id === id ? { ...b, ...updates } : b);
    setBks(next);
    onChange(next);
  }, [bks, onChange]);

  const deleteBlock = useCallback((id) => {
    if (bks.length <= 1) return;
    const next = bks.filter(b => b.id !== id);
    setBks(next);
    onChange(next);
  }, [bks, onChange]);

  const insertAfter = useCallback((index) => {
    const newBlock = { id: `b-${uuidv4().slice(0,8)}`, type: 'paragraph', content: '' };
    const next = [...bks.slice(0, index + 1), newBlock, ...bks.slice(index + 1)];
    setBks(next);
    onChange(next);
    setTimeout(() => {
      const el = document.querySelectorAll('.block-content')[index + 1];
      el?.focus();
    }, 50);
  }, [bks, onChange]);

  let numberedCount = 0;

  return (
    <div className="block-editor">
      {bks.map((block, i) => {
        if (block.type === 'numbered') numberedCount++;
        else numberedCount = 0;
        return (
          <Block
            key={block.id}
            block={block}
            index={i}
            blocks={bks}
            onUpdate={update}
            onDelete={deleteBlock}
            onInsertAfter={insertAfter}
            isLocked={isLocked}
            numberedIndex={numberedCount}
          />
        );
      })}
      {!isLocked && (
        <button className="add-block-btn" onClick={() => insertAfter(bks.length - 1)}>
          <Plus size={14} /> Add a block
        </button>
      )}
    </div>
  );
}
