import { useState } from "react"
import { BookOpen, Sparkles } from "lucide-react"
import Sidebar from "./components/Sidebar"
import ResearchAssistant from "./components/ResearchAssistant"
import WritingAssistant from "./components/WritingAssistant"
import "./App.css"

function App() {
  const [activePage, setActivePage] = useState("research")

  return (
    <div className="app-shell">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="main-content">
        <header className="topbar">
          <div className="breadcrumb">Workspace <span>/</span> {activePage === "research" ? "Research" : "Writing"}</div>
          <div className="topbar-status"><span className="status-dot" /> Workspace ready</div>
        </header>

        <div className="page-wrap">
          <div className="welcome-strip">
            <div className="welcome-icon"><Sparkles size={18} /></div>
            <div>
              <strong>Your editorial workspace</strong>
              <p>Research ideas, shape clear writing, and prepare better newsletters.</p>
            </div>
          </div>

          {activePage === "research" ? (
            <ResearchAssistant />
          ) : (
            <WritingAssistant />
          )}
        </div>

        <footer className="app-footer">
          <span><BookOpen size={14} /> AI Editorial Workspace</span>
          <span>Research carefully. Write clearly.</span>
        </footer>
      </main>
    </div>
  )
}

export default App
