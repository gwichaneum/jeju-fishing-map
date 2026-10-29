const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const vm = require('node:vm');
const api = require('../catch-records.js');
const { calculateCatchStatistics: calculate } = require('../catch-statistics.js');
const catalog = require('../species-catalog.json');
const spots = vm.runInNewContext(fs.readFileSync(require.resolve('../fishing-spots.js'), 'utf8') + ';fishingSpots');
const ids = catalog.map(row => row.speciesId);
const stamp = '2026-10-28T00:00:00.000Z';
const custom = (changes = {}) => ({ customLocationId: 'custom-one', name: '나만의 갯바위', address: '',
  latitude: null, longitude: null, memo: '', createdAt: stamp, updatedAt: stamp, ...changes });
const record = (changes = {}) => ({ recordId: 'one', speciesId: ids[0], caughtAt: '2026-10-28', count: 2,
  photoBlob: new Blob(['metadata only'], { type: 'image/png' }), photoName: 'test.png', photoType: 'image/png',
  locationName: '', memo: '', createdAt: stamp, updatedAt: stamp, ...changes });
const options = { mapSpots: spots, mapSpotIds: spots.map(spot => spot.id), customLocations: [custom()] };

test('location search reads actual map names, regions, addresses and optional aliases without changing them', () => {
  const before = JSON.stringify(spots);
  assert.ok(api.searchLocations(spots, [], '도두').some(row => row.id === 48 && row.name === '도두등대'));
  assert.ok(api.searchLocations(spots, [], '현사').some(row => row.id === 67));
  assert.ok(api.searchLocations(spots, [], '성산').length > 0);
  const fixture = [{ id: 1, name: 'Harbor', region: 'West', address: 'JEJU 123', aliases: ['Old Pier'] }];
  for (const query of ['HARB', 'west', 'jeju', 'old']) assert.equal(api.searchLocations(fixture, [], query)[0].id, 1);
  assert.equal(JSON.stringify(spots), before);
});

test('location search includes persisted custom locations, limits results and prioritizes names', () => {
  assert.equal(api.searchLocations(spots, [custom()], '갯바위').find(row => row.customLocationId)?.source, 'custom');
  assert.equal(api.searchLocations(spots, [], '제주').length, 8);
  assert.deepEqual(api.searchLocations(spots, [], ' '), []);
  assert.deepEqual(api.searchLocations(spots, [], '없는장소-123'), []);
  const matches = api.searchLocations([{ id: 1, name: '다른 항', region: '현사' }, { id: 2, name: '현사포구' }], [], '현사');
  assert.equal(matches[0].id, 2);
});

test('new places reject exact duplicate names but keep similar names distinct', () => {
  assert.equal(api.findDuplicateLocation(spots, [], '도두등대').source, 'map');
  assert.equal(api.findDuplicateLocation(spots, [custom()], '나만의 갯바위').source, 'custom');
  assert.equal(api.findDuplicateLocation(spots, [custom()], '나만의갯바위'), null);
  assert.equal(api.findDuplicateLocation(spots, [], '도두항 방파제'), null);
});

test('custom locations allow name-only registration and validate optional coordinates and metadata', () => {
  assert.equal(api.validateCustomLocation(custom()).valid, true);
  assert.equal(api.validateCustomLocation(custom({ latitude: 0, longitude: 0 })).valid, true);
  for (const changes of [{ name: '' }, { name: 'x'.repeat(121) }, { latitude: 91 }, { longitude: -181 },
    { latitude: NaN }, { latitude: '33' }, { address: 'x'.repeat(301) }, { memo: 'x'.repeat(2001) }, { updatedAt: 'bad' }]) {
    assert.equal(api.validateCustomLocation(custom(changes)).valid, false, JSON.stringify(changes));
  }
});

test('record validation accepts old records with no location IDs and checks new references', () => {
  assert.equal(api.validateCatchRecord(record({ locationName: '과거 장소' }), ids, options.mapSpotIds).valid, true);
  assert.equal(api.validateCatchRecord(record({ customLocationId: 'custom-one' }), ids).valid, true);
  for (const changes of [{ customLocationId: '' }, { customLocationId: 1 }, { customLocationId: 'custom-one', mapSpotId: 48 }]) {
    assert.equal(api.validateCatchRecord(record(changes), ids, options.mapSpotIds).valid, false);
  }
});

test('statistics group map IDs with stale labels under the current official name', () => {
  const rows = [record({ mapSpotId: 48, locationName: '도두 옛 이름' }),
    record({ recordId: 'two', count: 3, mapSpotId: 48, locationName: '다른 이름' })];
  assert.deepEqual(calculate(rows, catalog, options).locationStats, [{ locationName: '도두등대', recordCount: 2, totalCount: 5 }]);
});

test('statistics include custom IDs, keep distinct IDs separate and never infer similar legacy names', () => {
  const rows = [record({ customLocationId: 'custom-one', locationName: '옛 이름' }),
    record({ recordId: 'two', customLocationId: 'custom-one', count: 3, locationName: '다른 이름' }),
    record({ recordId: 'three', locationName: '나만의 갯바위' }),
    record({ recordId: 'four', mapSpotId: 48, locationName: '도두등대' }),
    record({ recordId: 'five', locationName: '도두 등대' })];
  const result = calculate(rows, catalog, options);
  assert.equal(result.recordCount, 5);
  assert.equal(result.locationStats.length, 4);
  assert.deepEqual(result.locationStats[0], { locationName: '나만의 갯바위', recordCount: 2, totalCount: 5 });
});

test('only exact unambiguous official names join legacy records without mutating persisted fields', () => {
  const rows = [record({ mapSpotId: 48, locationName: '옛 이름' }),
    record({ recordId: 'exact', locationName: '도두등대' }),
    record({ recordId: 'similar', locationName: '도두 등대' }),
    record({ recordId: 'space', locationName: ' 도두등대 ' })];
  const before = rows.map(row => ({ ...row }));
  const stats = calculate(rows, catalog, options).locationStats;
  assert.equal(stats.find(row => row.recordCount === 2).locationName, '도두등대');
  assert.equal(stats.length, 3);
  assert.deepEqual(rows, before);
  const ambiguous = calculate([record({ locationName: '동명항' }), record({ recordId: 'id', mapSpotId: 1, locationName: '동명항' })], catalog,
    { mapSpots: [{ id: 1, name: '동명항' }, { id: 2, name: '동명항' }] });
  assert.equal(ambiguous.locationStats.length, 2);
});
