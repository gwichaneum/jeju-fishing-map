const { TIDE_STATIONS, isValidTideDate, getKoreaTideDate, shiftTideDate, parseKhoaTideTime } = require("../tide-utils.js");
const KHOA_TIDE_ENDPOINT = "https://apis.data.go.kr/1192136/tideFcstHghLw/GetTideFcstHghLwApiService";

class TideError extends Error {
  constructor(code, status = 502) { super("Official tide request failed"); this.code = code; this.status = status; }
}

function validateTideQuery(station, date, now = Date.now()) {
  const selected = TIDE_STATIONS.find(item => item.code === station);
  const today = getKoreaTideDate(now);
  if (!selected || !isValidTideDate(date) || ![today, shiftTideDate(today)].includes(date)) {
    throw new TideError("INVALID_REQUEST", 400);
  }
  return selected;
}

function buildKhoaTideUrl(station, date, key) {
  let decodedKey = key.trim();
  if (/%[0-9a-f]{2}/i.test(decodedKey)) {
    try { decodedKey = decodeURIComponent(decodedKey); } catch { throw new TideError("KEY_INVALID", 503); }
  }
  const url = new URL(KHOA_TIDE_ENDPOINT);
  url.search = new URLSearchParams({ serviceKey: decodedKey, obsCode: station.code, reqDate: date,
    type: "json", pageNo: "1", numOfRows: "300" }).toString();
  return url;
}

function normalizeKhoaTides(payload, station, date) {
  // Never forward raw upstream messages or URLs, which may contain credentials.
  if (!payload || payload.header?.resultCode !== "00") throw new TideError("UPSTREAM_ERROR");
  const numeric = value => typeof value === "number" && Number.isFinite(value) ? value
    : typeof value === "string" && /^-?\d+(?:\.\d+)?$/.test(value) && Number.isFinite(Number(value)) ? Number(value) : NaN;
  const body = payload.body;
  const total = numeric(body?.totalCount);
  if (!body || !Number.isInteger(total) || total < 0) throw new TideError("INVALID_RESPONSE");
  const raw = body.items?.item;
  const rows = Array.isArray(raw) ? raw : raw && typeof raw === "object" ? [raw] : [];
  if (rows.length !== total) throw new TideError("INVALID_RESPONSE");
  const seen = new Set();
  const events = rows.map(row => {
    const at = parseKhoaTideTime(row.predcDt);
    const heightCm = numeric(row.predcTdlvVl);
    const extremumCode = numeric(row.extrSe);
    const latitude = numeric(row.lat), longitude = numeric(row.lot);
    if (row.obsvtrNm !== station.name || !Number.isFinite(at) || getKoreaTideDate(at) !== date
      || !Number.isFinite(heightCm) || ![1, 2, 3, 4].includes(extremumCode)
      || !Number.isFinite(latitude) || !Number.isFinite(longitude)
      || Math.abs(latitude - station.latitude) > 0.01 || Math.abs(longitude - station.longitude) > 0.01
      || seen.has(at)) throw new TideError("INVALID_RESPONSE");
    seen.add(at);
    return { at, heightCm, extremumCode, kind: [1, 3].includes(extremumCode) ? "high" : "low" };
  }).sort((a, b) => a.at - b.at);
  const location = rows.length ? { latitude: numeric(rows[0].lat), longitude: numeric(rows[0].lot) } : {};
  return { station: { ...station, ...location }, date, timezone: "Asia/Seoul", unit: "cm", events };
}

function createTideService({ serviceKey = "", fetcher = fetch, now = () => Date.now(), timeoutMs = 12000 } = {}) {
  const cache = new Map();
  const configured = Boolean(serviceKey.trim() && serviceKey.trim() !== "YOUR_SERVICE_KEY_HERE");
  return {
    configured,
    request(stationCode, date) {
      let station;
      try { station = validateTideQuery(stationCode, date, now()); }
      catch (error) { return Promise.reject(error); }
      if (!configured) return Promise.reject(new TideError("KEY_NOT_CONFIGURED", 503));
      const today = getKoreaTideDate(now()), tomorrow = shiftTideDate(today);
      for (const [key, entry] of cache) if (![today, tomorrow].includes(entry.date)) cache.delete(key);
      const key = `${station.code}:${date}`;
      const entry = cache.get(key);
      if (entry?.pending) return entry.pending;
      if (entry?.data) return Promise.resolve(entry.data);
      if (entry?.error && now() < entry.retryAt) return Promise.reject(entry.error);
      const pending = (async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const url = buildKhoaTideUrl(station, date, serviceKey);
          const response = await fetcher(url.href, { signal: controller.signal, redirect: "error",
            headers: { Accept: "application/json" }, cache: "no-store" });
          if (!response.ok) throw new TideError("UPSTREAM_ERROR");
          const declaredSize = Number(response.headers?.get("content-length"));
          if (declaredSize > 512000) throw new TideError("INVALID_RESPONSE");
          const text = await response.text();
          if (text.length > 512000) throw new TideError("INVALID_RESPONSE");
          return normalizeKhoaTides(JSON.parse(text), station, date);
        } catch (error) {
          throw error instanceof TideError ? error : new TideError(controller.signal.aborted ? "UPSTREAM_TIMEOUT" : "UPSTREAM_ERROR");
        } finally { clearTimeout(timer); }
      })().then(data => { cache.set(key, { date, data }); return data; }, error => {
        cache.set(key, { date, error, retryAt: now() + 30000 }); throw error;
      });
      cache.set(key, { date, pending });
      return pending;
    },
  };
}

module.exports = { KHOA_TIDE_ENDPOINT, TideError, validateTideQuery, buildKhoaTideUrl, normalizeKhoaTides, createTideService };
