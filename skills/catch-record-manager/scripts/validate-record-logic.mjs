import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const nonempty = value => typeof value === 'string' && value.trim().length > 0;
const maxPhotoBytes = 10 * 1024 * 1024;
const photoTypes = new Set(['image/jpeg', 'image/png', 'image/webp']);

function validDate(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00.000Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function validTimestamp(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)) return false;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) && date.toISOString() === value;
}

// Validator fixture checks only. Actual application checks import the shared runtime module below.
export function validateRecordShape(record, speciesIds, mapSpotIds = []) {
  const errors = [];
  if (!record || typeof record !== 'object' || Array.isArray(record)) return ['Record must be an object.'];
  if (!nonempty(record.recordId)) errors.push('recordId is required.');
  if (!speciesIds.includes(record.speciesId)) errors.push('Unknown speciesId.');
  if (!validDate(record.caughtAt)) errors.push('caughtAt must be a real YYYY-MM-DD date.');
  else {
    const today = new Date();
    const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    if (record.caughtAt > localToday) errors.push('caughtAt cannot be in the future.');
  }
  if (!Number.isSafeInteger(record.count) || record.count <= 0) errors.push('count must be a positive safe integer.');
  if (!(record.photoBlob instanceof Blob) || !photoTypes.has(record.photoBlob.type)
    || record.photoBlob.size <= 0 || record.photoBlob.size > maxPhotoBytes) errors.push('Invalid photo Blob/type/size.');
  if (!nonempty(record.photoName)) errors.push('photoName is required.');
  if (record.photoType !== record.photoBlob?.type) errors.push('photoType must match the Blob.');
  if (record.mapSpotId !== null && (!Number.isSafeInteger(record.mapSpotId) || !mapSpotIds.includes(record.mapSpotId))) errors.push('Unknown mapSpotId.');
  for (const field of ['locationName', 'memo']) if (typeof record[field] !== 'string') errors.push(`${field} must be a string.`);
  for (const field of ['createdAt', 'updatedAt']) if (!validTimestamp(record[field])) errors.push(`${field} must be an ISO UTC timestamp.`);
  if (validTimestamp(record.createdAt) && validTimestamp(record.updatedAt) && record.updatedAt < record.createdAt) errors.push('updatedAt precedes createdAt.');
  return errors;
}

function fixtures() {
  // Byte fixtures test the contract; browser image decoding is tested separately.
  const first = {
    recordId: 'fixture-1', speciesId: 'fixture-a', caughtAt: '2026-10-28', count: 2,
    photoBlob: new Blob(['fixture photo bytes'], { type: 'image/png' }),
    photoName: 'fixture.png', photoType: 'image/png',
    locationName: '', mapSpotId: 1, memo: '',
    createdAt: '2026-10-28T00:00:00.000Z', updatedAt: '2026-10-28T00:00:00.000Z',
  };
  return {
    first,
    second: { ...first, recordId: 'fixture-2', count: 3 },
    other: { ...first, recordId: 'fixture-3', speciesId: 'fixture-b', count: 9 },
    speciesIds: ['fixture-a', 'fixture-b'],
    mapSpotIds: [1],
  };
}

function invalidCases(first) {
  return [
    ['zero count', { ...first, count: 0 }],
    ['negative count', { ...first, count: -1 }],
    ['fractional count', { ...first, count: 1.5 }],
    ['unsafe count', { ...first, count: Number.MAX_SAFE_INTEGER + 1 }],
    ['numeric string count policy', { ...first, count: '2' }],
    ['blank count', { ...first, count: '' }],
    ['text count', { ...first, count: 'two' }],
    ['NaN count', { ...first, count: NaN }],
    ['infinite count', { ...first, count: Infinity }],
    ['unknown species', { ...first, speciesId: 'missing' }],
    ['unknown spot', { ...first, mapSpotId: 999 }],
    ['not Blob', { ...first, photoBlob: 'data:image/png;base64,AA==' }],
    ['wrong MIME', { ...first, photoBlob: new Blob(['x'], { type: 'text/plain' }) }],
    ['empty photo', { ...first, photoBlob: new Blob([], { type: 'image/png' }) }],
    ['oversized photo', { ...first, photoBlob: new Blob([new Uint8Array(maxPhotoBytes + 1)], { type: 'image/png' }) }],
    ['impossible date', { ...first, caughtAt: '2026-02-30' }],
    ['missing date', { ...first, caughtAt: '' }],
    ['future date', { ...first, caughtAt: '9999-12-31' }],
    ['missing photo name', { ...first, photoName: '' }],
    ['photo type mismatch', { ...first, photoType: 'image/jpeg' }],
    ['timestamp not date', { ...first, caughtAt: first.createdAt }],
    ['invalid createdAt', { ...first, createdAt: '2026-02-30T00:00:00.000Z' }],
    ['reversed timestamps', { ...first, updatedAt: '2026-10-27T00:00:00.000Z' }],
    ['missing ID', { ...first, recordId: '' }],
    ['malformed row', null],
  ];
}

