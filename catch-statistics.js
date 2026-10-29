(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory(() => require('./catch-records.js'));
  else root.CatchStatistics = factory(() => root.CatchRecords);
})(typeof globalThis === 'object' ? globalThis : this, function (getRecordsApi) {
  'use strict';

  const emptyLocations = new Set(['', '없음', 'undefined', 'null', 'none', 'n/a', '-', '미입력', '미지정', '장소 없음', '장소 미입력', '알 수 없음']);

  function normalizeLocationName(value) {
    if (typeof value !== 'string') return '';
    const name = value.trim();
    return emptyLocations.has(name.toLowerCase()) ? '' : name;
  }

  function recentMonths(now) {
    // Use local calendar getters and month arithmetic; never reinterpret caughtAt as a UTC instant.
    const current = now.getFullYear() * 12 + now.getMonth();
    return Array.from({ length: 6 }, (_, index) => {
      const value = current - 5 + index;
      return { month: `${Math.floor(value / 12)}-${String(value % 12 + 1).padStart(2, '0')}`, totalCount: 0 };
    });
  }

  function calculateCatchStatistics(records, speciesCatalog, { now = new Date(), mapSpots = [], customLocations = [], mapSpotIds = null } = {}) {
    // CatchRecords is loaded lazily by the catalog. Loading this file must not depend on its arrival.
    const api = getRecordsApi();
    if (typeof api?.validateCatchRecord !== 'function' || typeof api?.summarizeCollection !== 'function'
      || typeof api?.sortRecords !== 'function') throw new TypeError('CatchRecords is unavailable');

    const speciesIds = [...new Set((Array.isArray(speciesCatalog) ? speciesCatalog : [])
      .map(species => species?.speciesId).filter(id => typeof id === 'string' && id.trim()))];
    const seen = new Set();
    const validRecords = [];
    let invalidCount = 0;
    for (const record of Array.isArray(records) ? records : []) {
      // Persisted count must already be a positive integer. Form input "3" becomes 3 via parseCount;
      // a raw stored string remains invalid, exactly as in the collection progress calculation.
      if (!api.validateCatchRecord(record, speciesIds, mapSpotIds).valid || seen.has(record.recordId)) {
        invalidCount++;
        continue;
      }
      seen.add(record.recordId);
      validRecords.push(record);
    }

    // This is the single source for collected species, collection progress and species totals.
    const summary = api.summarizeCollection(validRecords, speciesIds, mapSpotIds);
    const speciesStats = Object.entries(summary.bySpecies)
      .filter(([, value]) => value.collected)
      .map(([speciesId, value]) => ({ speciesId, totalCount: value.totalCount, recordCount: value.recordCount, lastCaughtAt: value.lastCaughtAt }))
      // Equal totals prefer the species caught most recently, then a stable ID for equal dates.
      .sort((a, b) => b.totalCount - a.totalCount || b.lastCaughtAt.localeCompare(a.lastCaughtAt) || a.speciesId.localeCompare(b.speciesId));

    const monthlyStats = recentMonths(now);
    const months = new Map(monthlyStats.map(month => [month.month, month]));
    const locations = new Map();
    const spotsById = new Map(mapSpots.map(spot => [spot.id, spot]));
    const customById = new Map(customLocations.map(location => [location.customLocationId, location]));
    const spotsByName = new Map();
    for (const spot of mapSpots) {
      if (!spotsByName.has(spot.name)) spotsByName.set(spot.name, []);
      spotsByName.get(spot.name).push(spot);
    }
    for (const record of validRecords) {
      const count = Number(record.count);
      const month = months.get(record.caughtAt.slice(0, 7));
      if (month) month.totalCount += count;

      let locationName = normalizeLocationName(record.locationName);
      let locationKey;
      if (record.mapSpotId != null) {
        locationKey = `map:${record.mapSpotId}`;
        locationName = spotsById.get(record.mapSpotId)?.name || locationName;
      } else if (record.customLocationId != null) {
        locationKey = `custom:${record.customLocationId}`;
        locationName = customById.get(record.customLocationId)?.name || locationName;
      } else {
        // Only a unique, byte-for-byte official name match can join an old record to a map ID.
        const exact = spotsByName.get(record.locationName);
        locationKey = exact?.length === 1 ? `map:${exact[0].id}` : `legacy:${locationName}`;
      }
      if (!locationName) continue;
      if (!locations.has(locationKey)) locations.set(locationKey, { locationName, recordCount: 0, totalCount: 0 });
      const location = locations.get(locationKey);
      location.recordCount++;
      location.totalCount += count;
    }
    const locationStats = [...locations.values()]
      .sort((a, b) => b.recordCount - a.recordCount || b.totalCount - a.totalCount || a.locationName.localeCompare(b.locationName, 'ko'))
      .slice(0, 5);

    return {
      summary,
      totalCount: speciesStats.reduce((sum, species) => sum + Number(species.totalCount), 0),
      recordCount: speciesStats.reduce((sum, species) => sum + species.recordCount, 0),
      speciesStats,
      topSpecies: speciesStats[0] || null,
      recentRecords: api.sortRecords(validRecords).slice(0, 5),
      monthlyStats,
      locationStats,
      invalidCount,
    };
  }

  return { calculateCatchStatistics, normalizeLocationName };
});
