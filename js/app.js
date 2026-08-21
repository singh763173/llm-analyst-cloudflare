/* LLMAnalyst shared frontend logic */

const ALL_CATEGORIES = [
  "General Chat / Assistant",
  "Coding",
  "Research & Deep Thinking",
  "Vision / Multimodal",
  "Math & STEM",
  "Embeddings",
  "Creative / Roleplay",
];

const SIZE_BANDS = [
  "Small (≤3B)",
  "Medium (4B–30B)",
  "Large (>30B)",
  "Unknown",
];

const AVAILABILITY_FILTERS = [
  { key: "cloud", label: "Cloud on Ollama" },
  { key: "hermes_compatible", label: "Hermes / Claw agent" },
  { key: "not_hermes", label: "Not Hermes / Claw" },
];

const CAPABILITY_FILTERS = [
  { key: "tools", label: "Tools" },
  { key: "vision", label: "Vision" },
  { key: "thinking", label: "Thinking" },
  { key: "embedding", label: "Embedding" },
];

const RECENCY_FILTERS = [
  { key: "today", label: "Today", days: 1 },
  { key: "week", label: "This week", days: 7 },
  { key: "month", label: "This month", days: 30 },
  { key: "year", label: "This year", days: 365 },
];

const SORT_OPTIONS = [
  { field: "pull_value", dir: "desc", label: "Most popular" },
  { field: "estimated_updated_iso", dir: "desc", label: "Recently updated" },
  { field: "name", dir: "asc", label: "Name A→Z" },
  { field: "name", dir: "desc", label: "Name Z→A" },
  { field: "size_band", dir: "asc", label: "Size small→large" },
];

const CATEGORY_COLOURS = {
  "General Chat / Assistant": { bg: "#eef2ff", text: "#3730a3", darkBg: "rgba(99,102,241,0.18)", darkText: "#818cf8", gradient: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)" },
  "Coding": { bg: "#f0fdf4", text: "#15803d", darkBg: "rgba(34,197,94,0.18)", darkText: "#4ade80", gradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)" },
  "Research & Deep Thinking": { bg: "#faf5ff", text: "#7e22ce", darkBg: "rgba(168,85,247,0.18)", darkText: "#c084fc", gradient: "linear-gradient(135deg, #a855f7 0%, #d8b4fe 100%)" },
  "Vision / Multimodal": { bg: "#ecfeff", text: "#0e7490", darkBg: "rgba(34,211,238,0.18)", darkText: "#67e8f9", gradient: "linear-gradient(135deg, #06b6d4 0%, #22d3ee 100%)" },
  "Math & STEM": { bg: "#fff7ed", text: "#9a3412", darkBg: "rgba(251,146,60,0.18)", darkText: "#fdba74", gradient: "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)" },
  "Embeddings": { bg: "#f5f3ff", text: "#5b21b6", darkBg: "rgba(139,92,246,0.18)", darkText: "#a78bfa", gradient: "linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)" },
  "Creative / Roleplay": { bg: "#fdf2f8", text: "#9d174d", darkBg: "rgba(244,114,182,0.18)", darkText: "#f9a8d4", gradient: "linear-gradient(135deg, #ec4899 0%, #f472b6 100%)" },
};

const CATEGORY_ICONS = {
  "General Chat / Assistant": "ph-chat-circle",
  "Coding": "ph-code",
  "Research & Deep Thinking": "ph-brain",
  "Vision / Multimodal": "ph-eye",
  "Math & STEM": "ph-function",
  "Embeddings": "ph-arrows-in-line-vertical",
  "Creative / Roleplay": "ph-mask-happy",
};

const PRESETS = [
  {
    id: "favourites",
    label: "Favourites",
    icon: "ph-star",
    filters: { availability: ["favourite"] },
    sort: { field: "pull_value", dir: "desc" },
  },
  {
    id: "coding",
    label: "Best for coding",
    icon: "ph-code",
    filters: { categories: ["Coding"], capabilities: ["tools"] },
    sort: { field: "pull_value", dir: "desc" },
  },
  {
    id: "agents",
    label: "Best for agents (Hermes/Claw)",
    icon: "ph-robot",
    filters: { availability: ["hermes_compatible"], capabilities: ["tools"] },
    sort: { field: "pull_value", dir: "desc" },
  },
  {
    id: "small",
    label: "Small & fast",
    icon: "ph-lightning",
    filters: { sizes: ["Small (≤3B)"] },
    sort: { field: "pull_value", dir: "desc" },
  },
  {
    id: "recent",
    label: "Recently updated",
    icon: "ph-clock-clockwise",
    filters: {},
    sort: { field: "estimated_updated_iso", dir: "desc" },
  },
  {
    id: "popular",
    label: "Most popular",
    icon: "ph-trend-up",
    filters: {},
    sort: { field: "pull_value", dir: "desc" },
  },
];

const FILTER_LABELS = {
  ...Object.fromEntries(ALL_CATEGORIES.map((c) => [c, c])),
  ...Object.fromEntries(SIZE_BANDS.map((s) => [s, s])),
  ...Object.fromEntries(AVAILABILITY_FILTERS.map((f) => [f.key, f.label])),
  ...Object.fromEntries(CAPABILITY_FILTERS.map((f) => [f.key, f.label])),
  ...Object.fromEntries(RECENCY_FILTERS.map((f) => [f.key, f.label])),
  favourite: "Favourite",
};

const DEFAULT_TITLE = "LLMAnalyst — Ollama Model Explorer";
const TABLE_TITLE = "LLMAnalyst — Full Model Table";

const COMPARE_ICONS = {
  cloud: "ph-cloud",
  hermes_compatible: "ph-robot",
  tools: "ph-wrench",
  vision: "ph-eye",
  thinking: "ph-brain",
  embedding: "ph-arrows-in-line-vertical",
};

let appState = {
  models: [],
  filtered: [],
  filters: {
    search: "",
    categories: new Set(),
    sizes: new Set(),
    availability: new Set(),
    capabilities: new Set(),
    recency: new Set(),
  },
  sort: { field: "pull_value", dir: "desc" },
  view: "cards",
  loading: false,
  selectedModel: null,
  selectedTag: null,
  searchDebounce: null,
  activePreset: null,
  favourites: loadFavourites(),
  cacheIsStale: false,
  compare: new Set(),
  previousModelNames: loadPreviousModelNames(),
  modalTrigger: null,
};

