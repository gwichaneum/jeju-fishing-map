const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const api = require('../catch-records.js');
const { calculateCatchStatistics: calculate, normalizeLocationName } = require('../catch-statistics.js');
const catalog = require('../species-catalog.json');
const speciesIds = catalog.map(species => species.speciesId);
const now = new Date(2024, 9, 28, 12);
const options = { now, mapSpotIds: [1, 2] };
const record = (changes = {}) => ({
  recordId: 'one', speciesId: 'red-seabream', caughtAt: '2024-10-27', count: 2,
  photoBlob: new Blob(['metadata fixture; browser tests verify decoded photos'], { type: 'image/png' }),
  photoName: 'test.png', photoType: 'image/png', locationName: '', mapSpotId: null, memo: '',
  createdAt: '2024-10-28T00:00:00.000Z', updatedAt: '2024-10-28T00:00:00.000Z', ...changes,
});

test('statistics A: no records produce zero catches, records and collected species', () => {
  const result = calculate([], catalog, options);
  assert.equal(result.totalCount, 0);
  assert.equal(result.recordCount, 0);
  assert.equal(result.summary.collectedSpecies, 0);
  assert.equal(result.summary.totalSpecies, catalog.length);
  assert.equal(result.summary.progress, 0);
  assert.equal(result.topSpecies, null);
  assert.deepEqual(result.speciesStats, []);
  assert.deepEqual(result.recentRecords, []);
  assert.deepEqual(result.locationStats, []);
  assert.equal(result.monthlyStats.length, 6);
  assert.ok(result.monthlyStats.every(month => month.totalCount === 0));
});

test('statistics B: two red seabream records count as five fish and one species', () => {
  const records = [record(), record({ recordId: 'two', count: 3 })];
  const result = calculate(records, catalog, options);
  assert.equal(result.totalCount, 5);
  assert.equal(result.recordCount, 2);
  assert.equal(result.summary.collectedSpecies, 1);
  assert.deepEqual(result.topSpecies, { speciesId: 'red-seabream', totalCount: 5, recordCount: 2, lastCaughtAt: '2024-10-27' });
  assert.deepEqual(result.summary, api.summarizeCollection(records, speciesIds, options.mapSpotIds));
});

test('statistics C: three species total nine fish and patterned squid leads', () => {
  const records = [record(), record({ recordId: 'two', speciesId: 'local-hanchi', count: 3 }),
    record({ recordId: 'three', speciesId: 'patterned-squid', count: 4 })];
  const result = calculate(records, catalog, options);
  assert.equal(result.totalCount, 9);
  assert.equal(result.recordCount, 3);
  assert.equal(result.summary.collectedSpecies, 3);
  assert.equal(result.topSpecies.speciesId, 'patterned-squid');
  assert.deepEqual(result.speciesStats.map(species => species.totalCount), [4, 3, 2]);
});

test('statistics D: deleting the last squid record reduces totals and collected species', () => {
  const records = [record(), record({ recordId: 'two', speciesId: 'local-hanchi', count: 3 }),
    record({ recordId: 'three', speciesId: 'patterned-squid', count: 4 })];
  const before = calculate(records, catalog, options);
  const after = calculate(records.filter(item => item.recordId !== 'three'), catalog, options);
  assert.equal(before.totalCount - after.totalCount, 4);
  assert.equal(after.totalCount, 5);
  assert.equal(after.recordCount, 2);
  assert.equal(after.summary.collectedSpecies, 2);
  assert.equal(after.topSpecies.speciesId, 'local-hanchi');
  assert.equal(records.length, 3);
});

test('statistics E: form "3" converts to 3, while a persisted string remains excluded consistently', () => {
  const raw = [record({ count: '3' })];
  const result = calculate(raw, catalog, options);
  assert.equal(result.totalCount, 0);
  assert.equal(result.recordCount, 0);
  assert.equal(result.invalidCount, 1);
  assert.deepEqual(result.summary, api.summarizeCollection(raw, speciesIds, options.mapSpotIds));
  assert.equal(calculate([record({ count: api.parseCount('3') })], catalog, options).totalCount, 3);
});

