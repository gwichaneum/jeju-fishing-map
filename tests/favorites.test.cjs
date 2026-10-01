const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const context = vm.createContext({ document: { querySelector: () => null } });
for (const file of ["fishing-spots.js", "favorites.js", "spot-filters.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context);
}
const { spots, createStore, key, filter } = vm.runInContext(
  "({ spots: fishingSpots, createStore: createFavoriteStore, key: FAVORITES_STORAGE_KEY, filter: filterSpots })", context
);
const ids = values => Array.from(values, spot => spot.id);
const storedIds = store => Array.from(store.getFavorites());

function storageWith(value = null) {
  const data = new Map(value === null ? [] : [[key, value]]);
  return { data, getItem: name => data.get(name) ?? null, setItem: (name, value) => data.set(name, value) };
}

test("all points have stable, non-null, unique integer IDs", () => {
  assert.equal(spots.length, 69);
  assert.ok(spots.every(spot => Number.isInteger(spot.id)));
  assert.equal(new Set(spots.map(spot => spot.id)).size, 69);
  assert.equal(key, "jejuFishingFavorites");
});

test("toggle stores only unique IDs and restores them in a new store", () => {
  const storage = storageWith();
  const store = createStore(spots, () => storage);
  assert.deepEqual(storedIds(store), []);
  assert.equal(store.toggleFavorite(67), true);
  assert.equal(storage.getItem(key), "[67]");
  assert.equal(store.isFavorite(67), true);
  assert.equal(store.getFavoriteCount(), 1);
  const reopened = createStore(spots, () => storage);
  assert.deepEqual(storedIds(reopened), [67]);
  assert.equal(reopened.toggleFavorite(67), false);
  assert.equal(storage.getItem(key), "[]");
  assert.equal(reopened.getFavoriteCount(), 0);
});

test("duplicate, missing, null, string and malformed IDs are ignored and cleaned", () => {
  const storage = storageWith('[67,3,67,999999,null,"3",1.5,{},false]');
  storage.setItem("unrelated", "keep");
  const store = createStore(spots, () => storage);
  assert.deepEqual(storedIds(store), [3, 67]);
  assert.equal(storage.getItem(key), "[3,67]");
  assert.equal(storage.getItem("unrelated"), "keep");
  assert.equal(store.toggleFavorite(999999), false);
  assert.equal(store.toggleFavorite(null), false);
  assert.equal(store.toggleFavorite("3"), false);
  assert.equal(storage.getItem(key), "[3,67]");
});

test("broken JSON and non-array values recover to an empty list", () => {
  for (const value of ["{bad-json", "null", "{}", "42", '"text"']) {
    const storage = storageWith(value);
    const store = createStore(spots, () => storage);
    assert.deepEqual(storedIds(store), []);
    assert.equal(storage.getItem(key), "[]");
    assert.equal(store.toggleFavorite(3), true);
    assert.equal(storage.getItem(key), "[3]");
  }
});

test("storage access and read failures do not prevent in-memory favorites", () => {
  for (const getStorage of [
    () => { throw new Error("SecurityError"); },
    () => ({ getItem() { throw new Error("SecurityError"); }, setItem() { throw new Error("SecurityError"); } }),
  ]) {
    const store = createStore(spots, getStorage);
    assert.equal(store.canPersist(), false);
    assert.equal(store.toggleFavorite(67), true);
    assert.equal(store.isFavorite(67), true);
    assert.equal(store.getFavoriteCount(), 1);
    assert.equal(store.toggleFavorite(67), false);
  }
});

test("quota failure preserves temporary edits and a later successful save can recover", () => {
  const storage = storageWith("[3]");
  let blocked = true;
  const save = storage.setItem;
  storage.setItem = (name, value) => {
    if (blocked) throw new Error("QuotaExceededError");
    save(name, value);
  };
  const store = createStore(spots, () => storage);
  assert.equal(store.toggleFavorite(67), true);
  assert.deepEqual(storedIds(store), [3, 67]);
  assert.equal(store.canPersist(), false);
  assert.equal(storage.getItem(key), "[3]");
  blocked = false;
  store.toggleFavorite(8);
  assert.equal(store.canPersist(), true);
  assert.equal(storage.getItem(key), "[3,8,67]");
});

test("snapshots cannot mutate the stored set and subscribers see coherent state", () => {
  const storage = storageWith();
  const store = createStore(spots, () => storage);
  const seen = [];
  const unsubscribe = store.subscribe(() => seen.push(storedIds(store)));
  store.toggleFavorite(8);
  const snapshot = store.getFavorites();
  snapshot.push(67);
  assert.deepEqual(storedIds(store), [8]);
  store.toggleFavorite(3);
  unsubscribe();
  store.toggleFavorite(8);
  assert.deepEqual(seen, [[8], [3, 8]]);
});

test("external storage edits reload and a toggle does not overwrite another tab", () => {
  const storage = storageWith("[3]");
  const store = createStore(spots, () => storage);
  storage.setItem(key, "[3,8]");
  store.toggleFavorite(67);
  assert.equal(storage.getItem(key), "[3,8,67]");
  storage.setItem(key, "[16]");
  store.reload();
  assert.deepEqual(storedIds(store), [16]);
  storage.data.delete(key);
  store.reload();
  assert.equal(store.getFavoriteCount(), 0);
});

test("favorites use AND with the existing search, species, method and type filters", () => {
  const favorites = [3, 4, 16, 23, 67, 68];
  assert.deepEqual(ids(filter(spots, { favoritesOnly: true }, favorites)), favorites);
  assert.deepEqual(ids(filter(spots, { query: "성산", species: "무늬오징어", favoritesOnly: true }, favorites)), [4]);
  assert.deepEqual(ids(filter(spots, { query: "태흥", species: "무늬오징어", method: "에깅", type: "fishing-spot", favoritesOnly: true }, favorites)), [16]);
  assert.deepEqual(ids(filter(spots, { type: "personal-spot", favoritesOnly: true }, favorites)), [68]);
  assert.deepEqual(ids(filter(spots, { species: "갈치", favoritesOnly: true }, favorites)), [23]);
  assert.deepEqual(ids(filter(spots, { favoritesOnly: true }, [])), []);
  assert.equal(filter(spots, {}, favorites).length, 69);
});

test("resetting filter conditions does not delete favorites or change point data", () => {
  const original = JSON.stringify(spots);
  const storage = storageWith("[3,67]");
  const store = createStore(spots, () => storage);
  filter(spots, { query: "現", favoritesOnly: true }, store.getFavorites());
  filter(spots, {}, store.getFavorites());
  assert.equal(storage.getItem(key), "[3,67]");
  assert.equal(JSON.stringify(spots), original);
  const unverifiedStore = createStore(spots, () => storageWith("[6]"));
  assert.deepEqual(storedIds(unverifiedStore), [6]);
  assert.equal(spots.find(spot => spot.id === 6).latitude, null);
});
