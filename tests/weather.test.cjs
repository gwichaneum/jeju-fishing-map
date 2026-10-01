const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");
const root = path.resolve(__dirname, "..");
let startupRequests = 0;
const api = vm.runInNewContext(
  fs.readFileSync(path.join(root, "script.js"), "utf8") + "\n"
    + fs.readFileSync(path.join(root, "weather.js"), "utf8")
    + "\n({createSpotWeatherService, buildSpotWeatherUrl, normalizeSpotWeather, buildWeatherForecast, degreesToDirection, formatWeatherDirection, formatWeatherTime, formatWeatherNumber, weatherCodeLabel});",
  { document: { querySelector: () => null }, URL, URLSearchParams, AbortController, setTimeout, clearTimeout,
    fetch() { startupRequests++; throw new Error("Unexpected startup request"); } }
);
const now = Date.parse("2026-10-02T14:25:00+09:00");
const base = Math.floor(now / 3600000) * 3600;
const spot = { id: 43, latitude: 33.5227588, longitude: 126.5301222, needsVerification: false };
const plain = value => JSON.parse(JSON.stringify(value));
const fixture = (kind, start = base) => kind === "land" ? {
  current_units: { time: "unixtime", temperature_2m: "°C", apparent_temperature: "°C", wind_speed_10m: "m/s",
    wind_direction_10m: "°", wind_gusts_10m: "m/s", precipitation: "mm", weather_code: "wmo code" },
  current: { time: start, temperature_2m: 21.4, apparent_temperature: 20.8, wind_speed_10m: 4.2,
    wind_direction_10m: 315, wind_gusts_10m: 6.1, precipitation: 0, weather_code: 2 },
  hourly_units: { time: "unixtime", wind_speed_10m: "m/s" },
  hourly: { time: Array.from({length:8}, (_, i) => start + i * 3600), wind_speed_10m: [3, 3.1, 3.2, 3.3, 4.1, 4.2, 5, 5.1] },
} : {
  current_units: { time: "unixtime", wave_height: "m", wave_direction: "°", wave_period: "s", sea_surface_temperature: "°C" },
  current: { time: start, wave_height: 0.8, wave_direction: 45, wave_period: 6.4, sea_surface_temperature: 19.2 },
  hourly_units: { time: "unixtime", wave_height: "m" },
  hourly: { time: Array.from({length:8}, (_, i) => start + i * 3600), wave_height: [0.6, 0.6, 0.7, 0.7, 0.8, 0.9, 1, 1.1] },
};
const response = payload => ({ ok: true, json: async () => payload });

test("weather module startup never requests an API", () => { assert.equal(startupRequests, 0); });

test("requests use the clicked spot coordinates, official free endpoints, m/s and Korea time", () => {
  const before = JSON.stringify(spot);
  const land = api.buildSpotWeatherUrl(spot, "land");
  const marine = api.buildSpotWeatherUrl(spot, "marine");
  assert.equal(land.origin, "https://api.open-meteo.com");
  assert.equal(land.pathname, "/v1/forecast");
  assert.equal(land.searchParams.get("models"), "kma_seamless");
  assert.equal(land.searchParams.get("wind_speed_unit"), "ms");
  assert.equal(land.searchParams.get("current").split(",").length, 7);
  assert.equal(marine.origin, "https://marine-api.open-meteo.com");
  assert.equal(marine.pathname, "/v1/marine");
  assert.equal(marine.searchParams.get("cell_selection"), "sea");
  assert.equal(marine.searchParams.get("current"), "wave_height,wave_direction,wave_period,sea_surface_temperature");
  for (const url of [land, marine]) {
    assert.equal(url.searchParams.get("latitude"), String(spot.latitude));
    assert.equal(url.searchParams.get("longitude"), String(spot.longitude));
    assert.equal(url.searchParams.get("timezone"), "Asia/Seoul");
    assert.equal(url.searchParams.get("timeformat"), "unixtime");
    assert.equal(url.searchParams.get("forecast_hours"), "8");
    assert.equal(url.searchParams.has("apikey"), false);
    assert.equal(url.href.includes("sea_level_height"), false);
  }
  assert.equal(api.buildSpotWeatherUrl(spot, "land", "").searchParams.has("models"), false);
  assert.equal(JSON.stringify(spot), before);
});

