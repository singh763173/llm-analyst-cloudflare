

## Table Overflow / Broken Lines Fix (2026-08-17 12:34)
User confirmed broken horizontal lines, especially in capabilities empty cells.
- Root cause: table had min-width: 1100px causing horizontal overflow; the visible clipping made row borders appear broken and empty cells misaligned.
- Fixed: removed min-width from .models-table, changed .table-wrap overflow back to hidden.
- Reverted Cloud/Hermes/Link headers to compact text labels.
- Made capability badges wrap within a max-width 180px cell and removed fixed cell widths.
- Reduced table font-size to 0.85rem and model-name max-width to 140px so the table fits the centered container.


## Empty Capabilities Cell Alignment Fix v2 (2026-08-17 12:32)
User confirmed line issues were focused on capabilities column when no capabilities listed.
- Root cause: `.cell-caps` used `display: flex`, which broke normal table-cell vertical alignment and made empty cells misalign.
- Fixed: changed `.cell-caps` to `display: inline-block; vertical-align: middle` and wrapped contents in explicit 28px-height inline-flex containers.
- Standardized `.cell-icon`, `.cell-actions`, and `.cell-dash` to 48px cell height with centered content.
- Added consistent `line-height: 1.4` to all table cells.


## Table Row Border Fix (2026-08-17 12:28)
User reported horizontal rules between table rows looked broken / out of place.
- Root cause: borders were on individual `td` cells, and fixed `height: 48px` on rows caused inconsistent rendering when content overflowed.
- Fixed: moved bottom border from `td` to `tr`, changed row height to `min-height: 48px`, added `vertical-align: middle` to all cells.
- Enforced `white-space: nowrap` on capability badge wraps so they stay on one line.
- Cleaned duplicate table CSS rules from media queries.


## Pre-Launch Hardening (2026-08-17 10:27)
- Added security headers middleware: X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- Added Cache-Control headers: /api/models max-age=300, /api/health and /api/refresh no-cache.
- Created static/og-image.png (1200x630).
- Added og:image and twitter:image meta tags to index.html and table.html.
- Added prefers-reduced-motion media query to disable animations for users who choose reduced motion.
- Cleaned up duplicate CSS rules for .cell-caps and .models-table tbody tr.
- Fixed /api/refresh to accept POST (matching frontend and tests).


## Compact Table Layout (2026-08-17 09:51)
User reported table was wider than the page and line alignment still off.
- Widened base container from 1280px to 1440px.
- Added `.table-page.page-full` class so the table page uses full viewport width with horizontal scroll instead of clipping.
- Compact Cloud and Hermes/Claw columns to icon-only with tooltip titles.
- Compact Link/Compare column to icon + checkbox only.
- Added `.cell-icon`, `.cell-actions`, and `.cell-dash` classes with explicit sizing/centering.
- Set capability badges to `flex-wrap: nowrap` within each row so they stay on one line.


## Capabilities Empty Cell Alignment Fix (2026-08-17 09:45)
User reported table rows looked broken when capabilities column had no tags (showed "—").
- Root cause: the bare em-dash had no consistent box to align with other cells, and duplicated CSS rules caused inconsistent row height.
- Fixed: wrapped capability badges in `.caps-wrap` and the empty state in `.caps-empty` with explicit width/height/line-height.
- Cleaned up duplicated table CSS rules so `tbody tr height: 48px` is the single source of truth.
- Made `.cell-caps` a flex container aligned to center.


## Updated Column Sort Fix (2026-08-17 09:41)
User reported sorting the Updated column produced wrong order.
- Root cause: table header used `data-sort="relative_updated"` (text like "2 years ago", "1 month ago"), so sorting was alphabetical on human-readable strings.
- Fixed: changed `table.html` header to `data-sort="estimated_updated_iso"` so it sorts by the ISO timestamp.
- `sortModels` already handled ISO date sorting correctly.


## Cache-Busting & Table Wrapping Fix (2026-08-17 09:40)
User reported filters and table still looked old — caused by browser caching static assets and a CSS bug.
- Added `?v=2` cache-busting query string to `styles.css` and `app.js` links in `index.html` and `table.html`.
- Fixed `.cell-caps` which used `display: flex; flex-wrap: wrap;`, causing capability badges to stack vertically. Changed to `inline-flex; flex-wrap: nowrap`.
- Forced `white-space: nowrap` on all table header/cell rules.
- Made all table badges `inline-flex` and non-wrapping.
- Added `.cell-name` ellipsis truncation for model names.
- Consolidated duplicated table CSS rules and media queries.


