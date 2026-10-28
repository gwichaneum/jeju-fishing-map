'use strict';

// Presentation only: records and their shared collection summary come from catalog.js.
globalThis.createCatchStatisticsUI = function ({ root, createSpeciesImage, onShowCollection }) {
  const photoUrls = new Set();
  const format = new Intl.NumberFormat('ko-KR');
  const number = value => format.format(value);

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function cleanup() {
    for (const url of photoUrls) URL.revokeObjectURL(url);
    photoUrls.clear();
    root.replaceChildren();
  }

  function section(title, className) {
    const node = element('section', `statistics-section ${className}`);
    const heading = element('h3', '', title);
    heading.id = className + '-heading';
    node.setAttribute('aria-labelledby', heading.id);
    node.append(heading);
    return node;
  }

  function bar(count, maximum) {
    const track = element('div', 'statistics-bar');
    track.setAttribute('aria-hidden', 'true'); // The adjacent text supplies the exact value.
    const fill = element('span');
    fill.style.width = `${maximum > 0 ? Math.min(100, count / maximum * 100) : 0}%`;
    track.append(fill);
    return track;
  }

  function thumbnail(record, species) {
    const frame = element('div', 'statistics-photo');
    const fallback = element('span', 'statistics-photo-fallback', '사진 없음');
    frame.append(fallback);
    if (!(record.photoBlob instanceof Blob) || !record.photoBlob.size) return frame;
    try {
      const url = URL.createObjectURL(record.photoBlob);
      photoUrls.add(url);
      const img = element('img');
      img.alt = `${species.nameKo} 조과 사진 · ${record.caughtAt}`;
      img.width = 64;
      img.height = 64;
      img.decoding = 'async';
      img.addEventListener('load', () => { fallback.hidden = true; }, { once: true });
      img.addEventListener('error', () => {
        img.hidden = true;
        fallback.hidden = false;
        URL.revokeObjectURL(url);
        photoUrls.delete(url);
      }, { once: true });
      img.src = url;
      frame.append(img);
    } catch { /* Keep the fallback if this browser cannot create an object URL. */ }
    return frame;
  }

  function render({ species, statistics, hasSnapshot, ready, loading }) {
    cleanup();
    const header = element('div', 'statistics-header');
    header.append(element('p', 'collection-eyebrow', 'MY CATCHES'), element('h2', '', '나의 조과 통계'),
      element('p', 'collection-caption', '이 브라우저에 저장한 기록으로 돌아보는 나의 바다.'));
    root.append(header);
    if (!hasSnapshot || !statistics) {
      const message = element('p', 'catalog-load-status', loading ? '조과 통계를 준비하고 있어요.' : hasSnapshot
        ? '통계 기능을 불러오지 못했습니다. 페이지를 새로고침해 다시 시도해 주세요.'
        : '저장된 조과 기록을 확인한 뒤 통계를 표시합니다.');
      message.setAttribute('role', 'status');
      root.append(message);
      return;
    }

    const { summary, totalCount, recordCount, speciesStats, topSpecies, recentRecords, monthlyStats, locationStats } = statistics;
    const byId = new Map(species.map(item => [item.speciesId, item]));
    const cards = element('dl', 'statistics-summary');
    for (const [key, label, value] of [
      ['total', '총 조과', `${number(totalCount)}마리`],
      ['collected', '수집 어종', `${number(summary.collectedSpecies)} / ${number(summary.totalSpecies)}종`],
      ['records', '조과 기록', `${number(recordCount)}회`],
      ['top', '가장 많이 잡은 어종', topSpecies ? `${byId.get(topSpecies.speciesId).nameKo} · ${number(topSpecies.totalCount)}마리` : '아직 없음'],
    ]) {
      const card = element('div', `statistics-summary-card statistics-summary-${key}`);
      card.append(element('dt', '', label), element('dd', '', value));
      cards.append(card);
    }
    root.append(cards);
    if (!ready) root.append(element('p', 'statistics-note', '마지막으로 확인한 기록의 통계입니다. 위 안내에서 기록을 다시 불러올 수 있어요.'));
    if (!recordCount) {
      const empty = element('div', 'statistics-empty');
      empty.append(element('h3', '', '아직 등록된 조과가 없습니다.'),
        element('p', '', '도감에서 잡은 어종을 기록하면 통계가 여기에 표시됩니다.'));
      const button = element('button', 'catalog-button', '도감에서 기록하기');
      button.type = 'button';
      button.addEventListener('click', onShowCollection);
      empty.append(button);
      root.append(empty);
    }

    const sections = element('div', 'statistics-sections');
    const ranking = section('어종별 조과', 'statistics-ranking');
    ranking.append(element('p', 'statistics-note', '총 마릿수 순 · 동률이면 최근에 잡은 어종 순'));
    const rankingList = element('ol', 'statistics-list');
    for (const [index, item] of speciesStats.entries()) {
      const fish = byId.get(item.speciesId);
      const row = element('li', 'statistics-ranking-row');
      row.dataset.statisticsSpecies = item.speciesId;
      row.append(element('span', 'statistics-rank', String(index + 1)), createSpeciesImage(fish, 'statistics-species-image', true));
      const body = element('div', 'statistics-row-body');
      body.append(element('strong', '', fish.nameKo), bar(item.totalCount, topSpecies?.totalCount || 0),
        element('span', 'statistics-value', `${number(item.totalCount)}마리 · 기록 ${number(item.recordCount)}회`));
      row.append(body);
      rankingList.append(row);
    }
    ranking.append(speciesStats.length ? rankingList : element('p', 'statistics-note', '기록한 어종이 아직 없어요.'));

    const recent = section('최근 조과', 'statistics-recent');
    recent.append(element('p', 'statistics-note', '잡은 날짜 순 · 같은 날에는 등록한 시각 순, 최근 5개'));
    const recentList = element('ol', 'statistics-list');
    for (const record of recentRecords) {
      const fish = byId.get(record.speciesId);
      const row = element('li', 'statistics-recent-row');
      row.dataset.statisticsRecord = record.recordId;
      const body = element('div', 'statistics-row-body');
      const date = element('time', '', record.caughtAt.replaceAll('-', '.'));
      date.dateTime = record.caughtAt;
      body.append(date, element('strong', '', `${fish.nameKo} · ${number(record.count)}마리`));
      // The calculation module supplies normalized, non-placeholder location names.
      const place = globalThis.CatchStatistics.normalizeLocationName(record.locationName);
      if (place) body.append(element('span', 'statistics-value', place));
      row.append(thumbnail(record, fish), body);
      recentList.append(row);
    }
    recent.append(recentRecords.length ? recentList : element('p', 'statistics-note', '최근 조과가 여기에 표시됩니다.'));

    const monthly = section('월별 조과', 'statistics-monthly');
    monthly.append(element('p', 'statistics-note', '이번 달을 포함한 최근 6개월 · 잡은 날짜 기준'));
    const monthList = element('ol', 'statistics-list');
    const maxMonth = Math.max(0, ...monthlyStats.map(item => item.totalCount));
    for (const item of monthlyStats) {
      const row = element('li', 'statistics-month-row');
      row.dataset.month = item.month;
      const label = element('time', '', item.month.replace('-', '.'));
      label.dateTime = item.month;
      row.append(label, bar(item.totalCount, maxMonth), element('span', 'statistics-value', `${number(item.totalCount)}마리`));
      monthList.append(row);
    }
    monthly.append(monthList);

    const locations = section('자주 간 낚시 장소', 'statistics-locations');
    locations.append(element('p', 'statistics-note', '기록 횟수가 많은 장소 TOP 5 · 장소를 입력한 기록 기준'));
    const locationList = element('ol', 'statistics-list');
    for (const item of locationStats) {
      const row = element('li', 'statistics-location-row');
      row.append(element('strong', '', item.locationName),
        element('span', 'statistics-value', `${number(item.recordCount)}회 · 총 ${number(item.totalCount)}마리`));
      locationList.append(row);
    }
    locations.append(locationStats.length ? locationList : element('p', 'statistics-note', '장소를 입력한 조과 기록이 아직 없어요.'));
    sections.append(ranking, recent, monthly, locations);
    root.append(sections);
  }

  return { render, cleanup };
};
