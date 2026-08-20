import { scrapeAll } from './scraper.js';

const CACHE_KEY = 'models.json';
const CACHE_MAX_AGE_SECONDS = 3600;

function cacheAgeSeconds(data) {
  const generated = data?.scraped_at;
  if (!generated) return Infinity;
  const dt = new Date(generated);
  if (isNaN(dt.getTime())) return Infinity;
  return (Date.now() - dt.getTime()) / 1000;
}

async function loadCachedData(env) {
  try {
    const cached = await env.LLM_ANALYST_CACHE.get(CACHE_KEY);
    if (!cached) return { generated_at: null, source: 'https://ollama.com/library', model_count: 0, models: [] };
    return JSON.parse(cached);
  } catch (e) {
    return { generated_at: null, source: 'https://ollama.com/library', model_count: 0, models: [], error: e.message };
  }
}

async function saveCache(env, data) {
  await env.LLM_ANALYST_CACHE.put(CACHE_KEY, JSON.stringify(data));
}

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const path = url.pathname;

  if (path === '/api/models' || path === '/api/models/') {
    const data = await loadCachedData(env);
    if (cacheAgeSeconds(data) > CACHE_MAX_AGE_SECONDS) {
      context.waitUntil(scrapeAndCache(env));
    }
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300'
      }
    });
  }

  if (path === '/api/health' || path === '/api/health/') {
    const data = await loadCachedData(env);
    const age = cacheAgeSeconds(data);
    return new Response(JSON.stringify({
      status: 'ok',
      cache_exists: !!data.scraped_at,
      model_count: data.models?.length || 0,
      cache_age_hours: Math.round((age / 3600) * 100) / 100,
      stale: age > CACHE_MAX_AGE_SECONDS
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
    });
  }

  if (path === '/api/refresh' || path === '/api/refresh/') {
    try {
      const data = await scrapeAll();
      await saveCache(env, data);
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' }
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ detail: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' }
  });
}

async function scrapeAndCache(env) {
  try {
    const data = await scrapeAll();
    await saveCache(env, data);
  } catch (e) {
    console.error('Background scrape failed:', e.message);
  }
}