## Table Formatting Fix (2026-08-17 09:36)
User reported table cells were wrapping and row heights inconsistent.
- Forced `white-space: nowrap` on all table cells.
- Wrapped size values in `.badge-size` and made all badges inline-flex.
- Added `.cell-name` with max-width + ellipsis truncation for model names.
- Added consistent `48px` row height.
- Added horizontal scroll on smaller screens (`min-width: 1000px`) instead of squashing columns.


## Filter Desktop Layout Redesign (2026-08-17 09:32)
Addressed user feedback that filters looked ugly/imbalanced on desktop.
- Replaced uneven `auto-fit` grid with explicit 6-column layout on desktop, collapsing to 3 columns then 2 then 1 column on smaller viewports.
- Moved Recency into the same grid as other filter groups (no longer isolated below).
- Put the result count inside the active-filters row so it no longer sits as a loose separate row.
- Tightened toolbar spacing and added subtle borders to visually separate search, chips, and active filters.
- Reduced chip padding/font sizes slightly so the panel is more compact.
# Full UI/UX + Feature/Functionality Assessment — All Issues Fixed
Updated: 2026-08-16 20:15:59

## Issues fixed in this pass

### Must-do before public launch
- [x] Open Graph/Twitter URLs now have a clear `TODO` comment and will be easy to update to the real domain.
- [x] Fixed double-toast on copy: only `copyToClipboard` shows the toast now.
- [x] Modal focus is returned to the trigger element after closing.
- [x] `document.title` updates when filters change or a model modal is opened.

### Should-do
- [x] Fuse.js is now wired up and used when available; custom `fuzzyMatch` remains as fallback.
- [x] Added visible stale/refreshing indicator in the status line + offline toast when API fails while offline.
- [x] Added `scope="row"` to first table cell.
- [x] Improved compare modal mobile layout and added small-screen media query.

### Nice-to-have
- [x] Added print stylesheet.
- [x] Added search term highlighting with `<mark>` and `.mark` CSS class.
- [x] Added online/offline event listeners with user toast feedback.

## Verification
- `node --check static/js/app.js` passes.
- `py_compile` passes for `server.py` and `scraper.py`.
- Server running and all static endpoints return 200.
- `/api/health`, `/api/refresh`, 404 fallback, and model permalink all verified.

## Remaining manual steps before real deployment
1. Replace `https://llmanalyst.example.com` in `static/index.html` and `static/table.html` Open Graph/Twitter meta tags with the real domain.
2. Generate a real `og-image.png` (1200×630 recommended) and upload it to `static/og-image.png`.
3. Test compare modal on an actual phone to confirm horizontal scroll feel.



# Full UI/UX + Feature/Functionality Assessment
Generated: 2026-08-16 20:10:16

## Executive Summary
LLMAnalyst is a mature, self-contained FastAPI + vanilla-JS application for exploring the Ollama library. The UI has been through several polish passes and is visually consistent. All major requested features are implemented. A small number of refinements remain before it is "production-polished" for public deployment.

## UI/UX Strengths
- Clean, grouped filter panel with consistent chip components and clear labels.
- Poppins font, gradient hero, category colour coding, and card entrance animations give a modern feel.
- Dark mode with `localStorage` persistence and system-preference fallback.
- Loading skeletons, empty states, toast feedback, and responsive layout.
- Accessibility: skip link, `aria-label` on icon-only buttons, modal focus trap, table `scope="col"`.
- Shareable URLs and active-filters bar make the state transparent.

## UI/UX Issues Found
1. **Double toast on copy** — `copyToClipboard` shows a toast, and callers like `copyModalCommand` also show a toast. User may see two toasts.
2. **Focus not returned after modal close** — after closing the detail/compare modal, focus is lost rather than returning to the element that opened it.
3. **No page title updates** — opening a model modal or applying filters does not update `document.title`, which hurts shareability/tab discoverability.
4. **No print styles** — printing the table would include the filters and header.
5. **Compare modal can overflow on small screens** — needs real-device testing.
6. **Open Graph URLs use `example.com` placeholder** — must be changed to real domain before public deployment.
7. **Service worker scope is `/static`** — intentional but root `/` paths are not cached/offline-controlled.

