const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const root = path.resolve(__dirname, "..");
const source = ["fishing-spots.js", "spot-filters.js", "script.js", "location.js"]
  .map(file => fs.readFileSync(path.join(root, file), "utf8")).join("\n");
const api = vm.runInNewContext(source + "\n({createLocationStore, formatLocationDistance, getNearestFishingSpots, locationAccuracyLabel, haversineDistanceMeters, filterSpots, fishingSpots});", {
  document: { querySelector: () => null },
});
const jeju = { latitude: 33.49753, longitude: 126.449588, accuracy: 30 };
const plain = value => JSON.parse(JSON.stringify(value));

test("location is requested only explicitly, once while busy, with a finite timeout", () => {
  let reads = 0;
  let calls = 0;
  let success;
  const store = api.createLocationStore(() => {
    reads++;
    return { secure: true, geolocation: { getCurrentPosition(ok, fail, options) {
      calls++; success = ok;
      assert.deepEqual(plain(options), { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
    } } };
  });
  const states = [];
  store.subscribe(() => states.push(store.getState().phase));
  assert.equal(store.getPosition(), null);
  assert.equal(reads, 0);
  assert.equal(calls, 0);
  store.request(); store.request();
  assert.equal(calls, 1);
  assert.equal(store.getState().phase, "requesting");
  success({ coords: { ...jeju, altitude: 123, speed: 4 }, timestamp: 1234 });
  assert.deepEqual(plain(store.getPosition()), jeju);
  assert.equal(Object.isFrozen(store.getPosition()), true);
  assert.match(store.getState().message, /30m/);
  assert.deepEqual(states, ["requesting", "ready"]);
  assert.equal(api.createLocationStore().getPosition(), null);
});

test("denial, unavailable, timeout, unsupported, insecure and thrown failures are readable and retryable", () => {
  for (const [code, expression] of [[1, /권한/], [2, /위치 설정/], [3, /초과/], [99, /못했습니다/]]) {
    let calls = 0;
    const store = api.createLocationStore(() => ({ secure: true, geolocation: {
      getCurrentPosition(ok, error) { calls++; error({ code }); },
    } }));
    store.request();
    assert.equal(store.getState().phase, "error");
    assert.match(store.getState().message, expression);
    assert.equal(store.getPosition(), null);
    store.request();
    assert.equal(calls, 2);
  }
  for (const [environment, expression] of [
    [{ secure: false, geolocation: { getCurrentPosition() { throw new Error("must not request"); } } }, /HTTPS.*localhost/],
    [{ secure: true }, /지원하지/],
    [{ secure: true, geolocation: { getCurrentPosition() { throw new Error("SecurityError"); } } }, /위치 설정/],
  ]) {
    const store = api.createLocationStore(() => environment);
    assert.doesNotThrow(() => store.request());
    assert.match(store.getState().message, expression);
    assert.equal(store.getPosition(), null);
  }
});

test("invalid positions are rejected and a failed refresh preserves the previous location", () => {
  let next = { coords: jeju };
  const store = api.createLocationStore(() => ({ secure: true, geolocation: {
    getCurrentPosition(ok, fail) { if (next.error) fail(next.error); else ok(next); },
  } }));
  store.request();
  const position = store.getPosition();
  for (const coords of [null, { latitude: null, longitude: 126 }, { latitude: 91, longitude: 126 }, { latitude: 33, longitude: Infinity }]) {
    next = { coords }; store.request();
    assert.equal(store.getState().phase, "error");
    assert.equal(store.getPosition(), position);
    assert.match(store.getState().message, /이전에 확인한 위치/);
  }
  next = { error: { code: 1 } }; store.request();
  assert.equal(store.getPosition(), position);
  next = { coords: { ...jeju, accuracy: -10 } }; store.request();
  assert.equal(store.getPosition().accuracy, null);
  assert.match(store.getState().message, /정확도 정보 없음/);
});

test("large accuracy stays approximate rather than promising a precise GPS fix", () => {
  assert.match(api.locationAccuracyLabel({ accuracy: 3000 }), /약 3.0km.*오차/);
  assert.equal(api.locationAccuracyLabel({ accuracy: null }), "정확도 정보 없음");
});

test("distance labels handle meters, kilometers, zero, boundaries and invalid values", () => {
  for (const [input, expected] of [[0, "0m"], [350.4, "350m"], [999.9, "1.0km"], [2400, "2.4km"], [1000, "1.0km"], [Infinity, ""], [NaN, ""], [-1, ""]]) {
    assert.equal(api.formatLocationDistance(input), expected);
  }
});

test("nearest five use true straight-line distances and never mutate records", () => {
  const before = JSON.stringify(api.fishingSpots);
  const results = api.getNearestFishingSpots(jeju, api.fishingSpots);
  assert.equal(results.length, 5);
  assert.equal(results[0].spot.id, 67);
  assert.equal(results[0].distanceMeters, 0);
  for (let i = 0; i < results.length; i++) {
    assert.equal(results[i].spot.needsVerification, false);
    assert.equal(results[i].distanceMeters, api.haversineDistanceMeters(jeju, results[i].spot));
    if (i) assert.ok(results[i].distanceMeters >= results[i - 1].distanceMeters);
  }
  assert.equal(JSON.stringify(api.fishingSpots), before);
  assert.deepEqual(plain(api.getNearestFishingSpots(null, api.fishingSpots)), []);
});

test("nearby results obey combined search, species, method, type and favorite filters", () => {
  const state = { query: "포구", species: "무늬오징어", method: "에깅", type: "fishing-spot", favoritesOnly: true };
  const filtered = api.filterSpots(api.fishingSpots, state, [16, 67]);
  const results = api.getNearestFishingSpots(jeju, filtered);
  assert.deepEqual(plain(results.map(result => result.spot.id)), [16]);
  assert.equal(api.getNearestFishingSpots(jeju, api.fishingSpots.filter(spot => spot.needsVerification)).length, 0);
  assert.equal(api.getNearestFishingSpots(jeju, []).length, 0);
});

test("Seoul positions calculate realistic long distances without being rejected", () => {
  const seoul = { latitude: 37.5665, longitude: 126.978 };
  const results = api.getNearestFishingSpots(seoul, api.fishingSpots);
  assert.equal(results.length, 5);
  for (const result of results) assert.ok(result.distanceMeters > 440000 && result.distanceMeters < 500000);
});
