# LLMAnalyst — Project Plan

## Goal
A simple, self-contained web app that lists all models available on Ollama, classifies them into clear, idiot-proof purpose categories, and lets the user filter by cloud availability, Hermes/Claw agent compatibility, size, and capabilities. Two views: beautiful cards and a full filterable table. Data refreshes from Ollama on page load (with caching) and on demand via a refresh button.

## Files & Structure

```
/home/ajay/LLMAnalyst/
├── PLAN.md                 # this plan
├── README.md               # setup, dependencies, deployment notes
├── requirements.txt        # Python dependencies
├── scraper.py              # Ollama scraping + classification logic
├── server.py               # FastAPI backend (serves /api/models, /api/refresh, static files)
├── static/
│   ├── index.html          # card view
│   ├── table.html          # full filterable table view
│   ├── css/
│   │   └── styles.css      # clean, modern styling with badges/icons
│   └── js/
│       └── app.js          # fetching, filtering, rendering, refresh button
└── data/
    └── models.json         # cached scraped data
```

## Data Source
- https://ollama.com/library — model names, tags, sizes, Ollama `cloud` badge.
- https://ollama.com/library/<model> — description and full tag list.

## Classification (purpose categories)
| Category | What it means | How we decide |
|----------|---------------|---------------|
| **General Chat / Assistant** | Everyday Q&A, drafting, summaries, productivity | Default if no stronger category matches |
| **Coding** | Code completion, debugging, writing scripts, explaining code | Name/tag contains `coder`, `code`, `codellama`, `codegemma`, `codestral`, `devstral`, `qwen*-coder`, `deepseek-coder`, `codeqwen`, `dolphincoder`, `duckdb-nsql` |
| **Research & Deep Thinking** | Long reasoning, complex analysis, reports, step-by-step problem solving | Tag `thinking` or names like `deepseek-r1`, `qwq`, `exaone-deep`, `cogito`, `deepscaler`, `openthinker`, `athene-v2` |
| **Vision / Multimodal** | Describes and analyses images | Tag `vision` or names like `llava`, `bakllava`, `minicpm-v`, `gemma3` (only vision sizes), `phi4-mini-vision` |
| **Embeddings** | Search, RAG, similarity (not chat) | Tag `embedding` or names like `nomic-embed`, `bge-`, `all-minilm`, `mxbai-embed`, `gte-`, `snowflake-arctic-embed` |
| **Math & STEM** | Mathematics, logic, science | Names/tags like `math`, `mathstral`, `deepseek-math`, `qwen2.5-math`, `athene-v2` |
| **Creative / Roleplay** | Stories, characters, fiction, uncensored roleplay | Names like `dolphin`, `wizardlm`, `vicuna`, `everythinglm`, `llama3-uncensored`, `mxbai-embed` excluded |

A model can belong to more than one category. Primary category shown first on the card.

## Filters
- Category (multi-select chips)
- Cloud available on Ollama (yes/no)
- Hermes / OpenClaw agent compatible (yes/no)
- Parameter size (small ≤3B, medium 4B–30B, large >30B)
- Capabilities: Tools, Vision, Thinking, Embedding
- Free text search across name, title, description, tags

## Hermes / OpenClaw Compatibility
A model is flagged as agent-compatible if:
- It is a known Hermes-family model (`hermes-3`, `nous-hermes`, `openhermes`, `teuken`, `dolphin`, `athene-v2`), or
- Its Ollama tags include `tools`, or
- Its description explicitly mentions tool use / function calling.

Cloud availability is taken directly from the Ollama `cloud` badge on each model card.

## Backend (server.py)
- `GET /api/models` — returns cached JSON. If cache is older than 1 hour, rescrape in the background and return the current cache immediately so the page stays fast.
- `POST /api/refresh` — force rescrape, block until done, return fresh data.
- Static files served from `/static/`.
- Cache stored in `data/models.json`.

## Frontend
- **Cards view (`index.html`)**: responsive grid of model cards. Each card shows name, primary category badge, cloud badge, Hermes/Claw badge, size badges, tags, short description, Ollama link. Filter bar at the top with chips and search.
- **Table view (`table.html`)**: full-width sortable/filterable table with all columns.
- **Refresh button**: calls `/api/refresh`, shows spinner, updates both views.
- Icons via Phosphor Icons CDN (lightweight, clean).

## Dependencies
```
fastapi
uvicorn
requests
beautifulsoup4
lxml
```

## How to Run
```bash
cd /home/ajay/LLMAnalyst
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python server.py
# open http://localhost:8000
```

## Future Deployment
- To move to a new server: copy the whole `/home/ajay/LLMAnalyst` directory, install requirements, run `python server.py` (or run behind nginx/Caddy with uvicorn).
- Optional GitHub repo can be created later; `README.md` will document this.

## Decisions Made for Simplicity
- Use FastAPI instead of a static cron approach so page-load refresh is trivial.
- Cache for 1 hour to avoid hammering Ollama; manual refresh always fetches live.
- Use vanilla HTML/CSS/JS — no build step, easy to move anywhere.
- Use Ollama’s own `cloud` badge as the cloud availability source.
