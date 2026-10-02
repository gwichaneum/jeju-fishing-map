const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { once } = require("node:events");
const { execFileSync } = require("node:child_process");
const utils = require("../tide-utils.js");
const { KHOA_TIDE_ENDPOINT, validateTideQuery, buildKhoaTideUrl, normalizeKhoaTides, createTideService } = require("../server/tide-service.cjs");
const { createApp } = require("../server.js");
const fixtures = require("./fixtures/khoa-tides.json");
const root = path.resolve(__dirname, "..");
const now = Date.parse("2026-10-02T10:00:00+09:00");
const station = utils.TIDE_STATIONS[0];
const fixture = (code = station.code, date = "20261002") => {
  const data = structuredClone(fixtures.stations[code]);
  for (const row of data.body.items.item) row.predcDt = `${date.slice(0,4)}-${date.slice(4,6)}-${date.slice(6)}${row.predcDt.slice(10)}`;
  return data;
};
const response = data => new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
let startupCalls = 0;
const source = ["fishing-spots.js", "script.js", "tide-utils.js", "tides.js"].map(file => fs.readFileSync(path.join(root,file),"utf8")).join("\n");
const frontend = vm.runInNewContext(source + "\n({findNearestTideStation,createTideClient,validateTideResponse,spots:fishingSpots});", {
  document: { querySelector: () => null }, fetch: () => { startupCalls++; },
  URLSearchParams, AbortController, setTimeout, clearTimeout,
});

test("tides make no startup request and nearest stations reuse the existing Haversine", () => {
  assert.equal(startupCalls,0);
  for (const [id,code] of [[43,"DT_0004"],[66,"DT_0022"],[64,"DT_0010"],[3,"DT_0023"],[46,"DT_0023"]]) {
    assert.equal(frontend.findNearestTideStation(frontend.spots.find(spot=>spot.id===id)).code,code);
  }
  for (const spot of [null,{needsVerification:true},{needsVerification:false,latitude:null,longitude:126}]) {
    assert.equal(frontend.findNearestTideStation(spot),null);
  }
  for(const item of utils.TIDE_STATIONS) {
    const raw=fixtures.stations[item.code].body.items.item[0];
    assert.equal(item.name,raw.obsvtrNm);assert.equal(item.latitude,raw.lat);assert.equal(item.longitude,raw.lot);
  }
});

test("Korea dates, leap days and midnight are independent of the host timezone", () => {
  assert.equal(utils.getKoreaTideDate(Date.parse("2026-10-01T15:00:00Z")),"20261002");
  assert.equal(utils.shiftTideDate("20261231"),"20270101");
  assert.equal(utils.shiftTideDate("20240228"),"20240229");
  for(const date of [null,"",20261002,"20260229","20261301","20261000","2026-10-02"]) assert.equal(utils.isValidTideDate(date),false);
  for(const value of [null,"2026-02-29 10:00","2026-10-02 24:00","2026-10-02 10:60","2026-10-02T10:00Z"]) assert.ok(Number.isNaN(utils.parseKhoaTideTime(value)));
  const at=utils.parseKhoaTideTime("2026-10-02 14:55");
  assert.equal(at,Date.parse("2026-10-02T14:55:00+09:00"));
  assert.equal(utils.formatKhoaTideTime(at),"14:55");
});

test("next tide is selected by timestamps without mutating events and handles tomorrow", () => {
  const today=normalizeKhoaTides(fixture(),station,"20261002").events;
  const snapshot=JSON.stringify(today);
  assert.equal(utils.getNextTide(today,now).heightCm,256);
  assert.equal(utils.formatTideCountdown(today[2].at,now),"4시간 55분");
  assert.equal(utils.getNextTide(today,today[3].at).at,today[3].at);
  assert.equal(utils.getNextTide(today,today[3].at+1),null);
  const tomorrow=normalizeKhoaTides(fixture(station.code,"20261003"),station,"20261003").events;
  assert.equal(utils.getKoreaTideDate(utils.getNextTide(tomorrow,today[3].at+1).at),"20261003");
  assert.equal(utils.formatTideCountdown(now-1,now),"");
  assert.equal(JSON.stringify(today),snapshot);
});

test("upstream URLs use only the documented fixed endpoint and encode the key once", () => {
  const synthetic="fixture-only+/=";
  for(const key of [synthetic,encodeURIComponent(synthetic)]) {
    const url=buildKhoaTideUrl(station,"20261002",key);
    assert.equal(url.origin+url.pathname,KHOA_TIDE_ENDPOINT);
    assert.equal(url.searchParams.get("serviceKey"),synthetic);
    assert.deepEqual([...url.searchParams.keys()].sort(),["numOfRows","obsCode","pageNo","reqDate","serviceKey","type"].sort());
    assert.equal(url.searchParams.get("obsCode"),"DT_0004");assert.equal(url.searchParams.get("reqDate"),"20261002");
    assert.equal(url.searchParams.get("type"),"json");assert.equal(url.searchParams.get("numOfRows"),"300");
  }
});

