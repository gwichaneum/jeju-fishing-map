function findNearestTideStation(spot) {
  if (!spot || spot.needsVerification !== false || !hasValidCoordinates(spot)) return null;
  return TIDE_STATIONS.map(station => ({ station, distance: haversineDistanceMeters(spot, station) }))
    .sort((a, b) => a.distance - b.distance)[0]?.station || null;
}

function validateTideResponse(data, stationCode, date) {
  const station = TIDE_STATIONS.find(item => item.code === stationCode);
  if (!station || data?.station?.code !== stationCode || data.station.name !== station.name
    || !Number.isFinite(data.station.latitude) || !Number.isFinite(data.station.longitude)
    || Math.abs(data.station.latitude - station.latitude) > 0.01 || Math.abs(data.station.longitude - station.longitude) > 0.01
    || data.date !== date || data.unit !== "cm" || data.timezone !== "Asia/Seoul"
    || !Array.isArray(data.events)) throw new Error("Invalid tide response");
  const seen = new Set();
  for (const event of data.events) {
    if (!Number.isFinite(event.at) || getKoreaTideDate(event.at) !== date || !Number.isFinite(event.heightCm)
      || ![1, 2, 3, 4].includes(event.extremumCode)
      || event.kind !== ([1, 3].includes(event.extremumCode) ? "high" : "low") || seen.has(event.at)) {
      throw new Error("Invalid tide event");
    }
    seen.add(event.at);
  }
  return { ...data, events: data.events.slice().sort((a, b) => a.at - b.at) };
}

function createTideClient({ fetcher = (...args) => fetch(...args), now = () => Date.now(), timeoutMs = 15000 } = {}) {
  const cache = new Map();
  return {
    request(stationCode, date) {
      const today = getKoreaTideDate(now()), tomorrow = shiftTideDate(today);
      if (!TIDE_STATIONS.some(station => station.code === stationCode) || ![today, tomorrow].includes(date)) {
        return Promise.reject(new Error("Invalid tide request"));
      }
      for (const [key, entry] of cache) if (![today, tomorrow].includes(entry.date)) cache.delete(key);
      const key = `${stationCode}:${date}`, entry = cache.get(key);
      if (entry?.pending) return entry.pending;
      if (entry?.data) return Promise.resolve(entry.data);
      const pending = (async () => {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const query = new URLSearchParams({ station: stationCode, date });
          const response = await fetcher(`/api/tides?${query}`, { signal: controller.signal, credentials: "same-origin", cache: "no-store" });
          if (!response.ok) throw new Error("Official tide request failed");
          return validateTideResponse(await response.json(), stationCode, date);
        } finally { clearTimeout(timer); }
      })().then(data => { cache.set(key, { date, data }); return data; }, error => { cache.delete(key); throw error; });
      cache.set(key, { date, pending });
      return pending;
    },
  };
}

const spotTideClient = createTideClient();
const tideSectionStates = new WeakMap();

function tideElement(tag, className, text) {
  const node = document.createElement(tag);
  node.className = className;
  if (text) node.textContent = text;
  return node;
}

function createSpotTideSection() {
  const section = tideElement("section", "fishing-popup-tides");
  section.dataset.state = "idle";
  const station = tideElement("p", "tide-station");
  const tabs = tideElement("div", "tide-tabs");
  tabs.setAttribute("role", "group");
  tabs.setAttribute("aria-label", "조석예보 날짜");
  for (const [value, label] of [["today", "오늘"], ["tomorrow", "내일"]]) {
    const button = tideElement("button", "tide-tab", label);
    button.type = "button";
    button.dataset.day = value;
    button.setAttribute("aria-pressed", String(value === "today"));
    button.addEventListener("click", () => {
      const state = tideSectionStates.get(section);
      if (!state?.active || state.selected === value) return;
      state.selected = value;
      refreshSpotTides(state);
    });
    tabs.append(button);
  }
  const date = tideElement("p", "tide-date");
  const results = tideElement("div", "tide-results");
  const next = tideElement("div", "tide-next");
  const caution = tideElement("p", "tide-caution", "국립해양조사원 조석예보 기준이며, 실제 현장 조위와 차이가 있을 수 있습니다.");
  const source = tideElement("a", "tide-source", "출처: 해양수산부 국립해양조사원");
  source.href = "https://www.data.go.kr/data/15156018/openapi.do";
  source.target = "_blank"; source.rel = "noopener noreferrer";
  section.append(tideElement("h3", "", "공식 물때"), station, tabs, date, results,
    tideElement("h4", "tide-next-heading", "다음 물때"), next, caution, source);
  return section;
}

