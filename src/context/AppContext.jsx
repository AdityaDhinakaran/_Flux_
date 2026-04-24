import React, { createContext, useContext, useState, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { INITIAL_PAGES, INITIAL_DATABASES } from '../data/initialData';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [pages, setPages] = useState(INITIAL_PAGES);
  const [databases, setDatabases] = useState(INITIAL_DATABASES);
  const [theme, setTheme] = useState('light');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [activePageId, setActivePageId] = useState('page-1');

  const toggleTheme = useCallback(() => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      return next;
    });
  }, []);

  const createPage = useCallback((parentId = null, templateBlocks = null) => {
    const id = `page-${uuidv4().slice(0, 8)}`;
    const newPage = {
      id,
      title: 'Untitled',
      icon: '📄',
      emoji: '📄',
      parentId,
      isFavorite: false,
      isLocked: false,
      tags: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      coverColor: null,
      wordCount: 0,
      blocks: templateBlocks || [
        { id: `b-${uuidv4().slice(0,6)}`, type: 'heading1', content: 'Untitled' },
        { id: `b-${uuidv4().slice(0,6)}`, type: 'paragraph', content: '' },
      ]
    };
    setPages(prev => [...prev, newPage]);
    setActivePageId(id);
    return id;
  }, []);

  const updatePage = useCallback((id, updates) => {
    setPages(prev => prev.map(p =>
      p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
    ));
  }, []);

  const deletePage = useCallback((id) => {
    setPages(prev => prev.filter(p => p.id !== id && p.parentId !== id));
    setActivePageId(prev => prev === id ? 'page-1' : prev);
  }, []);

  const toggleFavorite = useCallback((id) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, isFavorite: !p.isFavorite } : p));
  }, []);

  const toggleLock = useCallback((id) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, isLocked: !p.isLocked } : p));
  }, []);

  const duplicatePage = useCallback((id) => {
    const page = pages.find(p => p.id === id);
    if (!page) return;
    const newId = `page-${uuidv4().slice(0, 8)}`;
    const newPage = {
      ...page,
      id: newId,
      title: `${page.title} (Copy)`,
      isFavorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      blocks: page.blocks.map(b => ({ ...b, id: `b-${uuidv4().slice(0,6)}` })),
    };
    setPages(prev => [...prev, newPage]);
    setActivePageId(newId);
    return newId;
  }, [pages]);

  const updatePageBlocks = useCallback((pageId, blocks) => {
    setPages(prev => prev.map(p =>
      p.id === pageId
        ? { ...p, blocks, updatedAt: new Date().toISOString(), wordCount: blocks.reduce((a, b) => a + (b.content || '').split(' ').filter(Boolean).length, 0) }
        : p
    ));
  }, []);

  const updateDatabase = useCallback((dbId, updates) => {
    setDatabases(prev => prev.map(db => db.id === dbId ? { ...db, ...updates } : db));
  }, []);

  const addDbRow = useCallback((dbId) => {
    setDatabases(prev => prev.map(db => {
      if (db.id !== dbId) return db;
      const newRow = { id: `r-${uuidv4().slice(0,6)}`, Title: 'New item', Status: 'Todo', Priority: 'Medium', Assignee: '', 'Due Date': '' };
      return { ...db, rows: [...db.rows, newRow] };
    }));
  }, []);

  const updateDbRow = useCallback((dbId, rowId, field, value) => {
    setDatabases(prev => prev.map(db => {
      if (db.id !== dbId) return db;
      return { ...db, rows: db.rows.map(r => r.id === rowId ? { ...r, [field]: value } : r) };
    }));
  }, []);

  const deleteDbRow = useCallback((dbId, rowId) => {
    setDatabases(prev => prev.map(db => {
      if (db.id !== dbId) return db;
      return { ...db, rows: db.rows.filter(r => r.id !== rowId) };
    }));
  }, []);

  return (
    <AppContext.Provider value={{
      pages, databases, theme, sidebarOpen, searchOpen, commandOpen, activePageId,
      setActivePageId, setSidebarOpen, setSearchOpen, setCommandOpen,
      toggleTheme, createPage, updatePage, deletePage, toggleFavorite, toggleLock,
      duplicatePage, updatePageBlocks, updateDatabase, addDbRow, updateDbRow, deleteDbRow,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
