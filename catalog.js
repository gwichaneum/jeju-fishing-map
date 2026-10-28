// Public catalog data and private IndexedDB catch records stay separate.
const CATALOG_CATEGORY_LABELS = { fish: '어류', cephalopod: '두족류' };

function getCatalogProgress(species, collectedIds = new Set()) {
  const collected = species.filter(item => collectedIds.has(item.speciesId)).length;
  return { collected, total: species.length, percent: species.length ? Math.round(collected / species.length * 100) : 0 };
}

function createEmptyCatalogSummary(species) {
  const ids = (Array.isArray(species) ? species : []).map(item => item.speciesId);
  return { bySpecies: Object.fromEntries(ids.map(id => [id, { totalCount: 0, recordCount: 0, collected: false, firstCaughtAt: null, lastCaughtAt: null }])),
    collectedSpecies: 0, totalSpecies: ids.length, progress: 0 };
}

function normalizeCatalogQuery(value) {
  return String(value || '').normalize('NFKC').toLocaleLowerCase('ko-KR').trim();
}

function filterCatalogSpecies(species, { query = '', category = 'all', status = 'all' } = {}, collectedIds = new Set()) {
  const words = normalizeCatalogQuery(query).split(/\s+/).filter(Boolean);
  return species.filter(item => {
    const text = normalizeCatalogQuery([item.nameKo, item.nameEn, item.scientificName, item.mapSpeciesKey].filter(Boolean).join(' '));
    return (category === 'all' || item.category === category)
      && (status === 'all' || (status === 'collected' ? collectedIds.has(item.speciesId) : !collectedIds.has(item.speciesId)))
      && words.every(word => text.includes(word));
  });
}

function getCatalogRelatedSpots(species) {
  if (!species.mapSpeciesKey || typeof fishingSpots === 'undefined' || typeof filterSpots !== 'function') return [];
  return filterSpots(fishingSpots, { species: species.mapSpeciesKey }).map(spot => ({
    id: spot.id, name: spot.name,
    hasLocation: spot.needsVerification === false && Number.isFinite(spot.latitude) && Number.isFinite(spot.longitude),
    evidence: spot.species.includes(species.mapSpeciesKey) ? 'public' : spot.reportedSpecies?.includes(species.mapSpeciesKey) ? 'report' : 'memo',
  }));
}

function isCatalogSpeciesEntry(item) {
  return item && typeof item === 'object'
    && typeof item.speciesId === 'string' && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.speciesId)
    && typeof item.nameKo === 'string' && item.nameKo.trim()
    && typeof item.imageAlt === 'string' && item.imageAlt.trim()
    && (item.mapSpeciesKey === null || typeof item.mapSpeciesKey === 'string')
    && typeof item.verified === 'boolean' && typeof item.needsVerification === 'boolean' && typeof item.needsAsset === 'boolean'
    && Object.hasOwn(CATALOG_CATEGORY_LABELS, item.category)
    && (typeof item.imageSrc === 'string' && /^assets\/species\/[a-z0-9-]+\.(?:png|webp|svg|jpe?g)$/.test(item.imageSrc)
        && item.imageSrc.replace(/^.*\//, '').replace(/\.[^.]+$/, '') === item.speciesId
        && item.imageVerified === true && item.needsAsset === false && item.imageQualityVerified === true)
    && (item.imageScale === undefined || Number.isFinite(item.imageScale) && item.imageScale >= 0.25 && item.imageScale <= 1.5)
    && (item.imageRotation === undefined || Number.isFinite(item.imageRotation) && Math.abs(item.imageRotation) <= 180)
    && Array.isArray(item.methods) && item.methods.every(value => typeof value === 'string')
    && Array.isArray(item.rigs) && item.rigs.every(value => typeof value === 'string')
    && Array.isArray(item.informationSources)
    && item.informationSources.every(source => source && typeof source.title === 'string' && typeof source.url === 'string');
}

function catalogElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function createCatalogImage(species, className = 'species-image-frame', collected = false) {
  const frame = catalogElement('div', className);
  frame.dataset.collected = String(collected);
  const img = catalogElement('img', 'species-image');
  img.src = `./${species.imageSrc}`;
  img.alt = species.imageAlt;
  img.loading = 'lazy';
  img.decoding = 'async';
  img.width = 512;
  img.height = 512;
  img.style.setProperty('--species-scale', species.imageScale ?? 1);
  img.style.setProperty('--species-rotation', `${species.imageRotation ?? 0}deg`);
  img.addEventListener('error', () => {
    img.hidden = true;
    const error = catalogElement('span', 'species-image-error', '이미지를 불러오지 못했습니다.');
    error.setAttribute('role', 'status');
    frame.append(error);
  }, { once: true });
  frame.append(img);
  return frame;
}