function renderTideStatus(container, text) {
  const status = tideElement("p", "tide-status", text);
  status.setAttribute("role", "status");
  container.replaceChildren(status);
}

function formatTideHeight(value) {
  return Number.isFinite(value) ? `${value.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}cm` : "정보 없음";
}

function ensureSpotTideDay(state, date) {
  if (state.days.has(date)) return;
  state.days.set(date, { status: "loading" });
  spotTideClient.request(state.station.code, date).then(data => {
    if (!state.active) return;
    state.days.set(date, { status: "ready", data }); refreshSpotTides(state);
  }, () => {
    if (!state.active) return;
    state.days.set(date, { status: "error" }); refreshSpotTides(state);
  });
}

function refreshSpotTides(state) {
  if (!state.active) return;
  const now = Date.now(), today = getKoreaTideDate(now), tomorrow = shiftTideDate(today);
  for (const key of state.days.keys()) if (![today, tomorrow].includes(key)) state.days.delete(key);
  const date = state.selected === "today" ? today : tomorrow;
  ensureSpotTideDay(state, today);
  ensureSpotTideDay(state, date);
  const current = state.days.get(today), selected = state.days.get(date);
  const section = state.section;
  section.querySelector(".tide-station").textContent = `기준지점 · ${state.station.name}`;
  section.querySelector(".tide-date").textContent = `${date.slice(0, 4)}.${date.slice(4, 6)}.${date.slice(6)} · ${state.selected === "today" ? "오늘" : "내일"} · KST`;
  for (const button of section.querySelectorAll(".tide-tab")) button.setAttribute("aria-pressed", String(button.dataset.day === state.selected));
  const results = section.querySelector(".tide-results");
  if (selected.status === "loading") renderTideStatus(results, "공식 물때 정보를 불러오는 중...");
  else if (selected.status === "error") renderTideStatus(results, "현재 공식 물때 정보를 불러올 수 없습니다.");
  else if (!selected.data.events.length) renderTideStatus(results, "이 날짜의 공식 조석예보가 제공되지 않습니다.");
  else {
    const list = tideElement("ol", "tide-list");
    for (const event of selected.data.events) {
      const row = tideElement("li", `tide-row tide-${event.kind}`);
      const label = tideElement("span", "tide-kind", event.kind === "high" ? "만조" : "간조");
      const time = tideElement("time", "tide-time", formatKhoaTideTime(event.at));
      time.dateTime = new Date(event.at).toISOString();
      row.append(label, time, tideElement("span", "tide-height", formatTideHeight(event.heightCm)));
      list.append(row);
    }
    results.replaceChildren(list);
  }
  const nextContainer = section.querySelector(".tide-next");
  let next = current.data ? getNextTide(current.data.events, now) : null;
  let nextState = current;
  if (current.status === "ready" && !next) {
    ensureSpotTideDay(state, tomorrow);
    nextState = state.days.get(tomorrow);
    next = nextState.data ? getNextTide(nextState.data.events, now) : null;
  }
  if (next) {
    const label = next.kind === "high" ? "만조" : "간조";
    const until = tideElement("p", "tide-next-countdown", `${label}까지 ${formatTideCountdown(next.at, now)}`);
    const info = tideElement("p", "tide-next-meta", `${getKoreaTideDate(next.at) !== today ? "내일 " : ""}${formatKhoaTideTime(next.at)} · ${formatTideHeight(next.heightCm)}`);
    nextContainer.replaceChildren(until, info);
  } else renderTideStatus(nextContainer, nextState.status === "loading" ? "다음 물때를 불러오는 중..."
    : nextState.status === "error" ? "다음 물때 정보를 불러올 수 없습니다." : "다음 물때 정보 없음");
  section.dataset.state = selected.status;
  section.setAttribute("aria-busy", String(selected.status === "loading" || nextState.status === "loading"));
  state.onChange();
}

function loadSpotTides(spot, section, onChange = () => {}) {
  if (!section) return () => {};
  const station = findNearestTideStation(spot);
  const previous = tideSectionStates.get(section);
  if (previous) { previous.active = false; window.clearInterval(previous.timer); }
  if (!station) {
    renderTideStatus(section.querySelector(".tide-results"), "포인트 위치 확인 후 공식 물때를 조회할 수 있습니다.");
    return () => {};
  }
  const state = { section, station, onChange, selected: "today", days: new Map(), active: true };
  tideSectionStates.set(section, state);
  refreshSpotTides(state);
  // Recompute countdown and Korean calendar rollover only while this popup is open.
  state.timer = window.setInterval(() => refreshSpotTides(state), 60000);
  return () => { state.active = false; window.clearInterval(state.timer); };
}