## Feature/Functionality Strengths
- Full filter stack: search, category, size, availability, capabilities, recency.
- Sort (dropdown on cards, column headers on table).
- Favourites, export CSV/JSON, shareable links, model permalinks, compare.
- Fuzzy search fallback, hero chart, new-model banner.
- PWA manifest + service worker, keyboard shortcuts, auto-refresh on focus.
- Robust backend: health endpoint, background rescrape, force refresh, 404 SPA fallback.
- Daily cron rescrape scheduled.

## Feature/Functionality Issues / Gaps
1. **Fuse.js is loaded but not used** — only the custom `fuzzyMatch` is used. Either wire up Fuse for better typo tolerance or remove the extra script.
2. **No visible "data is stale" warning** — background refresh happens silently. Users might see old data for a few seconds with no indication.
3. **No offline user messaging** — if the API fails, the page shows a generic error but no "you are offline" guidance.
4. **Export buttons have no loading state** — fine for 234 models, but could matter later.
5. **Table body rows lack `scope="row"`** — minor screen-reader improvement.
6. **No search result highlighting** — the matching term is not highlighted in card/table text.
7. **No pagination / virtualisation** — currently fine with 234 models, but if the library grows significantly, rendering could slow down.

## Code Quality / Risk
- No hardcoded secrets.
- `escapeHtml` is used consistently for dynamic content.
- State-changing endpoints are POST, GET endpoints are read-only.
- Scraper and server both handle errors gracefully.

## Recommendations (prioritised)
### Must do before public launch
1. Replace `example.com` in Open Graph/Twitter meta with the real domain.
2. Fix double-toast on copy.
3. Return focus to trigger after closing modal.
4. Update `document.title` when model modal opens or filters change.

### Should do soon
5. Wire up Fuse.js properly or remove the unused script.
6. Add a visible "refreshing / data is stale" indicator.
7. Add `scope="row"` to first table cell and test compare modal on mobile.

### Nice to have
8. Print stylesheet for the table.
9. Search term highlighting.
10. Pagination or virtual scrolling if model count grows past ~500.


# LLMAnalyst Assessment & Recommendations

## Purpose Review

LLMAnalyst exists to solve one clear problem: **choosing the right Ollama model for a specific task**. It does this by:

1. Keeping a fresh index of every model on ollama.com/library.
2. Classifying each model into an idiot-proof purpose category.
3. Letting the user filter by size, capabilities, cloud availability, Hermes/Claw compatibility, recency, and popularity.
4. Presenting the data in two views: a card grid and a full filterable table.

The purpose is sound, the stack is simple, and the deployment path is clean. It succeeds as a decision-support tool for someone running local LLMs via Ollama.

---

## What works well now

- **Data freshness**: scrapes Ollama on page load + manual refresh, with a 1-hour cache.
- **Classification coverage**: 234 models sorted into 7 clear categories.
- **Filter model**: category, size band, cloud, Hermes/Claw, capabilities, text search.
- **Two useful views**: cards for browsing, table for comparison/sorting.
- **Metadata now includes**: pull counts and relative last-updated dates.
- **Self-contained**: one directory, one command to run, easy to move to another server.
- **No build step**: vanilla HTML/CSS/JS means low maintenance.

---

## Data quality issues found

| Issue | Impact | Fix needed |
|-------|--------|------------|
| **1 model missing update date** (`granite4.1-guardian`) | Minor | Defensive parsing |
| **1 model has `pull_value` but no `relative_updated`** (`gemma4`) | Minor | Defensive parsing |
| **40 models have no sizes** | Some cards show "?" | Acceptable for embeddings/some vision models; could extract sizes from model page more aggressively |
| `last_updated` field is actually *scrape time*, not model release date | Slightly confusing name | Rename to `scraped_at`; keep `relative_updated` / `estimated_updated_iso` as the real date fields |
| `pull_count` is verbose (e.g. `118.5MPulls`) while `pull_value` is the clean one | Minor | UI already uses `pull_value`; `pull_count` can be deprecated or kept for raw reference |

---

## Bugs / UX issues to fix

1. **Card view title overflow**
   - Very long model names can break the card layout. Add `word-break: break-word` or `overflow-wrap: anywhere`.

2. **Mobile table**
   - The table is horizontally scrollable on mobile, which is fine, but the filters are wide. Consider collapsing filter chips into a dropdown on small screens.

3. **No loading state on filter chips**
   - When the user clicks a category chip, the count badge updates but there is no immediate "filtering…" feedback. Perceived delay is small, but a spinner on the result count would help.

4. **Sort indicator is static**
   - Table headers show `ph-caret-up-down` for every column regardless of active sort. Should show `ph-caret-up` or `ph-caret-down` on the active column.

