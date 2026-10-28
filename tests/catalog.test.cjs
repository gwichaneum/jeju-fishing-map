const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const { once } = require('node:events');
const { test } = require('node:test');
const { createApp } = require('../server.js');
const root = path.resolve(__dirname, '..');
const catalog = require('../species-catalog.json');
const context = vm.createContext({ document: { querySelector: () => null } });
for (const file of ['fishing-spots.js', 'spot-filters.js', 'catalog.js']) {
  vm.runInContext(fs.readFileSync(path.join(root, file), 'utf8'), context, { filename: file });
}
const api = vm.runInContext('({ filter: filterCatalogSpecies, valid: isCatalogSpeciesEntry, related: getCatalogRelatedSpots, progress: getCatalogProgress, emptySummary: createEmptyCatalogSummary, keys: createSpotFilterOptions(fishingSpots).species })', context);

test('static catalog creates a complete gray baseline without any catch module', () => {
  assert.equal(vm.runInContext('typeof CatchRecords', context), 'undefined');
  const summary = api.emptySummary(catalog);
  assert.equal(summary.totalSpecies, 31);
  assert.equal(summary.collectedSpecies, 0);
  assert.equal(summary.progress, 0);
  assert.equal(Object.keys(summary.bySpecies).length, 31);
  assert.ok(Object.values(summary.bySpecies).every(s => s.totalCount === 0 && s.recordCount === 0 && s.collected === false));
  assert.equal(api.emptySummary(null).totalSpecies, 0);
});

test('catalog preserves required targets, stable unique identities and actual map keys', () => {
  assert.ok(catalog.length >= 30);
  assert.equal(new Set(catalog.map(item => item.speciesId)).size, catalog.length);
  assert.equal(new Set(catalog.map(item => item.nameKo)).size, catalog.length);
  for (const name of ['볼락', '감성돔', '참돔', '벵에돔', '전갱이', '고등어', '농어', '광어', '돌돔', '쏨뱅이', '한치', '무늬오징어', '갈치', '갑오징어', '살오징어', '참문어', '주꾸미', '방어', '부시리', '삼치', '숭어', '전어', '학공치', '자리돔', '조피볼락', '자바리', '독가시치', '벤자리', '붕장어', '민어']) assert.ok(catalog.some(item => item.nameKo === name), name);
  for (const item of catalog) {
    assert.ok(api.valid(item), item.speciesId);
    assert.ok(item.mapSpeciesKey === null || api.keys.includes(item.mapSpeciesKey));
    if (item.needsVerification) assert.ok(item.verificationNote);
    if (item.mapSpeciesKey === null && !item.needsVerification) {
      assert.equal(item.mapMatchStatus, 'unavailable');
      assert.ok(item.verificationNote);
    }
  }
});

test('catalog search combines name, actual map spelling, category and state without mutations', () => {
  const before = JSON.stringify(catalog);
  const find = options => Array.from(api.filter(catalog, options), item => item.nameKo);
  assert.equal(find({}).length, catalog.length);
  assert.equal(find({ status: 'uncollected' }).length, catalog.length);
  assert.deepEqual(find({ status: 'collected' }), []);
  assert.deepEqual(find({ query: '무늬', category: 'cephalopod' }), ['무늬오징어']);
  assert.deepEqual(find({ query: '무늬', category: 'fish' }), []);
  assert.deepEqual(find({ query: '학꽁치' }), ['학공치']);
  assert.deepEqual(find({ query: '  SEBASTES  INERMIS  ' }), ['볼락']);
  assert.deepEqual(find({ query: '없는어종123' }), []);
  assert.equal(find({ category: 'fish' }).length + find({ category: 'cephalopod' }).length, catalog.length);
  assert.equal(JSON.stringify(catalog), before);
});

test('collection filters use derived species IDs and keep search/category conditions', () => {
  const collected = new Set(['red-seabream', 'local-hanchi']);
  const find = options => Array.from(api.filter(catalog, options, collected), item => item.nameKo);
  assert.deepEqual(find({ status: 'collected' }), ['참돔', '한치']);
  assert.deepEqual(find({ status: 'collected', category: 'cephalopod' }), ['한치']);
  assert.deepEqual(find({ status: 'collected', query: '무늬' }), []);
  assert.equal(find({ status: 'uncollected' }).length, catalog.length - 2);
});

