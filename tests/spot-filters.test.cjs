const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ document: { querySelector: () => null } });
for (const file of ["fishing-spots.js", "spot-filters.js", "script.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
}
const { spots, search, filter, options, displayable, typeOf } = vm.runInContext(
  "({ spots: fishingSpots, search: searchSpots, filter: filterSpots, options: createSpotFilterOptions, displayable: isDisplayableFishingSpot, typeOf: getSpotFilterType })", context
);
const ids = values => Array.from(values, spot => spot.id);
const sourceData = JSON.stringify(spots);

test("search covers name, address, region, memo, aliases and fishing fields", () => {
  for (const [query, expected] of [
    ["현사포구", 67], ["테우해안로 143", 67], ["성산", 15], ["태흥", 16],
    ["태흥1리", 6], ["애월", 23], ["구멍치기", 39], ["제주항 서부두", 43],
    ["무늬", 3], ["벵에", 16], ["갈치", 45], ["점다랑어", 43],
  ]) assert.ok(ids(search(spots, query)).includes(expected), query);
  assert.equal(search(spots, "   ").length, 69);
  assert.equal(search(spots, "없는낚시터987654").length, 0);
  assert.equal(search([{ ...spots[0], name: "JEJU Pier" }], "  jeju   PIER ").length, 1);
  assert.equal(search([{ ...spots[0], name: "ＡＢＣ" }], "abc").length, 1);
});

test("filter menus contain only real data or explicitly recognized memo terms", () => {
  const catalog = options(spots);
  for (const fish of ["무늬오징어", "광어", "갈치", "점다랑어", "잿방어"]) assert.ok(catalog.species.includes(fish));
  for (const method of ["에깅", "원투", "루어", "서프루어", "구멍치기"]) assert.ok(catalog.methods.includes(method));
  assert.deepEqual(Array.from(catalog.types), ["fishing-spot", "personal-spot", "access-point"]);
  assert.equal(new Set(catalog.species).size, catalog.species.length);
  assert.equal(new Set(catalog.methods).size, catalog.methods.length);
  for (const species of catalog.species) assert.ok(filter(spots, { species }).length, species);
  for (const method of catalog.methods) assert.ok(filter(spots, { method }).length, method);
  const empty = options([{ ...spots[0], species: [], methods: [], userNote: "발판 좋음" }]);
  assert.equal(empty.species.length, 0);
  assert.equal(empty.methods.length, 0);
});

test("memo-only fish and methods match without promoting them to verified arrays", () => {
  assert.ok(ids(filter(spots, { species: "무늬오징어" })).includes(3));
  assert.deepEqual(ids(filter(spots, { species: "광어" })), [38]);
  assert.deepEqual(ids(filter(spots, { method: "서프루어" })), [2, 37]);
  assert.deepEqual(ids(filter(spots, { method: "구멍치기" })), [39]);
  assert.ok(!ids(filter(spots, { method: "루어" })).includes(37));
  assert.ok(!ids(filter(spots, { species: "오징어" })).includes(3));
  assert.deepEqual(ids(filter(spots, { species: "갈치" })), [23, 43, 45]);
});

test("different filter groups and multiple search words use AND semantics", () => {
  assert.deepEqual(ids(filter(spots, { query: "성산", species: "무늬오징어", type: "access-point" })), [4]);
  assert.deepEqual(ids(filter(spots, { query: "태흥", species: "무늬오징어", method: "에깅", type: "fishing-spot" })), [16]);
  assert.deepEqual(ids(filter(spots, { species: "무늬오징어", method: "에깅", type: "personal-spot" })), []);
  assert.deepEqual(ids(filter(spots, { species: "참돔", method: "없는방법" })), []);
});

test("filter types follow kind, not the provenance or marker color", () => {
  assert.deepEqual(ids(filter(spots, { type: "personal-spot" }).filter(displayable)), [8, 68, 69]);
  assert.deepEqual(ids(filter(spots, { type: "access-point" }).filter(displayable)), [4, 39]);
  assert.equal(filter(spots, { type: "fishing-spot" }).filter(displayable).length, 39);
  assert.equal(typeOf(spots.find(spot => spot.id === 8)), "personal-spot");
  assert.equal(typeOf(spots.find(spot => spot.id === 4)), "access-point");
});

test("unverified results stay searchable but never become map markers", () => {
  const matches = filter(spots, { query: "태흥1리" });
  assert.deepEqual(ids(matches), [6]);
  assert.equal(matches.filter(displayable).length, 0);
  assert.equal(filter(spots).filter(displayable).length, 44);
});

test("all search and filter operations leave the original data untouched", () => {
  const catalog = options(spots);
  for (const species of catalog.species) filter(spots, { query: "제주", species });
  for (const method of catalog.methods) filter(spots, { method });
  for (const type of catalog.types) filter(spots, { type });
  assert.equal(JSON.stringify(spots), sourceData);
});
