const SPOT_TYPE_LABELS = {
  "fishing-spot": "일반 낚시 포인트",
  "personal-spot": "개인 저장 포인트",
  "access-point": "접근 포인트",
};

function getSpotFilterType(spot) {
  return spot.kind === "landmark" ? "personal-spot" : spot.kind;
}

function normalizeSpotSearch(value) {
  return String(value || "").normalize("NFKC").toLocaleLowerCase("ko-KR").trim();
}

function noteHasFishingTerm(note, term) {
  const escaped = term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(^|[\\s,·/])${escaped}(?=$|[\\s,·/]|낚시|포인트|갯바위)`).test(note || "");
}

// Only these reviewed abbreviations are species terms; arbitrary memo words are not.
const SPOT_SPECIES_MEMO_ALIASES = { '무늬오징어': ['무늬'], '벵에돔': ['벵에'] };

function getSpotSpeciesEvidence(spot, key) {
  if (spot.species.includes(key)) return 'public';
  if (spot.reportedSpecies?.includes(key)) return 'report';
  return [key, ...(SPOT_SPECIES_MEMO_ALIASES[key] || [])]
    .some(term => noteHasFishingTerm(spot.userNote, term)) ? 'memo' : null;
}

function readSpeciesQuery(search, supported) {
  const values = new URLSearchParams(search).getAll('species');
  if (!values.length) return { value: '', invalid: false };
  const valid = values.length === 1 && supported.includes(values[0]);
  return { value: valid ? values[0] : '', invalid: !valid };
}

function speciesPageUrl(page, key) {
  const params = new URLSearchParams();
  if (key) params.set('species', key);
  return `${page}${params.size ? `?${params}` : ''}`;
}

function createSpotFilterOptions(spots) {
  const species = new Set(spots.flatMap(spot => [...spot.species, ...(spot.reportedSpecies || [])]));
  const methods = new Set(spots.flatMap(spot => spot.methods));
  // Recognize explicit memo terms without turning personal notes into verified data.
  for (const term of [...species, "광어", "오징어"]) {
    if (spots.some(spot => getSpotSpeciesEvidence(spot, term))) species.add(term);
  }
  for (const term of ["에깅", "원투", "루어", "서프루어", "구멍치기"]) {
    if (spots.some(spot => noteHasFishingTerm(spot.userNote, term))) methods.add(term);
  }
  const sort = values => [...values].sort((a, b) => a.localeCompare(b, "ko"));
  return {
    species: sort(species),
    methods: sort(methods),
    types: Object.keys(SPOT_TYPE_LABELS).filter(type => spots.some(spot => getSpotFilterType(spot) === type)),
  };
}

function searchSpots(spots, query) {
  const words = normalizeSpotSearch(query).split(/\s+/).filter(Boolean);
  if (!words.length) return spots.slice();
  return spots.filter(spot => {
    const text = normalizeSpotSearch([
      spot.name, spot.address, spot.region, spot.userNote, ...(spot.aliases || []),
      ...spot.species, ...(spot.reportedSpecies || []), ...spot.methods,
    ].filter(Boolean).join(" "));
    return words.every(word => text.includes(word));
  });
}

function filterSpots(spots, { query = "", species = "", method = "", type = "", favoritesOnly = false } = {}, favoriteIds = []) {
  const favorites = new Set(favoriteIds);
  return searchSpots(spots, query).filter(spot =>
    (!species || getSpotSpeciesEvidence(spot, species))
    && (!method || spot.methods.includes(method) || noteHasFishingTerm(spot.userNote, method))
    && (!type || getSpotFilterType(spot) === type)
    && (!favoritesOnly || favorites.has(spot.id))
  );
}

function initializeSpotControls(markerController, favorites = null, location = null) {
  const form = document.querySelector(".spot-controls");
  if (!form || typeof fishingSpots === "undefined" || !markerController) return;
  const search = form.querySelector("#spot-search");
  const resultsPanel = form.querySelector(".spot-search-results");
  const resultsList = form.querySelector("#spot-results");
  const emptyResult = form.querySelector(".spot-no-results");
  const count = form.querySelector(".spot-result-count");
  const emptyMap = form.querySelector(".spot-empty-map");
  const reset = form.querySelector(".spot-reset");
  const favoriteOnly = form.querySelector("#spot-favorites");
  const favoriteCount = form.querySelector(".spot-favorites-count");
  const favoriteEmpty = form.querySelector(".spot-favorites-empty");
  const storageStatus = form.querySelector(".favorite-storage-status");
  const selects = {
    species: form.querySelector("#spot-species"),
    method: form.querySelector("#spot-method"),
    type: form.querySelector("#spot-type"),
  };
  const options = createSpotFilterOptions(fishingSpots);
  const queryNotice = document.createElement('p');
  queryNotice.className = 'spot-query-notice';
  queryNotice.setAttribute('role', 'status');
  queryNotice.hidden = true;
  form.append(queryNotice);
  for (const [key, select] of Object.entries(selects)) {
    for (const value of options[key === "method" ? "methods" : key === "type" ? "types" : key]) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = key === "type" ? SPOT_TYPE_LABELS[value] : value;
      select.append(option);
    }
  }
  for (const control of form.querySelectorAll("input, select, button")) control.disabled = false;
  favoriteOnly.disabled = !favorites;

  let matches = [];
  const closeResults = () => { resultsPanel.hidden = true; };
  const showResults = () => { resultsPanel.hidden = !normalizeSpotSearch(search.value); };

  function selectSpot(spot) {
    closeResults();
    markerController.focusSpot(spot.id);
  }

  function renderSearchResults() {
    resultsList.replaceChildren();
    const sorted = matches.slice().sort((a, b) => Number(isDisplayableFishingSpot(b)) - Number(isDisplayableFishingSpot(a)));
    for (const spot of sorted) {
      const item = document.createElement("li");
      const button = document.createElement("button");
      button.type = "button";
      button.className = "spot-search-result";
      button.dataset.spotId = spot.id;
      button.disabled = !isDisplayableFishingSpot(spot);
      const name = document.createElement("span");
      name.className = "spot-search-result-name";
      name.textContent = spot.name;
      const meta = document.createElement("span");
      meta.className = "spot-search-result-meta";
      meta.textContent = `${spot.region} · ${SPOT_TYPE_LABELS[getSpotFilterType(spot)] || spot.category}`;
      if (button.disabled) meta.append(" · 위치 확인 필요");
      else if (location?.getPosition()) {
        meta.append(` · 직선 ${formatLocationDistance(haversineDistanceMeters(location.getPosition(), spot))}`);
      }
      button.append(name, meta);
      button.addEventListener("click", () => selectSpot(spot));
      item.append(button);
      resultsList.append(item);
    }
    emptyResult.hidden = matches.length !== 0;
  }

  function applyFilters() {
    const state = { query: search.value, favoritesOnly: favoriteOnly.checked, ...Object.fromEntries(Object.entries(selects).map(([key, select]) => [key, select.value])) };
    matches = filterSpots(fishingSpots, state, favorites?.getFavorites());
    const visible = matches.filter(isDisplayableFishingSpot);
    markerController.renderMarkers(visible);
    location?.setSpots(visible);
    const active = normalizeSpotSearch(state.query) || state.species || state.method || state.type || state.favoritesOnly;
    count.textContent = `${active ? "" : "전체 "}${visible.length}개 포인트`;
    const noFavorites = state.favoritesOnly && favorites?.getFavoriteCount() === 0;
    favoriteEmpty.hidden = !noFavorites;
    emptyMap.hidden = noFavorites || visible.length !== 0 || normalizeSpotSearch(state.query).length !== 0;
    emptyMap.textContent = state.species ? '현재 등록된 관련 포인트가 없습니다.' : '검색 결과가 없습니다.';
    emptyResult.textContent = noFavorites ? "아직 즐겨찾기한 포인트가 없습니다." : "검색 결과가 없습니다.";
    favoriteCount.textContent = `즐겨찾기 ${favorites?.getFavoriteCount() || 0}`;
    storageStatus.hidden = !favorites || favorites.canPersist();
    renderSearchResults();
  }

  function resetFilters() {
    search.value = "";
    for (const select of Object.values(selects)) select.value = "";
    favoriteOnly.checked = false;
    closeResults();
    syncSpeciesUrl();
    queryNotice.hidden = true;
    applyFilters();
    markerController.resetView();
  }

  search.addEventListener("input", event => {
    if (event.isComposing) return;
    applyFilters();
    showResults();
  });
  search.addEventListener("compositionend", () => { applyFilters(); showResults(); });
  search.addEventListener("focus", showResults);
  search.addEventListener("keydown", event => {
    if (event.isComposing) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      showResults();
      resultsList.querySelector("button:not(:disabled)")?.focus();
    }
    if (event.key === "Escape") { closeResults(); event.preventDefault(); }
  });
  resultsList.addEventListener("keydown", event => {
    const buttons = [...resultsList.querySelectorAll("button:not(:disabled)")];
    const index = buttons.indexOf(document.activeElement);
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const next = index + (event.key === "ArrowDown" ? 1 : -1);
      if (next < 0) search.focus();
      else buttons[Math.min(next, buttons.length - 1)]?.focus();
    }
    if (event.key === "Escape") { search.focus(); closeResults(); event.preventDefault(); }
  });
  function syncSpeciesUrl() {
    const url = new URL(window.location.href);
    if (selects.species.value) url.searchParams.set('species', selects.species.value);
    else url.searchParams.delete('species');
    history.replaceState(history.state, '', url);
  }

  function applySpeciesUrl() {
    const parsed = readSpeciesQuery(window.location.search, options.species);
    search.value = '';
    for (const select of Object.values(selects)) select.value = '';
    favoriteOnly.checked = false;
    selects.species.value = parsed.value;
    closeResults();
    queryNotice.textContent = parsed.invalid ? '지원하지 않는 어종 필터입니다. 전체 포인트를 표시합니다.' : '';
    queryNotice.hidden = !parsed.invalid;
    if (parsed.invalid) syncSpeciesUrl();
    applyFilters();
    if (parsed.value) markerController.fitSpots(matches.filter(isDisplayableFishingSpot));
    else markerController.resetView();
  }

  for (const [key, select] of Object.entries(selects)) select.addEventListener('change', () => {
    queryNotice.hidden = true;
    if (key === 'species') syncSpeciesUrl();
    applyFilters();
    if (key === 'species') markerController.fitSpots(matches.filter(isDisplayableFishingSpot));
  });
  favoriteOnly.addEventListener("change", applyFilters);
  favorites?.subscribe(() => {
    const focused = document.activeElement;
    applyFilters();
    if (focused && !focused.isConnected && favoriteOnly.checked) favoriteOnly.focus({ preventScroll: true });
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    if (normalizeSpotSearch(search.value)) {
      const spot = matches.find(isDisplayableFishingSpot);
      if (spot) selectSpot(spot);
      else showResults();
    }
  });
  reset.addEventListener("click", resetFilters);
  location?.subscribe(renderSearchResults);
  document.addEventListener("click", event => { if (!form.contains(event.target)) closeResults(); });
  window.addEventListener('popstate', applySpeciesUrl);
  applySpeciesUrl();
}
