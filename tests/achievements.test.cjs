const assert = require('node:assert/strict');
const { test } = require('node:test');
const { calculateCatchStatistics } = require('../catch-statistics.js');
const api = require('../achievements.js');
const catalog = require('../species-catalog.json');
const stamp = '2026-10-29T00:00:00.000Z';
const photoBlob = new Blob(['metadata fixture; browser verifies decoding'], { type: 'image/png' });
const record = (recordId, speciesId = 'rockfish', count = 1, extra = {}) => ({ recordId, speciesId, count, caughtAt: '2026-10-28',
  photoBlob, photoType: 'image/png', photoName: 'test.png', locationName: '', mapSpotId: null, memo: '', createdAt: stamp, updatedAt: stamp, ...extra });
const calculate = (records = [], species = catalog, history = [], options = {}) => api.calculateAchievements(calculateCatchStatistics(records, species, options), species, history);
const get = (result, id) => result.achievements.find(row => row.achievementId === id);

test('achievements define 24 distinct goals with unique IDs and four tiers in one immutable list', () => {
  assert.equal(api.definitions.length, 24); assert.equal(new Set(api.definitions.map(row => row.achievementId)).size, 24);
  assert.deepEqual(api.definitions.reduce((sum, row) => { sum[row.tier] = (sum[row.tier] || 0) + 1; return sum; }, {}), { bronze: 5, silver: 9, gold: 8, master: 2 });
  for (const row of api.definitions) { assert.ok(Object.isFrozen(row)); for (const key of ['achievementId', 'title', 'description', 'category', 'tier', 'conditionType']) assert.ok(row[key]); assert.ok(row.target > 0); }
});
test('A: no records unlock nothing; an empty catalog never grants zero-target master badges', () => {
  for (const species of [catalog, []]) { const result = calculate([], species); assert.equal(result.unlockedCount, 0); assert.equal(result.progress, 0); assert.ok(result.achievements.every(row => Number.isFinite(row.progress) && row.current === 0)); }
});
test('scenario A: one fish at one map point unlocks only 첫 조과 for every catalog species', () => {
  for (const species of catalog) {
    const result = calculate([record('one', species.speciesId, 1, { mapSpotId: 1 })]);
    assert.deepEqual(result.achievements.filter(row => row.qualified).map(row => row.achievementId), ['first-catch'], species.nameKo);
    assert.equal(get(result, 'new-taste').current, 1); assert.equal(get(result, 'new-taste').target, 3);
    assert.equal(get(result, 'jeju-first-steps').current, 1); assert.equal(get(result, 'jeju-first-steps').target, 2);
    assert.equal(get(result, 'five-records').current, 1);
  }
});
test('C/D: five and ten species unlock milestones; half/master targets use the actual catalog length', () => {
  for (const [count, id] of [[5, 'fishing-beginner'], [10, 'catalog-explorer'], [15, 'jeju-collector']]) {
    const rows = catalog.slice(0, count).map((row, i) => record(String(i), row.speciesId)); const result = calculate(rows);
    assert.equal(get(result, id).qualified, true); assert.equal(get(calculate(rows.slice(1)), id).qualified, false);
  }
  assert.equal(get(calculate(), 'half-collection').target, 16); assert.equal(get(calculate(), 'catalog-master').target, 31);
  const smaller = catalog.slice(0, 7), rows = smaller.map((row, i) => record(String(i), row.speciesId));
  assert.equal(get(calculate(rows.slice(0, 3), smaller), 'half-collection').qualified, false);
  assert.equal(get(calculate(rows.slice(0, 4), smaller), 'half-collection').qualified, true);
  assert.equal(get(calculate(rows, smaller), 'catalog-master').qualified, true);
});
test('E: catch thresholds 10/30/50/100 use summed count, not record count', () => {
  for (const [count, id] of [[10, 'ten-fish'], [30, 'sea-regular'], [50, 'fifty-fish'], [100, 'hundred-fish']]) {
    assert.equal(get(calculate([record('one', 'rockfish', count - 1)]), id).qualified, false);
    const result = calculate([record('one', 'rockfish', count)]); assert.equal(get(result, id).qualified, true); assert.equal(get(result, 'five-records').current, 1);
  }
});
test('scenario D: five records unlock 꾸준한 기록; duplicate record IDs cannot increase the count', () => {
  const rows = Array.from({ length: 5 }, (_, i) => record(String(i)));
  assert.equal(get(calculate(rows.slice(1)), 'five-records').qualified, false);
  assert.equal(get(calculate([...rows, rows[0]]), 'five-records').current, 5);
  assert.equal(get(calculate(rows), 'five-records').qualified, true);
});
test('F: squid/hanchi/cuttlefish award the hunter badge and cephalopod percentage rounds upward', () => {
  const rows = ['patterned-squid', 'local-hanchi', 'golden-cuttlefish'].map((id, i) => record(String(i), id));
  const result = calculate(rows); assert.equal(get(result, 'cephalopod-hunter').qualified, true);
  assert.equal(get(result, 'cephalopod-collector').target, 5); assert.equal(get(result, 'cephalopod-collector').qualified, false);
  assert.deepEqual(get(result, 'cephalopod-hunter').matchedSpecies.map(row => row.name), ['한치', '무늬오징어', '갑오징어']);
  const cephalopods = catalog.filter(row => row.category === 'cephalopod');
  assert.equal(get(calculate(cephalopods.slice(0, 5).map((row, i) => record(String(i), row.speciesId))), 'cephalopod-collector').qualified, true);
});
test('bream badges use the four explicit catalog IDs and never include a fish only because its name contains 돔', () => {
  const ids = ['black-seabream', 'red-seabream', 'largescale-blackfish', 'striped-beakfish'];
  assert.equal(get(calculate([record('one', 'pearl-spot-chromis')]), 'bream-collector').current, 0);
  const rows = ids.map((id, i) => record(String(i), id));
  assert.equal(get(calculate(rows.slice(0, 3)), 'bream-collector').qualified, true); assert.equal(get(calculate(rows.slice(0, 3)), 'bream-master').qualified, false);
  assert.equal(get(calculate(rows), 'bream-master').qualified, true);
  const reduced = catalog.filter(row => row.speciesId !== ids[3]); assert.equal(get(calculate(rows.slice(0, 3), reduced), 'bream-master').target, 3);
});
test('variety uses cumulative species totals, and specialty details name the leading species', () => {
  const rows = catalog.slice(0, 5).flatMap((row, i) => [record(`${i}-a`, row.speciesId), record(`${i}-b`, row.speciesId)]);
  assert.equal(get(calculate(rows), 'diverse-angler').qualified, true); assert.equal(get(calculate(rows.slice(1)), 'diverse-angler').qualified, false);
  const result = calculate([record('one', 'patterned-squid', 21)]);
  assert.equal(get(result, 'signature-species').qualified, true); assert.deepEqual(get(result, 'signature-species').matchedSpecies, [{ speciesId: 'patterned-squid', name: '무늬오징어', count: 21 }]);
});
test('map exploration uses distinct actual map IDs, excluding custom and name-only locations even with exact official names', () => {
  const spots = Array.from({ length: 10 }, (_, i) => ({ id: i + 1, name: '포인트' + i }));
  const rows = spots.map((row, i) => record(String(i), 'rockfish', 1, { mapSpotId: row.id, locationName: '이름' + i }));
  const extra = [record('same', 'rockfish', 1, { mapSpotId: 1, locationName: '다른 이름' }), record('legacy', 'rockfish', 1, { locationName: '포인트0' }), record('custom', 'rockfish', 1, { customLocationId: 'custom', locationName: '사용자 장소' })];
  const result = calculate([...rows, ...extra], catalog, [], { mapSpots: spots, mapSpotIds: spots.map(row => row.id) });
  assert.equal(get(result, 'point-explorer').current, 10); assert.equal(get(result, 'point-explorer').qualified, true);
  assert.equal(get(calculate(extra.slice(1)), 'jeju-first-steps').current, 0);
});
test('date badges count caughtAt dates, never record count or contiguous attendance', () => {
  const rows = Array.from({ length: 10 }, (_, i) => record(String(i), 'rockfish', 1, { caughtAt: `2026-09-${String(i * 2 + 1).padStart(2, '0')}` }));
  assert.equal(get(calculate(rows.slice(0, 9)), 'continuing-records').qualified, false);
  assert.equal(get(calculate(rows), 'continuing-records').qualified, true);
  assert.equal(get(calculate([...rows, record('same-date', 'rockfish', 1, { caughtAt: rows[0].caughtAt })]), 'continuing-records').current, 10);
});
test('G/H: retained unlocks survive deletion, while current progress returns to zero and next excludes earned badges', () => {
  const history = ['first-catch', 'first-fish', 'first-record', 'first-point', 'ten-records', 'unknown-id'].map(achievementId => ({ achievementId, unlockedAt: stamp }));
  const before = structuredClone(history);
  const result = calculate([], catalog, history); assert.equal(result.unlockedCount, 1);
  assert.equal(get(result, 'first-catch').qualified, false); assert.equal(get(result, 'first-catch').current, 0); assert.equal(get(result, 'first-catch').progress, 0);
  assert.ok(!history.some(row => row.achievementId === result.next.achievementId)); assert.match(api.remainingText(get(result, 'first-catch')), /이력 유지/);
  assert.equal(get(result, 'first-catch').title, '첫 조과');
  assert.equal(get(result, 'jeju-first-steps').unlocked, false); assert.equal(get(result, 'five-records').unlocked, false);
  assert.deepEqual(history, before);
});
test('next goal chooses the highest current percentage, with definition order for equal progress and no completed badges', () => {
  const result = calculate([record('one', 'rockfish', 9)]); assert.equal(result.next.achievementId, 'ten-fish'); assert.equal(result.next.progress, 90);
  const all = api.definitions.map(row => ({ achievementId: row.achievementId, unlockedAt: stamp })); assert.equal(calculate([], catalog, all).next, null);
});
test('bad records cannot unlock achievements; calculation shares statistics validation and leaves inputs unchanged', () => {
  const rows = [record('good'), record('string', 'rockfish', '100'), record('zero', 'rockfish', 0), record('unknown', 'not-a-species', 100), record('future', 'rockfish', 100, { caughtAt: '9999-12-31' })];
  const snapshot = rows.map(row => ({ ...row })); const stats = calculateCatchStatistics(rows, catalog), result = api.calculateAchievements(stats, catalog);
  assert.equal(get(result, 'hundred-fish').current, stats.totalCount); assert.equal(stats.totalCount, 1); assert.equal(get(result, 'five-records').current, 1); assert.deepEqual(rows, snapshot);
});