test("station and calendar validation blocks arbitrary URLs, codes and dates", () => {
  assert.equal(validateTideQuery("DT_0004","20261002",now).name,"제주");
  assert.equal(validateTideQuery("DT_0022","20261003",now).name,"성산포");
  for(const [code,date] of [["http://127.0.0.1","20261002"],["DT_9999","20261002"],["DT_0004","20261004"],["DT_0004","20260930"],["DT_0004","20260229"],[null,"20261002"]]) {
    assert.throws(()=>validateTideQuery(code,date,now),error=>error.status===400);
  }
});

test("official root header/body, single objects, units and extrema codes are parsed strictly", () => {
  const raw=fixture();raw.body.items.item.reverse();
  const data=normalizeKhoaTides(raw,station,"20261002");
  assert.deepEqual(data.events.map(event=>event.kind),["high","low","high","low"]);
  assert.deepEqual(data.events.map(event=>event.heightCm),[223,77,256,152]);
  assert.equal(data.unit,"cm");assert.equal(data.timezone,"Asia/Seoul");
  const single=fixture();single.body.items.item=single.body.items.item[0];single.body.totalCount=1;
  single.body.items.item.predcTdlvVl="-1.5";
  assert.equal(normalizeKhoaTides(single,station,"20261002").events[0].heightCm,-1.5);
  const empty=fixture();empty.body.items={};empty.body.totalCount=0;
  assert.deepEqual(normalizeKhoaTides(empty,station,"20261002").events,[]);
});

test("malformed or partial data never invents tides or treats missing levels as zero", () => {
  for(const mutation of [
    data=>{data.header.resultCode="30";},data=>{data.body.totalCount=null;},data=>{data.body.totalCount=5;},
    data=>{data.body.items.item[0].predcDt="2026-10-03 01:16";},
    ...[null,"",NaN,Infinity,"NaN"].map(value=>data=>{data.body.items.item[0].predcTdlvVl=value;}),
    data=>{data.body.items.item[0].extrSe="9";},data=>{data.body.items.item[0].obsvtrNm="서울";},
    data=>{data.body.items.item[0].lat=null;},data=>{data.body.items.item[1].predcDt=data.body.items.item[0].predcDt;},
  ]) {
    const data=fixture();mutation(data);assert.throws(()=>normalizeKhoaTides(data,station,"20261002"));
  }
  const zero=fixture();zero.body.items.item[0].predcTdlvVl=0;
  assert.equal(normalizeKhoaTides(zero,station,"20261002").events[0].heightCm,0);
});

test("server cache deduplicates by official station/date and retains tomorrow across midnight", async () => {
  let clock=now,calls=0;
  const service=createTideService({serviceKey:"fixture-only",now:()=>clock,fetcher:async url=>{
    calls++;const query=new URL(url).searchParams;return response(fixture(query.get("obsCode"),query.get("reqDate")));
  }});
  const first=service.request(station.code,"20261002");assert.equal(first,service.request(station.code,"20261002"));
  const data=await first;assert.equal(await service.request(station.code,"20261002"),data);assert.equal(calls,1);
  await service.request(station.code,"20261003");await service.request("DT_0022","20261002");assert.equal(calls,3);
  clock=Date.parse("2026-10-03T00:01:00+09:00");await service.request(station.code,"20261003");assert.equal(calls,3);
  await assert.rejects(service.request(station.code,"20261002"));
});

test("missing and placeholder keys do not request KHOA and do not crash the service", async () => {
  let calls=0;
  for(const serviceKey of [""," ","YOUR_SERVICE_KEY_HERE"]) {
    const service=createTideService({serviceKey,now:()=>now,fetcher:()=>{calls++;}});
    assert.equal(service.configured,false);
    await assert.rejects(service.request(station.code,"20261002"),error=>error.status===503&&error.code==="KEY_NOT_CONFIGURED");
  }
  assert.equal(calls,0);
});

test("server failures cool down, time out, and never expose upstream secrets", async () => {
  let clock=now,calls=0,fail=true;
  const service=createTideService({serviceKey:"fixture-only",now:()=>clock,fetcher:async()=>{
    calls++;if(fail) throw new Error("private upstream URL and fixture-only");return response(fixture());
  }});
  await assert.rejects(service.request(station.code,"20261002"),error=>!error.message.includes("fixture-only"));
  await assert.rejects(service.request(station.code,"20261002"));assert.equal(calls,1);
  clock+=30000;fail=false;await service.request(station.code,"20261002");assert.equal(calls,2);
  const timeout=createTideService({serviceKey:"fixture-only",now:()=>now,timeoutMs:5,fetcher:(_url,options)=>new Promise((_resolve,reject)=>{
    options.signal.addEventListener("abort",()=>reject(new Error("abort")),{once:true});
  })});
  await assert.rejects(timeout.request(station.code,"20261002"),error=>error.code==="UPSTREAM_TIMEOUT");
  for(const body of ["<error>fixture-only</error>","not json",JSON.stringify({header:{resultCode:"30",resultMsg:"fixture-only"}})]) {
    const broken=createTideService({serviceKey:"fixture-only",now:()=>now,fetcher:async()=>new Response(body)});
    await assert.rejects(broken.request(station.code,"20261002"),error=>!JSON.stringify(error).includes("fixture-only"));
  }
});

