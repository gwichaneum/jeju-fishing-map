const FAVORITES_STORAGE_KEY = "jejuFishingFavorites";

function createFavoriteStore(spots, getStorage = () => window.localStorage) {
  const validIds = new Set(spots.map(spot => spot.id).filter(Number.isInteger));
  const listeners = new Set();
  let favorites = new Set();
  let persistent = true;

  function getFavorites() {
    return [...favorites].sort((a, b) => a - b);
  }

  function saveFavorites() {
    try {
      getStorage().setItem(FAVORITES_STORAGE_KEY, JSON.stringify(getFavorites()));
      persistent = true;
    } catch {
      persistent = false;
    }
  }

  function loadFavorites() {
    let raw;
    try {
      raw = getStorage().getItem(FAVORITES_STORAGE_KEY);
      persistent = true;
    } catch {
      persistent = false;
      return;
    }
    let values;
    try {
      values = raw === null ? [] : JSON.parse(raw);
    } catch {
      values = [];
    }
    favorites = new Set(Array.isArray(values) ? values.filter(id => validIds.has(id)) : []);
    if (raw !== null && raw !== JSON.stringify(getFavorites())) saveFavorites();
  }

  function notify() {
    for (const listener of listeners) listener();
  }

  function toggleFavorite(id) {
    if (!validIds.has(id)) return false;
    // Read the latest stored IDs before editing, including changes from another tab.
    if (persistent) loadFavorites();
    if (favorites.has(id)) favorites.delete(id);
    else favorites.add(id);
    saveFavorites();
    notify();
    return favorites.has(id);
  }

  loadFavorites();
  return {
    getFavorites,
    toggleFavorite,
    isFavorite: id => favorites.has(id),
    getFavoriteCount: () => favorites.size,
    canPersist: () => persistent,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    reload() {
      loadFavorites();
      notify();
    },
  };
}