function loadFavourites() {
  try {
    const raw = localStorage.getItem("llmanalyst-favourites");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function saveFavourites() {
  try {
    localStorage.setItem("llmanalyst-favourites", JSON.stringify([...appState.favourites]));
  } catch {
    // ignore
  }
}

function loadPreviousModelNames() {
  try {
    const raw = localStorage.getItem("llmanalyst-model-names");
    return raw ? new Set(JSON.parse(raw)) : new Set();
  } catch {
    return new Set();
  }
}

function savePreviousModelNames() {
  try {
    localStorage.setItem("llmanalyst-model-names", JSON.stringify([...appState.previousModelNames]));
  } catch {
    // ignore
  }
}

function toggleFavourite(name) {
  if (appState.favourites.has(name)) appState.favourites.delete(name);
  else appState.favourites.add(name);
  saveFavourites();
  updateFavouriteButtons();
  applyFilters();
}

function isFavourite(name) {
  return appState.favourites.has(name);
}

function updateFavouriteButtons() {
  document.querySelectorAll(".fav-btn").forEach((btn) => {
    const name = btn.dataset.name;
    const active = isFavourite(name);
    btn.classList.toggle("active", active);
    btn.innerHTML = `<i class="ph ${active ? "ph-star" : "ph-star"}"></i>`;
    btn.title = active ? "Remove from favourites" : "Add to favourites";
  });
}

async function initApp(view) {
  appState.view = view;
  bindControls();
  buildFilterChips();
  buildPresets();
  buildRecencyChips();
  buildSortControl();
  buildExportButtons();
  loadFiltersFromURL();
  await loadModels(false);
  applyDarkMode();
  setupVisibilityRefresh();
  updateDocumentTitle();

  // Online/offline detection
  window.addEventListener("online", () => {
    showToast("Back online");
    if (appState.cacheIsStale) loadModels(false);
  });
  window.addEventListener("offline", () => {
    showToast("You are offline");
  });
}

function bindControls() {
  const search = document.getElementById("searchInput");
  if (search) {
    search.value = appState.filters.search;
    search.addEventListener("input", (e) => {
      const val = e.target.value.trim().toLowerCase();
      clearTimeout(appState.searchDebounce);
      appState.searchDebounce = setTimeout(() => {
        appState.filters.search = val;
        appState.activePreset = null;
        applyFilters();
      }, 200);
    });
  }

  const refreshBtn = document.getElementById("refreshBtn");
  if (refreshBtn) {
    refreshBtn.addEventListener("click", async () => {
      if (refreshBtn.disabled) return;
      await loadModels(true);
    });
  }

  const clearBtn = document.getElementById("clearFilters");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      clearAllFilters();
    });
  }

  const darkToggle = document.getElementById("darkModeToggle");
  if (darkToggle) {
    darkToggle.addEventListener("click", () => {
      const root = document.documentElement;
      const isDark = root.classList.toggle("dark");
      localStorage.setItem("llmanalyst-dark", isDark ? "1" : "0");
      updateDarkIcon();
    });
  }

  if (appState.view === "table") {
    document.querySelectorAll(".models-table th[data-sort]").forEach((th) => {
      th.addEventListener("click", () => {
        const field = th.dataset.sort;
        if (appState.sort.field === field) {
          appState.sort.dir = appState.sort.dir === "asc" ? "desc" : "asc";
        } else {
          appState.sort.field = field;
          appState.sort.dir = "desc";
        }
        appState.activePreset = null;
        applyFilters();
      });
    });
  }

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "select" || tag === "textarea") return;
    if (e.key === "/") {
      e.preventDefault();
      document.getElementById("searchInput")?.focus();
    } else if (e.key.toLowerCase() === "r" && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      document.getElementById("refreshBtn")?.click();
    }
  });

  // Modal close handlers
  const modal = document.getElementById("modelModal");
  if (modal) {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) closeModal();
    });
  }
}

function setupVisibilityRefresh() {
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible" && appState.cacheIsStale && !appState.loading && navigator.onLine) {
      await loadModels(true);
    }
  });
}

function showToast(message) {
  let toast = document.getElementById("toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast";
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2000);
}

function loadFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("search")) appState.filters.search = params.get("search").toLowerCase();
  params.getAll("category").forEach((v) => appState.filters.categories.add(v));
  params.getAll("size").forEach((v) => appState.filters.sizes.add(v));
  params.getAll("availability").forEach((v) => appState.filters.availability.add(v));
  params.getAll("capability").forEach((v) => appState.filters.capabilities.add(v));
  params.getAll("recency").forEach((v) => appState.filters.recency.add(v));
  const sortField = params.get("sort");
  const sortDir = params.get("dir");
  if (sortField && sortDir) {
    appState.sort = { field: sortField, dir: sortDir };
  }
  const preset = params.get("preset");
  if (preset && PRESETS.find((p) => p.id === preset)) {
    appState.activePreset = preset;
  }
}

function updateURL() {
  const params = new URLSearchParams();
  if (appState.filters.search) params.set("search", appState.filters.search);
  appState.filters.categories.forEach((v) => params.append("category", v));
  appState.filters.sizes.forEach((v) => params.append("size", v));
  appState.filters.availability.forEach((v) => params.append("availability", v));
  appState.filters.capabilities.forEach((v) => params.append("capability", v));
  appState.filters.recency.forEach((v) => params.append("recency", v));
  const sort = appState.sort;
  if (sort.field !== "pull_value" || sort.dir !== "desc") {
    params.set("sort", sort.field);
    params.set("dir", sort.dir);
  }
  if (appState.activePreset) params.set("preset", appState.activePreset);
  const qs = params.toString();
  const url = qs ? `${window.location.pathname}?${qs}` : window.location.pathname;
  window.history.replaceState({}, "", url);
  updateDocumentTitle();
}

function updateDocumentTitle() {
  const base = appState.view === "table" ? TABLE_TITLE : DEFAULT_TITLE;
  const parts = [];
  if (appState.selectedModel) {
    parts.push(appState.selectedModel.name);
  } else {
    if (appState.filters.search) parts.push(`search: ${appState.filters.search}`);
    if (appState.activePreset) {
      const preset = PRESETS.find((p) => p.id === appState.activePreset);
      if (preset) parts.push(preset.label);
    }
    if (appState.filters.categories.size === 1) parts.push([...appState.filters.categories][0]);
  }
  if (parts.length > 0) {
    document.title = `${parts.join(" · ")} · ${base}`;
  } else {
    document.title = base;
  }
}

function getShareableURL() {
  const params = new URLSearchParams(window.location.search);
  return `${window.location.origin}${window.location.pathname}${params.toString() ? "?" + params.toString() : ""}`;
}

function applyDarkMode() {
  const saved = localStorage.getItem("llmanalyst-dark");
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  const isDark = saved ? saved === "1" : prefersDark;
  if (isDark) document.documentElement.classList.add("dark");
  else document.documentElement.classList.remove("dark");
  updateDarkIcon();
}

function updateDarkIcon() {
  const btn = document.getElementById("darkModeToggle");
  if (!btn) return;
  const isDark = document.documentElement.classList.contains("dark");
  btn.innerHTML = `<i class="ph ${isDark ? "ph-sun" : "ph-moon"}"></i><span>${isDark ? "Light" : "Dark"}</span>`;
  btn.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  btn.setAttribute("title", isDark ? "Switch to light mode" : "Switch to dark mode");
}

function buildFilterChips() {
  const categoryContainer = document.getElementById("categoryChips");
  if (categoryContainer) {
    categoryContainer.innerHTML = ALL_CATEGORIES.map((cat) =>
      `<button class="chip" data-type="category" data-value="${escapeHtml(cat)}" title="Filter by ${escapeHtml(cat)}">
        <i class="ph ${CATEGORY_ICONS[cat] || "ph-tag"}"></i> ${escapeHtml(cat)} <span class="count"></span>
      </button>`
    ).join("");
  }

  const sizeContainer = document.getElementById("sizeChips");
  if (sizeContainer) {
    sizeContainer.innerHTML = SIZE_BANDS.map((size) =>
      `<button class="chip" data-type="size" data-value="${escapeHtml(size)}"><i class="ph ph-resize"></i> ${escapeHtml(size)} <span class="count"></span></button>`
    ).join("");
  }

  const availContainer = document.getElementById("availChips");
  if (availContainer) {
    availContainer.innerHTML = AVAILABILITY_FILTERS.map((f) =>
      `<button class="chip" data-type="availability" data-value="${f.key}" title="${escapeHtml(f.label)}"><i class="ph ph-check-circle"></i> ${escapeHtml(f.label)} <span class="count"></span></button>`
    ).join("");
  }

  const capContainer = document.getElementById("capChips");
  if (capContainer) {
    capContainer.innerHTML = CAPABILITY_FILTERS.map((f) =>
      `<button class="chip" data-type="capability" data-value="${f.key}"><i class="ph ph-lightning"></i> ${escapeHtml(f.label)} <span class="count"></span></button>`
    ).join("");
  }

  document.querySelectorAll(".chip[data-type]").forEach((chip) => {
    chip.addEventListener("click", () => {
      const type = chip.dataset.type;
      const value = chip.dataset.value;
      const set = filterSet(type);
      if (set.has(value)) {
        set.delete(value);
      } else {
        set.add(value);
      }
      appState.activePreset = null;
      applyFilters();
    });
  });
}

