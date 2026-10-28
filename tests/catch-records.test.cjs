const assert = require('node:assert/strict');
const { test } = require('node:test');
const api = require('../catch-records.js');
const record = (changes = {}) => ({
  recordId: 'one', speciesId: 'red-seabream', caughtAt: '2026-10-27', count: 2,
  photoBlob: new Blob(['shape fixture, not a browser image'], { type: 'image/png' }),
  photoName: 'trip.png', photoType: 'image/png', locationName: '', mapSpotId: null, memo: '',
  createdAt: '2026-10-28T00:00:00.000Z', updatedAt: '2026-10-28T00:00:00.000Z', ...changes,
});
const ids = ['red-seabream', 'local-hanchi'];

test('catch form converts decimal digits, while persisted numeric strings stay invalid', () => {
  assert.equal(api.parseCount(' 02 '), 2);
  assert.equal(api.parseCount(3), 3);
  for (const value of ['', ' ', '2.1', '2e2', 'Infinity', 'NaN', 'fish', 0, -1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1]) assert.ok(Number.isNaN(api.parseCount(value)), String(value));
  assert.equal(api.validateCatchRecord(record({ count: '2' }), ids).valid, false);
  assert.equal(api.validateCatchRecord(record(), ids).valid, true);
});

test('catch validation rejects mismatched photo metadata, future dates, unknown identities and malformed text', () => {
  for (const changes of [
    { photoName: '' }, { photoType: 'image/jpeg' }, { photoBlob: null },
    { caughtAt: '2026-02-30' }, { caughtAt: '9999-12-31' }, { speciesId: 'missing' },
    { mapSpotId: 999 }, { locationName: null }, { memo: '<'.repeat(2001) },
    { updatedAt: '2026-10-27T00:00:00.000Z' },
  ]) assert.equal(api.validateCatchRecord(record(changes), ids, [1]).valid, false, JSON.stringify(changes));
  assert.equal(api.validateCatchRecord(record({ mapSpotId: 1 }), ids, [1]).valid, true);
});

test('photo validation enforces the documented byte and MIME limits', () => {
  for (const blob of [new Blob([], {type:'image/png'}), new Blob(['x'], {type:'text/plain'}),
    new Blob(['<svg/>'], {type:'image/svg+xml'}), new Blob(['x'], {type:'image/heic'}),
    new Blob([new Uint8Array(api.MAX_PHOTO_BYTES + 1)], {type:'image/png'})]) assert.ok(api.photoError(blob));
  assert.equal(api.photoError(new Blob(['x'], {type:'image/webp'})), '');
});

test('photo inspection rejects forged image MIME before invoking the browser decoder', async () => {
  for (const text of ['plain text', '<svg xmlns="http://www.w3.org/2000/svg"/>']) {
    await assert.rejects(api.inspectPhoto(new Blob([text], {type:'image/png'})),error=>error.code==='PHOTO');
  }
});

test('collection derives dates, unlock and precise progress from valid unique records without mutations', () => {
  const rows = [record(), record({ recordId:'two',count:3,caughtAt:'2026-10-28' }),
    record({ recordId:'hanchi', speciesId:'local-hanchi',count:1 }), record({recordId:'broken',count:0}), record()];
  const before = rows.map(row=>({...row}));
  const summary = api.summarizeCollection(rows, ids);
  assert.deepEqual(summary.bySpecies['red-seabream'], {totalCount:5,recordCount:2,collected:true,firstCaughtAt:'2026-10-27',lastCaughtAt:'2026-10-28'});
  assert.equal(summary.bySpecies['local-hanchi'].totalCount,1);
  assert.equal(summary.collectedSpecies,2);
  assert.deepEqual(rows,before);
  const allIds = [ids[0], ...Array.from({length:30},(_,i)=>'other-'+i)];
  assert.equal(api.summarizeCollection([record()],allIds).progress,100/31);
  assert.equal(api.summarizeCollection([],ids).bySpecies[ids[0]].collected,false);
  assert.equal(api.summarizeCollection([],[]).progress,0);
});

test('missing/null record arrays and broken rows never crash empty collection summaries', () => {
  for (const rows of [undefined, null, {}, 'not-records', [null, undefined, {}, record({photoBlob:null}), record({count:'2'})]]) {
    const summary = api.summarizeCollection(rows, ids);
    assert.equal(summary.collectedSpecies, 0);
    assert.equal(summary.bySpecies[ids[0]].recordCount, 0);
  }
  assert.equal(api.summarizeCollection(undefined, undefined).totalSpecies, 0);
  assert.equal(api.validateCatchRecord(record(), undefined).valid, false);
});

test('record ordering follows catch date, then creation time, with deterministic ties', () => {
  const rows = [record({recordId:'a'}),record({recordId:'b',caughtAt:'2026-10-28'}),record({recordId:'c',caughtAt:'2026-10-28',createdAt:'2026-10-28T01:00:00.000Z',updatedAt:'2026-10-28T01:00:00.000Z'})];
  assert.deepEqual(api.sortRecords(rows).map(row=>row.recordId),['c','b','a']);
  assert.deepEqual(rows.map(row=>row.recordId),['a','b','c']);
});

test('local date uses calendar getters and UUID fallback uses secure random bytes', () => {
  assert.equal(api.localDate({getFullYear:()=>2026,getMonth:()=>0,getDate:()=>1}), '2026-01-01');
  const fakeCrypto = {getRandomValues:bytes=>{bytes.fill(170);return bytes;}};
  assert.match(api.createRecordId(fakeCrypto), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.throws(()=>api.createRecordId({}), error=>error.code==='UNSUPPORTED');
});

test('unavailable storage and safe error messages never expose raw record or upstream data', async () => {
  const store = api.createCatchRecordStore({ speciesIds:ids, indexedDB:null });
  await assert.rejects(store.loadAll(),error=>error.code==='UNSUPPORTED');
  assert.match(api.storageErrorMessage({name:'QuotaExceededError',message:'private fixture text'}),/저장 공간/);
  assert.match(api.storageErrorMessage(new api.CatchRecordError('UNSUPPORTED')),/브라우저/);
  assert.ok(!api.storageErrorMessage(new Error('private fixture text')).includes('private fixture text'));
});