5. **Refresh button can be clicked twice**
   - If the user clicks Refresh during a scrape, the button disables but the browser could still fire the event. The JS disables the button, but double-check the guard.

6. **Search is case-insensitive but not debounced**
   - For 234 models this is fine; at larger scale, debounce the input.

7. **No “no results” guidance**
   - Empty state just says “No models match your filters.” Could add a one-click “Clear all filters” link inside the empty state.

8. **Page title is static**
   - `document.title` could reflect active filters (nice-to-have).

---

## Missing features I recommend adding

### High value / low effort

1. **Presets / quick filters**
   - Buttons like "Best for coding", "Best for agents", "Small & fast", "Recently updated", "Most popular" that apply a sensible filter set in one click.

2. **Default sort by popularity or recency**
   - Currently sorted alphabetically. Most users probably want to see the most-downloaded or newest models first.

3. **Capability tooltip / legend**
   - New users may not know what “Tools”, “Vision”, “Thinking”, or “Hermes/Claw” mean. A small legend or hover tooltip helps.

4. **Model detail page**
   - Clicking a card opens a modal or dedicated page showing full description, all sizes, all tags, full capabilities, cloud badge, Ollama link, pull count, and estimated release date.

5. **“Compare” checkbox in table view**
   - Let the user select 2–3 models and show a side-by-side comparison.

6. **Dark mode**
   - Pure CSS toggle; most dev tools expect it.

### Medium effort

7. **Real benchmarks / quality signals**
   - Ollama has no ratings. You asked about ratings — the realistic next step is pulling scores from an external source such as:
     - LMSYS Chatbot Arena Elo ratings (needs scraping or API)
     - OpenRouter model rankings
     - Hugging Face Open LLM Leaderboard
   - This is a separate data source and would need normalisation, but it would dramatically improve decision-making.

8. **Recency filter**
   - Chips: "Updated in last 30 days", "Last 90 days", "Last 6 months", "Over 1 year old".

9. **Local run helper**
   - Show the exact `ollama run <model>` / `ollama pull <model>` command, with a copy button.

10. **Category confidence indicator**
    - Some models are borderline. Show all matched categories as small secondary badges (the data already supports multiple categories; only the primary is shown).

### Longer term / optional

11. **User notes / favourites**
    - Store locally in `localStorage`: mark models as tried/favourite/add notes.

12. **Cloud provider mapping**
    - Currently we use Ollama’s own `cloud` badge only. You could add which *specific* cloud providers host each model (e.g. Groq, Together, Fireworks, OpenRouter) if you want a true cloud-availability matrix.

13. **Alerts / watchlist**
    - Notify when a model is updated or a new model appears in a category you care about.

14. **Export**
    - Export filtered results to CSV or JSON.

---

## Architecture / operational recommendations

1. **Add a systemd service file**
   - So the app starts automatically on boot. Document in `README.md`.

2. **Add request logging and basic error alerting**
   - FastAPI logs are basic. A failing scrape should be visible without manually checking the console.

3. **Rate-limit or backoff the scraper**
   - Currently it hits Ollama for every model page sequentially. Add a small delay between requests and handle HTTP 429/503 gracefully to avoid being blocked.

4. **Health endpoint should verify scrape success**
   - `/api/health` checks cache existence but not freshness. Add `cache_age_hours` and a warning if the last scrape failed.

5. **Environment-based config**
   - Port, cache TTL, and scrape concurrency should be configurable via environment variables rather than hard-coded.

6. **Tests**
   - Add a small test suite for `scraper.py` classification logic using known model names. This prevents regressions when keyword lists change.

---

## Prioritised action list

| Priority | Action |
|----------|--------|
| **P1 — fix now** | Fix the 2 models missing date/pull metadata |
| **P1 — fix now** | Rename `last_updated` to `scraped_at` to avoid confusion |
| **P1 — fix now** | Add `overflow-wrap` to card titles |
| **P2 — add soon** | Default sort by pull count or estimated recency |
| **P2 — add soon** | Add quick-filter presets |
| **P2 — add soon** | Add live sort indicators to table headers |
| **P3 — nice to have** | Model detail modal/page |
| **P3 — nice to have** | Dark mode |
| **P3 — nice to have** | `ollama pull/run` copy command |
| **P4 — future** | Integrate LMSYS / OpenRouter benchmark scores |
| **P4 — future** | Favourites + notes in localStorage |

---

## Summary

