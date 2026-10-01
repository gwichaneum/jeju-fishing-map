const LAND_WEATHER_FIELDS = [
  "temperature_2m", "apparent_temperature", "wind_speed_10m", "wind_direction_10m",
  "wind_gusts_10m", "precipitation", "weather_code",
];
const MARINE_WEATHER_FIELDS = ["wave_height", "wave_direction", "wave_period", "sea_surface_temperature"];

function degreesToDirection(degrees) {
  if (!Number.isFinite(degrees)) return "";
  const angle = ((degrees % 360) + 360) % 360;
  return ["북", "북동", "동", "남동", "남", "남서", "서", "북서"][Math.round(angle / 45) % 8];
}

function formatWeatherDirection(degrees, wind = false) {
  const direction = degreesToDirection(degrees);
  if (!direction) return "정보 없음";
  const angle = Math.round(((degrees % 360) + 360) % 360) % 360;
  return `${direction}${wind ? "풍" : ""} ${angle}°`;
}

function weatherCodeLabel(code) {
  return {
    0: "맑음", 1: "대체로 맑음", 2: "구름 조금", 3: "흐림", 45: "안개", 48: "착빙 안개",
    51: "약한 이슬비", 53: "이슬비", 55: "강한 이슬비", 56: "약한 어는 이슬비", 57: "어는 이슬비",
    61: "약한 비", 63: "비", 65: "강한 비", 66: "약한 어는 비", 67: "어는 비",
    71: "약한 눈", 73: "눈", 75: "강한 눈", 77: "싸락눈", 80: "약한 소나기", 81: "소나기",
    82: "강한 소나기", 85: "약한 눈 소나기", 86: "눈 소나기", 95: "뇌우", 96: "우박 동반 뇌우", 99: "강한 우박 동반 뇌우",
  }[code] || "정보 없음";
}

function formatWeatherNumber(value, unit) {
  return Number.isFinite(value) ? `${value.toFixed(1)}${unit}` : "정보 없음";
}

function formatWeatherTime(seconds, date = false) {
  if (!Number.isFinite(seconds) || seconds <= 0 || !Number.isFinite(new Date(seconds * 1000).getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", hourCycle: "h23", hour: "2-digit", minute: "2-digit",
    ...(date ? { month: "2-digit", day: "2-digit" } : {}),
  }).format(new Date(seconds * 1000));
}

function buildSpotWeatherUrl(spot, kind, model = "kma_seamless") {
  const url = new URL(kind === "marine"
    ? "https://marine-api.open-meteo.com/v1/marine" : "https://api.open-meteo.com/v1/forecast");
  url.search = new URLSearchParams({
    latitude: String(spot.latitude), longitude: String(spot.longitude),
    current: (kind === "marine" ? MARINE_WEATHER_FIELDS : LAND_WEATHER_FIELDS).join(","),
    hourly: kind === "marine" ? "wave_height" : "wind_speed_10m",
    timezone: "Asia/Seoul", timeformat: "unixtime", forecast_hours: "8",
    cell_selection: kind === "marine" ? "sea" : "land",
  }).toString();
  if (kind === "land") {
    if (model) url.searchParams.set("models", model);
    url.searchParams.set("wind_speed_unit", "ms");
    url.searchParams.set("temperature_unit", "celsius");
    url.searchParams.set("precipitation_unit", "mm");
  } else url.searchParams.set("length_unit", "metric");
  return url;
}

function normalizeSpotWeather(payload, kind) {
  const expectedUnits = {
    temperature_2m: "°C", apparent_temperature: "°C", sea_surface_temperature: "°C",
    wind_speed_10m: "m/s", wind_gusts_10m: "m/s", precipitation: "mm",
    wind_direction_10m: "°", wave_direction: "°", wave_height: "m", wave_period: "s", weather_code: "wmo code",
  };
  const readValue = (value, field, units) => {
    if (!Number.isFinite(value)) return null;
    const unit = units?.[field];
    if (expectedUnits[field] === "m/s" && unit === "km/h") value /= 3.6;
    else if (unit !== expectedUnits[field]) return null;
    if (expectedUnits[field] !== "°C" && value < 0) return null;
    if (expectedUnits[field] === "°" && value > 360) return null;
    return value;
  };
  const fields = kind === "marine" ? MARINE_WEATHER_FIELDS : LAND_WEATHER_FIELDS;
  const current = Object.fromEntries(fields.map(field => [field, readValue(payload.current?.[field], field, payload.current_units)]));
  current.time = payload.current_units?.time === "unixtime" && Number.isFinite(payload.current?.time)
    ? payload.current.time : null;
  const hourlyField = kind === "marine" ? "wave_height" : "wind_speed_10m";
  const times = payload.hourly_units?.time === "unixtime" && Array.isArray(payload.hourly?.time) ? payload.hourly.time : [];
  const hourly = times.map((time, index) => ({
    time, value: readValue(payload.hourly?.[hourlyField]?.[index], hourlyField, payload.hourly_units),
  })).filter(row => Number.isFinite(row.time));
  return { current, hourly, hasData: fields.some(field => current[field] !== null) || hourly.some(row => row.value !== null) };
}