export async function checkRecordModule(moduleFile) {
  const imported = await import(pathToFileURL(path.resolve(moduleFile)).href);
  const api = typeof imported.validateCatchRecord === 'function' ? imported : imported.default;
  assert.equal(typeof api?.validateCatchRecord, 'function', 'Actual module must export validateCatchRecord.');
  assert.equal(typeof api?.summarizeCollection, 'function', 'Actual module must export summarizeCollection.');
  const { first, second, other, speciesIds, mapSpotIds } = fixtures();
  for (const record of [first, second, other, { ...first, mapSpotId: null }]) {
    const result = await api.validateCatchRecord(record, speciesIds, mapSpotIds);
    assert.equal(result?.valid, true, 'Valid contract fixture rejected.');
    assert.ok(Array.isArray(result.errors) && result.errors.length === 0, 'Valid result requires empty errors.');
  }
  for (const [label, record] of invalidCases(first)) {
    const result = await api.validateCatchRecord(record, speciesIds, mapSpotIds);
    assert.equal(result?.valid, false, `Invalid input accepted: ${label}`);
    assert.ok(Array.isArray(result.errors) && result.errors.length > 0, `Missing errors: ${label}`);
  }
  const scenarios = [
    ['initial', [], 0, 0, false, 0, 0],
    ['first catch', [first], 2, 1, true, 1, 50],
    ['2 + 3', [first, second], 5, 2, true, 1, 50],
    ['edit 2 to 4', [{ ...first, count: 4 }, second], 7, 2, true, 1, 50],
    ['edit 3 to 4', [first, { ...second, count: 4 }], 6, 2, true, 1, 50],
    ['delete first', [second], 3, 1, true, 1, 50],
    ['delete second', [first], 2, 1, true, 1, 50],
    ['delete last', [], 0, 0, false, 0, 0],
    ['isolate other species', [first, second, other], 5, 2, true, 2, 100],
  ];
  for (const [label, records, totalCount, recordCount, collected, collectedSpecies, progress] of scenarios) {
    const summary = await api.summarizeCollection(records, speciesIds);
    const actual = summary?.bySpecies?.['fixture-a'];
    assert.ok(actual, `${label}: missing species summary.`);
    assert.equal(actual.totalCount, totalCount, `${label}: totalCount`);
    assert.equal(actual.recordCount, recordCount, `${label}: recordCount`);
    assert.equal(actual.collected, collected, `${label}: collected`);
    assert.equal(summary.collectedSpecies, collectedSpecies, `${label}: collectedSpecies`);
    assert.equal(summary.totalSpecies, 2, `${label}: totalSpecies`);
    assert.equal(summary.progress, progress, `${label}: progress`);
    assert.equal(summary.bySpecies['fixture-b'].totalCount, records.includes(other) ? 9 : 0, `${label}: other species`);
  }
  const empty = await api.summarizeCollection([], []);
  assert.equal(empty.totalSpecies, 0);
  assert.equal(empty.collectedSpecies, 0);
  assert.equal(empty.progress, 0);
  const corrupt = await api.summarizeCollection([first, first, { ...second, count: '3' }, { ...other, speciesId: 'missing' }], speciesIds);
  assert.equal(corrupt.bySpecies['fixture-a'].totalCount, 2, 'ignore duplicate IDs and invalid stored rows');
  assert.equal(corrupt.collectedSpecies, 1);
  const accurate = await api.summarizeCollection([first], Array.from({ length: 31 }, (_, i) => i ? `unused-${i}` : 'fixture-a'));
  assert.equal(accurate.progress, 100 / 31, 'keep full progress precision internally');
  console.log(`PASS actual record module: ${scenarios.length} aggregate scenarios, valid inputs and ${invalidCases(first).length} rejected inputs. IndexedDB/browser I/O not tested.`);
}

function selfTest() {
  const { first, speciesIds, mapSpotIds } = fixtures();
  assert.deepEqual(validateRecordShape(first, speciesIds, mapSpotIds), []);
  assert.deepEqual(validateRecordShape({ ...first, mapSpotId: null }, speciesIds, mapSpotIds), []);
  for (const [label, record] of invalidCases(first)) assert.ok(validateRecordShape(record, speciesIds, mapSpotIds).length > 0, label);
  console.log(`PASS validator self-test: record schema fixtures, ${invalidCases(first).length} invalid inputs. App aggregates/IndexedDB not tested.`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length === 1 && args[0] === '--self-test') { selfTest(); return; }
  if (args.length === 0) { console.log('SKIP records: no --module supplied; app record logic/IndexedDB not implemented or validated.'); return; }
  if (args.length !== 2 || args[0] !== '--module' || args[1].startsWith('--')) throw new Error('Usage: validate-record-logic.mjs [--module actual-module.cjs] | --self-test');
  await checkRecordModule(args[1]);
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(error => { console.error(`FAIL record validator: ${error.message}`); process.exitCode = 1; });
}