function buildRecencyChips() {
  const container = document.getElementById("recencyChips");
  if (!container) return;
  container.innerHTML = RECENCY_FILTERS.map((f) =>
    `<button class="chip" data-type="recency" data-value="${f.key}"><i class="ph ph-calendar"></i> ${escapeHtml(f.label)} <span class="count"></span></button>`
  ).join("");

  container.querySelectorAll(".chip[data-type='recency']").forEach((chip) => {
    chip.addEventListener("click", () => {
      const value = chip.dataset.value;
      const set = appState.filters.recency;
      if (set.has(value)) set.delete(value);
      else set.add(value);
      appState.activePreset = null;
      applyFilters();
    });
  });
}

function buildPresets() {
  const container = document.getElementById("presetChips");
  if (!container) return;
  container.innerHTML = PRESETS.map((p) =>
    `<button class="chip preset-chip" data-preset="${p.id}" title="${escapeHtml(p.label)}">
      <i class="ph ${p.icon}"></i> ${escapeHtml(p.label)}
    </button>`
  ).join("");

  container.querySelectorAll(".preset-chip").forEach((chip) => {
    chip.addEventListener("click", () => {
      const preset = PRESETS.find((p) => p.id === chip.dataset.preset);
      if (!preset) return;
      applyPreset(preset);
    });
  });
}

function buildSortControl() {
  const container = document.getElementById("sortControl");
  if (!container) return;
  container.innerHTML = `
    <label class="sort-label" for="sortSelect"><i class="ph ph-sort-descending"></i> Sort</label>
    <select id="sortSelect" class="sort-select">
      ${SORT_OPTIONS.map((opt) => {
        const selected = appState.sort.field === opt.field && appState.sort.dir === opt.dir ? "selected" : "";
        return `<option value="${opt.field}|${opt.dir}" ${selected}>${escapeHtml(opt.label)}</option>`;
      }).join("")}
    </select>
  `;
  const select = document.getElementById("sortSelect");
  if (select) {
    select.addEventListener("change", (e) => {
      const [field, dir] = e.target.value.split("|");
      appState.sort = { field, dir };
      appState.activePreset = null;
      applyFilters();
    });
  }
}

function buildExportButtons() {
  const container = document.getElementById("exportButtons");
  if (!container) return;
  container.innerHTML = `
    <button class="btn btn-ghost export-btn" id="exportCsv" title="Export filtered results as CSV"><i class="ph ph-file-csv"></i> CSV</button>
    <button class="btn btn-ghost export-btn" id="exportJson" title="Export filtered results as JSON"><i class="ph ph-file-json"></i> JSON</button>
    <button class="btn btn-ghost export-btn" id="copyLinkBtn" title="Copy link to current filters"><i class="ph ph-link"></i> Link</button>
    <button class="btn btn-ghost export-btn" id="compareBtn" title="Compare selected models (2–3)"><i class="ph ph-circles-three-plus"></i> Compare <span class="compare-count" id="compareCount">0</span></button>
  `;
  document.getElementById("exportCsv")?.addEventListener("click", exportCSV);
  document.getElementById("exportJson")?.addEventListener("click", exportJSON);
  document.getElementById("copyLinkBtn")?.addEventListener("click", copyShareableLink);
  document.getElementById("compareBtn")?.addEventListener("click", openCompareModal);
}

function copyShareableLink() {
  const url = getShareableURL();
  copyToClipboard(url);
}

function copyShareableModelLink(name) {
  const url = `${window.location.origin}${window.location.pathname}?model=${encodeURIComponent(name)}`;
  copyToClipboard(url);
}

function exportCSV() {
  const rows = appState.filtered.map((m) => ({
    name: m.name,
    primary_category: m.primary_category,
    categories: (m.categories || []).join("; "),
    size_band: m.size_band || "Unknown",
    sizes: (m.sizes || []).join("; "),
    cloud: m.cloud ? "Yes" : "No",
    hermes_compatible: m.hermes_compatible ? "Yes" : "No",
    tools: m.capabilities?.tools ? "Yes" : "No",
    vision: m.capabilities?.vision ? "Yes" : "No",
    thinking: m.capabilities?.thinking ? "Yes" : "No",
    embedding: m.capabilities?.embedding ? "Yes" : "No",
    pull_value: m.pull_value || "",
    relative_updated: m.relative_updated || "",
    estimated_updated_iso: m.estimated_updated_iso || "",
    description: (m.description || "").replace(/"/g, String.fromCharCode(34, 34)),
    ollama_url: m.ollama_url,
  }));
  if (!rows.length) return showToast("Nothing to export");
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) => headers.map((h) => `"${String(r[h] || "").replace(/"/g, String.fromCharCode(34, 34))}"`).join(",")),
  ].join("\n");
  downloadBlob(csv, "llmanalyst_filtered.csv", "text/csv");
  showToast(`Exported ${rows.length} models to CSV`);
}

