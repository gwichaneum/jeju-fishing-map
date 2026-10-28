// Phase 2 is a read-only catalog. Catch storage and collection state arrive later.
const CATALOG_CATEGORY_LABELS = { fish: '어류', cephalopod: '두족류' };

function getCatalogProgress(species, collectedIds = new Set()) {
  const collected = species.filter(item => collectedIds.has(item.speciesId)).length;
  return { collected, total: species.length, percent: species.length ? Math.round(collected / species.length * 100) : 0 };
}

function normalizeCatalogQuery(value) {
  return String(value || '').normalize('NFKC').toLocaleLowerCase('ko-KR').trim();
}

function filterCatalogSpecies(species, { query = '', category = 'all', status = 'all' } = {}) {
  const words = normalizeCatalogQuery(query).split(/\s+/).filter(Boolean);
  return species.filter(item => {
    const text = normalizeCatalogQuery([item.nameKo, item.nameEn, item.scientificName, item.mapSpeciesKey].filter(Boolean).join(' '));
    return (category === 'all' || item.category === category)
      && status !== 'collected'
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

function createCatalogImage(species, className = 'species-image-frame') {
  const frame = catalogElement('div', className);
  frame.dataset.collected = 'false';
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

function createSpeciesDetail(species) {
  const infoValue = key => {
    if (species.verified !== true) return '정보 확인 중';
    const value = species[key];
    if (Array.isArray(value)) return value.filter(text => typeof text === 'string' && text.trim()).join(' · ') || '정보 확인 중';
    return typeof value === 'string' && value.trim() ? value : '정보 확인 중';
  };
  const content = document.createDocumentFragment();
  const hero = catalogElement('div', 'species-detail-hero');
  hero.append(createCatalogImage(species, 'species-detail-image'));
  const title = catalogElement('div', 'species-detail-title');
  const name = catalogElement('h2', '', species.nameKo);
  name.id = 'species-detail-name';
  title.append(name);
  title.append(catalogElement('p', 'species-category', `${CATALOG_CATEGORY_LABELS[species.category]} · 미수집`));
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
  let species = [];
  let opener = null;

  function closeDetail() { dialog.close(); }
  dialog.querySelector('#species-detail-close').addEventListener('click', closeDetail);
  dialog.addEventListener('click', event => { if (event.target === dialog) {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closeDetail();
  } });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('species-detail-open');
    if (opener?.isConnected) opener.focus({ preventScroll: true });
  });

  function render() {
    const values = new FormData(form);
    const matches = filterCatalogSpecies(species, Object.fromEntries(values));
    const fragment = document.createDocumentFragment();
    for (const item of matches) {
      const li = catalogElement('li', 'species-grid-item');
      const card = catalogElement('button', 'species-card');
      card.type = 'button';
      card.dataset.speciesId = item.speciesId;
      card.dataset.collected = 'false';
      card.setAttribute('aria-label', `${item.nameKo} · 미수집 · 상세 보기`);
      card.setAttribute('aria-haspopup', 'dialog');
      card.append(createCatalogImage(item), catalogElement('span', 'species-card-name', item.nameKo), catalogElement('span', 'species-card-status', '미수집'));
      card.addEventListener('click', () => {
        opener = card;
        detail.replaceChildren(createSpeciesDetail(item));
        dialog.showModal();
        document.body.classList.add('species-detail-open');
        dialog.scrollTop = 0;
        dialog.querySelector('#species-detail-close').focus({ preventScroll: true });
      });
      li.append(card);
      fragment.append(li);
    }
    grid.replaceChildren(fragment);
    grid.hidden = matches.length === 0;
    empty.hidden = matches.length !== 0;
    document.querySelector('#catalog-empty-message').textContent = values.get('status') === 'collected'
      ? '아직 수집한 어종이 없어요. 전체 도감에서 다음 출조의 대상을 만나보세요.'
      : '검색어나 분류를 바꿔보세요.';
    count.textContent = `${matches.length}종 표시 · 전체 ${species.length}종`;
  }

  async function load() {
    panel.setAttribute('aria-busy', 'true');
    form.inert = true;
    grid.hidden = true;
    empty.hidden = true;
    retry.hidden = true;
    status.hidden = false;
    status.textContent = '제주의 어종을 불러오는 중이에요.';
    try {
      const response = await fetch('./species-catalog.json', { signal: AbortSignal.timeout(10000) });
      if (!response.ok) throw new Error('Catalog request failed');
      const catalog = await response.json();
      if (!Array.isArray(catalog) || catalog.length < 30 || !catalog.every(isCatalogSpeciesEntry)
        || new Set(catalog.map(item => item.speciesId)).size !== catalog.length) throw new Error('Invalid catalog');
      species = catalog;
      // Read-only baseline; Phase 3 will supply IDs derived from valid records.
      const progress = getCatalogProgress(species);
      document.querySelector('#collection-collected').textContent = progress.collected;
      document.querySelector('#collection-total').textContent = ` / ${progress.total}종 수집`;
      document.querySelector('#collection-percent').textContent = `${progress.percent}%`;
      const progressBar = document.querySelector('#collection-progress');
      progressBar.max = progress.total;
      progressBar.value = progress.collected;
      progressBar.textContent = `${progress.percent}%`;
      status.hidden = true;
      render();
    } catch {
      status.textContent = '도감을 불러오지 못했어요. 연결 상태를 확인하고 다시 시도해 주세요.';
      count.textContent = '도감을 불러올 수 없습니다.';
      retry.hidden = false;
    } finally {
      panel.setAttribute('aria-busy', 'false');
      form.inert = false;
    }
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
  load();
}

initializeCatalog();