test('static achievement cards can calculate a locked baseline before statistics or IndexedDB exist', () => {
  for (const stats of [undefined, null, {}, { summary: null }, { speciesStats: null }]) {
    const result = api.calculateAchievements(stats, catalog);
    assert.equal(result.total, 24); assert.equal(result.unlockedCount, 0);
    assert.ok(result.achievements.every(row => row.current === 0 && Number.isFinite(row.progress)));
    assert.equal(get(result, 'half-collection').target, 16);
    assert.equal(get(result, 'cephalopod-collector').target, 5);
  }
});

test('definition validation reports duplicate IDs, bad tiers, unknown conditions and invalid targets', () => {
  assert.deepEqual(api.validateDefinitions(catalog), { valid: true, errors: [], missingSpeciesIds: [] });
  for (const rows of [null, [], [...api.definitions, api.definitions[0]],
    [{ ...api.definitions[0], conditionType: 'unknown' }], [{ ...api.definitions[0], tier: 'unknown' }],
    [{ ...api.definitions[0], target: 0 }], [{ ...api.definitions[0], target: '1' }], [{ ...api.definitions[0], title: '' }]]) {
    assert.equal(api.validateDefinitions(catalog, rows).valid, false);
  }
});

test('missing categories and group species do not crash static definitions or grant zero-target badges', () => {
  const incomplete = [{ speciesId: 'rockfish', nameKo: '볼락' }, null, {}];
  const result = api.calculateAchievements(undefined, incomplete);
  assert.equal(result.achievements.length, 24); assert.equal(result.unlockedCount, 0);
  assert.equal(get(result, 'cephalopod-collector').target, 0);
  assert.equal(get(result, 'bream-master').qualified, false);
  assert.ok(api.validateDefinitions(incomplete).missingSpeciesIds.includes('patterned-squid'));
});

