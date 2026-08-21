const ALL_CATEGORIES = [
  'General Chat / Assistant',
  'Coding',
  'Research & Deep Thinking',
  'Vision / Multimodal',
  'Math & STEM',
  'Embeddings',
  'Creative / Roleplay'
];

const SIZE_BANDS = ['Small (≤3B)', 'Medium (4B–30B)', 'Large (>30B)', 'Unknown'];

const AVAILABILITY_FILTERS = [
  { key: 'cloud', label: 'Cloud on Ollama' },
  { key: 'hermes_compatible', label: 'Hermes / Claw agent' }
];

const CAPABILITY_FILTERS = [
  { key: 'tools', label: 'Tools' },
  { key: 'vision', label: 'Vision' },
  { key: 'thinking', label: 'Thinking' },
  { key: 'embedding', label: 'Embedding' }
];

const CATEGORY_COLOURS = {
  'General Chat / Assistant': { text: '#3730a3' },
  'Coding': { text: '#15803d' },
  'Research & Deep Thinking': { text: '#7e22ce' },
  'Vision / Multimodal': { text: '#0e7490' },
  'Math & STEM': { text: '#9a3412' },
  'Embeddings': { text: '#5b21b6' },
  'Creative / Roleplay': { text: '#9d174d' }
};

let appState = {
  models: [],
  fuse: null,
  activeFilters: {
    search: '',
    categories: new Set(),
    sizes: new Set(),
    availability: new Set(),
    capabilities: new Set()
  }
};

function initApp(view) {
  renderFilterChips();
  bindEvents();
  loadModels();
}

function bindEvents() {
  const search = document.getElementById('searchInput');
  if (search) {
    search.addEventListener('input', (e) => {
      appState.activeFilters.search = e.target.value;
      applyFilters();
    });
  }

  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => loadModels(true));
  }

  const clearBtn = document.getElementById('clearFilters');
  if (clearBtn) {
    clearBtn.addEventListener('click', clearAllFilters);
  }
}

function renderFilterChips() {
  const catContainer = document.getElementById('categoryChips');
  const sizeContainer = document.getElementById('sizeChips');
  const availContainer = document.getElementById('availChips');
  const capContainer = document.getElementById('capChips');

  if (catContainer) {
    catContainer.innerHTML = ALL_CATEGORIES.map(c =>
      `<button class="chip" data-type="category" data-value="${escapeHtml(c)}" style="color:${CATEGORY_COLOURS[c]?.text || 'inherit'}">` +
      `<i class="ph ph-tag"></i>${escapeHtml(c)}</button>`
    ).join('');
  }

  if (sizeContainer) {
    sizeContainer.innerHTML = SIZE_BANDS.map(s =>
      `<button class="chip" data-type="size" data-value="${escapeHtml(s)}">${escapeHtml(s)}</button>`
    ).join('');
  }

  if (availContainer) {
    availContainer.innerHTML = AVAILABILITY_FILTERS.map(a =>
      `<button class="chip" data-type="availability" data-value="${a.key}">${escapeHtml(a.label)}</button>`
    ).join('');
  }

  if (capContainer) {
    capContainer.innerHTML = CAPABILITY_FILTERS.map(c =>
      `<button class="chip" data-type="capability" data-value="${c.key}">${escapeHtml(c.label)}</button>`
    ).join('');
  }

  document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => toggleFilter(chip.dataset.type, chip.dataset.value, chip));
  });
}

function toggleFilter(type, value, el) {
  const setKey = type === 'category' ? 'categories' : type === 'size' ? 'sizes' : type === 'availability' ? 'availability' : 'capabilities';
  const set = appState.activeFilters[setKey];
  if (set.has(value)) {
    set.delete(value);
    el.classList.remove('active');
  } else {
    set.add(value);
    el.classList.add('active');
  }
  applyFilters();
}

function clearAllFilters() {
  appState.activeFilters.search = '';
  appState.activeFilters.categories.clear();
  appState.activeFilters.sizes.clear();
  appState.activeFilters.availability.clear();
  appState.activeFilters.capabilities.clear();
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('.chip.active').forEach(c => c.classList.remove('active'));
  applyFilters();
}

function updateActiveFilters() {
  const container = document.getElementById('activeFilters');
  if (!container) return;
  const items = [];
  appState.activeFilters.categories.forEach(v => items.push(`Category: ${v}`));
  appState.activeFilters.sizes.forEach(v => items.push(`Size: ${v}`));
  appState.activeFilters.availability.forEach(v => {
    const label = AVAILABILITY_FILTERS.find(a => a.key === v)?.label || v;
    items.push(`Availability: ${label}`);
  });
  appState.activeFilters.capabilities.forEach(v => {
    const label = CAPABILITY_FILTERS.find(c => c.key === v)?.label || v;
    items.push(`Capability: ${label}`);
  });

  if (!items.length) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = items.map(t =>
    `<span class="chip active" style="cursor:default">${escapeHtml(t)}</span>`
  ).join('');
}

