const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ document: { querySelector: () => null } });
for (const name of ["fishing-spots.js", "restrooms.js", "script.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, name), "utf8"), context);
}
const { spots, toilets, metadata, distance, nearest, displayable } = vm.runInContext(
  "({ spots: fishingSpots, toilets: restrooms, metadata: restroomDataset, distance: haversineDistanceMeters, nearest: findNearbyRestroom, displayable: isDisplayableFishingSpot })",
  context
);
const origin = { latitude: 33.5, longitude: 126.5, needsVerification: false };
const atDistance = (meters, id = "fixture") => ({
  id, name: id, address: "제주특별자치도 제주시", openHours: "정보 없음",
  latitude: origin.latitude + meters / 6371000 * 180 / Math.PI,
  longitude: origin.longitude,
});

test("static restrooms contain only identified Jeju records with explicit provenance", () => {
  assert.equal(toilets.length, 147);
  assert.equal(new Set(toilets.map(toilet => toilet.id)).size, 147);
  assert.equal(toilets.filter(toilet => toilet.id.startsWith("jejusi-")).length, 141);
  assert.equal(toilets.filter(toilet => toilet.id.startsWith("poopoo-")).length, 6);
  assert.equal(metadata.sourceRecordCount, 503);
  assert.equal(metadata.dataDate, "2025-12-31");
  assert.equal(metadata.reviewedOn, "2026-10-01");
  for (const toilet of toilets) {
    assert.ok(toilet.address.startsWith("제주특별자치도 "));
    assert.ok(Number.isFinite(toilet.latitude) && toilet.latitude > 33.1 && toilet.latitude < 33.65);
    assert.ok(Number.isFinite(toilet.longitude) && toilet.longitude > 126.1 && toilet.longitude < 126.98);
    if (toilet.id.startsWith("jejusi-")) {
      assert.equal(toilet.dataDate, metadata.dataDate);
      assert.equal(toilet.sourceUrl, "https://www.data.go.kr/data/15110521/fileData.do");
      assert.ok(["공중화장실", "개방화장실", "간이화장실"].includes(toilet.type));
    } else {
      assert.equal(toilet.dataDate, "2024-07-19");
      assert.equal(toilet.source, "POOPOO · 공공데이터 참고");
      assert.equal(toilet.sourceUrl, `https://www.poopoo.co.kr/toilet/${toilet.id.slice(7)}`);
      assert.equal(toilet.type, undefined);
      assert.ok(toilet.manager);
    }
    assert.ok(toilet.name && toilet.openHours && toilet.source);
  }
  assert.ok(!toilets.some(toilet => toilet.id === "jejusi-PT0363"));
  assert.ok(toilets.some(toilet => toilet.openHours === "정보 없음"));
});

test("Haversine is symmetric and handles zero, antipodes and invalid coordinates", () => {
  assert.equal(distance(origin, origin), 0);
  const north = { ...origin, latitude: 34.5 };
  assert.ok(Math.abs(distance(origin, north) - 111194.9266) < 0.01);
  assert.equal(distance(origin, north), distance(north, origin));
  assert.ok(Number.isFinite(distance({ latitude: 0, longitude: 0 }, { latitude: 0, longitude: 180 })));
  for (const change of [{ latitude: null }, { longitude: "126.5" }, { latitude: NaN }, { longitude: Infinity }, { latitude: 91 }, { longitude: -181 }]) {
    assert.equal(distance(origin, { ...origin, ...change }), Infinity);
  }
});

test("the nearest eligible restroom is selected by distance rather than list order", () => {
  const near = atDistance(100, "near");
  const result = nearest(origin, [atDistance(450, "far"), near, atDistance(200, "middle")]);
  assert.equal(result.status, "nearby");
  assert.equal(result.restroom.id, "near");
  assert.ok(Math.abs(result.distanceMeters - 100) < 0.001);
});

test("500m filtering uses the exact distance before display rounding", () => {
  assert.equal(nearest(origin, [atDistance(499.9)]).status, "nearby");
  assert.equal(nearest(origin, [atDistance(500.1)]).status, "no-confirmed-info");
  const boundary = atDistance(500);
  assert.equal(nearest(origin, [boundary], distance(origin, boundary)).status, "nearby");
  assert.equal(nearest(origin, [atDistance(501)]).status, "no-confirmed-info");
});

test("non-Jeju, invalid and uncertain locations never create a nearby claim", () => {
  const invalid = [
    { ...atDistance(10), address: "경상남도 통영시" },
    { ...atDistance(10), latitude: null },
    { ...atDistance(10), longitude: "126.5" },
    { ...atDistance(10), latitude: 35 },
    { ...atDistance(10), longitude: 129 },
    { ...atDistance(10), address: undefined },
  ];
  assert.equal(nearest(origin, invalid).status, "no-confirmed-info");
  assert.equal(nearest(origin, []).status, "no-confirmed-info");
  for (const change of [{ needsVerification: true }, { needsVerification: undefined }, { latitude: null }]) {
    assert.equal(nearest({ ...origin, ...change }, toilets).status, "unverified-location");
  }
});

test("the current 44 displayed pins split into 22 nearby and 22 without confirmed information", () => {
  const markers = spots.filter(displayable);
  assert.equal(markers.length, 44);
  const results = markers.map(spot => nearest(spot, toilets));
  assert.equal(results.filter(result => result.status === "nearby").length, 22);
  assert.equal(results.filter(result => result.status === "no-confirmed-info").length, 22);
  for (const spot of spots.filter(spot => spot.needsVerification)) {
    assert.equal(nearest(spot, toilets).status, "unverified-location");
  }
  const hyeonsa = nearest(spots.find(spot => spot.name === "현사포구"), toilets);
  assert.equal(hyeonsa.restroom.name, "이호테우해변(상황실1층)");
  assert.equal(hyeonsa.restroom.openHours, "상시");
  assert.ok(hyeonsa.distanceMeters > 414 && hyeonsa.distanceMeters < 415);
  assert.equal(nearest(spots.find(spot => spot.id === 8), toilets).status, "no-confirmed-info");
  assert.equal(nearest(spots.find(spot => spot.id === 39), toilets).status, "nearby");
  assert.equal(nearest(spots.find(spot => spot.id === 43), toilets).status, "no-confirmed-info");
  const eastPier = nearest(spots.find(spot => spot.id === 45), toilets);
  assert.equal(eastPier.restroom.id, "jejusi-PT0002");
  assert.ok(Math.abs(eastPier.distanceMeters - 403.597173) < 0.001);
});

test("published supplemental candidates preserve distinct facilities without duplicating older Jeju data", () => {
  const normalize = text => text.replace(/\s+/g, "");
  for (let index = 0; index < toilets.length; index++) {
    const toilet = toilets[index];
    assert.ok(!toilets.slice(index + 1).some(other =>
      normalize(toilet.name) === normalize(other.name) &&
      normalize(toilet.address) === normalize(other.address) && distance(toilet, other) < 5
    ), `Duplicate facility: ${toilet.name}`);
  }
  assert.equal(toilets.filter(toilet => toilet.name === "성산일출봉").length, 2);
  assert.equal(toilets.filter(toilet => toilet.name === "이호테우해변(상황실1층)").length, 1);
  assert.ok(!toilets.some(toilet => toilet.id === "poopoo-49201530-c492-45d7-8b2d-6226d8dcae3c"));
  assert.equal(metadata.supplementarySources[0].recordCount, 6);
});

test("target restroom links use exact Haversine distances and never force a candidate outside 500m", () => {
  for (const [id, name, address, meters] of [
    [15, "성산일출봉", "제주특별자치도 서귀포시 성산읍 성산리 114-3", 196.04],
    [68, "신산보건진료소", "제주특별자치도 서귀포시 성산읍 환해장성로111번길 21-12", 406.52],
    [16, "태흥3리 마을회관", "제주특별자치도 서귀포시 남원읍 삼덕로 3", 396.76],
  ]) {
    const result = nearest(spots.find(spot => spot.id === id), toilets);
    assert.equal(result.status, "nearby");
    assert.equal(result.restroom.name, name);
    assert.equal(result.restroom.address, address);
    assert.ok(Math.abs(result.distanceMeters - meters) < 0.01);
  }
  const parking = spots.find(spot => spot.id === 4);
  assert.equal(nearest(parking, toilets).status, "no-confirmed-info");
  assert.ok(Math.min(...toilets.map(toilet => distance(parking, toilet))) > 618);
  assert.equal(nearest(spots.find(spot => spot.id === 69), toilets).status, "no-confirmed-info");
  assert.equal(nearest(spots.find(spot => spot.id === 6), toilets).status, "unverified-location");
});