function createSpotWeatherService({ fetcher = (...args) => fetch(...args), now = () => Date.now(),
  timeoutMs = 12000, cacheMs = 10 * 60 * 1000 } = {}) {
  const cache = new Map();
  async function fetchData(url, kind) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetcher(url.href, {
        signal: controller.signal, cache: "no-store", credentials: "omit", referrerPolicy: "no-referrer",
      });
      if (!response.ok) {
        const error = new Error("Weather request failed");
        error.status = response.status;
        throw error;
      }
      const payload = await response.json();
      if (!payload || typeof payload !== "object" || Array.isArray(payload) || payload.error) throw new Error("Invalid weather response");
      return normalizeSpotWeather(payload, kind);
    } finally { clearTimeout(timer); }
  }
  async function fetchLand(spot) {
    try {
      const data = await fetchData(buildSpotWeatherUrl(spot, "land"), "land");
      if (data.hasData) return { ...data, model: "KMA" };
    } catch (error) {
      if (error.status === 429) throw error;
    }
    const data = await fetchData(buildSpotWeatherUrl(spot, "land", ""), "land");
    return { ...data, model: "자동 선택", fallback: true };
  }
  return {
    request(kind, spot) {
      if (!["land", "marine"].includes(kind) || !spot || spot.needsVerification !== false || !hasValidCoordinates(spot)) {
        return Promise.reject(new Error("Unverified weather location"));
      }
      const key = `${kind}:${spot.latitude},${spot.longitude}`;
      const entry = cache.get(key);
      if (entry?.pending) return entry.pending;
      if (entry?.data && now() - entry.timestamp < cacheMs) return Promise.resolve(entry.data);
      const pending = (kind === "land" ? fetchLand(spot)
        : fetchData(buildSpotWeatherUrl(spot, "marine"), "marine"))
        .then(data => {
          const timestamp = now();
          const result = { ...data, fetchedAt: timestamp / 1000 };
          cache.set(key, { timestamp, data: result });
          return result;
        }, error => { cache.delete(key); throw error; });
      cache.set(key, { pending });
      return pending;
    },
  };
}

function buildWeatherForecast(land, marine, nowMs = Date.now()) {
  const wind = new Map((land?.hourly || []).map(row => [row.time, row.value]));
  const waves = new Map((marine?.hourly || []).map(row => [row.time, row.value]));
  const hour = Math.floor(nowMs / 3600000) * 3600;
  return [2, 4, 6].map(offset => {
    const time = hour + offset * 3600;
    return { time, windSpeed: wind.get(time) ?? null, waveHeight: waves.get(time) ?? null };
  }).filter(row => row.windSpeed !== null || row.waveHeight !== null);
}

function createSpotWeatherSection() {
  const section = document.createElement("section");
  section.className = "fishing-popup-weather";
  section.dataset.state = "idle";
  return section;
}