test("wind and incoming wave directions share eight compass sectors", () => {
  for (const [angle, expected] of [[0,"북"],[45,"북동"],[90,"동"],[135,"남동"],[180,"남"],[225,"남서"],[270,"서"],[315,"북서"],[360,"북"],[359,"북"],[22.4,"북"],[22.5,"북동"],[-45,"북서"]]) {
    assert.equal(api.degreesToDirection(angle), expected);
  }
  assert.equal(api.formatWeatherDirection(315,true), "북서풍 315°");
  assert.equal(api.formatWeatherDirection(45), "북동 45°");
  for (const value of [null,undefined,NaN,Infinity,"45"]) assert.equal(api.degreesToDirection(value), "");
});

test("model weather codes and finite values never confuse missing values with zero", () => {
  assert.equal(api.weatherCodeLabel(0), "맑음");
  assert.equal(api.weatherCodeLabel(63), "비");
  for (const value of [null,undefined,NaN,123]) assert.equal(api.weatherCodeLabel(value), "정보 없음");
  assert.equal(api.formatWeatherNumber(0,"mm"), "0.0mm");
  for (const value of [null,undefined,NaN,Infinity,"0"]) assert.equal(api.formatWeatherNumber(value,"m"), "정보 없음");
  const data = fixture("marine");
  data.current.wave_height = null; data.current.wave_direction = undefined;
  data.current.wave_period = NaN; data.current.sea_surface_temperature = Infinity;
  data.hourly.wave_height = data.hourly.wave_height.map(()=>null);
  const normalized = api.normalizeSpotWeather(data,"marine");
  for (const field of ["wave_height","wave_direction","wave_period","sea_surface_temperature"]) assert.equal(normalized.current[field],null);
  assert.equal(normalized.hasData,false);
});

test("units are checked and km/h winds are correctly converted, including hourly forecasts", () => {
  const data = fixture("land");
  data.current.wind_speed_10m = 36; data.current_units.wind_speed_10m = "km/h";
  data.current.wind_gusts_10m = 72; data.current_units.wind_gusts_10m = "km/h";
  data.hourly.wind_speed_10m = [36]; data.hourly_units.wind_speed_10m = "km/h";
  data.current_units.temperature_2m = "°F";
  const normalized = api.normalizeSpotWeather(data,"land");
  assert.equal(normalized.current.wind_speed_10m,10);
  assert.equal(normalized.current.wind_gusts_10m,20);
  assert.equal(normalized.hourly[0].value,10);
  assert.equal(normalized.current.temperature_2m,null);
});

test("times remain KST even with UTC epochs, cross midnight, and malformed times", () => {
  const midnight = Date.parse("2026-10-02T15:00:00Z") / 1000;
  assert.equal(api.formatWeatherTime(midnight),"00:00");
  assert.match(api.formatWeatherTime(midnight,true),/10.*03.*00:00/);
  for (const value of [null,undefined,NaN,Infinity,1e30]) assert.equal(api.formatWeatherTime(value),"");
});

test("three future rows use +2/+4/+6 hours and join APIs by epoch, not array order", () => {
  const land = api.normalizeSpotWeather(fixture("land"),"land");
  const marine = api.normalizeSpotWeather(fixture("marine"),"marine");
  marine.hourly.reverse();
  const rows = api.buildWeatherForecast(land,marine,now);
  assert.deepEqual(plain(rows), [
    {time:base+7200,windSpeed:3.2,waveHeight:0.7},
    {time:base+14400,windSpeed:4.1,waveHeight:0.8},
    {time:base+21600,windSpeed:5,waveHeight:1},
  ]);
  assert.ok(rows.every(row=>row.time*1000>now && row.time*1000<=now+6*3600000));
  assert.equal(api.buildWeatherForecast(null,marine,now).length,3);
  assert.deepEqual(plain(api.buildWeatherForecast(null,null,now)),[]);
});

