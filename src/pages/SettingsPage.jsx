import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Settings, Moon, Sun, Trash2, Download, User, Bell, Lock, Palette } from 'lucide-react';
import './SettingsPage.css';

const ACCENT_COLORS = [
  { name: 'Violet', value: '#6c63ff' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Pink', value: '#ec4899' },
];

export default function SettingsPage() {
  const { theme, toggleTheme, pages } = useApp();
  const [accentColor, setAccentColor] = useState('#6c63ff');
  const [notificationsOn, setNotificationsOn] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [activeSection, setActiveSection] = useState('profile');

  const applyAccent = (color) => {
    setAccentColor(color);
    document.documentElement.style.setProperty('--accent', color);
  };

  const exportData = () => {
    const data = JSON.stringify(pages, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flux-export.json';
    a.click();
  };

  const SECTIONS = [
    { id: 'profile', label: 'Profile', icon: <User size={15} /> },
    { id: 'appearance', label: 'Appearance', icon: <Palette size={15} /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell size={15} /> },
    { id: 'privacy', label: 'Privacy', icon: <Lock size={15} /> },
    { id: 'data', label: 'Data & Export', icon: <Download size={15} /> },
  ];

  return (
    <div className="settings-view fade-in">
      <div className="settings-header">
        <Settings size={24} />
        <h1>Settings</h1>
      </div>

      <div className="settings-layout">
        <div className="settings-nav">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`settings-nav-item ${activeSection === s.id ? 'active' : ''}`}
              onClick={() => setActiveSection(s.id)}
            >
              {s.icon} {s.label}
            </button>
          ))}
        </div>

        <div className="settings-content">
          {activeSection === 'profile' && (
            <div className="settings-section">
              <h2 className="section-title">Profile</h2>
              <div className="profile-avatar-row">
                <div className="profile-avatar">A</div>
                <div>
                  <div className="profile-name">Aditya</div>
                  <div className="profile-email">aditya@fluxapp.io</div>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Display Name</label>
                <input className="form-input" defaultValue="Aditya" placeholder="Your name" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input className="form-input" defaultValue="aditya@fluxapp.io" placeholder="Email" type="email" />
              </div>
              <div className="form-group">
                <label className="form-label">Bio</label>
                <textarea className="form-input form-textarea" defaultValue="Building cool things with React and AI." />
              </div>
              <button className="flux-btn flux-btn-primary">Save changes</button>
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="settings-section">
              <h2 className="section-title">Appearance</h2>

              <div className="settings-row">
                <div>
                  <div className="row-label">Theme</div>
                  <div className="row-desc">Switch between light and dark mode</div>
                </div>
                <button className="theme-toggle-btn" onClick={toggleTheme}>
                  {theme === 'light' ? <><Moon size={16} /> Dark mode</> : <><Sun size={16} /> Light mode</>}
                </button>
              </div>

              <div className="settings-row column">
                <div>
                  <div className="row-label">Accent color</div>
                  <div className="row-desc">Customize the primary color throughout Flux</div>
                </div>
                <div className="accent-swatches">
                  {ACCENT_COLORS.map(c => (
                    <button
                      key={c.value}
                      className="accent-swatch"
                      style={{ background: c.value, border: accentColor === c.value ? '3px solid var(--text-primary)' : '3px solid transparent' }}
                      onClick={() => applyAccent(c.value)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              <div className="settings-row">
                <div>
                  <div className="row-label">Auto-save</div>
                  <div className="row-desc">Automatically save pages as you type</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={autoSave} onChange={() => setAutoSave(!autoSave)} />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="settings-section">
              <h2 className="section-title">Notifications</h2>
              <div className="settings-row">
                <div>
                  <div className="row-label">Enable notifications</div>
                  <div className="row-desc">Get notified about page updates and mentions</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" checked={notificationsOn} onChange={() => setNotificationsOn(!notificationsOn)} />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="settings-row">
                <div>
                  <div className="row-label">Email digest</div>
                  <div className="row-desc">Weekly summary of your workspace activity</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" defaultChecked />
                  <span className="toggle-slider" />
                </label>
              </div>
            </div>
          )}

          {activeSection === 'privacy' && (
            <div className="settings-section">
              <h2 className="section-title">Privacy & Security</h2>
              <div className="settings-row">
                <div>
                  <div className="row-label">Lock sensitive pages by default</div>
                  <div className="row-desc">New pages tagged "personal" are locked automatically</div>
                </div>
                <label className="toggle">
                  <input type="checkbox" />
                  <span className="toggle-slider" />
                </label>
              </div>
              <div className="danger-zone">
                <h3 className="danger-title">Danger Zone</h3>
                <div className="danger-action">
                  <div>
                    <div className="row-label">Delete workspace</div>
                    <div className="row-desc">Permanently delete all your pages and data</div>
                  </div>
                  <button className="danger-btn"><Trash2 size={14} /> Delete workspace</button>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'data' && (
            <div className="settings-section">
              <h2 className="section-title">Data & Export</h2>
              <div className="data-stats">
                <div className="data-stat-item">
                  <div className="data-num">{pages.length}</div>
                  <div className="data-label">Total pages</div>
                </div>
                <div className="data-stat-item">
                  <div className="data-num">{pages.reduce((s, p) => s + (p.wordCount || 0), 0).toLocaleString()}</div>
                  <div className="data-label">Words written</div>
                </div>
                <div className="data-stat-item">
                  <div className="data-num">{pages.filter(p => p.isLocked).length}</div>
                  <div className="data-label">Locked pages</div>
                </div>
              </div>
              <div className="settings-row">
                <div>
                  <div className="row-label">Export all pages</div>
                  <div className="row-desc">Download all your pages as JSON</div>
                </div>
                <button className="flux-btn flux-btn-ghost" onClick={exportData}>
                  <Download size={14} /> Export JSON
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