function exportJSON() {
  const rows = appState.filtered.map((m) => ({
    name: m.name,
    primary_category: m.primary_category,
    categories: m.categories,
    size_band: m.size_band,
    sizes: m.sizes,
    cloud: m.cloud,
    hermes_compatible: m.hermes_compatible,
    capabilities: m.capabilities,
    pull_value: m.pull_value,
    relative_updated: m.relative_updated,
    estimated_updated_iso: m.estimated_updated_iso,
    description: m.description,
    ollama_url: m.ollama_url,
  }));
  if (!rows.length) return showToast("Nothing to export");
  downloadBlob(JSON.stringify(rows, null, 2), "llmanalyst_filtered.json", "application/json");
  showToast(`Exported ${rows.length} models to JSON`);
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function applyPreset(preset) {
  clearAllFilters(false);

  if (preset.filters.categories) {
    preset.filters.categories.forEach((c) => appState.filters.categories.add(c));
  }
  if (preset.filters.sizes) {
    preset.filters.sizes.forEach((s) => appState.filters.sizes.add(s));
  }
  if (preset.filters.availability) {
    preset.filters.availability.forEach((a) => appState.filters.availability.add(a));
  }
  if (preset.filters.capabilities) {
    preset.filters.capabilities.forEach((c) => appState.filters.capabilities.add(c));
  }

  appState.sort = { ...preset.sort };
  appState.activePreset = preset.id;

  const search = document.getElementById("searchInput");
  if (search) search.value = appState.filters.search;

  applyFilters();
}

function clearAllFilters(apply = true) {
  appState.filters.search = "";
  appState.filters.categories.clear();
  appState.filters.sizes.clear();
  appState.filters.availability.clear();
  appState.filters.capabilities.clear();
  appState.filters.recency.clear();
  appState.activePreset = null;

  const search = document.getElementById("searchInput");
  if (search) search.value = "";
  if (apply) applyFilters();
}

function removeFilter(type, value) {
  if (type === "preset") {
    appState.activePreset = null;
    clearAllFilters(false);
  } else if (type === "search") {
    appState.filters.search = "";
    const searchInput = document.getElementById("searchInput");
    if (searchInput) searchInput.value = "";
  } else {
    const set = filterSet(type);
    if (set) {
      set.delete(value);
      appState.activePreset = null;
    }
  }
  applyFilters();
}

function filterSet(type) {
  if (type === "category") return appState.filters.categories;
  if (type === "size") return appState.filters.sizes;
  if (type === "availability") return appState.filters.availability;
  if (type === "capability") return appState.filters.capabilities;
  if (type === "recency") return appState.filters.recency;
  return null;
}

function hasActiveFilters() {
  return (
    appState.filters.search ||
    appState.filters.categories.size > 0 ||
    appState.filters.sizes.size > 0 ||
    appState.filters.availability.size > 0 ||
    appState.filters.capabilities.size > 0 ||
    appState.filters.recency.size > 0 ||
    appState.activePreset
  );
}

// Tiny fuzzy search: matches if the query can be built from the text in order
// with optional extra characters in between. Good enough for simple typos.
function fuzzyMatch(query, text) {
  query = query.toLowerCase();
  text = text.toLowerCase();
  let qi = 0;
  for (let i = 0; i < text.length && qi < query.length; i++) {
    if (text[i] === query[qi]) qi++;
  }
  return qi === query.length;
}

async function loadModels(forceRefresh) {
  const status = document.getElementById("statusLine");
  const refreshBtn = document.getElementById("refreshBtn");
  const grid = document.getElementById("cardsGrid");
  const tbody = document.getElementById("tableBody");

  try {
    appState.loading = true;
    if (refreshBtn) refreshBtn.disabled = true;
    if (status) {
      status.className = "status-line";
      status.innerHTML = `<i class="ph ph-spinner ph-spin"></i> ${forceRefresh ? "Refreshing from Ollama…" : "Loading models…"}`;
    }
    if (appState.view === "cards") {
      renderSkeletonCards();
      renderHeroChart(true);
    } else {
      tbody.innerHTML = `<tr><td colspan="10" class="empty-state">${renderSkeletonTable()}</td></tr>`;
    }

    const url = forceRefresh ? "/api/refresh" : "/api/models";
    const method = forceRefresh ? "POST" : "GET";
    const resp = await fetch(url, { method });
    if (!resp.ok) {
      if (!navigator.onLine) throw new Error("You appear to be offline.");
      throw new Error(`HTTP ${resp.status}`);
    }
    const data = await resp.json();

    appState.cacheIsStale = false;

    const previous = appState.previousModelNames;
    const currentNames = new Set((data.models || []).map((m) => m.name));
    const newNames = [...currentNames].filter((n) => !previous.has(n));
    appState.newModels = newNames;
    appState.previousModelNames = currentNames;
    savePreviousModelNames();

    appState.models = (data.models || []).map((m) => ({
      ...m,
      searchText: `${m.name} ${m.title || ""} ${m.description || ""} ${(m.tags || []).join(" ")} ${(m.categories || []).join(" ")}`.toLowerCase(),
    }));

    // Build Fuse index for fuzzy search
    if (typeof Fuse !== "undefined") {
      appState.fuse = new Fuse(appState.models, {
        keys: ["name", "title", "description", "tags", "categories"],
        threshold: 0.35,
        includeScore: false,
      });
    }

    if (status) {
      status.className = "status-line ok";
      const age = data.scraped_at ? ` · cached ${new Date(data.scraped_at).toLocaleString()}` : "";
      status.innerHTML = `<i class="ph ph-check-circle"></i> ${appState.models.length} models loaded${age}`;
    }
  } catch (err) {
    appState.cacheIsStale = true;
    if (status) {
      status.className = "status-line error";
      const msg = err.message === "You appear to be offline." ? "Offline — showing cached data" : `Failed to load: ${escapeHtml(err.message)}`;
      status.innerHTML = `<i class="ph ph-warning-circle"></i> ${msg}`;
      if (!navigator.onLine) {
        showToast("You are offline. Data may be out of date.");
      }
    }
  } finally {
    appState.loading = false;
    if (refreshBtn) refreshBtn.disabled = false;
    updateChipCounts();
    applyFilters();
    updateFavouriteButtons();
  }
}

function renderSkeletonCards() {
  const grid = document.getElementById("cardsGrid");
  if (!grid) return;
  grid.innerHTML = Array.from({ length: 8 }).map((_, idx) => `
    <article class="card skeleton-card" style="animation-delay: ${idx * 40}ms">
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-badges">
        <span class="skeleton-badge"></span>
        <span class="skeleton-badge"></span>
      </div>
      <div class="skeleton-line skeleton-desc"></div>
      <div class="skeleton-line skeleton-desc"></div>
      <div class="skeleton-line skeleton-desc"></div>
      <div class="skeleton-meta">
        <span class="skeleton-line skeleton-short"></span>
        <span class="skeleton-line skeleton-short"></span>
      </div>
    </article>
  `).join("");
}

function renderHeroChart(skeleton = false) {
  const container = document.getElementById("heroChart");
  if (!container) return;

  if (skeleton || appState.models.length === 0) {
    container.style.display = "none";
    return;
  }

  container.style.display = "block";
  const top = [...appState.models]
    .sort((a, b) => parsePullValue(b.pull_value) - parsePullValue(a.pull_value))
    .slice(0, 5);
  const max = Math.max(...top.map((m) => parsePullValue(m.pull_value)), 1);

  container.innerHTML = `
    <h3><i class="ph ph-chart-bar"></i> Top models by popularity</h3>
    <div class="chart-grid">${top.map((m) => {
      const pct = (parsePullValue(m.pull_value) / max) * 100;
      return `
        <div class="chart-row">
          <span class="chart-label" title="${escapeHtml(m.name)}" onclick="openModelDetail('${escapeHtml(m.name)}', this)">${escapeHtml(m.name)}</span>
          <div class="chart-bar-wrap"><div class="chart-bar" data-width="${pct.toFixed(1)}%"></div></div>
          <span class="chart-value" onclick="openModelDetail('${escapeHtml(m.name)}', this)">${formatPullCount(m.pull_value)}</span>
        </div>`;
    }).join("")}</div>
  `;

  requestAnimationFrame(() => {
    container.querySelectorAll(".chart-bar").forEach((bar) => {
      bar.style.width = bar.dataset.width;
    });
  });
}

function renderSkeletonTable() {
  return `
    <div class="skeleton-table">
      ${Array.from({ length: 6 }).map(() => `
        <div class="skeleton-table-row">
          <span class="skeleton-line skeleton-cell"></span>
          <span class="skeleton-line skeleton-cell"></span>
          <span class="skeleton-line skeleton-cell"></span>
          <span class="skeleton-line skeleton-cell"></span>
        </div>
      `).join("")}
    </div>
  `;
}

function updateChipCounts() {
  const counts = {
    category: {},
    size: {},
    availability: { cloud: 0, hermes_compatible: 0, not_hermes: 0 },
    capability: { tools: 0, vision: 0, thinking: 0, embedding: 0 },
    recency: { today: 0, week: 0, month: 0, year: 0 },
  };

  const now = new Date();
  const dayMs = 86400000;

  for (const m of appState.models) {
    for (const cat of m.categories || [m.primary_category]) {
      counts.category[cat] = (counts.category[cat] || 0) + 1;
    }
    const size = m.size_band || "Unknown";
    counts.size[size] = (counts.size[size] || 0) + 1;
    if (m.cloud) counts.availability.cloud += 1;
    if (m.hermes_compatible) counts.availability.hermes_compatible += 1;
    else counts.availability.not_hermes += 1;
    const caps = m.capabilities || {};
    for (const key of CAPABILITY_FILTERS.map((c) => c.key)) {
      if (caps[key]) counts.capability[key] += 1;
    }
    if (m.estimated_updated_iso) {
      const d = new Date(m.estimated_updated_iso);
      const daysAgo = (now - d) / dayMs;
      if (daysAgo <= 1) counts.recency.today += 1;
      if (daysAgo <= 7) counts.recency.week += 1;
      if (daysAgo <= 30) counts.recency.month += 1;
      if (daysAgo <= 365) counts.recency.year += 1;
    }
  }

  document.querySelectorAll('.chip[data-type="category"] .count').forEach((el) => {
    el.textContent = counts.category[el.closest(".chip").dataset.value] || 0;
  });
  document.querySelectorAll('.chip[data-type="size"] .count').forEach((el) => {
    el.textContent = counts.size[el.closest(".chip").dataset.value] || 0;
  });
  document.querySelectorAll('.chip[data-type="availability"] .count').forEach((el) => {
    el.textContent = counts.availability[el.closest(".chip").dataset.value] || 0;
  });
  document.querySelectorAll('.chip[data-type="capability"] .count').forEach((el) => {
    el.textContent = counts.capability[el.closest(".chip").dataset.value] || 0;
  });
  document.querySelectorAll('.chip[data-type="recency"] .count').forEach((el) => {
    el.textContent = counts.recency[el.closest(".chip").dataset.value] || 0;
  });
}

function applyFilters() {
  const search = appState.filters.search;
  const cats = appState.filters.categories;
  const sizes = appState.filters.sizes;
  const avail = appState.filters.availability;
  const caps = appState.filters.capabilities;
  const recency = appState.filters.recency;

  const now = Date.now();
  const dayMs = 86400000;

  let list = appState.models.filter((m) => {
    if (search) {
      const text = m.searchText;
      if (!text.includes(search)) {
        // Use Fuse.js if available for fuzzy matching, otherwise fall back to custom matcher
        if (typeof Fuse !== "undefined" && appState.fuse) {
          const results = appState.fuse.search(search);
          if (!results.find((r) => r.item.name === m.name)) return false;
        } else if (!fuzzyMatch(search, text)) {
          return false;
        }
      }
    }

    if (cats.size > 0 && !m.categories.some((c) => cats.has(c))) return false;

    if (sizes.size > 0 && !sizes.has(m.size_band || "Unknown")) return false;

    if (avail.size > 0) {
      if (avail.has("cloud") && !m.cloud) return false;
      if (avail.has("hermes_compatible") && !m.hermes_compatible) return false;
      if (avail.has("not_hermes") && m.hermes_compatible) return false;
      if (avail.has("favourite") && !isFavourite(m.name)) return false;
    }

    if (caps.size > 0) {
      const mcaps = m.capabilities || {};
      for (const key of caps) {
        if (!mcaps[key]) return false;
      }
    }

    if (recency.size > 0 && m.estimated_updated_iso) {
      const daysAgo = (now - new Date(m.estimated_updated_iso).getTime()) / dayMs;
      let ok = false;
      if (recency.has("today") && daysAgo <= 1) ok = true;
      if (recency.has("week") && daysAgo <= 7) ok = true;
      if (recency.has("month") && daysAgo <= 30) ok = true;
      if (recency.has("year") && daysAgo <= 365) ok = true;
      if (!ok) return false;
    } else if (recency.size > 0) {
      return false;
    }

    return true;
  });

  list = sortModels(list);
  appState.filtered = list;

  updateChipActiveStates();
  updatePresetActiveStates();
  updateSortSelect();
  updateActiveFiltersBar();
  updateClearButton();
  updateExportButton();
  updateCompareCount();
  updateNewModelBanner();
  updateURL();
  render();
}

function updateChipActiveStates() {
  document.querySelectorAll(".chip[data-type]").forEach((chip) => {
    const set = filterSet(chip.dataset.type);
    chip.classList.toggle("active", set && set.has(chip.dataset.value));
  });
}

function updatePresetActiveStates() {
  document.querySelectorAll(".preset-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.preset === appState.activePreset);
  });
}