async function loadModels(forceRefresh = false) {
  const status = document.getElementById('statusLine');
  const refreshBtn = document.getElementById('refreshBtn');
  if (refreshBtn) refreshBtn.disabled = true;
  if (status) status.innerHTML = `<i class="ph ph-spinner ph-spin"></i> ${forceRefresh ? 'Refreshing from Ollama…' : 'Loading models…'}`;

  try {
    const url = forceRefresh ? '/api/refresh' : '/api/models';
    const method = forceRefresh ? 'POST' : 'GET';
    const resp = await fetch(url, { method });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();

    appState.models = (data.models || []).map(m => ({
      ...m,
      capabilities: m.capabilities || {},
      categories: m.categories || ['General Chat / Assistant']
    }));

    appState.fuse = new Fuse(appState.models, {
      keys: ['name', 'title', 'description', 'tags', 'primary_category'],
      threshold: 0.3
    });

    const age = data.scraped_at ? formatAge(data.scraped_at) : '';
    if (status) status.innerHTML = `<i class="ph ph-check-circle"></i> ${appState.models.length} models loaded${age ? ` · ${age}` : ''}`;

    applyFilters();
  } catch (e) {
    if (status) status.innerHTML = `<i class="ph ph-warning-circle"></i> Failed to load: ${e.message}`;
    console.error(e);
  } finally {
    if (refreshBtn) refreshBtn.disabled = false;
  }
}

function formatAge(iso) {
  const dt = new Date(iso);
  const diff = (Date.now() - dt.getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

function applyFilters() {
  updateActiveFilters();
  let list = [...appState.models];

  if (appState.activeFilters.search.trim()) {
    const results = appState.fuse.search(appState.activeFilters.search.trim());
    list = results.map(r => r.item);
  }

  if (appState.activeFilters.categories.size) {
    list = list.filter(m => m.categories.some(c => appState.activeFilters.categories.has(c)));
  }
  if (appState.activeFilters.sizes.size) {
    list = list.filter(m => appState.activeFilters.sizes.has(m.size_band));
  }
  if (appState.activeFilters.availability.size) {
    list = list.filter(m => {
      for (const key of appState.activeFilters.availability) {
        if (key === 'cloud' && !m.cloud) return false;
        if (key === 'hermes_compatible' && !m.hermes_compatible) return false;
      }
      return true;
    });
  }
  if (appState.activeFilters.capabilities.size) {
    list = list.filter(m => {
      for (const key of appState.activeFilters.capabilities) {
        if (!m.capabilities?.[key]) return false;
      }
      return true;
    });
  }

  renderCards(list);
  const count = document.getElementById('resultCount');
  if (count) count.textContent = `${list.length} result${list.length === 1 ? '' : 's'}`;
}

function renderCards(models) {
  const grid = document.getElementById('cardsGrid');
  if (!grid) return;
  if (!models.length) {
    grid.innerHTML = `<p class="status-line" style="grid-column:1/-1;text-align:center;padding:3rem">No models match your filters.</p>`;
    return;
  }

  grid.innerHTML = models.map(m => {
    const badges = [];
    if (m.cloud) badges.push(`<span class="badge badge-cloud"><i class="ph ph-cloud"></i> Cloud</span>`);
    if (m.hermes_compatible) badges.push(`<span class="badge badge-hermes">Hermes</span>`);
    if (m.capabilities?.tools) badges.push(`<span class="badge badge-tools"><i class="ph ph-wrench"></i> Tools</span>`);
    if (m.capabilities?.vision) badges.push(`<span class="badge badge-vision"><i class="ph ph-eye"></i> Vision</span>`);
    if (m.capabilities?.thinking) badges.push(`<span class="badge badge-thinking"><i class="ph ph-brain"></i> Thinking</span>`);
    if (m.capabilities?.embedding) badges.push(`<span class="badge badge-embedding"><i class="ph ph-arrows-in-line-vertical"></i> Embed</span>`);

    const category = m.primary_category || m.categories?.[0] || 'General Chat / Assistant';
    const colour = CATEGORY_COLOURS[category]?.text || 'inherit';

    const pullDisplay = m.pull_value || formatPullCount(m.pull_count);

    return `
      <article class="model-card" style="border-top:3px solid ${colour}">
        <div class="card-header">
          <h2 class="card-title">
            <a href="${escapeHtml(m.ollama_url)}" target="_blank" rel="noopener">${escapeHtml(m.name)}</a>
          </h2>
          <div class="card-badges">${badges.join('')}</div>
        </div>
        <p class="card-description">${escapeHtml(m.description || 'No description available.')}</p>
        <div class="card-meta">
          <span style="color:${colour};font-weight:600">${escapeHtml(category)}</span>
          <span><i class="ph ph-resize"></i> ${escapeHtml(m.size_band || 'Unknown')}</span>
          ${pullDisplay ? `<span><i class="ph ph-download-simple"></i> ${escapeHtml(pullDisplay)}</span>` : ''}
          ${m.relative_updated ? `<span><i class="ph ph-clock"></i> ${escapeHtml(m.relative_updated)}</span>` : ''}
        </div>
      </article>
    `;
  }).join('');
}

function formatPullCount(text) {
  if (!text) return '';
  // text might be '118.7M Pulls' or just '1,234'
  const m = String(text).match(/([\d,]+(?:\.\d+)?)([KMB]?)\s*(?:Pulls?|Downloads?)?/i);
  if (!m) return '';
  const raw = m[1].replace(/,/g, '');
  const suffix = m[2].toUpperCase();
  return suffix ? `${raw}${suffix}` : raw;
}

function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

window.initApp = initApp;
