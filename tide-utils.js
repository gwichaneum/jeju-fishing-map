// Codes and coordinates: KHOA's official API viewer, checked 2026-10-02.
const TIDE_STATIONS = Object.freeze([
  Object.freeze({ code: "DT_0004", name: "제주", latitude: 33.52750, longitude: 126.54305 }),
  Object.freeze({ code: "DT_0022", name: "성산포", latitude: 33.47472, longitude: 126.92777 }),
  Object.freeze({ code: "DT_0010", name: "서귀포", latitude: 33.24000, longitude: 126.56166 }),
  Object.freeze({ code: "DT_0023", name: "모슬포", latitude: 33.21444, longitude: 126.25111 }),
]);

function isValidTideDate(date) {
  if (typeof date !== "string" || !/^\d{8}$/.test(date)) return false;
  const year = Number(date.slice(0, 4)), month = Number(date.slice(4, 6)), day = Number(date.slice(6));
  if (year < 2000 || year > 2100) return false;
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

function getKoreaTideDate(now = Date.now()) {
  if (!Number.isFinite(now) || !Number.isFinite(new Date(now).getTime())) return "";
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(now));
  return ["year", "month", "day"].map(type => parts.find(part => part.type === type).value).join("");
}

function shiftTideDate(date, days = 1) {
  if (!isValidTideDate(date) || !Number.isInteger(days)) return "";
  const parsed = new Date(Date.UTC(Number(date.slice(0, 4)), Number(date.slice(4, 6)) - 1, Number(date.slice(6)) + days));
  return parsed.toISOString().slice(0, 10).replaceAll("-", "");
}

function parseKhoaTideTime(value) {
  if (typeof value !== "string") return NaN;
  const match = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2}))?(?:\+09:00)?$/.exec(value);
  if (!match || !isValidTideDate(match[1] + match[2] + match[3])
    || Number(match[4]) > 23 || Number(match[5]) > 59 || Number(match[6] || 0) > 59) return NaN;
  return Date.parse(`${match[1]}-${match[2]}-${match[3]}T${match[4]}:${match[5]}:${match[6] || "00"}+09:00`);
}

function formatKhoaTideTime(time) {
  if (!Number.isFinite(time) || !Number.isFinite(new Date(time).getTime())) return "정보 없음";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", hourCycle: "h23", hour: "2-digit", minute: "2-digit",
  }).format(new Date(time));
}

function getNextTide(events, now = Date.now()) {
  return events.filter(event => Number.isFinite(event.at) && event.at >= now)
    .sort((a, b) => a.at - b.at)[0] || null;
}

function formatTideCountdown(at, now = Date.now()) {
  if (!Number.isFinite(at) || !Number.isFinite(now) || at < now) return "";
  const minutes = Math.ceil((at - now) / 60000);
  const hours = Math.floor(minutes / 60);
  return hours ? `${hours}시간 ${minutes % 60}분` : `${minutes}분`;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { TIDE_STATIONS, isValidTideDate, getKoreaTideDate, shiftTideDate,
    parseKhoaTideTime, formatKhoaTideTime, getNextTide, formatTideCountdown };
}