function updateSortSelect() {
  const select = document.getElementById("sortSelect");
  if (!select) return;
  const target = `${appState.sort.field}|${appState.sort.dir}`;
  select.value = target;
}

function updateActiveFiltersBar() {
  const bar = document.getElementById("activeFilters");
  if (!bar) return;

  const pills = [];
  if (appState.activePreset) {
    const preset = PRESETS.find((p) => p.id === appState.activePreset);
    if (preset) {
      pills.push({ type: "preset", value: preset.id, label: preset.label, icon: preset.icon });
    }
  }
  if (appState.filters.search) {
    pills.push({ type: "search", value: appState.filters.search, label: `Search: "${appState.filters.search}"`, icon: "ph-magnifying-glass" });
  }
  appState.filters.categories.forEach((v) => pills.push({ type: "category", value: v, label: FILTER_LABELS[v] || v, icon: CATEGORY_ICONS[v] || "ph-tag" }));
  appState.filters.sizes.forEach((v) => pills.push({ type: "size", value: v, label: FILTER_LABELS[v] || v, icon: "ph-resize" }));
  appState.filters.availability.forEach((v) => pills.push({ type: "availability", value: v, label: FILTER_LABELS[v] || v, icon: "ph-check-circle" }));
  appState.filters.capabilities.forEach((v) => pills.push({ type: "capability", value: v, label: FILTER_LABELS[v] || v, icon: "ph-lightning" }));
  appState.filters.recency.forEach((v) => pills.push({ type: "recency", value: v, label: FILTER_LABELS[v] || v, icon: "ph-calendar" }));

  if (pills.length === 0) {
    bar.innerHTML = "";
    bar.classList.add("empty");
    return;
  }
  bar.classList.remove("empty");
  bar.innerHTML = `
    <span class="active-filters-label"><i class="ph ph-faders"></i> Active filters</span>
    ${pills.map((p) => `
      <button class="active-filter-pill" title="Remove ${escapeHtml(p.label)}"
        onclick="removeFilter('${p.type}', '${escapeHtml(p.value).replace(/'/g, "\\'")}')">
        <i class="ph ${p.icon}"></i>
        <span>${escapeHtml(p.label)}</span>
        <i class="ph ph-x"></i>
      </button>
    `).join("")}
  `;
}

function updateClearButton() {
  const btn = document.getElementById("clearFilters");
  if (!btn) return;
  const active = hasActiveFilters();
  btn.disabled = !active;
  btn.style.opacity = active ? "1" : "0.45";
  btn.style.cursor = active ? "pointer" : "not-allowed";
}

function updateExportButton() {
  const container = document.getElementById("exportButtons");
  if (!container) return;
  const hasModels = appState.models.length > 0;
  container.style.opacity = hasModels ? "1" : "0.5";
  container.style.pointerEvents = hasModels ? "auto" : "none";
}

function updateCompareCount() {
  const countEl = document.getElementById("compareCount");
  if (countEl) countEl.textContent = appState.compare.size;
}

