import "./ResearchAssistant.css"
import { useState } from "react"
import { Link2, Plus, X, Search, FileText, ExternalLink, AlertCircle } from "lucide-react"

function ResearchAssistant() {
  const [url, setUrl] = useState("")
  const [sources, setSources] = useState([])
  const [report, setReport] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function addSource() {
    const value = url.trim()
    if (!value) return
    try {
      const parsed = new URL(value)
      if (!["http:", "https:"].includes(parsed.protocol)) throw new Error()
    } catch {
      setError("Enter a valid article URL beginning with https://")
      return
    }
    if (sources.includes(value)) {
      setError("This source has already been added.")
      return
    }
    setSources([...sources, value])
    setUrl("")
    setError("")
  }

  async function researchSources() {
    setLoading(true)
    setReport("")
    setError("")
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: sources })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Research request failed.")
      setReport(data.report)
    } catch (error) {
      setError(error.message === "Failed to fetch" ? "Could not connect to the backend. Make sure Flask is running on port 5000." : error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="research-container">
      <div className="page-heading">
        <div>
          <div className="eyebrow">DISCOVER & UNDERSTAND</div>
          <h1>Research Assistant</h1>
          <p>Turn articles and industry updates into useful editorial insights.</p>
        </div>
        <div className="heading-icon"><Search size={22} /></div>
      </div>

      <div className="research-layout">
        <div className="research-main-card">
          <div className="section-heading">
            <div className="section-icon"><Link2 size={17} /></div>
            <div><h3>Collect your sources</h3><p>Add at least three article URLs to begin.</p></div>
          </div>

          <div className="source-entry">
            <input
              type="url"
              placeholder="https://example.com/article"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addSource()}
            />
            <button className="add-source-button" onClick={addSource}><Plus size={16} /> Add source</button>
          </div>
          {error && <div className="inline-error"><AlertCircle size={15} />{error}</div>}

          <div className="source-list-heading">
            <strong>Added sources</strong><span>{sources.length} / 3 minimum</span>
          </div>
          <div className="source-list">
            {sources.length === 0 ? (
              <div className="empty-sources"><FileText size={23} /><span>Your article links will appear here.</span></div>
            ) : sources.map((source, index) => (
              <div className="source-item" key={source}>
                <span className="source-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="source-url" title={source}>{source}</span>
                <a href={source} target="_blank" rel="noreferrer" aria-label="Open source"><ExternalLink size={14} /></a>
                <button className="remove-source" onClick={() => setSources(sources.filter((item) => item !== source))} aria-label="Remove source"><X size={15} /></button>
              </div>
            ))}
          </div>

          <button className="research-button" disabled={sources.length < 3 || loading} onClick={researchSources}>
            {loading ? <><span className="button-spinner" /> Extracting articles...</> : <><Search size={16} /> Research sources</>}
          </button>
          <p className="minimum-note">The research process extracts article text and selects relevant sentences. Some websites may block automated access.</p>
        </div>

        <aside className="research-side-card">
          <div className="side-card-icon"><FileText size={19} /></div>
          <h3>What you'll get</h3>
          <ul>
            <li>Article summaries and key information</li>
            <li>Source links for verification</li>
            <li>Initial editorial angles for a newsletter</li>
          </ul>
          <div className="research-note"><strong>Research note</strong><p>This prototype uses rule-based extraction, not an LLM. Treat its summaries as starting points and verify claims in the linked sources.</p></div>
        </aside>
      </div>

      {report && (
        <div className="research-report">
          <div className="report-title"><div><div className="eyebrow">YOUR RESEARCH OUTPUT</div><h2>Research report</h2></div><span className="report-count">{sources.length} sources processed</span></div>
          <pre>{report}</pre>
        </div>
      )}
    </section>
  )
}

export default ResearchAssistant