test('statistics F: nonnumeric "abc" is excluded without stopping valid records', () => {
  const result = calculate([record({ count: 'abc' }), record({ recordId: 'valid', count: 3 })], catalog, options);
  assert.equal(result.totalCount, 3);
  assert.equal(result.recordCount, 1);
  assert.equal(result.invalidCount, 1);
});

test('statistics reject malformed and duplicate rows without changing collection progress or input', () => {
  const good = record();
  const records = [good, record(), null, undefined, {}, record({ recordId: 'zero', count: 0 }),
    record({ recordId: 'negative', count: -1 }), record({ recordId: 'unknown', speciesId: 'missing' }),
    record({ recordId: 'date', caughtAt: '2024-02-30' }), record({ recordId: 'future', caughtAt: '9999-01-01' }),
    record({ recordId: 'photo', photoBlob: null }), record({ recordId: 'spot', mapSpotId: 999 }),
    record({ recordId: 'location', locationName: undefined })];
  const original = [...records];
  const result = calculate(records, catalog, options);
  assert.equal(result.totalCount, 2);
  assert.equal(result.recordCount, 1);
  assert.equal(result.invalidCount, records.length - 1);
  assert.deepEqual(result.summary, api.summarizeCollection(records, speciesIds, options.mapSpotIds));
  assert.deepEqual(records, original);
  assert.strictEqual(result.recentRecords[0], good);
  for (const input of [undefined, null, {}, 'not records']) {
    assert.equal(calculate(input, catalog, options).recordCount, 0);
  }
  assert.equal(calculate([good], undefined, options).summary.totalSpecies, 0);
});

test('equal species totals prefer the most recently caught species, then a stable ID', () => {
  const records = [record({ speciesId: 'red-seabream', caughtAt: '2024-10-21' }),
    record({ recordId: 'two', speciesId: 'local-hanchi', caughtAt: '2024-10-22' }),
    record({ recordId: 'three', speciesId: 'patterned-squid', caughtAt: '2024-10-22' })];
  const result = calculate(records, catalog, options);
  assert.deepEqual(result.speciesStats.map(species => species.speciesId), ['local-hanchi', 'patterned-squid', 'red-seabream']);
  assert.equal(result.topSpecies.speciesId, 'local-hanchi');
  assert.deepEqual(calculate([...records].reverse(), catalog, options).speciesStats, result.speciesStats);
});

test('recent records keep only five, ordered by caughtAt, createdAt and stable record ID', () => {
  const records = [record({ recordId: 'oldest', caughtAt: '2024-09-01' }),
    record({ recordId: 'a', caughtAt: '2024-10-27' }), record({ recordId: 'b', caughtAt: '2024-10-27' }),
    record({ recordId: 'newer-created', caughtAt: '2024-10-27', createdAt: '2024-10-28T01:00:00.000Z', updatedAt: '2024-10-28T01:00:00.000Z' }),
    record({ recordId: 'latest', caughtAt: '2024-10-28' }), record({ recordId: 'fifth', caughtAt: '2024-10-26' }),
    record({ recordId: 'sixth', caughtAt: '2024-10-25' })];
  assert.deepEqual(calculate(records, catalog, options).recentRecords.map(item => item.recordId), ['latest', 'newer-created', 'a', 'b', 'fifth']);
  assert.equal(records[0].recordId, 'oldest');
});