test('malformed aggregate and unlock arrays stay finite and cannot fabricate retained badges', () => {
  const stats = { totalCount: '100', recordCount: NaN, mapPointCount: undefined, distinctDateCount: -1,
    speciesStats: [null, {}, { speciesId: 'rockfish', totalCount: '100' }], summary: { collectedSpecies: '31' } };
  for (const unlocks of [undefined, null, {}, [null, { achievementId: 'first-catch', unlockedAt: '2026-02-30T00:00:00.000Z' }]]) {
    const result = api.calculateAchievements(stats, catalog, unlocks);
    assert.equal(result.unlockedCount, 0); assert.ok(result.achievements.every(row => Number.isFinite(row.current) && Number.isFinite(row.progress)));
  }
});

test('valid large cumulative totals are not reset to zero by defensive achievement defaults', () => {
  const rows = [record('large-one', 'rockfish', Number.MAX_SAFE_INTEGER), record('large-two', 'rockfish', Number.MAX_SAFE_INTEGER)];
  const result = calculate(rows);
  assert.equal(get(result, 'hundred-fish').current, Number.MAX_SAFE_INTEGER * 2);
  assert.equal(get(result, 'hundred-fish').qualified, true);
  assert.equal(get(result, 'signature-species').qualified, true);
});

test('scenarios B/C/E separate two points, three species and three records at the same point', () => {
  const rows = [record('one', 'rockfish', 1, { mapSpotId: 1 }), record('two', 'horse-mackerel', 1, { mapSpotId: 2 }),
    record('three', 'chub-mackerel', 1, { mapSpotId: 1 }), record('four', 'rockfish', 1, { mapSpotId: 1 })];
  const second = calculate(rows.slice(0, 2));
  assert.equal(get(second, 'jeju-first-steps').qualified, true); assert.equal(get(second, 'new-taste').current, 2);
  assert.equal(get(second, 'new-taste').qualified, false); assert.equal(second.next.title, '새로운 손맛');
  assert.equal(api.remainingText(second.next), '1종 더 수집하면 해금');
  assert.equal(get(calculate(rows.slice(0, 3)), 'new-taste').qualified, true);
  assert.equal(get(calculate(rows.slice(0, 3)), 'point-regular').qualified, false);
  assert.equal(get(calculate(rows), 'point-regular').qualified, true);
  assert.equal(get(calculate(rows), 'point-regular').current, 3);
  assert.equal(get(calculate(rows), 'five-records').qualified, false);
});

