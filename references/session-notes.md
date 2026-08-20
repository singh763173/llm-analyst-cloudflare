# LLMAnalyst Session Notes

## Verification workflow for future work
1. Check server health: `curl http://127.0.0.1:8000/api/health`
2. Kill any stale process on port 8000 and restart fresh.
3. After CSS/JS changes, bump `?v=N` in `static/index.html` and `static/table.html`.
4. Verify served files via HTTP: fetch `?v=N` and check for new markers.
5. Run `python tests/validation.py` before declaring done.

## Browser screenshots
Chrome is not running in this environment. Do not rely on browser screenshots; use HTTP verification and explicit cache-busting.

## FastAPI lessons from this session
- `/api/refresh` must accept POST because both tests and frontend use POST.
- Add security headers via `@app.middleware("http")`.
- Set explicit `Cache-Control` on API responses: `public, max-age=300` for `/api/models`, `no-cache` for health/refresh.

## CSS lessons
- Repeated patch cycles can duplicate rules (e.g., `.cell-caps`, `.models-table tbody tr`). Consolidate after each feature pass.
- Use inline-flex with explicit sizing for empty-state cells (`.cell-dash`) so em-dash aligns.
- Force table cells to `white-space: nowrap` and give the table page horizontal scroll to avoid clipping.
