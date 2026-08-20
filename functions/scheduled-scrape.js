import { scrapeAll } from './scraper.js';

export async function onScheduled(event, env, ctx) {
  try {
    const data = await scrapeAll();
    await env.LLM_ANALYST_CACHE.put('models.json', JSON.stringify(data));
    console.log(`Scheduled scrape completed: ${data.model_count} models`);
  } catch (e) {
    console.error('Scheduled scrape failed:', e.message);
  }
}