test('monthly totals include six local calendar months, zero months and the year boundary', () => {
  const records = [record({ recordId: 'outside', caughtAt: '2023-07-31', count: 20 }),
    record({ recordId: 'august', caughtAt: '2023-08-01', count: 3 }),
    record({ recordId: 'december', caughtAt: '2023-12-31', count: 4 }),
    record({ recordId: 'january', caughtAt: '2024-01-01', count: 5 }),
    record({ recordId: 'later', caughtAt: '2024-02-01', count: 40 })];
  const result = calculate(records, catalog, { ...options, now: new Date(2024, 0, 31, 23, 59) });
  assert.deepEqual(result.monthlyStats, [
    { month: '2023-08', totalCount: 3 }, { month: '2023-09', totalCount: 0 },
    { month: '2023-10', totalCount: 0 }, { month: '2023-11', totalCount: 0 },
    { month: '2023-12', totalCount: 4 }, { month: '2024-01', totalCount: 5 },
  ]);
  assert.equal(result.totalCount, 72);
});

test('monthly calculation relies on local calendar getters and literal caughtAt month', () => {
  const localBoundary = {
    getFullYear: () => 2024, getMonth: () => 0,
    toISOString: () => { throw new Error('UTC conversion must not be used'); },
  };
  const records = [record({ caughtAt: '2024-01-01', count: 3 }), record({ recordId: 'dec', caughtAt: '2023-12-31', count: 2 })];
  const result = calculate(records, catalog, { ...options, now: localBoundary });
  assert.deepEqual(result.monthlyStats.slice(-2), [{ month: '2023-12', totalCount: 2 }, { month: '2024-01', totalCount: 3 }]);
});

test('location TOP 5 uses record frequency, trims names and excludes placeholder locations', () => {
  const records = [record({ recordId: 'harbor1', locationName: ' 현사포구 ', count: 1 }),
    record({ recordId: 'harbor2', locationName: '현사포구', count: 1 }),
    record({ recordId: 'harbor3', locationName: '현사포구', count: 1 }),
    record({ recordId: 'lighthouse1', locationName: '도두등대', count: 10 }),
    record({ recordId: 'lighthouse2', locationName: '도두등대', count: 10 }),
    ...['애월항', '한림항', '성산항', '모슬포항'].map((locationName, index) => record({ recordId: `place${index}`, locationName, count: 6 - index })),
    ...['', '  ', '없음', ' undefined ', 'NULL', 'N/A', '-'].map((locationName, index) => record({ recordId: `empty${index}`, locationName, count: 50 }))];
  const result = calculate(records, catalog, options);
  assert.deepEqual(result.locationStats, [
    { locationName: '현사포구', recordCount: 3, totalCount: 3 },
    { locationName: '도두등대', recordCount: 2, totalCount: 20 },
    { locationName: '애월항', recordCount: 1, totalCount: 6 },
    { locationName: '한림항', recordCount: 1, totalCount: 5 },
    { locationName: '성산항', recordCount: 1, totalCount: 4 },
  ]);
  assert.equal(result.recordCount, records.length);
});

test('location normalization shares placeholder handling with recent catch labels', () => {
  for (const value of [undefined, null, 0, {}, '', '  ', '없음', ' undefined ', 'NULL', 'None', 'N/A', '-', '장소 없음', '알 수 없음']) {
    assert.equal(normalizeLocationName(value), '');
  }
  assert.equal(normalizeLocationName(' 현사포구 '), '현사포구');
  assert.equal(normalizeLocationName('도두 등대'), '도두 등대');
});

test('browser module can load before the lazy record module and resolve it at calculation time', () => {
  const sandbox = {};
  vm.runInNewContext(fs.readFileSync(require.resolve('../catch-statistics.js'), 'utf8'), sandbox);
  assert.equal(typeof sandbox.CatchStatistics.calculateCatchStatistics, 'function');
  assert.throws(() => sandbox.CatchStatistics.calculateCatchStatistics([], catalog), /CatchRecords is unavailable/);
  sandbox.CatchRecords = api;
  assert.equal(sandbox.CatchStatistics.calculateCatchStatistics([], catalog, options).recordCount, 0);
});