function updateNewModelBanner() {
  let banner = document.getElementById("newModelBanner");
  if (!appState.newModels || appState.newModels.length === 0) {
    if (banner) banner.remove();
    return;
  }
  if (!banner) {
    banner = document.createElement("div");
    banner.id = "newModelBanner";
    banner.className = "new-model-banner";
    const header = document.querySelector(".site-header");
    if (header) header.insertAdjacentElement("afterend", banner);
  }
  banner.innerHTML = `
    <div class="container new-model-inner">
      <span><i class="ph ph-sparkle"></i> <strong>${appState.newModels.length} new model${appState.newModels.length !== 1 ? "s" : ""}</strong> added to Ollama since your last visit.</span>
      <button class="btn btn-ghost" onclick="showNewModels()">View them</button>
      <button class="btn btn-ghost" onclick="dismissNewModelBanner()" aria-label="Dismiss"><i class="ph ph-x"></i></button>
    </div>
  `;
}

function showNewModels() {
  clearAllFilters(false);
  appState.filters.search = "";
  appState.sort = { field: "estimated_updated_iso", dir: "desc" };
  applyFilters();
  dismissNewModelBanner();
}

function dismissNewModelBanner() {
  const banner = document.getElementById("newModelBanner");
  if (banner) banner.remove();
  appState.newModels = [];
}

function sortModels(list) {
  const { field, dir } = appState.sort;
  const mult = dir === "asc" ? 1 : -1;
  return [...list].sort((a, b) => {
    let va = a[field] || "";
    let vb = b[field] || "";

    if (field === "pull_value") {
      const na = parsePullValue(va);
      const nb = parsePullValue(vb);
      if (na !== nb) return (na - nb) * mult;
      const ta = a.estimated_updated_iso || "";
      const tb = b.estimated_updated_iso || "";
      if (ta === tb) return 0;
      return (ta > tb ? 1 : -1) * mult;
    }

    if (field === "estimated_updated_iso") {
      const hasA = !!a.estimated_updated_iso;
      const hasB = !!b.estimated_updated_iso;
      if (!hasA && !hasB) return 0;
      if (!hasA) return 1 * mult;
      if (!hasB) return -1 * mult;
      return (a.estimated_updated_iso > b.estimated_updated_iso ? 1 : -1) * mult;
    }

    if (typeof va === "string") va = va.toLowerCase();
    if (typeof vb === "string") vb = vb.toLowerCase();
    if (va < vb) return -1 * mult;
    if (va > vb) return 1 * mult;
    return 0;
  });
}

function parsePullValue(raw) {
  if (!raw) return 0;
  const m = String(raw).match(/^(\d+(?:\.\d+)?)\s*([KMB]?)$/i);
  if (!m) return 0;
  let num = parseFloat(m[1]);
  const map = { K: 1_000, M: 1_000_000, B: 1_000_000_000 };
  const suffix = m[2].toUpperCase();
  if (suffix in map) num *= map[suffix];
  return num;
}

function render() {
  const countEl = document.getElementById("resultCount");
  if (countEl) countEl.textContent = `${appState.filtered.length} result${appState.filtered.length !== 1 ? "s" : ""}`;

  updateSortIcons();

  if (appState.view === "cards") {
    renderCards();
    renderHeroChart();
  } else {
    renderTable();
  }
}

function updateSortIcons() {
  if (appState.view !== "table") return;
  document.querySelectorAll(".models-table th[data-sort]").forEach((th) => {
    const field = th.dataset.sort;
    const icon = th.querySelector("i");
    if (!icon) return;
    if (appState.sort.field === field) {
      icon.className = `ph ${appState.sort.dir === "asc" ? "ph-caret-up" : "ph-caret-down"}`;
    } else {
      icon.className = "ph ph-caret-up-down";
    }
  });
}

function categoryStyle(category) {
  const c = CATEGORY_COLOURS[category] || CATEGORY_COLOURS["General Chat / Assistant"];
  return `background: ${c.bg}; color: ${c.text}; --dark-bg: ${c.darkBg}; --dark-text: ${c.darkText}; --category-gradient: ${c.gradient};`;
}

function categoryTopBorderGradient(category) {
  const c = CATEGORY_COLOURS[category] || CATEGORY_COLOURS["General Chat / Assistant"];
  return c.gradient;
}

function renderCards() {
  const grid = document.getElementById("cardsGrid");
  if (!grid) return;

  if (appState.filtered.length === 0) {
    grid.innerHTML = renderEmptyState();
    return;
  }

  grid.innerHTML = appState.filtered.map((m, idx) => {
    const sizes = (m.sizes || []).map((s) => `<span class="size-pill">${s}B</span>`).join("");
    const caps = CAPABILITY_FILTERS.filter((c) => m.capabilities?.[c.key])
      .map((c) => `<span class="badge badge-cap" title="${c.label}"><i class="ph ph-check"></i> ${c.label}</span>`)
      .join("");
    const cloudBadge = m.cloud
      ? `<span class="badge badge-cloud" title="Available via Ollama cloud"><i class="ph ph-cloud"></i> Cloud</span>`
      : "";
    const hermesBadge = m.hermes_compatible
      ? `<span class="badge badge-hermes" title="Works with Hermes / OpenClaw agents"><i class="ph ph-robot"></i> Hermes/Claw</span>`
      : "";
    const catIcon = CATEGORY_ICONS[m.primary_category] || "ph-circle";
    const fav = isFavourite(m.name);
    const catStyle = categoryStyle(m.primary_category);
    const animationDelay = idx < 12 ? `animation-delay: ${idx * 40}ms;` : '';
    const compareChecked = appState.compare.has(m.name) ? 'checked' : '';

    return `
      <article class="card" data-name="${escapeHtml(m.name)}" style="--category-gradient: ${categoryTopBorderGradient(m.primary_category)}; ${animationDelay}">
        <div class="card-header">
          <h2 class="card-title" onclick="openModelDetail('${escapeHtml(m.name)}', this)">${escapeHtml(m.name)}</h2>
          <button class="fav-btn ${fav ? "active" : ""}" data-name="${escapeHtml(m.name)}" aria-label="${fav ? "Remove from favourites" : "Add to favourites"}" title="${fav ? "Remove from favourites" : "Add to favourites"}"
            onclick="event.stopPropagation(); toggleFavourite('${escapeHtml(m.name)}')">
            <i class="ph ${fav ? "ph-star" : "ph-star"}"></i>
          </button>
        </div>
        <label class="compare-checkbox" onclick="event.stopPropagation()">
          <input type="checkbox" onchange="toggleCompare('${escapeHtml(m.name)}')" ${compareChecked} />
          <span>Compare</span>
        </label>
        <div class="card-badges" onclick="openModelDetail('${escapeHtml(m.name)}', this)">
          <span class="badge badge-category" style="${catStyle}"><i class="ph ${catIcon}"></i> ${escapeHtml(m.primary_category)}</span>
          ${cloudBadge}
          ${hermesBadge}
          ${caps}
          <span class="badge badge-size">${escapeHtml(m.size_band || "Unknown")}</span>
        </div>
        <p class="card-desc" onclick="openModelDetail('${escapeHtml(m.name)}', this)">${escapeHtml(m.description || "No description available.")}</p>
        <div class="card-meta" onclick="openModelDetail('${escapeHtml(m.name)}', this)">
          <span title="${m.pull_value || m.pull_count || ''}"><i class="ph ph-download-simple"></i> ${formatPullCount(m.pull_value || m.pull_count)}</span>
          <span title="Updated ${escapeHtml(m.relative_updated || '')}"><i class="ph ph-clock"></i> ${escapeHtml(m.relative_updated || '')}</span>
        </div>
        <div class="card-footer" onclick="openModelDetail('${escapeHtml(m.name)}', this)">
          <div class="card-sizes">${sizes || "<span class=\"size-pill\">?</span>"}</div>
          <span>${(m.tags || []).length} tags</span>
        </div>
      </article>
    `;
  }).join("");
  updateFavouriteButtons();
}

