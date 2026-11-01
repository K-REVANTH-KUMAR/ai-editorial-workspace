# AI Editorial Workspace

A lightweight editorial research and writing workspace built with React, Vite, Flask and Python.

## Features

### Research Assistant
- Accepts at least three article URLs.
- Extracts readable article text with Trafilatura and falls back to BeautifulSoup.
- Selects relevant sentences using keyword-based rules.
- Displays source URLs, extracted summaries, key information and possible newsletter angles.
- Reports extraction failures when fewer than three sources can be processed.

### Writing Assistant
- Checks for long sentences, selected filler words and common passive-voice patterns.
- Explains detected issues and provides editorial suggestions.
- Lets the editor accept or reject supported filler-word suggestions.
- Preserves the original draft and provides an editable revised draft.
- Displays word count, sentence count, average sentence length and estimated reading time.

## Technology
- Frontend: React, Vite, CSS and Lucide icons
- Backend: Python, Flask and Flask-CORS
- Article extraction: Trafilatura, BeautifulSoup and Requests
- Writing checks: Python regular expressions and deterministic rules

## Run locally

Use Python 3.10+ and Node.js 20.19+ or 22.12+.

### 1. Backend

Open PowerShell in the project root:

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
python app.py
```

The backend runs at `http://localhost:5000`.

Health check: `http://localhost:5000/api/health`

### 2. Frontend

Open a second PowerShell terminal in the project root:

```powershell
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite, usually `http://localhost:5173`.

The Vite development server proxies `/api` requests to Flask on port 5000.

## Suggested verification

1. Start both servers.
2. Open Research Assistant and add three publicly accessible article URLs.
3. Run research and check that source URLs and extracted content appear.
4. Open Writing Assistant and paste the content from `sample-newsletter.md`.
5. Analyze the draft and review the suggestions.
6. Accept one filler-word suggestion and reject another.
7. Confirm the original draft remains unchanged and the revised draft metrics update.
8. Edit the revised draft manually and confirm its metrics recalculate.

## Important limitations

- Research extraction and sentence selection are rule-based. The application does not currently call an LLM, independently verify factual claims, or generate deeply contextual founder/operator analysis.
- Editorial interpretations are generic prompts and should not be treated as verified conclusions.
- Some websites block automated requests, require JavaScript, or do not expose article text. If fewer than three sources are extracted, try other publicly accessible article URLs.
- Passive-voice detection is heuristic and may produce false positives or miss some constructions. Long-sentence and filler-word checks are also simple editorial rules, not a full linguistic model.
- Reading time is estimated at 200 words per minute.
- No user accounts or persistent project storage are included.
- The URL-fetching endpoint is intended for local evaluation. Add server-side URL/IP restrictions and other deployment security controls before exposing it publicly.

## AI tool disclosure

AI assistance was used to support implementation, code review, UI refinement and documentation. The application itself currently uses deterministic, rule-based article extraction and writing checks; it does not send article text to an LLM API. Before submission, the developer should review the implementation and describe only the work personally completed and verified.