test("frontend fetches only same-origin station/date and shares cached/pending successes", async () => {
  let clock=now;const requests=[];
  const client=frontend.createTideClient({now:()=>clock,fetcher:async url=>{
    requests.push(url);const query=new URL(url,"http://localhost").searchParams;
    return response(normalizeKhoaTides(fixture(query.get("station"),query.get("date")),utils.TIDE_STATIONS.find(item=>item.code===query.get("station")),query.get("date")));
  }});
  const first=client.request(station.code,"20261002");assert.equal(first,client.request(station.code,"20261002"));
  const data=await first;assert.equal(await client.request(station.code,"20261002"),data);assert.equal(requests.length,1);
  await client.request(station.code,"20261003");assert.equal(requests.length,2);
  for(const url of requests) {assert.match(url,/^\/api\/tides\?/);assert.doesNotMatch(url,/serviceKey|apis\.data\.go|latitude|longitude/);}
  clock=Date.parse("2026-10-03T00:01:00+09:00");await client.request(station.code,"20261003");assert.equal(requests.length,2);
});

test("frontend rejects wrong stations, dates, units and malformed events then permits retry", async () => {
  const good=normalizeKhoaTides(fixture(),station,"20261002");
  for(const mutation of [data=>{data.station.code="DT_0022";},data=>{data.date="20261003";},data=>{data.unit="m";},data=>{data.events[0].at=null;},data=>{data.events[0].heightCm=null;},data=>{data.events[0].kind="low";}]) {
    const data=structuredClone(good);mutation(data);assert.throws(()=>frontend.validateTideResponse(data,station.code,"20261002"));
  }
  let calls=0;
  const client=frontend.createTideClient({now:()=>now,fetcher:async()=>++calls===1?new Response("{}",{status:503}):response(good)});
  await assert.rejects(client.request(station.code,"20261002"));await client.request(station.code,"20261002");assert.equal(calls,2);
});

test("Express serves only browser assets and no env, server, git, fixture or dependency files", async t => {
  const service=createTideService({now:()=>now});
  const server=createApp({tideService:service}).listen(0,"127.0.0.1");await once(server,"listening");
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const origin=`http://127.0.0.1:${server.address().port}`;
  for(const file of ["/","/styles.css","/weather.js","/tides.js","/tide-utils.js","/assets/jeju-coast.jpg"]) {
    const reply=await fetch(origin+file);assert.equal(reply.status,200);assert.equal(reply.headers.get("x-powered-by"),null);await reply.arrayBuffer();
  }
  for(const file of ["/.env","/.env.example","/%2eenv","/server.js","/server/tide-service.cjs","/package.json","/README.md","/.git/config","/node_modules/dotenv/package.json","/tests/fixtures/khoa-tides.json","/.verify/artifacts/weather-results.json"]) {
    assert.equal((await fetch(origin+file)).status,404,file);
  }
  const missing=await fetch(origin+"/api/tides?station=DT_0004&date=20261002");assert.equal(missing.status,503);
  assert.equal((await missing.json()).error.code,"KEY_NOT_CONFIGURED");
  for(const query of ["url=http://localhost","station=DT_0004&station=DT_0022&date=20261002","station=DT_0004&date=20261002&serviceKey=fixture-only"]) {
    assert.equal((await fetch(origin+"/api/tides?"+query)).status,400);
  }
});

test("authenticated proxy integration returns only normalized fields and caches upstream calls", async t => {
  let calls=0;
  const service=createTideService({serviceKey:"fixture-only",now:()=>now,fetcher:async()=>{calls++;return response(fixture());}});
  const server=createApp({tideService:service}).listen(0,"127.0.0.1");await once(server,"listening");
  t.after(()=>new Promise(resolve=>server.close(resolve)));
  const url=`http://127.0.0.1:${server.address().port}/api/tides?station=DT_0004&date=20261002`;
  for(let index=0;index<2;index++) {const reply=await fetch(url);assert.equal(reply.status,200);const text=await reply.text();assert.doesNotMatch(text,/fixture-only|serviceKey|resultMsg/);assert.equal(JSON.parse(text).events.length,4);}
  assert.equal(calls,1);
});

test("Git ignores secret env and dependencies but keeps the example trackable", () => {
  assert.equal(execFileSync("git",["check-ignore",".env"],{cwd:root,encoding:"utf8"}).trim(),".env");
  assert.equal(execFileSync("git",["check-ignore","node_modules/"],{cwd:root,encoding:"utf8"}).trim(),"node_modules/");
  assert.throws(()=>execFileSync("git",["check-ignore",".env.example"],{cwd:root,stdio:"pipe"}));
  assert.equal(fs.readFileSync(path.join(root,".env.example"),"utf8").trim(),"DATA_GO_KR_SERVICE_KEY=YOUR_SERVICE_KEY_HERE");
});
