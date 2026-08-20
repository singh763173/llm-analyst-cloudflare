# LLMAnalyst — Quick Handoff

## One-line
Ollama library explorer with plain-English categories, Hermes/Claw tags, cloud availability, cards + full table, auto-refresh, PWA, and shareable links.

## Start the app
```bash
cd /home/ajay/LLMAnalyst
. .venv/bin/activate
python server.py
# open http://127.0.0.1:8000/static/index.html
```

## Run tests
```bash
python tests/validation.py
```

## Key files
- server.py — FastAPI backend
- scraper.py — Ollama scraper/classifier
- static/index.html — card view
- static/table.html — full filterable table
- static/js/app.js — frontend logic
- static/css/styles.css — styling
- data/models.json — cached models
- HISTORY.md — full project history
- MEMORY.md — user intent and architecture

## Before public launch
1. Replace `https://llmanalyst.example.com` in static/index.html and static/table.html with real domain.
2. Add real `static/og-image.png` (1200x630).
3. Choose deployment target and update DEPENDENCIES.md.