test('same-point progress counts records rather than fish and excludes custom, legacy, invalid and duplicate rows', () => {
  const options = { mapSpotIds: [1, 2] };
  const first = record('one', 'rockfish', 100, { mapSpotId: 1 });
  const one = calculate([first], catalog, [], options);
  assert.equal(get(one, 'point-regular').current, 1); assert.equal(get(one, 'point-regular').qualified, false);
  const rows = [first, first, record('two', 'rockfish', 1, { mapSpotId: 1 }),
    record('bad-map', 'rockfish', 1, { mapSpotId: 999 }), record('bad-count', 'rockfish', '3', { mapSpotId: 1 }),
    ...Array.from({ length: 4 }, (_, i) => record('custom-' + i, 'rockfish', 1, { customLocationId: 'same-custom', locationName: '같은 장소' })),
    record('legacy', 'rockfish', 1, { locationName: '같은 장소' })];
  const stats = calculateCatchStatistics(rows, catalog, options);
  assert.equal(stats.mapPointCount, 1); assert.equal(stats.maxMapSpotRecordCount, 2);
  const result = api.calculateAchievements(stats, catalog);
  assert.equal(get(result, 'point-regular').current, 2); assert.equal(get(result, 'point-regular').qualified, false);
  assert.equal(get(result, 'jeju-first-steps').qualified, false);
  assert.equal(calculateCatchStatistics([], catalog).maxMapSpotRecordCount, 0);
});

test('condition audit detects the old first-record equivalence and resolved ratio collisions without rejecting future catalogs', () => {
  assert.deepEqual(api.findDuplicateConditions(catalog), []);
  const old = ['uniqueSpecies', 'totalCount', 'recordCount'].map((conditionType, i) => ({ ...api.definitions[0], achievementId: 'old-' + i, conditionType, target: 1 }));
  assert.deepEqual(api.findDuplicateConditions(catalog, old), [{ condition: 'first-valid-record:1', achievementIds: ['old-0', 'old-1', 'old-2'] }]);
  const smaller = catalog.slice(0, 30);
  assert.ok(api.findDuplicateConditions(smaller).some(row => row.achievementIds.includes('jeju-collector') && row.achievementIds.includes('half-collection')));
  assert.equal(api.validateDefinitions(smaller).valid, true);
});

test('all requested major goals remain; removed one-action and surplus goals are absent', () => {
  const names = new Set(api.definitions.map(row => row.title));
  for (const title of ['낚시 입문자', '도감 탐험가', '제주 컬렉터', '도감 절반 완성', '도감 마스터',
    '오늘부터 낚시꾼', '바다 단골', '50마리의 기록', '백 마리의 추억', '두족류 헌터', '두족류 컬렉터',
    '돔 수집가', '돔 마스터', '다양하게 잡는 낚시꾼', '한 종 제대로', '나만의 주력 어종', '제주 바다 탐험', '포인트 탐험가', '계속되는 기록']) assert.ok(names.has(title), title);
  for (const title of ['첫 수집', '첫 손맛', '첫 기록', '첫 포인트', '첫 돔', '에깅 입문', '낚시 일기장', '꾸준한 낚시꾼']) assert.equal(names.has(title), false, title);
});
