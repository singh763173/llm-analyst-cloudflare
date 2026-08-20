# LLMAnalyst Dependencies & Deployment Notes

## What this project does
A self-contained website that scrapes the Ollama library, classifies models by purpose, and lets users filter/search/compare them.

## Files you need to move
Everything lives under `/home/ajay/LLMAnalyst`:

```
LLMAnalyst/
├── server.py              # FastAPI backend
├── scraper.py             # Ollama scraper + classifier
├── requirements.txt       # Python dependencies
├── PLAN.md                # Project plan
├── ASSESSMENT.md          # Ongoing review/notes
├── README.md              # Setup/usage docs
├── DEPENDENCIES.md        # This file
├── data/
│   └── models.json        # Cached model data
└── static/
    ├── index.html         # Cards view
    ├── table.html         # Full table view
    ├── css/styles.css     # Styling
    ├── js/app.js          # Shared frontend logic
    ├── favicon.ico
    ├── favicon-32x32.png
    ├── manifest.json      # PWA manifest
    └── sw.js              # Service worker
```

## Python dependencies
See `requirements.txt`. In production:

```bash
pip install -r requirements.txt
```

Current deps:
- `fastapi` + `uvicorn[standard]` — web server
- `requests` + `beautifulsoup4` — scraping

No database is required. Data is stored in `data/models.json`.

## External CDN dependencies (all free)
The frontend loads these from public CDNs:
- **Google Fonts** — Poppins font
- **Phosphor Icons** — icon font
- **Fuse.js** — fuzzy search

For a fully offline/air-gapped deployment, you would need to self-host these.

## Can this be deployed as a GitHub Pages website?

**No, not directly as a pure GitHub Pages site.**

GitHub Pages can only serve static HTML/CSS/JS. This project needs a running Python backend to:
1. Scrape Ollama.com and keep the model list up to date.
2. Serve the API endpoints `/api/models`, `/api/refresh`, `/api/health`.

### Deployment options

#### Option A: Keep the FastAPI backend running somewhere (recommended)
Deploy the whole project to any server/VPS that can run Python 24/7, for example:
- A VPS (DigitalOcean, Hetzner, Linode, AWS EC2, etc.)
- Your home server behind a reverse proxy + HTTPS
- Fly.io / Railway / Render (they have free tiers)
- Any container host that supports Python

Then point a domain at it. This is the only way to keep the data fresh automatically.

#### Option B: Static export (requires a build step)
If you really want GitHub Pages, you would need to:
1. Run `python scraper.py` locally or in CI to generate `data/models.json`.
2. Add a small build script that converts the JSON into static JS files.
3. Replace the `/api/models` calls in `app.js` with a static JS import.
4. Commit the generated static site to a `gh-pages` branch.

Pros: free hosting on GitHub Pages.  
Cons: data only updates when you re-run the build and redeploy; no live scraping from the browser.

#### Option C: Hybrid — static frontend + separate updater
Host the static frontend on GitHub Pages or a CDN, and run the Python scraper elsewhere as a tiny updater that writes the JSON to a public location (e.g. a GitHub release asset, S3, or Cloudflare R2). The frontend then fetches the JSON from that public URL.

This is the most scalable architecture, but it requires splitting the project into:
- A static frontend build
- A scheduled scraper job
- A public JSON file host

### Recommendation for now
Keep using the FastAPI server on your own infrastructure. It is already self-contained and works. When you are ready to put it on the public internet, move it to a cheap VPS or Fly.io/Railway and add HTTPS via a free Cloudflare certificate or Let's Encrypt.

## Environment requirements
- Python 3.10+
- ~100 MB disk for code + cache
- Outbound HTTPS to `ollama.com` for scraping
- Optional: cron or systemd timer for daily refresh

## Cron job
A daily rescrape job is already scheduled in Hermes cron:
- Job ID: `a09413825251`
- Schedule: `0 3 * * *` (3 AM daily)
- Workdir: `/home/ajay/LLMAnalyst`
