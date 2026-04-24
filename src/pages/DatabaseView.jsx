import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Table2, Kanban, Trash2, Edit3 } from 'lucide-react';
import './DatabaseView.css';

const STATUS_COLORS = {
  'Todo': { bg: '#f1f5f9', text: '#64748b' },
  'In Progress': { bg: '#ede9ff', text: '#6c63ff' },
  'Done': { bg: '#d1fae5', text: '#059669' },
  'Blocked': { bg: '#fee2e2', text: '#dc2626' },
};

const PRIORITY_COLORS = {
  'Low': { bg: '#f0fdf4', text: '#16a34a' },
  'Medium': { bg: '#fefce8', text: '#ca8a04' },
  'High': { bg: '#fff7ed', text: '#ea580c' },
  'Critical': { bg: '#fef2f2', text: '#dc2626' },
};

const KANBAN_COLUMNS = ['Todo', 'In Progress', 'Done'];

function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || { bg: '#f1f5f9', text: '#64748b' };
  return <span className="badge" style={{ background: c.bg, color: c.text }}>{status}</span>;
}

function PriorityBadge({ priority }) {
  const c = PRIORITY_COLORS[priority] || { bg: '#f1f5f9', text: '#64748b' };
  return <span className="badge" style={{ background: c.bg, color: c.text }}>{priority}</span>;
}

function TableView({ db }) {
  const { addDbRow, updateDbRow, deleteDbRow } = useApp();
  const [editCell, setEditCell] = useState(null);

  const handleEdit = (rowId, field, value) => {
    updateDbRow(db.id, rowId, field, value);
    setEditCell(null);
  };

  return (
    <div className="table-view">
      <div className="table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {db.fields.map(f => <th key={f}>{f}</th>)}
              <th className="actions-th"></th>
            </tr>
          </thead>
          <tbody>
            {db.rows.map(row => (
              <tr key={row.id}>
                {db.fields.map(field => (
                  <td key={field} onClick={() => setEditCell(`${row.id}-${field}`)}>
                    {editCell === `${row.id}-${field}` ? (
                      field === 'Status' ? (
                        <select
                          autoFocus
                          defaultValue={row[field]}
                          onBlur={e => handleEdit(row.id, field, e.target.value)}
                          onChange={e => handleEdit(row.id, field, e.target.value)}
                          className="cell-select"
                        >
                          {Object.keys(STATUS_COLORS).map(s => <option key={s}>{s}</option>)}
                        </select>
                      ) : field === 'Priority' ? (
                        <select
                          autoFocus
                          defaultValue={row[field]}
                          onBlur={e => handleEdit(row.id, field, e.target.value)}
                          onChange={e => handleEdit(row.id, field, e.target.value)}
                          className="cell-select"
                        >
                          {Object.keys(PRIORITY_COLORS).map(p => <option key={p}>{p}</option>)}
                        </select>
                      ) : (
                        <input
                          autoFocus
                          defaultValue={row[field] || ''}
                          onBlur={e => handleEdit(row.id, field, e.target.value)}
                          className="cell-input"
                          type={field === 'Due Date' ? 'date' : 'text'}
                        />
                      )
                    ) : (
                      field === 'Status' ? <StatusBadge status={row[field]} /> :
                      field === 'Priority' ? <PriorityBadge priority={row[field]} /> :
                      <span className="cell-text">{row[field] || <span className="empty-cell">—</span>}</span>
                    )}
                  </td>
                ))}
                <td>
                  <button className="del-row-btn" onClick={() => deleteDbRow(db.id, row.id)}><Trash2 size={13} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="add-row-btn" onClick={() => addDbRow(db.id)}>
        <Plus size={14} /> Add row
      </button>
    </div>
  );
}

function KanbanView({ db }) {
  const { updateDbRow, addDbRow } = useApp();
  const [dragging, setDragging] = useState(null);

  const getByStatus = (status) => db.rows.filter(r => r.Status === status);

  const handleDrop = (e, status) => {
    e.preventDefault();
    if (dragging) updateDbRow(db.id, dragging, 'Status', status);
    setDragging(null);
  };

  return (
    <div className="kanban-view">
      {KANBAN_COLUMNS.map(col => {
        const rows = getByStatus(col);
        const colors = STATUS_COLORS[col];
        return (
          <div
            key={col}
            className="kanban-col"
            onDragOver={e => e.preventDefault()}
            onDrop={e => handleDrop(e, col)}
          >
            <div className="kanban-col-header">
              <span className="kanban-status" style={{ background: colors.bg, color: colors.text }}>{col}</span>
              <span className="kanban-count">{rows.length}</span>
            </div>
            <div className="kanban-cards">
              {rows.map(row => (
                <div
                  key={row.id}
                  className="kanban-card"
                  draggable
                  onDragStart={() => setDragging(row.id)}
                >
                  <div className="kc-title">{row.Title}</div>
                  <div className="kc-meta">
                    <PriorityBadge priority={row.Priority} />
                    {row.Assignee && <span className="kc-assignee">{row.Assignee}</span>}
                  </div>
                  {row['Due Date'] && <div className="kc-date">📅 {row['Due Date']}</div>}
                </div>
              ))}
              <button className="kanban-add-btn" onClick={() => addDbRow(db.id)}>
                <Plus size={13} /> Add card
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DatabaseView() {
  const { databases } = useApp();
  const [viewMode, setViewMode] = useState('table');
  const db = databases[0];

  return (
    <div className="db-view fade-in">
      <div className="db-header">
        <div className="db-title-row">
          <span className="db-emoji">✅</span>
          <h1 className="db-title">{db?.title}</h1>
        </div>
        <div className="db-view-switcher">
          <button
            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            <Table2 size={15} /> Table
          </button>
          <button
            className={`view-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            onClick={() => setViewMode('kanban')}
          >
            <Kanban size={15} /> Kanban
          </button>
        </div>
      </div>

      {db && (
        viewMode === 'table' ? <TableView db={db} /> : <KanbanView db={db} />
      )}
    </div>
  );
}