test("successes cache for ten minutes by provider and exact coordinates; in-flight requests deduplicate", async () => {
  let clock=now, calls=0;
  const service=api.createSpotWeatherService({now:()=>clock,fetcher:async url=>{
    calls++; return response(fixture(url.includes("marine-api")?"marine":"land"));
  }});
  assert.equal(calls,0);
  const first=service.request("land",spot), concurrent=service.request("land",spot);
  assert.equal(first,concurrent);
  const result=await first;
  assert.equal(result.model,"KMA"); assert.equal(calls,1);
  clock+=599999; assert.equal(await service.request("land",spot),result); assert.equal(calls,1);
  clock++; await service.request("land",spot); assert.equal(calls,2);
  await service.request("marine",spot); assert.equal(calls,3);
  await service.request("land",{...spot,latitude:33.5293798}); assert.equal(calls,4);
});

test("empty KMA data fall back transparently to automatic Forecast and then cache that result", async () => {
  const requests=[];
  const service=api.createSpotWeatherService({now:()=>now,fetcher:async url=>{
    requests.push(url);
    const payload=fixture("land");
    if(new URL(url).searchParams.has("models")) {
      for(const key of Object.keys(payload.current)) if(key!=="time") payload.current[key]=null;
      payload.hourly.wind_speed_10m=payload.hourly.wind_speed_10m.map(()=>null);
    }
    return response(payload);
  }});
  const result=await service.request("land",spot);
  assert.equal(result.model,"자동 선택"); assert.equal(result.fallback,true);
  assert.equal(requests.length,2);
  await service.request("land",spot); assert.equal(requests.length,2);
});

test("429 avoids a redundant fallback and failed requests can retry without breaking another provider", async () => {
  let fail=true,calls=0;
  const service=api.createSpotWeatherService({fetcher:async url=>{
    calls++;
    if(fail && !url.includes("marine-api")) return {ok:false,status:429};
    return response(fixture(url.includes("marine-api")?"marine":"land"));
  }});
  await assert.rejects(service.request("land",spot),error=>error.status===429);
  assert.equal(calls,1);
  assert.equal((await service.request("marine",spot)).hasData,true);
  fail=false; assert.equal((await service.request("land",spot)).hasData,true);
  assert.equal(calls,3);
});

test("timeouts abort finite requests, and invalid JSON / payloads fail safely", async () => {
  const service=api.createSpotWeatherService({timeoutMs:5,fetcher:(_url,options)=>new Promise((_resolve,reject)=>{
    options.signal.addEventListener("abort",()=>reject(new Error("aborted")),{once:true});
  })});
  await assert.rejects(service.request("marine",spot),/aborted/);
  for(const payload of [null,[],{error:true,reason:"bad request"}]) {
    const broken=api.createSpotWeatherService({fetcher:async()=>response(payload)});
    await assert.rejects(broken.request("marine",spot),/Invalid weather response/);
  }
  const invalidJson=api.createSpotWeatherService({fetcher:async()=>({ok:true,json:async()=>{throw new SyntaxError("invalid JSON");}})});
  await assert.rejects(invalidJson.request("marine",spot),/invalid JSON/);
});

test("unverified or invalid coordinates never cause a weather request", async () => {
  let calls=0;
  const service=api.createSpotWeatherService({fetcher:async()=>{calls++;return response(fixture("land"));}});
  for(const invalid of [null,undefined,{...spot,needsVerification:true},{...spot,latitude:null},{...spot,longitude:Infinity},{...spot,latitude:91}]) {
    await assert.rejects(service.request("land",invalid),/Unverified/);
  }
  assert.equal(calls,0);
});

test("weather popups account for wrapped headers and their actual total height", () => {
  const fit = vm.runInNewContext(fs.readFileSync(path.join(root,"script.js"),"utf8")+"\nfitFishingSpotPopup;",{document:{querySelector:()=>null}});
  const details={style:{},get offsetHeight(){return parseFloat(this.style.maxHeight)||0;}};
  const dialog={offsetWidth:254,get offsetHeight(){return details.offsetHeight+238;},querySelector:selector=>({
    ".fishing-popup-header":{offsetHeight:168},".fishing-popup-details":details,
    ".fishing-popup-actions":{offsetHeight:44},".fishing-popup-weather":{},
  })[selector]||null};
  let offset;
  const popup={options:{},getElement:()=>dialog,setOffset:value=>{offset=value;}};
  const map={project:()=>({x:143,y:220}),getContainer:()=>({clientWidth:286,clientHeight:440})};
  fit(map,popup,spot);
  assert.ok(dialog.offsetHeight<=424);
  assert.ok(details.offsetHeight>=64);
  assert.ok(220+offset[1]>=8);
});
