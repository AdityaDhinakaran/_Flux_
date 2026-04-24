# ⚡ Flux — Your Thinking Space

A feature-rich Notion-inspired workspace app built with **React**, featuring rich block editing, kanban boards, AI assistance, templates, and more. Built with custom branding and unique functionality.

---

## 🚀 Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start

# 3. Build for production
npm run build
```

App runs at `http://localhost:3000`

---

## ✨ Features

### Core (Notion-inspired)
| Feature | Description |
|---|---|
| 📝 Block Editor | Rich text editing with 10+ block types — headings, bullets, todos, callouts, code, quotes, dividers |
| 🗂️ Page Hierarchy | Nested pages with collapsible tree in sidebar |
| ⭐ Favorites | Star frequently accessed pages |
| 🔒 Page Locking | Lock pages to prevent accidental edits |
| 🔍 Search | Full-text search across all pages with `Cmd+K` |
| 📄 Templates | 6 built-in templates (Meeting Notes, RFC, Journal, etc.) |
| 🗄️ Database | Table + Kanban views with drag-and-drop |
| 🌙 Dark Mode | Full dark/light theme toggle |

### Unique to Flux
| Feature | Description |
|---|---|
| 🤖 AI Assist | Built-in AI chat powered by Claude — draft, summarize, brainstorm |
| 📎 Page Context | Attach a page as context to AI conversations |
| 💾 Save as Page | Convert AI responses directly into new Flux pages |
| 🎨 Accent Colors | Customize the primary color in Settings |
| 📊 Export | Export all workspace data as JSON |
| 📈 Word Counts | Live word count tracking per page |

---

## 🗂️ Project Structure

```
src/
├── components/
│   ├── Sidebar.jsx       # Navigation sidebar with page tree
│   ├── BlockEditor.jsx   # Rich block-based editor
│   └── SearchModal.jsx   # Cmd+K search overlay
├── pages/
│   ├── Home.jsx          # Dashboard with stats & recent pages
│   ├── PageView.jsx      # Individual page editor
│   ├── DatabaseView.jsx  # Table & Kanban database view
│   ├── Templates.jsx     # Template gallery
│   ├── AIAssist.jsx      # AI chat assistant (unique feature)
│   └── SettingsPage.jsx  # Settings & customization
├── context/
│   └── AppContext.jsx    # Global state (pages, theme, etc.)
├── data/
│   └── initialData.js    # Static seed data
└── index.css             # CSS variables & global styles
```

---

## ⚛️ React Concepts Used

- **useState / useEffect / useCallback / useRef** — across all components
- **useContext** — global app state via `AppContext`
- **React Router v6** — client-side routing with `BrowserRouter`, `Routes`, `Route`, `useNavigate`, `useParams`
- **Component composition** — reusable `BlockEditor`, `Sidebar`, `SearchModal`
- **Conditional rendering** — menus, modals, locked pages
- **Controlled/uncontrolled inputs** — `contentEditable` blocks, form fields
- **Lifting state up** — block changes propagate through context
- **Code splitting** — each page is a separate component

---

## 🎨 Design Decisions

- **Font:** Sora (display/UI) + JetBrains Mono (code blocks)
- **Brand color:** `#6c63ff` Flux Violet — accent for all interactions
- **CSS Variables:** Full theming system, dark/light mode via `data-theme`
- **No UI library** — all components hand-built in CSS

---

## 👥 Team

| Member | GitHub | Contributions |
|---|---|---|
| Aditya | @aditya | AI Assist, Block Editor, App Context |
| Member 2 | @member2 | Sidebar, Search, Page View |
| Member 3 | @member3 | Database, Templates, Settings |

---

## 📌 Notes

- All data is stored in React state (no backend required per project spec)
- AI Assist uses the Anthropic Claude API via `fetch`
- The app is fully responsive on mobile
