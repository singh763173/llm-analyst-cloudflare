# LLM Analyst — Cloudflare Edition

A serverless fork of [LLM Analyst](https://github.com/singh763173/llm-analyst) that runs entirely on Cloudflare’s free tier.

- **Frontend:** Cloudflare Pages
- **API + scraper:** Cloudflare Functions (Workers)
- **Cache:** Cloudflare KV
- **Schedule:** Cloudflare Cron Triggers (hourly rescrape)

Live demo: https://llm.singh90.co.uk

---

## What it does

This version keeps the same core behaviour as the original LLM Analyst, but replaces the Python FastAPI backend with lightweight JavaScript Cloudflare Functions:

- Scrapes the [Ollama library](https://ollama.com/library) every hour
- Classifies each model by purpose: Coding, Vision, Thinking, Math, Embeddings, Creative, or General Chat
- Tags models for cloud availability, Hermes compatibility, and capabilities
- Serves cached data through a JSON API
- Provides a responsive filterable card view and full table view

---

## Architecture

```
Visitor
  ↓
Cloudflare Pages (static HTML/CSS/JS in /static)
  ↓
Cloudflare Functions (functions/api/[[routes]].js)
  ↓
Cloudflare KV (cached model data)
  ↓
Ollama.com/library (rescraped hourly by functions/scheduled-scrape.js)
```

---

## Differences from the main repo

| Feature | Main repo (Python) | Cloudflare fork |
|---|---|---|
| Backend | FastAPI + Uvicorn | Cloudflare Functions |
| Scraper | Python + BeautifulSoup | JavaScript + regex HTML parsing |
| Cache | Local JSON file | Cloudflare KV |
| Hosting | VPS / Docker / local | Cloudflare Pages + Functions |
| Cost | Depends on hosting | Free tier |
| Refresh | Manual or hourly background | Hourly cron + manual refresh |

---

## Local development

1. Install dependencies:
   ```bash
   npm install wrangler --save-dev
   ```

2. Create a KV namespace:
   ```bash
   npx wrangler kv namespace create "LLM_ANALYST_CACHE"
   ```
   Copy the returned ID into `wrangler.toml`.

3. Seed the cache by running a local refresh:
   ```bash
   npx wrangler dev
   ```
   Then visit `http://localhost:8787/api/refresh`.

4. Open the app:
   ```
   http://localhost:8787/
   ```

---

## Deploy to Cloudflare

```bash
# Login (one-time)
npx wrangler login

# Deploy
npx wrangler deploy

# Or for Pages
npx wrangler pages deploy .
```

Make sure `wrangler.toml` has:
- A valid `compatibility_date`
- The correct KV namespace ID
- A `[[triggers]]` cron entry if you want hourly rescrapes

---

## API endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Static app (card view) |
| `/table.html` | GET | Static full table view |
| `/api/models` | GET | Cached model data (triggers background rescrape if stale) |
| `/api/health` | GET | Cache age and model count |
| `/api/refresh` | POST | Force a fresh scrape and update KV |

---

## Custom domain

After deploying, add a custom domain in the Cloudflare dashboard:

1. Go to **Workers & Pages → llm-analyst → Custom domains**
2. Click **Set up a custom domain**
3. Enter `llm.singh90.co.uk` (or your domain)
4. Cloudflare will automatically create the DNS record if the zone is active

---

## Limitations

- Cloudflare Functions have a 50 ms CPU limit per invocation on the free tier. The scraper runs in a scheduled cron job and on manual refresh, not on every page view.
- KV is eventually consistent and cached at Cloudflare’s edge. Updates may take a few seconds to propagate globally.
- HTML scraping can break if Ollama significantly changes their page markup. The cron job logs failures in the Workers logs.

---

## Contributing

This fork is maintained alongside the main [llm-analyst](https://github.com/singh763173/llm-analyst) repo. Improvements to classification logic should ideally be synced back to both repositories.

---

## License

See the main repo for license details.

Data sourced from [ollama.com/library](https://ollama.com/library).

---

Built by Amarjot Singh (Ajay).