function createCatalogLink(label, url) {
  try {
    const target = new URL(url);
    if (!['https:', 'http:'].includes(target.protocol)) return null;
    const link = catalogElement('a', '', label);
    link.href = target.href;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    return link;
  } catch { return null; }
}

function createSpeciesDetail(species, collected = false) {
  const infoValue = key => {
    if (species.verified !== true) return '정보 확인 중';
    const value = species[key];
    if (Array.isArray(value)) return value.filter(text => typeof text === 'string' && text.trim()).join(' · ') || '정보 확인 중';
    return typeof value === 'string' && value.trim() ? value : '정보 확인 중';
  };
  const content = document.createDocumentFragment();
  const hero = catalogElement('div', 'species-detail-hero');
  hero.append(createCatalogImage(species, 'species-detail-image', collected));
  const title = catalogElement('div', 'species-detail-title');
  const name = catalogElement('h2', '', species.nameKo);
  name.id = 'species-detail-name';
  title.append(name);
  title.append(catalogElement('p', 'species-category', `${CATALOG_CATEGORY_LABELS[species.category]} · ${collected ? '수집 완료' : '미수집'}`));
  if (species.scientificName) title.append(catalogElement('p', 'species-scientific-name', species.scientificName));
  title.append(catalogElement('h3', 'species-feature-label', '특징'));
  const description = catalogElement('p', '', infoValue('description'));
  description.id = 'species-detail-description';
  title.append(description);
  hero.append(title);
  content.append(hero);
  const guide = catalogElement('dl', 'species-guide');
  for (const [label, value] of [
    ['대표 낚시 방법', infoValue('methods')],
    ['추천 채비', infoValue('rigs')],
    ['추천 시기', infoValue('seasonNote')],
    ['서식·포인트 특성', infoValue('habitatNote')],
  ]) {
    const row = catalogElement('div', 'species-guide-row');
    row.append(catalogElement('dt', '', label), catalogElement('dd', '', value));
    guide.append(row);
  }
  content.append(guide);

  const related = catalogElement('section', 'species-related');
  related.append(catalogElement('h3', '', '관련 낚시 포인트'));
  if (species.mapSpeciesKey) related.append(catalogElement('p', 'species-map-key', `지도 어종: ${species.mapSpeciesKey}`));
  const spots = getCatalogRelatedSpots(species);
  if (spots.length) {
    related.append(catalogElement('p', 'species-related-caption', `${spots.length}개 기록 · 위치 확인 ${spots.filter(spot => spot.hasLocation).length}곳`));
    const list = catalogElement('ul', 'species-related-list');
    for (const spot of spots) {
      const evidence = spot.evidence === 'memo' ? '개인 메모' : spot.evidence === 'report' ? '사용자 제보' : '공개 자료';
      list.append(catalogElement('li', '', `${spot.name} · ${evidence}${spot.hasLocation ? '' : ' · 위치 확인 필요'}`));
    }
    related.append(list);
  } else related.append(catalogElement('p', 'species-map-empty', species.mapMatchStatus === 'pending'
    ? '정보 확인 중' : '현재 등록된 관련 포인트 없음'));
  const mapButton = catalogElement('a', 'catalog-button species-map-link', '낚시 지도 열기');
  mapButton.href = './index.html';
  mapButton.setAttribute('aria-describedby', 'species-map-note');
  const mapNote = catalogElement('p', 'species-related-caption', species.mapSpeciesKey
    ? `지도에서 어종 필터 ‘${species.mapSpeciesKey}’를 선택해 관련 포인트를 볼 수 있습니다.`
    : '전체 낚시 지도를 열어 등록된 다른 포인트를 볼 수 있습니다.');
  mapNote.id = 'species-map-note';
  related.append(mapButton, mapNote);
  content.append(related);

  const sources = catalogElement('section', 'species-sources');
  sources.append(catalogElement('h3', '', '정보 출처'));
  const list = catalogElement('ul', 'species-source-list');
  const sourceFields = { description: '특징', methods: '낚시 방법', rigs: '채비', seasonNote: '시기', habitatNote: '서식' };
  for (const source of species.informationSources) {
    if (source.fields?.some(field => /^image/.test(field))) continue;
    const link = createCatalogLink(source.title || '정보 출처', source.url);
    if (!link) continue;
    const row = document.createElement('li');
    row.append(link);
    const labels = (source.fields || []).map(field => sourceFields[field]).filter(Boolean);
    if (labels.length) row.append(catalogElement('p', '', labels.join(' · ')));
    if (source.scope) row.append(catalogElement('p', '', source.scope));
    list.append(row);
  }
  if (!list.children.length && species.sourceUrl) {
    const link = createCatalogLink('식별 자료', species.sourceUrl);
    if (link) { const row = document.createElement('li'); row.append(link); list.append(row); }
  }
  if (!list.children.length) sources.append(catalogElement('p', '', '정보 확인 중'));
  sources.append(list, catalogElement('p', 'species-source-attribution', `${species.attribution || '정보 확인 중'} · ${species.license || '정보 확인 중'}`));
  content.append(sources);
  if (species.imageSourceUrl && species.imageSrc) {
    const images = catalogElement('section', 'species-sources species-image-sources');
    images.append(catalogElement('h3', '', '이미지 출처'));
    const imageList = catalogElement('ul', 'species-source-list');
    const row = document.createElement('li');
    const link = createCatalogLink('이미지 원본', species.imageSourceUrl);
    if (link) row.append(link);
    row.append(catalogElement('p', '', `${species.imageAttribution} · ${species.imageLicense}`));
    const license = createCatalogLink('이미지 이용 조건', species.imageLicenseUrl);
    if (license) row.append(license);
    row.append(catalogElement('p', '', species.imageChanges));
    imageList.append(row);
    images.append(imageList);
    content.append(images);
  }
  if (species.verificationNote || species.needsVerification) {
    const note = catalogElement('section', 'species-verification');
    note.append(catalogElement('h3', '', species.needsVerification ? '정보 확인 중' : '자료의 범위'), catalogElement('p', '', species.verificationNote || '정보 확인 중'));
    content.append(note);
  }
  content.append(catalogElement('p', 'species-field-caveat', '채비와 낚시 방법은 계절, 조류, 수심과 현장 상황에 따라 달라질 수 있습니다.'));
  return content;
}