function renderTable() {
  const tbody = document.getElementById("tableBody");
  if (!tbody) return;

  if (appState.filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="empty-state">${renderEmptyState(false)}</td></tr>`;
    return;
  }

  tbody.innerHTML = appState.filtered.map((m) => {
    const caps = CAPABILITY_FILTERS.filter((c) => m.capabilities?.[c.key])
      .map((c) => `<span class="badge badge-cap">${c.label}</span>`)
      .join("");
    const catIcon = CATEGORY_ICONS[m.primary_category] || "ph-circle";
    const fav = isFavourite(m.name);
    const catStyle = categoryStyle(m.primary_category);
    const compareChecked = appState.compare.has(m.name) ? 'checked' : '';
    return `
      <tr data-name="${escapeHtml(m.name)}" class="row-clickable">
        <td class="cell-name" scope="row" onclick="openModelDetail('${escapeHtml(m.name)}', this)">
          <button class="fav-btn-table ${fav ? "active" : ""}" data-name="${escapeHtml(m.name)}" aria-label="${fav ? "Remove from favourites" : "Add to favourites"}" title="${fav ? "Remove from favourites" : "Add to favourites"}"
            onclick="event.stopPropagation(); toggleFavourite('${escapeHtml(m.name)}')">
            <i class="ph ${fav ? "ph-star" : "ph-star"}"></i>
          </button>
          <strong>${escapeHtml(m.name)}</strong>
        </td>
        <td class="cell-nowrap" onclick="openModelDetail('${escapeHtml(m.name)}', this)"><span class="badge badge-category" style="${catStyle}"><i class="ph ${catIcon}"></i> ${escapeHtml(m.primary_category)}</span></td>
        <td class="cell-nowrap" onclick="openModelDetail('${escapeHtml(m.name)}', this)"><span class="badge badge-size">${escapeHtml(m.size_band || "Unknown")}</span></td>
        <td class="cell-caps" onclick="openModelDetail('${escapeHtml(m.name)}', this)">${caps ? `<span class="caps-wrap">${caps}</span>` : `<span class="caps-empty">—</span>`}</td>
        <td class="cell-icon" onclick="openModelDetail('${escapeHtml(m.name)}', this)">${m.cloud ? '<span class="badge badge-cloud" title="Cloud available"><i class="ph ph-cloud"></i></span>' : '<span class="cell-dash" title="Not in Ollama Cloud">—</span>'}</td>
        <td class="cell-icon" onclick="openModelDetail('${escapeHtml(m.name)}', this)">${m.hermes_compatible ? '<span class="badge badge-hermes" title="Hermes/Claw compatible"><i class="ph ph-robot"></i></span>' : '<span class="cell-dash" title="Not Hermes/Claw compatible">—</span>'}</td>
        <td class="cell-nowrap" onclick="openModelDetail('${escapeHtml(m.name)}', this)">${escapeHtml(m.relative_updated || "—")}</td>
        <td class="cell-nowrap" onclick="openModelDetail('${escapeHtml(m.name)}', this)">${formatPullCount(m.pull_value || m.pull_count) || "—"}</td>
        <td class="cell-actions" onclick="event.stopPropagation()">
          <label class="compare-checkbox" title="Compare">
            <input type="checkbox" onchange="toggleCompare('${escapeHtml(m.name)}')" ${compareChecked} />
          </label>
          <a href="${escapeHtml(m.ollama_url)}" target="_blank" rel="noopener" title="Open on Ollama"><i class="ph ph-arrow-square-out"></i></a>
        </td>
      </tr>
    `;
  }).join("");
  updateFavouriteButtons();
}

function toggleCompare(name) {
  if (appState.compare.has(name)) {
    appState.compare.delete(name);
  } else {
    if (appState.compare.size >= 3) {
      showToast("You can compare up to 3 models");
      return;
    }
    appState.compare.add(name);
  }
  updateCompareCount();
  applyFilters();
}

function openCompareModal() {
  const names = [...appState.compare];
  if (names.length < 2) {
    showToast(`Select at least 2 models to compare (currently ${names.length})`);
    return;
  }
  const models = names.map((n) => appState.models.find((m) => m.name === n)).filter(Boolean);
  if (models.length < 2) return;
  appState.modalTrigger = document.getElementById("compareBtn") || document.activeElement;

  const modal = document.getElementById("modelModal");
  const body = document.getElementById("modelModalBody");
  if (!modal || !body) return;

  const headers = models.map((m) => `
    <div class="compare-col-header">
      <h2>${escapeHtml(m.name)}</h2>
      <div>${(m.categories || [m.primary_category]).map((c) => `<span class="badge badge-category" style="${categoryStyle(c)}">${escapeHtml(c)}</span>`).join(" ")}</div>
    </div>
  `).join("");

  const rows = [
    { label: "Description", key: (m) => escapeHtml(m.description || "—") },
    { label: "Size band", key: (m) => escapeHtml(m.size_band || "—") },
    { label: "Sizes", key: (m) => (m.sizes || []).map((s) => `${s}B`).join(", ") || "—" },
    { label: "Pulls", key: (m) => formatPullCount(m.pull_value) || "—" },
    { label: "Updated", key: (m) => escapeHtml(m.relative_updated || "—") },
    { label: "Cloud", key: (m) => m.cloud ? '<span class="badge badge-cloud">Cloud</span>' : "—" },
    { label: "Hermes/Claw", key: (m) => m.hermes_compatible ? '<span class="badge badge-hermes">Yes</span>' : "—" },
    { label: "Tools", key: (m) => m.capabilities?.tools ? '<span class="badge badge-cap">Yes</span>' : "—" },
    { label: "Vision", key: (m) => m.capabilities?.vision ? '<span class="badge badge-cap">Yes</span>' : "—" },
    { label: "Thinking", key: (m) => m.capabilities?.thinking ? '<span class="badge badge-cap">Yes</span>' : "—" },
    { label: "Embedding", key: (m) => m.capabilities?.embedding ? '<span class="badge badge-cap">Yes</span>' : "—" },
  ];

  body.innerHTML = `
    <div class="modal-header compare-header">
      <div><h2>Compare models</h2></div>
      <button class="btn btn-ghost" onclick="closeModal()" aria-label="Close"><i class="ph ph-x"></i></button>
    </div>
    <div class="modal-body compare-body">
      <div class="compare-grid" style="grid-template-columns: 100px repeat(${models.length}, minmax(150px, 1fr));">
        <div class="compare-corner"></div>
        ${headers}
        ${rows.map((r) => `
          <div class="compare-row-label">${r.label}</div>
          ${models.map((m) => `<div class="compare-cell">${r.key(m)}</div>`).join("")}
        `).join("")}
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="clearCompare()">Clear selection</button>
      <button class="btn btn-ghost" onclick="closeModal()">Close</button>
    </div>
  `;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  updateDocumentTitle();
}

function clearCompare() {
  appState.compare.clear();
  updateCompareCount();
  applyFilters();
  closeModal();
}

function renderEmptyState(asCard = true) {
  const inner = `
    <i class="ph ph-magnifying-glass"></i>
    <p>No models match your filters.</p>
    <button class="btn btn-ghost" onclick="clearAllFilters()">
      <i class="ph ph-x-circle"></i> Clear all filters
    </button>
  `;
  if (asCard) {
    return `<div class="empty-state">${inner}</div>`;
  }
  return inner;
}

function openModelDetail(name, triggerEl = null) {
  const model = appState.models.find((m) => m.name === name);
  if (!model) return;
  appState.selectedModel = model;
  appState.modalTrigger = triggerEl || document.activeElement;
  window.history.replaceState({}, "", `#model=${encodeURIComponent(name)}`);

  const modal = document.getElementById("modelModal");
  const body = document.getElementById("modelModalBody");
  if (!modal || !body) return;

  const sizes = (model.sizes || []).map((s) => `<span class="size-pill size-pill-selectable ${appState.selectedTag === s ? 'selected' : ''}" data-tag="${escapeHtml(s)}" onclick="selectTag('${escapeHtml(s)}')">${s}B</span>`).join("");
  const caps = CAPABILITY_FILTERS.filter((c) => model.capabilities?.[c.key])
    .map((c) => `<span class="badge badge-cap"><i class="ph ph-check"></i> ${c.label}</span>`)
    .join("") || "—";
  const categories = (model.categories || [model.primary_category]).map((c) => {
    const icon = CATEGORY_ICONS[c] || "ph-circle";
    const style = categoryStyle(c);
    return `<span class="badge badge-category" style="${style}"><i class="ph ${icon}"></i> ${escapeHtml(c)}</span>`;
  }).join(" ");

  const selectedTag = appState.selectedTag || (model.sizes || [])[0] || "";
  const tagSuffix = selectedTag ? `:${escapeHtml(selectedTag)}` : "";

  body.innerHTML = `
    <div class="modal-header">
      <div>
        <h2 id="modalTitle">${escapeHtml(model.name)}</h2>
        <div class="modal-badges">
          ${categories}
          ${model.cloud ? '<span class="badge badge-cloud"><i class="ph ph-cloud"></i> Cloud</span>' : ""}
          ${model.hermes_compatible ? '<span class="badge badge-hermes"><i class="ph ph-robot"></i> Hermes/Claw</span>' : ""}
        </div>
      </div>
      <button class="btn btn-ghost" onclick="closeModal()" aria-label="Close" title="Close"><i class="ph ph-x"></i></button>
    </div>
    <div class="modal-body">
      <p class="modal-desc">${escapeHtml(model.description || "No description available.")}</p>
      <div class="modal-section">
        <h3><i class="ph ph-info"></i> Quick info</h3>
        <div class="modal-grid">
          <div><strong>Size band</strong><span>${escapeHtml(model.size_band || "Unknown")}</span></div>
          <div><strong>Available sizes</strong><span>${sizes || "—"}</span></div>
          <div><strong>Pulls</strong><span>${formatPullCount(model.pull_value || model.pull_count) || "—"}</span></div>
          <div><strong>Updated</strong><span>${escapeHtml(model.relative_updated || "—")}</span></div>
          <div><strong>Capabilities</strong><span>${caps}</span></div>
          <div><strong>Tags</strong><span>${(model.tags || []).map(escapeHtml).join(", ") || "—"}</span></div>
        </div>
      </div>
      <div class="modal-section">
        <h3><i class="ph ph-terminal"></i> Ollama commands</h3>
        <div class="command-row">
          <code id="modalPullCmd">ollama pull ${escapeHtml(model.name)}${tagSuffix}</code>
          <button class="btn btn-secondary" onclick="copyModalCommand('pull')">
            <i class="ph ph-copy"></i> Copy
          </button>
        </div>
        <div class="command-row">
          <code id="modalRunCmd">ollama run ${escapeHtml(model.name)}${tagSuffix}</code>
          <button class="btn btn-secondary" onclick="copyModalCommand('run')">
            <i class="ph ph-copy"></i> Copy
          </button>
        </div>
      </div>
    </div>
    <div class="modal-footer">
      <button class="btn btn-secondary" onclick="copyShareableModelLink('${escapeHtml(model.name)}')">
        <i class="ph ph-link"></i> Copy link
      </button>
      <a class="btn btn-primary" href="${escapeHtml(model.ollama_url)}" target="_blank" rel="noopener">
        <i class="ph ph-arrow-square-out"></i> Open on Ollama
      </a>
    </div>
  `;

  modal.classList.add("open");
  document.body.style.overflow = "hidden";
  trapFocus(modal);
  updateDocumentTitle();
}

function checkModelHashOnLoad() {
  const hash = window.location.hash;
  const hashMatch = hash.match(/#model=(.+)/);
  if (hashMatch) {
    const name = decodeURIComponent(hashMatch[1]);
    setTimeout(() => openModelDetail(name), 300);
    return;
  }
  const params = new URLSearchParams(window.location.search);
  const modelName = params.get("model");
  if (modelName) {
    setTimeout(() => openModelDetail(modelName), 300);
  }
}

function selectTag(tag) {
  appState.selectedTag = tag;
  const model = appState.selectedModel;
  if (!model) return;
  const suffix = tag ? `:${tag}` : "";
  const pullEl = document.getElementById("modalPullCmd");
  const runEl = document.getElementById("modalRunCmd");
  if (pullEl) pullEl.textContent = `ollama pull ${model.name}${suffix}`;
  if (runEl) runEl.textContent = `ollama run ${model.name}${suffix}`;
  document.querySelectorAll(".size-pill-selectable").forEach((el) => {
    el.classList.toggle("selected", el.dataset.tag === tag);
  });
}

function copyModalCommand(type) {
  const el = document.getElementById(type === "pull" ? "modalPullCmd" : "modalRunCmd");
  if (!el) return;
  copyToClipboard(el.textContent);
}

function closeModal() {
  const modal = document.getElementById("modelModal");
  if (modal) modal.classList.remove("open");
  document.body.style.overflow = "";
  appState.selectedModel = null;
  appState.selectedTag = null;
  // Remove model hash from URL
  const url = window.location.pathname + window.location.search;
  if (window.location.hash) {
    window.history.replaceState({}, "", url);
  }
  // Return focus to the trigger element
  const trigger = appState.modalTrigger;
  appState.modalTrigger = null;
  if (trigger && typeof trigger.focus === "function") {
    setTimeout(() => trigger.focus(), 0);
  }
  updateDocumentTitle();
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast("Copied to clipboard");
  });
}

