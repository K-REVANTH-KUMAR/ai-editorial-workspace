import "./WritingAssistant.css"
import { useState } from "react"
import { PenLine, Check, X, Sparkles, BarChart3 } from "lucide-react"

function getMetrics(text) {
  const words = text.trim() ? text.trim().split(/\s+/).length : 0
  const sentences = text.trim() ? (text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || []) : []
  return {
    words,
    sentences: sentences.length,
    average: sentences.length ? (words / sentences.length).toFixed(1) : "0.0",
    reading: words ? Math.ceil(words / 200) : 0
  }
}

function WritingAssistant() {
  const [content, setContent] = useState("")
  const [revisedContent, setRevisedContent] = useState("")
  const [issues, setIssues] = useState([])
  const [statuses, setStatuses] = useState({})
  const [loading, setLoading] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [error, setError] = useState("")

  const originalMetrics = getMetrics(content)
  const revisedMetrics = getMetrics(revisedContent)

  async function analyzeContent() {
    if (!content.trim()) {
      setError("Paste your newsletter content before analyzing.")
      return
    }
    setLoading(true)
    setError("")
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/analyze-writing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content })
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || "Analysis failed.")
      setIssues(data.issues || [])
      setRevisedContent(content)
      setStatuses({})
      setAnalyzed(true)
    } catch (error) {
      setError(error.message === "Failed to fetch" ? "Could not connect to the backend. Make sure Flask is running on port 5000." : error.message)
    } finally {
      setLoading(false)
    }
  }

  function acceptSuggestion(index) {
    const issue = issues[index]
    if (issue.replacement === null || issue.replacement === undefined) return
    const position = revisedContent.indexOf(issue.passage)
    if (position === -1) {
      setError("That passage is no longer present in the revised draft.")
      return
    }

    // Remove the filler word and its following comma/space when present.
    // This prevents results such as: "decision-making. , AI..."
    let start = position
    let end = position + issue.passage.length
    const textAfterWord = revisedContent.substring(end)
    const trailingText = textAfterWord.match(/^(,\s*|\s+)/)

    if (trailingText) {
      end += trailingText[0].length
    } else if (start > 0 && /\s/.test(revisedContent[start - 1])) {
      start -= 1
    }

    const remainingText = revisedContent.substring(end)
    const startsNewSentence = start === 0 || /[.!?]\s*$/.test(revisedContent.substring(0, start))
    const adjustedRemaining =
      startsNewSentence && remainingText
        ? remainingText[0].toUpperCase() + remainingText.substring(1)
        : remainingText

    const updated =
      revisedContent.substring(0, start) +
      issue.replacement +
      adjustedRemaining

    setRevisedContent(updated)
    setStatuses((previous) => ({ ...previous, [index]: "accepted" }))
    setError("")
  }

  function rejectSuggestion(index) {
    setStatuses((previous) => ({ ...previous, [index]: "rejected" }))
  }

  function metricCards(metrics) {
    return (
      <div className="writing-metrics">
        <div className="metric-card"><strong>{metrics.words}</strong><span>Words</span></div>
        <div className="metric-card"><strong>{metrics.sentences}</strong><span>Sentences</span></div>
        <div className="metric-card"><strong>{metrics.average}</strong><span>Avg. words / sentence</span></div>
        <div className="metric-card"><strong>{metrics.reading} min</strong><span>Reading time</span></div>
      </div>
    )
  }

  return (
    <section className="writing-container">
      <div className="page-heading">
        <div>
          <div className="eyebrow">REFINE & POLISH</div>
          <h1>Writing Assistant</h1>
          <p>Review clarity, improve readability, and keep control of every edit.</p>
        </div>
        <div className="heading-icon"><PenLine size={22} /></div>
      </div>

      <div className="writing-input writing-panel">
        <div className="writing-panel-heading">
          <div><div className="section-icon"><PenLine size={17} /></div></div>
          <div><h3>Original newsletter</h3><p>Paste your draft below to check its writing quality.</p></div>
        </div>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value)
            setAnalyzed(false)
            setError("")
          }}
          placeholder="Paste your newsletter content here..."
        />
        {metricCards(originalMetrics)}
        {error && <p className="writing-error">{error}</p>}
        <button className="analyze-button" onClick={analyzeContent} disabled={loading}>
          {loading ? <><span className="button-spinner" /> Analyzing draft...</> : <><Sparkles size={16} /> Analyze writing</>}
        </button>
      </div>

      {analyzed && (
        <>
          <div className="writing-results">
            <div className="results-heading">
              <div><div className="eyebrow">EDITORIAL REVIEW</div><h2>Writing suggestions</h2></div>
              <span className="issue-count">{issues.length} {issues.length === 1 ? "suggestion" : "suggestions"}</span>
            </div>

            {issues.length === 0 ? (
              <div className="no-issues"><Check size={18} /><div><strong>No issues detected</strong><p>Your draft passed the available automated checks.</p></div></div>
            ) : (
              issues.map((issue, index) => (
                <article className="issue-item" key={`${issue.type}-${index}`}>
                  <div className="issue-topline"><span className="issue-type">{issue.type}</span>
                    {statuses[index] === "accepted" && <span className="status-accepted"><Check size={12} /> Accepted</span>}
                    {statuses[index] === "rejected" && <span className="status-rejected"><X size={12} /> Rejected</span>}
                  </div>
                  <p className="issue-passage">{issue.passage}</p>
                  <p className="issue-explanation">{issue.explanation}</p>
                  <p className="issue-suggestion"><strong>Suggestion:</strong> {issue.suggestion}</p>
                  {issue.replacement !== null && issue.replacement !== undefined && (
                    <div className="rewrite-preview"><span>Suggested change</span><p>{issue.replacement || "Remove this filler word."}</p></div>
                  )}
                  {issue.replacement === null && <div className="rewrite-preview manual"><span>Manual edit needed</span><p>Review this passage and edit it directly in the revised draft below.</p></div>}
                  {!statuses[index] && (
                    <div className="suggestion-actions">
                      <button onClick={() => acceptSuggestion(index)} disabled={issue.replacement === null || issue.replacement === undefined}><Check size={14} /> Accept</button>
                      <button className="reject-button" onClick={() => rejectSuggestion(index)}><X size={14} /> Reject</button>
                    </div>
                  )}
                </article>
              ))
            )}
          </div>

          <div className="comparison-heading">
            <div><div className="eyebrow">REVIEW YOUR CHANGES</div><h2>Draft comparison</h2></div>
            <span><BarChart3 size={15} /> Original stays unchanged</span>
          </div>
          <div className="comparison-grid">
            <div className="comparison-card">
              <div className="comparison-card-heading"><strong>Original version</strong><span>READ ONLY</span></div>
              <div className="comparison-text">{content}</div>
              <p className="comparison-word-count">{originalMetrics.words} words</p>
            </div>
            <div className="comparison-card revised-card">
              <div className="comparison-card-heading"><strong>Revised version</strong><span>EDITABLE</span></div>
              <textarea className="revised-editor" value={revisedContent} onChange={(e) => setRevisedContent(e.target.value)} />
              <p className="comparison-word-count">{revisedMetrics.words} words · {revisedMetrics.reading} min read</p>
            </div>
          </div>
          <div className="revised-metrics-panel">
            <div className="revised-metrics-title"><strong>Revised draft metrics</strong><span>Updates as you edit</span></div>
            {metricCards(revisedMetrics)}
          </div>
        </>
      )}
    </section>
  )
}

export default WritingAssistant
