import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import SearchModal from './components/SearchModal';
import Home from './pages/Home';
import PageView from './pages/PageView';
import DatabaseView from './pages/DatabaseView';
import Templates from './pages/Templates';
import AIAssist from './pages/AIAssist';
import SettingsPage from './pages/SettingsPage';
import './App.css';

function AppShell() {
  const { sidebarOpen, setSidebarOpen, searchOpen, setSearchOpen, setCommandOpen } = useApp();

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setSearchOpen]);

  return (
    <div className="app-shell">
      {sidebarOpen && <Sidebar />}
      {!sidebarOpen && (
        <button className="sidebar-open-btn" onClick={() => setSidebarOpen(true)} title="Open sidebar">
          ⚡
        </button>
      )}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/page/:pageId" element={<PageView />} />
          <Route path="/database" element={<DatabaseView />} />
          <Route path="/templates" element={<Templates />} />
          <Route path="/ai-assist" element={<AIAssist />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {searchOpen && <SearchModal />}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