LLMAnalyst is already useful and functionally complete for its core purpose. The main gaps are **small polish issues** and **quality-of-life enhancements** rather than fundamental problems. The biggest single improvement would be adding an external benchmark/rating source (LMSYS/OpenRouter) because Ollama itself does not provide ratings. After that, presets, better default sorting, and a detail modal would turn it from a good tool into a great one.


## Additional Features Implemented (2026-08-16)

After the filter optimisation, the following features were also added:

1. **Favourites / shortlist** — star any model; saved to browser `localStorage`; "Favourites" quick filter.
2. **Recency filter chips** — Today, This week, This month, This year.
3. **Export filtered results** — CSV and JSON download buttons.
4. **Size tag selector in detail modal** — pick a specific tag (e.g. `8b`, `70b`) and copy `ollama pull/run <model>:<tag>`.
5. **Keyboard shortcuts** — `/` focus search, `Esc` clear search / close modal, `r` refresh.
6. **Auto-refresh on focus** — when tab becomes visible and cache is stale.
7. **Category colour coding** — each category has a distinct badge colour in both light and dark modes.
8. **"Not Hermes / Claw" filter** — exclude agent-compatible models.
9. **Copy toast feedback** — "Copied to clipboard" notification.
10. **Loading skeleton placeholders** — shimmer placeholders while models load/refresh.


## Visual Polish Pass (2026-08-16)

Based on a YouTube transcript about avoiding AI-generated design slop, the following visual upgrades were applied:

- Switched to **Poppins** font family via Google Fonts for a cleaner, less generic typographic feel.
- Added a **gradient hero title** and gradient category top-borders on cards.
- Introduced **subtle card gradients** and improved shadows for depth.
- Added a **real-data hero chart** showing the top 5 models by pull count, with animated bars.
- Added **staggered card entrance animations** and a **modal pop-in animation**.
- Rounded corners increased; spacing and transitions polished throughout.
- Maintained consistent Phosphor icon family and kept the UI simple and self-contained.


## Filter UI/UX Redesign & Full Site Review (2026-08-16)

### Filter issues found and fixed
1. **Inconsistent chip styling** — presets used a different background from regular chips.
2. **No visual grouping** — all chip rows were flattened into one box.
3. **Mixed control heights/styles** — search, sort, export, and clear felt disconnected.
4. **Active filters bar lacked a label** and looked like a loose block.
5. **Actions row was visually separated** from the rest of the filter panel.

### Redesign applied
- **Toolbar at top** containing search, sort (cards only), export, and clear button.
- **Filter groups grid** with consistent labelled sections: Quick filters, Category, Size, Availability, Capabilities, Recency.
- **Consistent chip component** used everywhere; presets differentiated by group label and icon, not by style.
- **Active filters bar** now has a proper "Active filters" label with icon.
- **Result count** moved to a clean bottom row.
- Added dark-mode variants for preset chips.

### Full site UX fixes
- Added `aria-label` to dark-mode toggle (icon-only button).
- Added `aria-label` and `title` to favourite star buttons.
- Added `scope="col"` to table headers for screen readers.
- Added a 404 exception handler that serves the SPA for unknown routes and JSON for unknown API routes.
- Verified JS syntax with `node --check` and Python syntax with `py_compile`.
- Verified all new filter structures exist in served HTML and CSS.

### Remaining non-issues
- No skip-link added (single-page utility app; could be added later if needed).
- `/favicon.ico` root request still 404s, but HTML links point to `/static/favicon.ico` which works.


## Additional Features Implemented (2026-08-16)

1. **Copy link to current filters** — toolbar button copies the shareable URL.
2. **Per-category icons** — every category chip/group uses a distinct Phosphor icon.
3. **Open Graph / Twitter meta tags** — `index.html` and `table.html` now have share preview metadata.
4. **Skip link + modal focus trap** — accessibility improvements for keyboard users.
5. **Individual model permalinks** — `?model=llama3.1` or `#model=llama3.1` opens the detail modal directly.
6. **Fuzzy search fallback** — Fuse.js loaded; in-app fuzzy fallback also implemented.
7. **Model compare** — checkbox on each card/table row, compare 2–3 models side-by-side in a modal.
8. **PWA manifest + service worker** — `manifest.json` and `sw.js` added; pages register the service worker.
9. **Daily cron rescrape** — Hermes cron job `a09413825251` runs at 3 AM daily.
10. **New-model notification banner** — detects newly added models since last visit and shows a banner.
