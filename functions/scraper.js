const BASE_URL = 'https://ollama.com';
const LIBRARY_URL = `${BASE_URL}/library`;
const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36'
};

const CODING_KEYWORDS = new Set([
  '-coder', ' coder', 'codegeex4', 'codegemma', 'codellama', 'codestral',
  'codebooga', 'codeqwen', 'codeup', 'deepcoder', 'deepseek-coder',
  'devstral', 'duckdb-nsql', 'dolphincoder', 'firefunction-v2',
  'granite-code', 'granite3-dense', 'magicoder', 'north-mini-code', 'opencoder',
  'phind-codellama', 'rnj-1', 'sqlcoder', 'stable-code', 'starcoder',
  'tulu3', 'wizardcoder', 'yi-coder'
]);

const THINKING_KEYWORDS = new Set([
  'thinking', 'deepseek-r1', 'deepseek-v3.1', 'deepseek-v4-pro',
  'deepseek-v4-flash', 'qwq', 'exaone-deep', 'cogito', 'deepscaler',
  'openthinker', 'magistral', 'glm-4.7-flash', 'glm-5.1',
  'minimax-m3', 'minimax-m2.7', 'lfm2.5-thinking',
  'r1-1776', 'olmo-3', 'olmo-3.1', 'granite3.2', 'granite4.1-guardian',
  'laguna', 'nemotron-cascade-2', 'nemotron-3.5-lightning', 'kimi-k3'
]);

const VISION_KEYWORDS = new Set([
  'vision', 'llava', 'bakllava', 'minicpm-v', 'llama3.2-vision',
  'phi4-mini-vision', 'gemma3', 'gemma3n', 'gemma4', 'qwen2.5-vl',
  'qwen2-vl', 'qwen3-vl', 'qwen3.5', 'qwen3.6', 'qwen3.8', 'pixtral',
  'moondream', 'granite3.2-vision', 'glm-4v', 'glm-ocr', 'deepseek-ocr',
  'llava-llama3', 'llava-phi3', 'muse-glimmer', 'medgemma', 'medgemma1.5',
  'mistral-small3.1', 'mistral-small3.2', 'mistral-medium-3.5', 'kimi-k2.6',
  'translategemma'
]);

const EMBEDDING_KEYWORDS = new Set([
  'embed', 'embedding', 'nomic-embed', 'bge-', 'all-minilm', 'mxbai-embed',
  'gte-', 'snowflake-arctic-embed', 'jina-embeddings', 'paraphrase',
  'sentence-transformers', 'e5-', 'multilingual-e5', 'granite-embedding'
]);

const MATH_KEYWORDS = new Set([
  'math', 'mathstral', 'deepseek-math', 'qwen2-math', 'qwen2.5-math',
  'wizard-math', 'athene-v2', 'deepscaler', 'exaone-deep', 'phi4-reasoning',
  'phi4-mini-reasoning', 'falcon3', 'smallthinker', 'llama-pro'
]);

const CREATIVE_KEYWORDS = new Set([
  'dolphin', 'wizardlm', 'vicuna', 'everythinglm', 'llama2-uncensored',
  'llama3-uncensored', 'wizard-vicuna', 'mythomax', 'airoboros', 'goliath',
  'chronos', 'megadolphin', 'tinydolphin'
]);

const HERMES_KEYWORDS = new Set(['hermes', 'nous-hermes', 'openhermes', 'teuken']);

function containsAny(text, keywords) {
  const t = text.toLowerCase();
  for (const kw of keywords) {
    if (t.includes(kw)) return true;
  }
  return false;
}

function extractSizes(tags) {
  const sizes = [];
  for (const tag of tags) {
    const m = String(tag).toLowerCase().match(/^(\d+(?:\.\d+)?)(b)$/);
    if (m) sizes.push(parseFloat(m[1]));
  }
  return sizes;
}

function sizeBand(sizes) {
  if (!sizes.length) return 'Unknown';
  const largest = Math.max(...sizes);
  if (largest <= 3) return 'Small (≤3B)';
  if (largest <= 30) return 'Medium (4B–30B)';
  return 'Large (>30B)';
}

function classify(name, tags, description) {
  const combined = `${name} ${tags.join(' ')} ${description}`.toLowerCase();
  const categories = [];
  if (containsAny(combined, EMBEDDING_KEYWORDS) || tags.some(t => String(t).toLowerCase() === 'embedding')) {
    categories.push('Embeddings');
  }
  if (containsAny(combined, VISION_KEYWORDS) || tags.some(t => String(t).toLowerCase() === 'vision')) {
    categories.push('Vision / Multimodal');
  }
  if (containsAny(combined, CODING_KEYWORDS)) categories.push('Coding');
  if (containsAny(combined, MATH_KEYWORDS)) categories.push('Math & STEM');
  if (containsAny(combined, THINKING_KEYWORDS) || tags.some(t => String(t).toLowerCase() === 'thinking')) {
    categories.push('Research & Deep Thinking');
  }
  if (containsAny(combined, CREATIVE_KEYWORDS)) categories.push('Creative / Roleplay');
  if (!categories.length) categories.push('General Chat / Assistant');
  return categories;
}

