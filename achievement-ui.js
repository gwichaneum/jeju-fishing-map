(function (root) {
  'use strict';
  root.createAchievementsUI = function ({ root: container, onRetry }) {
    const api = root.FishingAchievements;
    if (!container || typeof container.replaceChildren !== 'function' || !api) return null;
    const dialog = document.querySelector('#achievement-detail');
    const detail = document.querySelector('#achievement-detail-content');
    const toast = document.querySelector('#achievement-toast');
    const supportsPopover = typeof toast?.showPopover === 'function';
    if (toast && !supportsPopover) toast.hidden = true;
    let state = null;
    let filter = 'all';
    let activeId = null;

    function el(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    }
    const header = el('header', 'statistics-header');
    header.append(el('span', 'collection-eyebrow', 'MY ACHIEVEMENTS'), el('h2', '', '바다에서 모은 작은 성취'),
      el('p', 'collection-caption', '남겨 둔 조과가 다음 목표가 됩니다. 모든 배지의 조건을 미리 살펴보세요.'));
    const overview = el('dl', 'statistics-summary achievement-summary');
    overview.setAttribute('aria-label', '업적 요약');
    const numbers = {};
    for (const [key, label] of [['unlocks', '업적 달성'], ['progress', '달성률'], ['recent', '최근 해금'], ['next', '다음 목표']]) {
      const card = el('div', 'statistics-summary-card');
      const value = el('dd', `achievement-summary-${key}`, '확인 중');
      numbers[key] = value; card.append(el('dt', '', label), value); overview.append(card);
    }
    const policy = el('p', 'statistics-note', '진행도는 현재 기록 기준입니다. 한 번 얻은 배지는 기록을 수정하거나 삭제해도 유지됩니다.');
    const error = el('p', 'catch-field-error'); error.setAttribute('role', 'status'); error.hidden = true;
    const retry = el('button', 'catalog-button', '업적 다시 불러오기'); retry.type = 'button'; retry.hidden = true; retry.addEventListener('click', onRetry);
    const loading = el('p', 'catalog-load-status', '조과 기록과 해금 이력을 확인하고 있어요.'); loading.setAttribute('role', 'status');
    const filters = el('fieldset', 'achievement-filters'); filters.append(el('legend', 'visually-hidden', '업적 달성 상태'));
    for (const [value, text] of [['all', '전체'], ['unlocked', '달성'], ['locked', '미달성']]) {
      const label = el('label'); const radio = el('input'); radio.type = 'radio'; radio.name = 'achievement-filter'; radio.value = value; radio.checked = value === filter;
      radio.addEventListener('change', () => { filter = value; renderCards(); });
      label.append(radio, el('span', '', text)); filters.append(label);
    }
    const resultCount = el('p', 'statistics-note'); resultCount.setAttribute('role', 'status');
    const list = el('ul', 'achievement-grid'); list.setAttribute('aria-label', '업적 배지');
    const empty = el('p', 'statistics-note');
    container.replaceChildren(header, overview, policy, error, retry, loading, filters, resultCount, list, empty);

    function progress(row) {
      const group = el('span', 'achievement-progress');
      const meter = el('progress'); meter.max = row.target || 1; meter.value = Math.min(row.current, row.target);
      meter.setAttribute('aria-label', `${row.title} 현재 진행도`);
      group.append(el('span', '', `${row.current.toLocaleString('ko-KR')} / ${row.target.toLocaleString('ko-KR')}${row.unit}`), meter);
      return group;
    }
    function openDetail(row) {
      if (!dialog || !detail) return;
      activeId = row.achievementId; renderDetail(row); dialog.showModal(); document.body.classList.add('species-detail-open');
      document.querySelector('#achievement-detail-close')?.focus({ preventScroll: true });
    }
    function renderDetail(row) {
      if (!detail) return;
      const title = el('h2', '', row.title); title.id = 'achievement-detail-title';
      const status = row.unlocked ? row.unlockedAt ? `달성 완료 · ${new Date(row.unlockedAt).toLocaleDateString('ko-KR')}` : '달성 조건 충족 · 해금 이력 확인 중' : '미달성';
      detail.replaceChildren(el('p', 'collection-eyebrow', `${api.tierLabels[row.tier]} · ${api.categoryLabels[row.category]}`), title,
        el('p', 'achievement-detail-description', row.description), el('p', 'achievement-status', status),
        el('h3', '', '현재 진행도'), progress(row), el('p', 'statistics-note', api.remainingText(row)));
      if (row.matchedSpecies.length) {
        const heading = el('h3', '', row.conditionType === 'maxSpeciesCount' ? '가장 많이 기록한 어종' : '조건에 포함된 수집 어종');
        const speciesList = el('ul', 'achievement-species-list');
        for (const species of row.matchedSpecies) speciesList.append(el('li', '', `${species.name} · ${species.count}마리`));
        detail.append(heading, speciesList);
      }
      if (row.remainingSpecies.length) detail.append(el('h3', '', '아직 수집하지 않은 대상'), el('p', 'statistics-note', row.remainingSpecies.join(' · ')));
      if (row.unlocked && !row.qualified) detail.append(el('p', 'statistics-note', '현재 기록은 달성 조건보다 적지만, 이전 해금 이력으로 배지를 유지합니다.'));
    }
    function renderCards() {
      const focused = list.contains(document.activeElement) ? document.activeElement.dataset.achievementId : null;
      list.replaceChildren(); filters.disabled = !state; resultCount.textContent = ''; empty.textContent = '';
      if (!state) return;
      const rows = state.achievements.filter(row => filter === 'all' || row.unlocked === (filter === 'unlocked'))
        .sort((a, b) => Number(b.unlocked) - Number(a.unlocked) || b.progress - a.progress || a.sortOrder - b.sortOrder);
      for (const row of rows) {
        const li = el('li'); const button = el('button', 'achievement-card'); button.type = 'button';
        button.dataset.achievementId = row.achievementId; button.dataset.unlocked = String(row.unlocked); button.dataset.tier = row.tier;
        button.setAttribute('aria-haspopup', 'dialog');
        const top = el('span', 'achievement-card-top'); const icon = el('span', 'achievement-icon', api.icons[row.category]); icon.setAttribute('aria-hidden', 'true');
        top.append(icon, el('span', 'achievement-tier', api.tierLabels[row.tier]));
        const status = el('span', 'achievement-status', row.unlocked ? '✓ 달성' : '🔒 미달성');
        button.append(top, el('strong', 'achievement-title', row.title), el('span', 'achievement-description', row.description),
          progress(row), el('span', 'achievement-remaining', api.remainingText(row)), status);
        button.addEventListener('click', () => openDetail(row)); li.append(button); list.append(li);
      }
      resultCount.textContent = `${rows.length}개 표시 · 전체 ${state.total}개`;
      if (!rows.length) empty.textContent = filter === 'unlocked' ? '아직 달성한 업적이 없어요. 첫 조과부터 남겨 보세요.' : '모든 업적을 달성했어요.';
      if (focused) [...list.querySelectorAll('button')].find(node => node.dataset.achievementId === focused)?.focus({ preventScroll: true });
    }
    document.querySelector('#achievement-detail-close')?.addEventListener('click', () => dialog?.close());
    dialog?.addEventListener('close', () => {
      if (!document.querySelector('#species-detail')?.open) document.body.classList.remove('species-detail-open');
      ([...list.querySelectorAll('button')].find(node => node.dataset.achievementId === activeId) || document.querySelector('#achievements-tab'))?.focus({ preventScroll: true });
    });
    function dismiss() { if (!toast) return; if (supportsPopover) { if (toast.matches(':popover-open')) toast.hidePopover(); } else toast.hidden = true; }
    for (const modal of document.querySelectorAll('dialog')) modal.addEventListener('close', () => { if (modal.contains(toast)) dismiss(); });

    return {
      render({ state: nextState, hasSnapshot, errorMessage = '', syncing = false }) {
        state = nextState;
        loading.hidden = Boolean(state) && (hasSnapshot || Boolean(errorMessage));
        loading.textContent = state ? '조과 기록을 확인하고 있어요. 기본 잠금 상태를 먼저 표시합니다.' : '업적 정보를 준비하고 있어요.';
        error.hidden = !errorMessage; error.textContent = errorMessage;
        retry.hidden = !errorMessage; retry.disabled = syncing;
        overview.hidden = !state; list.hidden = !state;
        if (state) {
          numbers.unlocks.textContent = `${state.unlockedCount} / ${state.total}`;
          numbers.progress.textContent = `${Math.round(state.progress)}%`;
          numbers.recent.textContent = state.recent?.title || (state.unlockedCount ? '해금 이력 확인 중' : '아직 없음');
          numbers.next.textContent = state.next ? `${state.next.title} · ${state.next.target - state.next.current}${state.next.unit} 남음` : '모든 업적 달성';
          renderCards();
          if (dialog?.open) { const row = state.achievements.find(item => item.achievementId === activeId); if (row) renderDetail(row); }
        } else renderCards();
      },
      notify(rows, existing) {
        if (!toast || !rows.length || document.hidden) return;
        dismiss();
        const live = el('div'); live.setAttribute('role', 'status'); live.setAttribute('aria-live', 'polite');
        const title = existing ? `기존 기록으로 업적 ${rows.length}개를 달성했어요.` : `새로운 업적 ${rows.length}개 달성`;
        live.append(el('strong', '', title));
        if (rows.length === 1) live.append(el('p', '', `${rows[0].title} · ${rows[0].description}`));
        else {
          const details = el('details'); details.append(el('summary', '', '달성한 업적 보기'));
          const items = el('ul'); for (const row of rows) items.append(el('li', '', `${row.title} · ${row.description}`)); details.append(items); live.append(details);
        }
        const close = el('button', 'catalog-button', '확인'); close.type = 'button'; close.addEventListener('click', dismiss);
        toast.replaceChildren(live, close);
        // A modal makes outside DOM inert, even for a popover in the top layer.
        // Keep the notice inside the active modal so its dismiss button remains usable.
        (document.querySelector('#catch-record-dialog[open]') || document.querySelector('#achievement-detail[open]')
          || document.querySelector('#species-detail[open]') || document.body).append(toast);
        if (supportsPopover) toast.showPopover();
        else toast.hidden = false;
      },
      cleanup: dismiss,
    };
  };
})(globalThis);