function renderWeatherSection(section, state) {
  const element = (tag, className, text) => {
    const node = document.createElement(tag);
    node.className = className;
    if (className === "weather-status") node.setAttribute("role", "status");
    if (text) node.textContent = text;
    return node;
  };
  const fragment = document.createDocumentFragment();
  const metrics = values => {
    const list = element("dl", "weather-metrics");
    for (const [field, label, value] of values) {
      const item = document.createElement("div");
      const term = element("dt", "", label);
      const description = element("dd", "", value);
      description.dataset.weatherField = field;
      item.append(term, description); list.append(item);
    }
    return list;
  };
  for (const [kind, heading] of [["land", "현재 날씨"], ["marine", "해상 상태"]]) {
    const group = element("section", `weather-${kind}`);
    group.append(element("h3", "", heading));
    const { status, data } = state[kind];
    group.dataset.state = status;
    if (status === "loading") group.append(element("p", "weather-status", "날씨 정보를 불러오는 중..."));
    else if (status === "error") group.append(element("p", "weather-status", kind === "land"
      ? "현재 날씨 정보를 불러올 수 없습니다." : "현재 해상 정보를 불러올 수 없습니다."));
    else {
      const current = data.current;
      const stamp = formatWeatherTime(current.time, true);
      group.append(element("p", "weather-meta", `${stamp ? `${stamp} KST · ` : ""}모델 기반${kind === "land" ? ` · ${data.model}` : ""}`));
      if (kind === "land") {
        group.append(element("p", "weather-condition", weatherCodeLabel(current.weather_code)));
        group.append(metrics([
          ["temperature_2m", "기온", formatWeatherNumber(current.temperature_2m, "°C")],
          ["apparent_temperature", "체감온도", formatWeatherNumber(current.apparent_temperature, "°C")],
          ["wind_speed_10m", "풍속", formatWeatherNumber(current.wind_speed_10m, "m/s")],
          ["wind_direction_10m", "풍향", formatWeatherDirection(current.wind_direction_10m, true)],
          ["wind_gusts_10m", "돌풍", formatWeatherNumber(current.wind_gusts_10m, "m/s")],
          ["precipitation", "강수량", formatWeatherNumber(current.precipitation, "mm")],
        ]));
        if (data.fallback) group.append(element("p", "weather-meta", "KMA 데이터 미제공으로 자동 선택 예보를 표시합니다."));
        if (!data.hasData) group.append(element("p", "weather-status", "현재 이 위치의 날씨 정보가 제공되지 않습니다."));
      } else if (MARINE_WEATHER_FIELDS.every(field => current[field] === null)) {
        group.append(element("p", "weather-status", "현재 이 위치의 해상 정보가 제공되지 않습니다."));
      } else group.append(metrics([
        ["wave_height", "파고", formatWeatherNumber(current.wave_height, "m")],
        ["wave_direction", "파향 (오는 방향)", formatWeatherDirection(current.wave_direction)],
        ["wave_period", "파주기", formatWeatherNumber(current.wave_period, "초")],
        ["sea_surface_temperature", "표층 수온", formatWeatherNumber(current.sea_surface_temperature, "°C")],
      ]));
      group.append(element("p", "weather-meta", `조회 ${formatWeatherTime(data.fetchedAt, true)} KST`));
    }
    fragment.append(group);
  }
  const forecast = element("section", "weather-forecast");
  forecast.append(element("h3", "", "향후 6시간 예보"));
  if (state.land.status === "loading" || state.marine.status === "loading") {
    forecast.append(element("p", "weather-status", "예보를 불러오는 중..."));
  } else {
    const rows = buildWeatherForecast(state.land.data, state.marine.data);
    if (!rows.length) forecast.append(element("p", "weather-status", "향후 6시간 예보 정보 없음"));
    else {
      const table = element("table", "weather-forecast-table");
      const caption = element("caption", "visually-hidden", "한국 시간 기준 향후 파고와 풍속");
      const head = document.createElement("thead");
      const headings = document.createElement("tr");
      for (const title of ["시간 (KST)", "파고", "풍속"]) {
        const cell = element("th", "", title); cell.scope = "col"; headings.append(cell);
      }
      head.append(headings);
      const body = document.createElement("tbody");
      for (const row of rows) {
        const line = document.createElement("tr");
        const time = element("th", "", formatWeatherTime(row.time));
        time.scope = "row";
        time.title = `${formatWeatherTime(row.time, true)} KST`;
        line.append(time, element("td", "", formatWeatherNumber(row.waveHeight, "m")), element("td", "", formatWeatherNumber(row.windSpeed, "m/s")));
        body.append(line);
      }
      table.append(caption, head, body); forecast.append(table);
    }
  }
  fragment.append(forecast);
  fragment.append(element("p", "weather-caution", "날씨 및 해상 정보는 참고용입니다. 해상 격자 모델값은 연안 현장과 다를 수 있습니다. 실제 출조 전 기상특보와 현장 상황을 확인하세요. 기상청 특보·해양경찰 및 현장 출입 통제를 대체하지 않습니다."));
  const source = element("p", "weather-source");
  for (const [label, href] of [
    ["Open-Meteo", "https://open-meteo.com/"], ["KMA", "https://www.kma.go.kr/"],
    ["해상 자료 (DWD 등)", "https://open-meteo.com/en/docs/marine-weather-api#data-sources"],
  ]) {
    if (source.childNodes.length) source.append(" · ");
    const link = element("a", "", label); link.href = href; link.target = "_blank"; link.rel = "noopener noreferrer";
    source.append(link);
  }
  fragment.append(source);
  section.replaceChildren(fragment);
  section.dataset.state = state.land.status === "loading" || state.marine.status === "loading" ? "loading" : "complete";
  section.setAttribute("aria-busy", String(section.dataset.state === "loading"));
}

const spotWeatherService = createSpotWeatherService();
const weatherSectionVersions = new WeakMap();

function loadSpotWeather(spot, section, onChange = () => {}) {
  if (!section) return;
  const version = (weatherSectionVersions.get(section) || 0) + 1;
  weatherSectionVersions.set(section, version);
  const state = { land: { status: "loading" }, marine: { status: "loading" } };
  const render = () => {
    if (weatherSectionVersions.get(section) !== version) return;
    renderWeatherSection(section, state); onChange();
  };
  render();
  for (const kind of ["land", "marine"]) {
    spotWeatherService.request(kind, spot).then(data => {
      state[kind] = { status: "ready", data }; render();
    }, () => { state[kind] = { status: "error" }; render(); });
  }
}