function isHermesCompatible(name, tags, description) {
  const combined = `${name} ${description}`.toLowerCase();
  if (containsAny(combined, HERMES_KEYWORDS)) return true;
  return tags.some(t => String(t).toLowerCase() === 'tools');
}

function parseRelativeDate(text) {
  const t = String(text).toLowerCase().replace(/updated(\d)/, 'updated $1').replace(/updated([a-z])/, 'updated $1').trim();
  const now = new Date();
  if (/\btoday\b/.test(t)) return { relative: 'today', estimated_iso: now.toISOString().replace(/\.\d{3}Z$/, 'Z') };
  if (/\byesterday\b/.test(t)) {
    const est = new Date(now.getTime() - 86400000);
    return { relative: 'yesterday', estimated_iso: est.toISOString().replace(/\.\d{3}Z$/, 'Z') };
  }
  let m = t.match(/updated\s+(.+)/);
  if (!m) m = t.match(/(\d+\s+(?:second|minute|hour|day|week|month|year)s?\s+ago)/);
  if (!m) return { relative: t, estimated_iso: null };
  const rel = m[1].trim();
  const vm = rel.match(/^(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago$/);
  if (!vm) return { relative: rel, estimated_iso: null };
  const value = parseInt(vm[1], 10);
  const seconds = { second: 1, minute: 60, hour: 3600, day: 86400, week: 604800, month: 2592000, year: 31536000 }[vm[2]] || 0;
  const est = new Date(now.getTime() - value * seconds * 1000);
  return { relative: rel, estimated_iso: est.toISOString().replace(/\.\d{3}Z$/, 'Z') };
}

async function fetchModelPage(name) {
  const url = `${BASE_URL}/library/${name}`;
  try {
    const r = await fetch(url, { headers: HEADERS });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const html = await r.text();
    const description = extractMetaDescription(html);
    const pullCount = extractPattern(html, /pull|download/i, 'span');
    const relativeUpdated = extractRelativeUpdated(html);
    const pageTags = extractTags(html);
    const parsed = parseRelativeDate(relativeUpdated);
    return {
      description,
      pull_count: pullCount.text,
      relative_updated: parsed.relative,
      estimated_updated_iso: parsed.estimated_iso,
      tags: pageTags
    };
  } catch (e) {
    return { description: '', pull_count: '', relative_updated: '', estimated_updated_iso: null, tags: [], error: e.message };
  }
}

function extractMetaDescription(html) {
  const m = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
  if (m) return m[1].trim();
  const m2 = html.match(/<meta[^>]*content=["']([^"']*)["'][^>]*name=["']description["']/i);
  return m2 ? m2[1].trim() : '';
}

function extractTags(html) {
  const tags = [];
  const re = /<span[^>]*class=["'][^"']*(?:inline-flex|rounded)[^"']*["'][^>]*>([^<]*)<\/span>/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const txt = match[1].trim();
    if (txt && !tags.includes(txt)) tags.push(txt);
  }
  return tags;
}

function extractPattern(html, pattern, tagName) {
  const re = new RegExp(`<${tagName}[^>]*>([^<]*)<\/${tagName}>`, 'gi');
  let m;
  while ((m = re.exec(html)) !== null) {
    const text = m[1].trim();
    if (pattern.test(text)) return { text };
  }
  return { text: '' };
}

function extractRelativeUpdated(html) {
  const re = /<span[^>]*class=["'][^"']*(?:flex|items-center)[^"']*["'][^>]*>([^<]*)<\/span>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const text = m[1].trim().toLowerCase();
    if (/updated\s+\d+\s+(second|minute|hour|day|week|month|year)s?\s+ago|today|yesterday/.test(text)) {
      return text;
    }
    if (/\d+\s+(second|minute|hour|day|week|month|year)s?\s+ago/.test(text)) {
      return `Updated ${text}`;
    }
  }
  return '';
}

function normalizePullValue(text) {
  const m = String(text).match(/([\d,]+(?:\.\d+)?)([KMB]?)\s*(?:Pulls?|Downloads?)/i);
  if (!m) return '';
  const raw = m[1].replace(/,/g, '');
  const suffix = m[2].toUpperCase();
  return suffix ? `${raw}${suffix}` : raw;
}

async function scrapeLibrary() {
  const r = await fetch(LIBRARY_URL, { headers: HEADERS });
  if (!r.ok) throw new Error(`Library fetch failed: ${r.status}`);
  const html = await r.text();
  const items = [];
  const liRe = /<li[^>]*class=["'][^"']*border-b[^"']*py-6[^"']*["'][^>]*>([\s\S]*?)<\/li>/gi;
  let li;
  while ((li = liRe.exec(html)) !== null) {
    const block = li[1];
    const aMatch = block.match(/<a[^>]*href=["']\/library\/([^"']*)["'][^>]*(?:title=["']([^"']*)["'])?[^>]*>/i);
    if (!aMatch) continue;
    const name = aMatch[1];
    const title = aMatch[2] || name;
    const tags = [];
    const tagRe = /<span[^>]*class=["'][^"']*(?:inline-flex|rounded)[^"']*["'][^>]*>([^<]*)<\/span>/gi;
    let tm;
    while ((tm = tagRe.exec(block)) !== null) {
      const txt = tm[1].trim();
      if (txt && !tags.includes(txt)) tags.push(txt);
    }
    let pullCount = '';
    let pullValue = '';
    let relativeUpdated = '';
    const flexRe = /<span[^>]*class=["'][^"']*(?:flex|items-center)[^"']*["'][^>]*>([^<]*)<\/span>/gi;
    let fm;
    while ((fm = flexRe.exec(block)) !== null) {
      const txt = fm[1].trim();
      const lower = txt.toLowerCase();
      if ((lower.includes('pull') || lower.includes('download')) && !pullCount) {
        pullCount = txt;
        pullValue = normalizePullValue(txt);
      }
      if (/updated\s+\d+\s+(second|minute|hour|day|week|month|year)s?\s+ago|today|yesterday/.test(lower) && !relativeUpdated) {
        relativeUpdated = txt;
      } else if (/\d+\s+(second|minute|hour|day|week|month|year)s?\s+ago/.test(lower) && !relativeUpdated) {
        relativeUpdated = `Updated ${txt}`;
      }
    }
    const cloud = /<span[^>]*>\s*[Cc][Ll][Oo][Uu][Dd]\s*<\/span>/.test(block);
    items.push({
      name,
      title,
      ollama_url: `${BASE_URL}/library/${name}`,
      listing_tags: tags,
      cloud,
      pull_count: pullCount,
      pull_value: pullValue,
      relative_updated: relativeUpdated.replace(/Updated(\d)/, 'Updated $1').replace(/Updated\s*/, 'Updated ').trim()
    });
  }
  return items;
}

async function enrichModel(model) {
  const details = await fetchModelPage(model.name);
  const allTags = [...new Set([...(model.listing_tags || []), ...(details.tags || [])])];
  const sizes = extractSizes(allTags);
  const categories = classify(model.name, allTags, details.description);
  const hermes = isHermesCompatible(model.name, allTags, details.description);
  const pullCount = model.pull_count || details.pull_count || '';
  const pullValue = model.pull_value || normalizePullValue(details.pull_count || '');
  const relUpd = model.relative_updated || details.relative_updated || '';
  const parsed = parseRelativeDate(relUpd);
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  return {
    name: model.name,
    title: model.title,
    description: details.description,
    categories,
    primary_category: categories[0],
    sizes,
    size_band: sizeBand(sizes),
    tags: allTags,
    capabilities: {
      tools: allTags.some(t => String(t).toLowerCase() === 'tools'),
      vision: allTags.some(t => String(t).toLowerCase() === 'vision') || containsAny(model.name, VISION_KEYWORDS),
      thinking: allTags.some(t => String(t).toLowerCase() === 'thinking') || containsAny(model.name, THINKING_KEYWORDS),
      embedding: allTags.some(t => String(t).toLowerCase() === 'embedding') || containsAny(allTags.join(' '), EMBEDDING_KEYWORDS)
    },
    cloud: model.cloud,
    hermes_compatible: hermes,
    pull_count: pullCount,
    pull_value: pullValue,
    relative_updated: parsed.relative,
    estimated_updated_iso: parsed.estimated_iso,
    ollama_url: model.ollama_url,
    scraped_at: now
  };
}

export async function scrapeAll() {
  const libraryModels = await scrapeLibrary();
  const enriched = [];
  for (const m of libraryModels) {
    try {
      const model = await enrichModel(m);
      enriched.push(model);
    } catch (e) {
      console.error(`Failed to enrich ${m.name}: ${e.message}`);
    }
  }
  const now = new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
  return {
    generated_at: now,
    scraped_at: now,
    source: LIBRARY_URL,
    model_count: enriched.length,
    models: enriched,
    version: '1.1'
  };
}
