import { BookOpen, PenLine, Sparkles } from "lucide-react"
import "./Sidebar.css"

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark"><Sparkles size={19} /></div>
        <div><h2>Editorial<span>AI</span></h2><small>INTELLIGENCE STUDIO</small></div>
      </div>

      <div className="sidebar-label">WORKSPACE</div>
      <nav className="side-nav">
        <button onClick={() => setActivePage("research")} className={activePage === "research" ? "active" : ""}>
          <BookOpen size={17} /> <span>Research Assistant</span>
        </button>
        <button onClick={() => setActivePage("writing")} className={activePage === "writing" ? "active" : ""}>
          <PenLine size={17} /> <span>Writing Assistant</span>
        </button>
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-tip"><Sparkles size={15} /><strong>Editorial tip</strong><p>Verify important claims against their original sources before publishing.</p></div>
        <div className="sidebar-version">BUILT FOR FOUNDERS & BUILDERS</div>
      </div>
    </aside>
  )
}

export default Sidebar