test('catalog local images have distinct paths, correct bytes and explicit reusable source metadata', () => {
  const images = catalog.filter(item => item.imageSrc);
  assert.equal(images.length, catalog.length, 'every species has a reviewed image');
  assert.equal(new Set(images.map(item => item.imageSrc)).size, images.length);
  assert.equal(new Set(images.map(item => item.imageSha256)).size, images.length);
  for (const item of images) {
    assert.equal(item.imageVerified, true);
    assert.equal(item.needsAsset, false);
    assert.equal(item.imageQualityVerified, true);
    assert.ok(['transparent', 'solid'].includes(item.imageBackground));
    assert.match(item.imageSrc, /^assets\/species\/[a-z0-9-]+\.(?:png|jpe?g|webp|svg)$/);
    const bytes = fs.readFileSync(path.join(root, item.imageSrc));
    assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'), item.imageSha256, item.nameKo);
    assert.ok(bytes.length > 0);
    assert.ok(bytes[0] === 0xff && bytes[1] === 0xd8 || bytes.subarray(1, 4).toString() === 'PNG' || bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP' || /<svg[\s>]/.test(bytes.toString('utf8')));
    assert.equal(path.basename(item.imageSrc, path.extname(item.imageSrc)), item.speciesId);
    assert.match(item.imageSourceUrl, /^https:\/\/(?:commons\.wikimedia\.org\/wiki\/File:|www\.nifs\.go\.kr\/|togotv\.dbcls\.jp\/)/);
    assert.match(item.imageLicense, /^(CC BY|CC0|Public domain|공공누리 제1유형)/);
    assert.ok(item.imageAttribution && item.imageLicenseUrl && item.imageChanges);
  }
  const localFiles = fs.readdirSync(path.join(root, 'assets/species')).filter(file => /\.(png|jpe?g|webp|svg)$/.test(file));
  assert.deepEqual(localFiles.sort(), images.map(item => path.basename(item.imageSrc)).sort(), 'no retired or unused images remain');
});

test('unverified image identity is explicitly pending and never replaced by another fish', () => {
  for (const item of catalog.filter(item => !item.imageSrc)) {
    assert.equal(item.imageSrc, null);
    assert.equal(item.imageVerified, false);
    assert.equal(item.needsAsset, true);
    assert.ok(item.assetNote);
    assert.equal(item.imageSourceUrl, null);
    assert.equal(item.needsVerification, true);
    assert.ok(item.verificationNote);
  }
  const hanchi = catalog.find(item => item.nameKo === '한치');
  assert.equal(hanchi.scientificName, undefined);
  assert.equal(catalog.find(item => item.nameKo === '쏨뱅이').mapSpeciesKey, null);
  assert.equal(catalog.find(item => item.nameKo === '살오징어').mapSpeciesKey, null);
});

test('catalog progress uses actual species identities and counts no unknown or duplicate collections', () => {
  assert.deepEqual(JSON.parse(JSON.stringify(api.progress(catalog))), { collected: 0, total: catalog.length, percent: 0 });
  const ids = new Set([catalog[0].speciesId, catalog[0].speciesId, 'not-a-species']);
  assert.equal(api.progress(catalog, ids).collected, 1);
  assert.equal(api.progress([], ids).percent, 0);
});

test('catalog related points preserve memo/report provenance and unresolved locations', () => {
  const flounder = api.related(catalog.find(item => item.nameKo === '광어'));
  assert.equal(flounder.length, 1);
  assert.equal(flounder[0].id, 38);
  assert.equal(flounder[0].evidence, 'memo');
  assert.deepEqual(Array.from(api.related(catalog.find(item => item.nameKo === '쏨뱅이'))), []);
  const squid = api.related(catalog.find(item => item.nameKo === '무늬오징어'));
  assert.ok(squid.some(spot => !spot.hasLocation));
  assert.ok(squid.some(spot => spot.evidence === 'public'));
  assert.ok(squid.some(spot => spot.evidence === 'memo'));
});

test('browser catalog rejects unsafe image paths and malformed fetched entries', () => {
  const first = catalog.find(item => item.imageSrc);
  for (const imageSrc of ['https://example.org/fish.jpg', 'assets/species/../../.env', 'assets/species/a.jpg?x', 'assets/species/<script>.jpg']) assert.equal(Boolean(api.valid({ ...first, imageSrc })), false);
  assert.equal(Boolean(api.valid({ ...first, methods: null })), false);
  assert.equal(Boolean(api.valid({ ...first, imageVerified: false })), false);
  assert.equal(Boolean(api.valid({ ...first, informationSources: [null] })), false);
});

test('Express serves only catalog resources and registered species images without widening private access', async t => {
  const server = createApp().listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const origin = `http://127.0.0.1:${server.address().port}`;
  for (const file of ['/catalog.html', '/catalog.css', '/catalog.js', '/catch-records.js', '/catch-record-ui.js', '/species-catalog.json', ...catalog.filter(item => item.imageSrc).map(item => '/' + item.imageSrc)]) {
    const result = await fetch(origin + file);
    assert.equal(result.status, 200, file);
    await result.arrayBuffer();
  }
  for (const file of ['/.env', '/assets/species/ATTRIBUTION.md', '/assets/species/nonexistent.jpg', '/assets/species/local-hanchi.jpg', '/assets/species/patterned-squid.jpg', '/.verify/phase2-catalog-staging.json', '/server.js', '/skills/fish-catalog-manager/SKILL.md']) assert.equal((await fetch(origin + file)).status, 404, file);
});
