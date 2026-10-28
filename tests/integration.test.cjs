const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { test } = require('node:test');
const catalog = require('../species-catalog.json');
const context = vm.createContext({ URLSearchParams, document: { querySelector: () => null } });
for (const file of ['fishing-spots.js', 'spot-filters.js', 'script.js', 'catalog.js']) {
  vm.runInContext(fs.readFileSync(require('node:path').join(__dirname, '..', file), 'utf8'), context);
}
const api = vm.runInContext('({read: readSpeciesQuery, url: speciesPageUrl, filter: filterSpots, related: getCatalogRelatedSpots, evidence: getSpotSpeciesEvidence, spots: fishingSpots, displayable: isDisplayableFishingSpot, keys: createSpotFilterOptions(fishingSpots).species})', context);

test('map and catalog query contracts round-trip distinct identities and reject ambiguous input', () => {
  for (const item of catalog) {
    const detail = api.url('./catalog.html', item.speciesId);
    assert.equal(api.read(detail.slice(detail.indexOf('?')), catalog.map(s => s.speciesId)).value, item.speciesId);
    if (item.mapSpeciesKey) {
      const map = api.url('./index.html', item.mapSpeciesKey);
      assert.equal(api.read(map.slice(map.indexOf('?')), api.keys).value, item.mapSpeciesKey);
      assert.equal(api.read('?species=' + item.speciesId, api.keys).invalid, true);
    }
  }
  for (const query of ['?species=', '?species=없는어종', '?species=무늬', '?species=%3Cscript%3E', '?species=%E0%A4%A', '?species=한치&species=한치']) {
    assert.equal(api.read(query, api.keys).invalid, true, query);
    assert.equal(api.read(query, api.keys).value, '');
  }
  assert.equal(api.read('', api.keys).invalid, false);
  assert.equal(api.url('./index.html', null), './index.html');
});

test('related counts and map marker eligibility use the same source and preserve evidence', () => {
  for (const item of catalog) {
    const related = api.related(item);
    const matches = item.mapSpeciesKey ? api.filter(api.spots, { species: item.mapSpeciesKey }) : [];
    assert.deepEqual(Array.from(related, s => s.id), Array.from(matches, s => s.id));
    assert.equal(related.filter(s => s.hasLocation).length, matches.filter(api.displayable).length);
  }
  const squid = api.related(catalog.find(s => s.speciesId === 'patterned-squid'));
  assert.equal(squid.length, 23);
  assert.equal(squid.filter(s => s.hasLocation).length, 14);
  assert.ok(squid.some(s => s.evidence === 'memo'));
  assert.ok(squid.some(s => s.evidence === 'public'));
  assert.ok(catalog.some(item => api.related(item).some(s => s.evidence === 'report')));
});

test('reviewed memo abbreviations match whole terms and never become public claims', () => {
  const spot = { species: [], reportedSpecies: [], methods: [], userNote: '무늬, 벵에 포인트 / 발판 좋음' };
  assert.equal(api.evidence(spot, '무늬오징어'), 'memo');
  assert.equal(api.evidence(spot, '벵에돔'), 'memo');
  assert.equal(api.evidence(spot, '쏨뱅이'), null);
  assert.equal(api.evidence({ ...spot, userNote: '무늬목, 벵에돔아님' }, '무늬오징어'), null);
  assert.equal(api.evidence({ ...spot, userNote: '무늬목, 벵에돔아님' }, '벵에돔'), null);
  assert.deepEqual(spot.species, []);
});