function initializeCatalog() {
  const panel = document.querySelector('.collection-panel');
  if (!panel) return;
  const form = document.querySelector('#catalog-filters');
  const grid = document.querySelector('#species-grid');
  const empty = document.querySelector('#catalog-empty');
  const status = document.querySelector('#catalog-load-status');
  const retry = document.querySelector('#catalog-retry');
  const count = document.querySelector('#catalog-result-count');
  const dialog = document.querySelector('#species-detail');
  const detail = document.querySelector('#species-detail-content');
  const query = form.querySelector('#catalog-query');
  const storageStatus = document.querySelector('#record-storage-status');
  const storageMessage = document.querySelector('#record-storage-message');
  const storageRetry = document.querySelector('#record-storage-retry');
  const statusFilters = form.querySelector('.collection-status-filter');
  let species = [];
  let activeSpeciesId = null;
  let records = [];
  let summary = null;
  let ready = false;
  let hasSnapshot = false;
  let store = null;
  let recordUI = null;
  let loadGeneration = 0;
  let reloading = false;
  const moduleLoads = new Map();

  const mapSpotIds = () => typeof fishingSpots !== 'undefined' && Array.isArray(fishingSpots) ? fishingSpots.map(spot => spot.id) : [];

  function reportFailure(stage, error) {
    // Log only an error class/code, never records, photos, filenames or memo contents.
    const code = String(error?.code || error?.name || 'UnknownError').replace(/[^A-Za-z0-9_]/g, '').slice(0, 50);
    console.warn(`[catalog:${stage}] ${code}`);
  }

  function recordError(code) {
    const error = new Error(code);
    error.code = code;
    return error;
  }

  function withTimeout(promise, duration, code) {
    let timer;
    return Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(recordError(code)), duration); })])
      .finally(() => clearTimeout(timer));
  }

  function loadRecordModule(src) {
    if (moduleLoads.has(src)) return moduleLoads.get(src);
    const script = document.createElement('script');
    script.src = src;
    const pending = withTimeout(new Promise((resolve, reject) => {
      script.onload = resolve;
      script.onerror = () => reject(recordError('MODULE_LOAD'));
      document.head.append(script);
    }), 10000, 'MODULE_TIMEOUT').catch(error => {
      script.remove();
      throw error;
    }).finally(() => moduleLoads.delete(src));
    moduleLoads.set(src, pending);
    return pending;
  }

  async function ensureRecordModules() {
    const hasCore = () => typeof globalThis.CatchRecords?.createCatchRecordStore === 'function'
      && typeof globalThis.CatchRecords?.summarizeCollection === 'function';
    if (!hasCore()) await loadRecordModule('./catch-records.js');
    if (!hasCore()) throw recordError('MODULE_INVALID');
    if (typeof globalThis.createCatchRecordUI !== 'function') await loadRecordModule('./catch-record-ui.js');
    if (typeof globalThis.createCatchRecordUI !== 'function') throw recordError('MODULE_INVALID');
  }

  function closeDetail() { if (!recordUI?.isBusy()) dialog.close(); }
  dialog.querySelector('#species-detail-close').addEventListener('click', closeDetail);
  dialog.addEventListener('cancel', event => { if (recordUI?.isBusy()) event.preventDefault(); });
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDetail();
  } });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('species-detail-open');
    recordUI?.cleanup();
    const card = [...grid.querySelectorAll('.species-card')].find(node => node.dataset.speciesId === activeSpeciesId);
    (card || query).focus({ preventScroll: true });
    activeSpeciesId = null;
  });

  function announce(message, error = false) {
    const notice = document.querySelector('#catalog-notice');
    notice.textContent = message;
    notice.dataset.error = String(error);
    const detailNotice = detail.querySelector('#catch-detail-notice');
    if (detailNotice) { detailNotice.textContent = message; detailNotice.dataset.error = String(error); }
  }

  function collectedIds() {
    return new Set(Object.entries(summary?.bySpecies || {}).filter(([, value]) => value.collected).map(([id]) => id));
  }

  function renderProgress() {
    document.querySelector('#collection-collected').textContent = summary.collectedSpecies;
    document.querySelector('#collection-total').textContent = ` / ${species.length}종 수집`;
    document.querySelector('#collection-percent').textContent = `${Math.round(summary.progress)}%`;
    const progress = document.querySelector('#collection-progress');
    progress.max = species.length || 1;
    progress.value = summary.collectedSpecies;
    progress.textContent = `${Math.round(summary.progress)}%`;
    progress.setAttribute('aria-valuetext', `${summary.collectedSpecies} / ${species.length}종, ${summary.progress.toFixed(1)}%${hasSnapshot ? '' : ' · 기록 확인 전 미수집 표시'}`);
  }

  function renderDetail() {
    const item = species.find(row => row.speciesId === activeSpeciesId);
    if (!item) return;
    const scrollTop = dialog.scrollTop;
    const focused = document.activeElement;
    const action = detail.contains(focused) ? ['catch-add', 'catch-edit', 'catch-delete'].find(name => focused.classList.contains(name)) : null;
    const focusedRecord = focused?.dataset.recordId;
    const content = createSpeciesDetail(item, Boolean(summary?.bySpecies[item.speciesId].collected));
    if (recordUI) content.insertBefore(recordUI.mount(item), content.querySelector('.species-guide'));
    else {
      const warning = catalogElement('section', 'species-catches');
      warning.append(catalogElement('h3', '', '나의 조과'), catalogElement('p', 'catch-form-caption', storageMessage.textContent));
      const add = catalogElement('button', 'catalog-button catch-add', '잡은 기록 등록');
      add.type = 'button';
      add.disabled = true;
      warning.append(add);
      content.insertBefore(warning, content.querySelector('.species-guide'));
    }
    detail.replaceChildren(content);
    dialog.scrollTop = scrollTop;
    const notice = detail.querySelector('#catch-detail-notice');
    const globalNotice = document.querySelector('#catalog-notice');
    if (notice) { notice.textContent = globalNotice.textContent; notice.dataset.error = globalNotice.dataset.error || 'false'; }
    if (action) {
      const button = [...detail.querySelectorAll(`.${action}`)].find(node => !focusedRecord || node.dataset.recordId === focusedRecord);
      (button && !button.disabled ? button : dialog.querySelector('#species-detail-close')).focus({ preventScroll: true });
    }
  }

  function render() {
    // Read disabled fieldset controls directly: their values still describe the last view.
    const values = new FormData(form);
    const filters = Object.fromEntries(values);
    filters.status = form.querySelector('input[name="status"]:checked').value;
    const ids = collectedIds();
    const focusedCardId = grid.contains(document.activeElement) ? document.activeElement.closest('.species-card')?.dataset.speciesId : null;
    const matches = filterCatalogSpecies(species, filters, ids);
    const fragment = document.createDocumentFragment();
    for (const item of matches) {
      const li = catalogElement('li', 'species-grid-item');
      const card = catalogElement('button', 'species-card');
      card.type = 'button';
      card.dataset.speciesId = item.speciesId;
      const collected = ids.has(item.speciesId);
      const label = collected ? '수집 완료' : '미수집';
      card.dataset.collected = String(collected);
      card.setAttribute('aria-label', `${item.nameKo} · ${label} · 상세 보기`);
      card.setAttribute('aria-haspopup', 'dialog');
      card.append(createCatalogImage(item, 'species-image-frame', collected), catalogElement('span', 'species-card-name', item.nameKo), catalogElement('span', 'species-card-status', label));
      card.addEventListener('click', () => {
        announce('');
        activeSpeciesId = item.speciesId;
        renderDetail();
        dialog.showModal();
        document.body.classList.add('species-detail-open');
        dialog.scrollTop = 0;
        dialog.querySelector('#species-detail-close').focus({ preventScroll: true });
      });
      li.append(card);
      fragment.append(li);
    }
    grid.replaceChildren(fragment);
    if (focusedCardId) ([...grid.querySelectorAll('.species-card')].find(node => node.dataset.speciesId === focusedCardId) || query).focus({ preventScroll: true });
    grid.hidden = matches.length === 0;
    empty.hidden = matches.length !== 0;
    document.querySelector('#catalog-empty-message').textContent = filters.status === 'collected'
      ? '조건에 맞는 수집 어종이 없어요. 전체 도감에서 다음 출조의 대상을 만나보세요.'
      : '검색어나 분류를 바꿔보세요.';
    count.textContent = `${matches.length}종 표시 · 전체 ${species.length}종`;
  }

  function recalculate() {
    summary = hasSnapshot && globalThis.CatchRecords
      ? globalThis.CatchRecords.summarizeCollection(records, species.map(item => item.speciesId), mapSpotIds())
      : createEmptyCatalogSummary(species);
    statusFilters.disabled = false;
    renderProgress();
    render();
    if (dialog.open) renderDetail();
  }

  function showStorageError(error) {
    ready = false;
    storageStatus.hidden = false;
    const detail = ['MODULE_LOAD', 'MODULE_TIMEOUT', 'MODULE_INVALID'].includes(error?.code)
      ? '기록 기능 파일을 불러오지 못했습니다. 개발 서버를 재시작한 뒤 기록 다시 불러오기를 눌러 주세요.'
      : error?.code === 'RECORD_TIMEOUT' ? '기록 저장소 응답이 지연되었습니다. 다시 시도해 주세요.'
        : globalThis.CatchRecords?.storageErrorMessage?.(error) || '이 브라우저에서 기록 기능을 시작하지 못했습니다.';
    storageMessage.textContent = `저장된 조과 기록을 불러오지 못했습니다. ${hasSnapshot ? '마지막으로 확인한 수집 상태를 표시합니다.' : '도감은 미수집 상태로 계속 사용할 수 있습니다.'} ${detail}`;
    storageRetry.hidden = false;
    storageRetry.disabled = false;
    statusFilters.disabled = false;
    reportFailure('records', error);
    if (dialog.open) renderDetail();
  }

  async function loadRecords({ background = false } = {}) {
    const generation = ++loadGeneration;
    storageRetry.disabled = true;
    if (!background) {
      storageStatus.hidden = false;
      storageMessage.textContent = '저장된 조과 기록을 확인하고 있어요.';
    }
    try {
      if (!store) throw recordError('UNSUPPORTED');
      const snapshot = await withTimeout(store.loadAll(), 15000, 'RECORD_TIMEOUT');
      if (generation !== loadGeneration) return;
      if (!snapshot || !Array.isArray(snapshot.records)) throw recordError('RECORD_DATA');
      records = snapshot.records;
      ready = hasSnapshot = true;
      storageRetry.hidden = true;
      storageStatus.hidden = snapshot.invalidCount === 0;
      storageMessage.textContent = snapshot.invalidCount ? `유효하지 않은 기록 ${snapshot.invalidCount}개는 집계에서 제외했습니다. 저장된 데이터는 삭제하지 않았습니다.` : '';
      recalculate();
    } catch (error) {
      if (generation === loadGeneration) showStorageError(error);
    } finally { if (generation === loadGeneration) storageRetry.disabled = false; }
  }

  async function initializeRecords() {
    storageStatus.hidden = false;
    storageMessage.textContent = '저장된 조과 기록을 확인하고 있어요.';
    try {
      await ensureRecordModules();
      if (!store) store = globalThis.CatchRecords.createCatchRecordStore({ speciesIds: species.map(item => item.speciesId), mapSpotIds: mapSpotIds(), onVersionChange: showStorageError });
      if (!recordUI) recordUI = globalThis.createCatchRecordUI({ store, getState: () => ({ records, summary, ready, hasSnapshot, storageMessage: storageMessage.textContent }), onCommitted, announce });
      if (dialog.open) renderDetail();
      await loadRecords();
    } catch (error) { showStorageError(error); }
  }

  function onCommitted(change) {
    // Only called after transaction complete; never unlock optimistically.
    loadGeneration++;
    const id = change.record?.recordId || change.recordId;
    records = records.filter(record => record.recordId !== id);
    if (change.record) records.push(change.record);
    ready = hasSnapshot = true;
    recalculate();
    // Read the store again for changes from other tabs. A read failure does not undo a committed save.
    loadRecords({ background: true });
  }

  async function load() {
    if (reloading || recordUI?.isBusy() || recordUI?.isEditing()) return;
    reloading = true;
    const hadCatalog = species.length > 0;
    panel.setAttribute('aria-busy', 'true');
    form.inert = !hadCatalog;
    if (!hadCatalog) { grid.hidden = true; empty.hidden = true; }
    retry.hidden = true;
    retry.disabled = storageRetry.disabled = true;
    status.hidden = false;
    status.textContent = '제주의 어종을 불러오는 중이에요.';
    let loaded = false;
    try {
      const response = await fetch('./species-catalog.json', { cache: 'no-cache', signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Catalog request failed');
      const catalog = await response.json();
      if (!Array.isArray(catalog) || catalog.length < 30 || !catalog.every(isCatalogSpeciesEntry)
        || new Set(catalog.map(item => item.speciesId)).size !== catalog.length) throw new Error('Invalid catalog');
      species = catalog;
      // Static rendering has no dependency on record scripts, IndexedDB or their Promises.
      if (!summary) summary = createEmptyCatalogSummary(species);
      status.hidden = true;
      renderProgress();
      render();
      if (dialog.open) renderDetail();
      loaded = true;
    } catch (error) {
      status.textContent = '도감 기본 데이터를 불러오지 못했습니다.';
      if (!hadCatalog) {
        count.textContent = '도감 기본 데이터를 불러올 수 없습니다.';
        storageStatus.hidden = true;
      }
      retry.hidden = false;
      reportFailure('data', error);
    } finally {
      panel.setAttribute('aria-busy', 'false');
      form.inert = false;
    }
    // Record failures are handled separately and can never enter the catalog-data catch.
    if (loaded) await initializeRecords();
    retry.disabled = storageRetry.disabled = false;
    reloading = false;
  }
  form.addEventListener('submit', event => { event.preventDefault(); render(); });
  form.addEventListener('change', event => {
    // Search blur also emits change; replacing the focused card here loses its click/Enter.
    if (event.target.matches('input[type="radio"]')) render();
  });
  query.addEventListener('input', event => { if (!event.isComposing) render(); });
  query.addEventListener('compositionend', render);
  document.querySelector('#catalog-reset').addEventListener('click', () => { form.reset(); render(); query.focus(); });
  retry.addEventListener('click', load);
  storageRetry.addEventListener('click', load);
  window.addEventListener('pagehide', () => { recordUI?.cleanup(); store?.close(); });
  window.addEventListener('pageshow', event => { if (event.persisted && store && !reloading) loadRecords(); });
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden && hasSnapshot && store && !reloading && !recordUI?.isBusy() && !recordUI?.isEditing()) loadRecords({ background: true });
  });
  load();
}

initializeCatalog();
