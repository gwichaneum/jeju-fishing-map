(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.FishingAchievements = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const hunterIds = ['local-hanchi', 'patterned-squid', 'golden-cuttlefish', 'japanese-flying-squid', 'common-octopus', 'webfoot-octopus'];
  const breamIds = ['black-seabream', 'red-seabream', 'largescale-blackfish', 'striped-beakfish'];
  const definitions = [
    ['first-catch', '첫 조과', '첫 번째 조과를 기록했어요.', 'records', 'bronze', 'recordCount', 1],
    ['new-taste', '새로운 손맛', '서로 다른 세 어종을 도감에 등록했어요.', 'collection', 'bronze', 'uniqueSpecies', 3],
    ['jeju-first-steps', '제주 첫 발자국', '서로 다른 두 곳의 제주 낚시 포인트에서 조과를 남겼어요.', 'places', 'bronze', 'mapPointCount', 2],
    ['fishing-beginner', '낚시 입문자', '서로 다른 어종 5종을 수집하세요.', 'collection', 'bronze', 'uniqueSpecies', 5],
    ['five-records', '꾸준한 기록', '조과 기록을 5번 남겼어요.', 'records', 'silver', 'recordCount', 5],
    ['cephalopod-hunter', '두족류 헌터', '한치·무늬오징어·갑오징어·살오징어·참문어·주꾸미 중 3종을 수집하세요.', 'cephalopods', 'silver', 'hunterSpecies', 3],
    ['bream-collector', '돔 수집가', '감성돔·참돔·벵에돔·돌돔 중 3종을 수집하세요.', 'breams', 'silver', 'breamSpecies', 3],
    ['point-regular', '한 곳 제대로', '한 포인트에서 세 번의 조과를 기록했어요.', 'places', 'silver', 'maxMapSpotRecords', 3],
    ['catalog-explorer', '도감 탐험가', '서로 다른 어종 10종을 수집하세요.', 'collection', 'silver', 'uniqueSpecies', 10],
    ['jeju-collector', '제주 컬렉터', '서로 다른 어종 15종을 수집하세요.', 'collection', 'gold', 'uniqueSpecies', 15],
    ['half-collection', '도감 절반 완성', '현재 도감의 절반 이상을 수집하세요.', 'collection', 'gold', 'collectionRatio', 0.5],
    ['catalog-master', '도감 마스터', '현재 도감에 등록된 모든 어종을 수집하세요.', 'collection', 'master', 'collectionRatio', 1],
    ['ten-fish', '오늘부터 낚시꾼', '총 조과 10마리를 기록하세요.', 'catches', 'bronze', 'totalCount', 10],
    ['sea-regular', '바다 단골', '총 조과 30마리를 기록하세요.', 'catches', 'silver', 'totalCount', 30],
    ['fifty-fish', '50마리의 기록', '총 조과 50마리를 기록하세요.', 'catches', 'gold', 'totalCount', 50],
    ['hundred-fish', '백 마리의 추억', '총 조과 100마리를 기록하세요.', 'catches', 'gold', 'totalCount', 100],
    ['cephalopod-collector', '두족류 컬렉터', '현재 도감 두족류의 70% 이상을 수집하세요.', 'cephalopods', 'gold', 'cephalopodRatio', 0.7],
    ['bream-master', '돔 마스터', '현재 도감에 등록된 지정 돔류를 모두 수집하세요.', 'breams', 'master', 'allBreamSpecies', 1],
    ['diverse-angler', '다양하게 잡는 낚시꾼', '서로 다른 어종 5종에 각각 2마리 이상을 기록하세요.', 'variety', 'silver', 'speciesWithTwo', 5],
    ['species-ten', '한 종 제대로', '하나의 어종에서 누적 10마리를 기록하세요.', 'variety', 'silver', 'maxSpeciesCount', 10],
    ['signature-species', '나만의 주력 어종', '하나의 어종에서 누적 20마리를 기록하세요.', 'variety', 'gold', 'maxSpeciesCount', 20],
    ['jeju-sea-explorer', '제주 바다 탐험', '서로 다른 지도 포인트 5곳에서 기록하세요.', 'places', 'silver', 'mapPointCount', 5],
    ['point-explorer', '포인트 탐험가', '서로 다른 지도 포인트 10곳에서 기록하세요.', 'places', 'gold', 'mapPointCount', 10],
    ['continuing-records', '계속되는 기록', '서로 다른 날짜 10일에 조과를 기록하세요.', 'dates', 'gold', 'distinctDateCount', 10],
  ].map((row, sortOrder) => Object.freeze(Object.fromEntries(
    ['achievementId', 'title', 'description', 'category', 'tier', 'conditionType', 'target', 'sortOrder']
      .map((key, index) => [key, index === 7 ? sortOrder : row[index]]))));
  Object.freeze(definitions);
  const tierLabels = Object.freeze({ bronze: 'Bronze', silver: 'Silver', gold: 'Gold', master: 'Master' });
  const categoryLabels = Object.freeze({ collection: '도감 수집', catches: '조과 마릿수', records: '기록', cephalopods: '두족류', breams: '돔류', variety: '어종 탐구', places: '포인트 탐험', dates: '기록한 날짜' });
  const icons = Object.freeze({ collection: '◇', catches: '🐟', records: '✎', cephalopods: '🦑', breams: '🐟', variety: '◇', places: '≈', dates: '◷' });

  function validateDefinitions(catalog, rows = definitions) {
    const errors = [];
    const seen = new Set();
    const types = new Set(['uniqueSpecies', 'collectionRatio', 'totalCount', 'recordCount', 'hunterSpecies',
      'cephalopodRatio', 'breamSpecies', 'allBreamSpecies', 'speciesWithTwo', 'maxSpeciesCount', 'mapPointCount', 'maxMapSpotRecords', 'distinctDateCount']);
    if (!Array.isArray(rows) || !rows.length) return { valid: false, errors: ['업적 정의가 없습니다.'], missingSpeciesIds: [] };
    for (const row of rows) {
      if (!row || ['achievementId', 'title', 'description', 'conditionType', 'tier'].some(key => typeof row[key] !== 'string' || !row[key].trim())) {
        errors.push('업적 필수 항목이 누락되었습니다.'); continue;
      }
      if (seen.has(row.achievementId)) errors.push('중복 업적 ID입니다.');
      seen.add(row.achievementId);
      if (!Object.hasOwn(tierLabels, row.tier) || !types.has(row.conditionType)) errors.push('지원하지 않는 업적 조건 또는 Tier입니다.');
      if (typeof row.target !== 'number' || !Number.isFinite(row.target) || row.target <= 0) errors.push('업적 목표는 양수여야 합니다.');
    }
    const ids = new Set((Array.isArray(catalog) ? catalog : []).map(row => row?.speciesId));
    // A smaller/future catalog can omit group members without breaking the whole achievement list.
    const missingSpeciesIds = Array.isArray(catalog) ? [...new Set([...hunterIds, ...breamIds])].filter(id => !ids.has(id)) : [];
    return { valid: errors.length === 0, errors, missingSpeciesIds };
  }

  function findDuplicateConditions(catalog, rows = definitions) {
    const species = (Array.isArray(catalog) ? catalog : []).filter(row => row?.speciesId);
    const conditions = new Map();
    for (const row of rows) {
      let metric = row.conditionType;
      let target = row.target;
      if (metric === 'collectionRatio') { metric = 'uniqueSpecies'; target = Math.ceil(species.length * target); }
      if (metric === 'allBreamSpecies') { metric = 'breamSpecies'; target = species.filter(item => breamIds.includes(item.speciesId)).length; }
      if (['hunterSpecies', 'cephalopodRatio', 'breamSpecies'].includes(metric)) {
        const group = species.filter(item => metric === 'cephalopodRatio' ? item.category === 'cephalopod'
          : (metric === 'hunterSpecies' ? hunterIds : breamIds).includes(item.speciesId));
        if (metric === 'cephalopodRatio') target = Math.ceil(group.length * target);
        metric = `species:${group.map(item => item.speciesId).sort().join(',')}`;
      }
      // Every valid record has one known species and a positive count; these three 1-targets coincide.
      if (target === 1 && ['uniqueSpecies', 'totalCount', 'recordCount'].includes(metric)) metric = 'first-valid-record';
      const key = `${metric}:${target}`;
      if (!conditions.has(key)) conditions.set(key, []);
      conditions.get(key).push(row.achievementId);
    }
    return [...conditions].filter(([, ids]) => ids.length > 1).map(([condition, achievementIds]) => ({ condition, achievementIds }));
  }

  function calculateAchievements(statistics, catalog, unlocks = []) {
    const species = (Array.isArray(catalog) ? catalog : []).filter(row => row && typeof row.speciesId === 'string');
    const stats = statistics && typeof statistics === 'object' ? statistics : {};
    const bySpecies = stats.summary?.bySpecies || {};
    const speciesStats = (Array.isArray(stats.speciesStats) ? stats.speciesStats : []).filter(row => row && typeof row.speciesId === 'string');
    const number = value => typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 0 ? value : 0;
    const collected = row => Boolean(bySpecies[row.speciesId]?.collected);
    const eligible = ids => species.filter(row => ids.includes(row.speciesId));
    const cephalopods = species.filter(row => row.category === 'cephalopod');
    const breams = eligible(breamIds);
    const groups = { hunterSpecies: eligible(hunterIds), cephalopodRatio: cephalopods, breamSpecies: breams, allBreamSpecies: breams };
    const history = new Map((Array.isArray(unlocks) ? unlocks : []).filter(row => typeof row?.achievementId === 'string'
      && typeof row.unlockedAt === 'string' && Number.isFinite(Date.parse(row.unlockedAt)) && new Date(row.unlockedAt).toISOString() === row.unlockedAt)
      .map(row => [row.achievementId, row.unlockedAt]));
    const leader = speciesStats[0] || null;
    const values = { uniqueSpecies: number(stats.summary?.collectedSpecies), collectionRatio: number(stats.summary?.collectedSpecies),
      totalCount: number(stats.totalCount), recordCount: number(stats.recordCount),
      speciesWithTwo: speciesStats.filter(row => number(row.totalCount) >= 2).length,
      maxSpeciesCount: number(leader?.totalCount), mapPointCount: number(stats.mapPointCount),
      maxMapSpotRecords: number(stats.maxMapSpotRecordCount), distinctDateCount: number(stats.distinctDateCount) };
    const achievements = definitions.map(definition => {
      const type = definition.conditionType;
      const group = groups[type];
      const matchedSpecies = (group || (type === 'speciesWithTwo' ? species.filter(row => bySpecies[row.speciesId]?.totalCount >= 2)
        : type === 'maxSpeciesCount' ? species.filter(row => row.speciesId === leader?.speciesId) : []));
      const current = group ? group.filter(collected).length : values[type];
      const target = type === 'collectionRatio' ? Math.ceil(species.length * definition.target)
        : type === 'cephalopodRatio' ? Math.ceil(cephalopods.length * definition.target)
          : type === 'allBreamSpecies' ? breams.length : definition.target;
      const unit = ['totalCount', 'maxSpeciesCount'].includes(type) ? '마리' : ['recordCount', 'maxMapSpotRecords'].includes(type) ? '회'
        : type === 'mapPointCount' ? '곳' : type === 'distinctDateCount' ? '일' : '종';
      const qualified = target > 0 && current >= target;
      const unlockedAt = history.get(definition.achievementId) || null;
      return { ...definition, current, target, unit, qualified, unlocked: qualified || Boolean(unlockedAt), unlockedAt,
        progress: target > 0 ? Math.min(100, current / target * 100) : 0,
        matchedSpecies: matchedSpecies.filter(collected).map(row => ({ speciesId: row.speciesId, name: row.nameKo, count: number(bySpecies[row.speciesId].totalCount) })),
        remainingSpecies: group ? group.filter(row => !collected(row)).map(row => row.nameKo) : [] };
    });
    const unlocked = achievements.filter(row => row.unlocked);
    const next = achievements.filter(row => !row.unlocked && row.target > 0)
      .sort((a, b) => b.progress - a.progress || a.sortOrder - b.sortOrder)[0] || null;
    const recent = unlocked.filter(row => row.unlockedAt).sort((a, b) => b.unlockedAt.localeCompare(a.unlockedAt) || a.sortOrder - b.sortOrder)[0] || null;
    return { achievements, unlockedCount: unlocked.length, total: achievements.length,
      progress: achievements.length ? unlocked.length / achievements.length * 100 : 0, next, recent };
  }

  function remainingText(achievement) {
    if (!achievement.target) return '현재 도감에 대상 어종이 없습니다.';
    if (achievement.unlocked) return achievement.qualified ? '달성 완료' : '달성 이력 유지 · 현재 기록 기준 진행도';
    return `${Math.max(0, achievement.target - achievement.current)}${achievement.unit} 더 ${achievement.unit === '종' ? '수집하면' : '기록하면'} 해금`;
  }
  return { definitions, tierLabels, categoryLabels, icons, validateDefinitions, findDuplicateConditions, calculateAchievements, remainingText };
});