function formatPullCount(raw) {
  if (!raw) return "";
  const num = parsePullValue(raw);
  if (num === 0) return String(raw);
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return String(Math.round(num));
}

function escapeHtml(str) {
  if (str == null) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function highlightMatch(text, query) {
  if (!query || !text) return escapeHtml(text);
  const q = escapeHtml(query.toLowerCase());
  const t = escapeHtml(text);
  if (!q) return t;
  const regex = new RegExp(`(${q})`, "gi");
  return t.replace(regex, '<mark class="mark">$1</mark>');
}

// Focus trap for modal accessibility
function trapFocus(modal) {
  const focusable = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (focusable.length === 0) return;
  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  first.focus();
  modal.addEventListener("keydown", function handler(e) {
    if (e.key !== "Tab") return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

// Register global functions for inline onclick handlers
window.initApp = initApp;
window.clearAllFilters = clearAllFilters;
window.removeFilter = removeFilter;
window.openModelDetail = openModelDetail;
window.closeModal = closeModal;
window.toggleFavourite = toggleFavourite;
window.toggleCompare = toggleCompare;
window.openCompareModal = openCompareModal;
window.clearCompare = clearCompare;
window.copyModalCommand = copyModalCommand;
window.selectTag = selectTag;
window.copyShareableModelLink = copyShareableModelLink;
window.showNewModels = showNewModels;
window.dismissNewModelBanner = dismissNewModelBanner;
