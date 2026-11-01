# Product & Engineering Note — AI Editorial Workspace

## Product goal
Help an editor move from a small set of AI/technology source articles to an initial research brief, then review a newsletter draft for basic writing-quality issues.

## Main user flows
1. The editor adds at least three article URLs in Research Assistant.
2. The backend downloads each page and extracts readable text.
3. The backend selects sentences using a small keyword-based scoring rule and returns an initial research report.
4. The editor pastes a newsletter draft into Writing Assistant.
5. The backend flags long sentences, selected filler words and possible passive voice.
6. The editor accepts or rejects supported suggestions and can directly edit the revised draft while keeping the original visible.

## Architecture
- React/Vite provides the single-page interface.
- Vite proxies `/api/*` requests to Flask during local development.
- Flask validates requests and delegates research extraction and writing checks to separate service modules.
- Trafilatura is the primary article extractor; BeautifulSoup is a fallback.
- Writing analysis is implemented with Python regular expressions. It checks sentence length, selected filler words and common passive-voice patterns.

## Sample newsletter
The included `sample-newsletter.md` is approximately 362 words and intentionally contains examples that exercise the long-sentence, filler-word and passive-voice checks.

## Trade-offs
The implementation prioritizes a small, reproducible end-to-end prototype over an LLM-dependent system. This avoids requiring a paid API key and keeps the application runnable with the listed Python packages. The trade-off is that the research output is extractive and generic rather than a deeply reasoned synthesis. The writing checks are heuristic and should be treated as editorial prompts, not definitive grammar judgments.

## Known limitations / next steps
- Add an optional LLM provider behind a service interface when credentials and budget are available.
- Improve source-specific synthesis, evidence-to-claim traceability, fact-versus-analysis labeling and newsletter-angle generation.
- Improve language-aware passive-voice detection and expand the supported filler-word list.
- Persist research sessions and draft versions.
- Expand automated backend tests, add frontend interaction tests, request rate limits and deployment configuration.
- Restrict backend URL fetching to public HTTP/HTTPS destinations before exposing the service publicly.

## Verification checklist
- [ ] Backend health endpoint responds.
- [ ] Writing endpoint rejects empty input and returns issue objects for sample content.
- [ ] Research endpoint rejects fewer than three URLs.
- [ ] Three accessible URLs produce a report with source links.
- [ ] Accept/reject actions work and original text remains unchanged.
- [ ] Accepting a filler word removes adjacent comma/spacing cleanly.
- [ ] Revised draft remains editable and metrics recalculate.
- [ ] Frontend lint and production build complete.
- [ ] Backend unit tests pass (`python -m unittest discover -s tests` from `backend`).
