const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

const root = path.resolve(__dirname, "..");
const spots = JSON.parse(JSON.stringify(vm.runInNewContext(
  fs.readFileSync(path.join(root, "fishing-spots.js"), "utf8") + "\nfishingSpots;"
)));
const displayable = vm.runInNewContext(
  fs.readFileSync(path.join(root, "script.js"), "utf8") + "\nisDisplayableFishingSpot;",
  { document: { querySelector: () => null } }
);
const personalNotes = [
  [
    1,
    "동복방파제",
    "무늬오징어",
    ""
  ],
  [
    2,
    "황우치해변",
    "서프루어",
    ""
  ],
  [
    3,
    "신도포구",
    "무늬오징어, 발판 좋음",
    "발판 좋음"
  ],
  [
    4,
    "성산노외2공영주차장",
    "무늬오징어 포인트",
    ""
  ],
  [
    5,
    "차귀도선착장",
    "무늬오징어",
    ""
  ],
  [
    6,
    "태흥1리어촌계",
    "무늬오징어",
    ""
  ],
  [
    7,
    "김녕불턱",
    "벵에돔, 돌돔 포인트",
    ""
  ],
  [
    8,
    "무거버거",
    "주변 무늬오징어 포인트",
    ""
  ],
  [
    9,
    "신촌포구 빨간등대",
    "벵에돔",
    ""
  ],
  [
    10,
    "한수리방파제",
    "무늬오징어",
    ""
  ],
  [
    11,
    "정주항",
    "",
    ""
  ],
  [
    12,
    "평대포구",
    "",
    ""
  ],
  [
    13,
    "서우봉입구",
    "",
    ""
  ],
  [
    14,
    "월령코지",
    "",
    ""
  ],
  [
    15,
    "수마포구",
    "",
    ""
  ],
  [
    16,
    "덕돌포구",
    "벵에돔",
    ""
  ],
  [
    17,
    "하예포구",
    "무늬오징어, 원투",
    ""
  ],
  [
    18,
    "옹포리포구",
    "돌돔, 돔 종류",
    ""
  ],
  [
    19,
    "운진항",
    "무늬오징어",
    ""
  ],
  [
    20,
    "세천포구",
    "벵에돔 포인트",
    ""
  ],
  [
    21,
    "백포포구",
    "무늬오징어",
    ""
  ],
  [
    22,
    "하귀포구",
    "",
    ""
  ],
  [
    23,
    "애월항",
    "",
    ""
  ],
  [
    24,
    "고내포구",
    "좋은 포인트, 발판 편함",
    "발판 편함"
  ],
  [
    25,
    "신흥리포구",
    "발판 편함",
    "발판 편함"
  ],
  [
    26,
    "하모 방파제",
    "4대 돔 포인트",
    ""
  ],
  [
    27,
    "협재포구",
    "안전하고 좋음, 돔 포인트",
    "안전하고 좋음"
  ],
  [
    28,
    "세화포구",
    "원투",
    ""
  ],
  [
    29,
    "두모포구공원",
    "무늬오징어, 원투",
    ""
  ],
  [
    30,
    "제주 서귀포시 대정읍 노을해안로",
    "에깅 갯바위",
    ""
  ],
  [
    31,
    "제주 서귀포시 안덕면 창천리 840-8",
    "무늬오징어 갯바위",
    ""
  ],
  [
    32,
    "연대포구",
    "",
    ""
  ],
  [
    33,
    "화순항",
    "안전함",
    "안전함"
  ],
  [
    34,
    "제주특별자치도 제주시 내도동 465-3",
    "돌돔, 참돔",
    ""
  ],
  [
    35,
    "동귀방파제",
    "",
    ""
  ],
  [
    36,
    "제주 서귀포시 대정읍 영락리 2169-4",
    "고등어, 전갱이",
    ""
  ],
  [
    37,
    "삼양해수욕장",
    "서프루어",
    ""
  ],
  [
    38,
    "중문색달해수욕장",
    "광어",
    ""
  ],
  [
    39,
    "제주 제주시 삼봉로2길 34 1층 101호 주변",
    "주변 양식장 구멍치기 포인트",
    ""
  ],
  [
    40,
    "용수포구",
    "무늬오징어",
    ""
  ],
  [
    41,
    "미수포구입구교차로",
    "무늬오징어",
    ""
  ],
  [
    42,
    "신칭항",
    "루어 농어",
    ""
  ],
  [
    43,
    "서부두",
    "",
    ""
  ],
  [
    44,
    "조천항",
    "",
    ""
  ],
  [
    45,
    "동부두",
    "",
    ""
  ],
  [
    46,
    "모슬포항",
    "안전 낚시",
    "안전 낚시"
  ],
  [
    47,
    "금능포구",
    "오징어",
    ""
  ],
  [
    48,
    "도두등대",
    "벵에돔, 한치",
    ""
  ],
  [
    49,
    "강정포구",
    "벵에돔, 안전한 테트라",
    "안전한 테트라"
  ],
  [
    50,
    "용담포구",
    "잿방어",
    ""
  ],
  [
    51,
    "북촌포구",
    "루어낚시, 무늬오징어",
    ""
  ]
];

test("all 51 original personal names and notes are preserved", () => {
  assert.deepEqual(spots.slice(0, 51).map(spot => [spot.id, spot.name, spot.userNote, spot.safetyNote]), personalNotes);
  assert.ok(spots.slice(0, 51).every(spot => spot.source === "개인 즐겨찾기"));
  assert.equal(spots.length, 69);
  assert.equal(spots.filter(spot => spot.source === "바다타임").length, 15);
  assert.equal(new Set(spots.map(spot => spot.id)).size, 69);
  assert.equal(new Set(spots.map(spot => spot.name)).size, 69);
  assert.ok(spots.every(spot => !("correctedName" in spot)));
  assert.equal(spots.find(spot => spot.id === 8).address, "제주 제주시 조천읍 조함해안로 356 1층");
});

test("only verified fishing locations and personal references have valid, unique coordinates", () => {
  const markers = spots.filter(displayable);
  assert.equal(markers.length, 44);
  assert.equal(spots.filter(spot => spot.needsVerification).length, 25);
  assert.equal(new Set(markers.map(spot => `${spot.latitude},${spot.longitude}`)).size, 44);
  for (const spot of spots) {
    assert.ok(["fishing-spot", "personal-spot", "landmark", "access-point"].includes(spot.kind));
    if (spot.needsVerification) {
      assert.equal(spot.latitude, null);
      assert.equal(spot.longitude, null);
      assert.equal(displayable(spot), false);
      assert.ok(spot.verificationNote);
    } else {
      assert.ok(spot.latitude > 33.1 && spot.latitude < 33.65);
      assert.ok(spot.longitude > 126.1 && spot.longitude < 126.98);
      assert.ok(spot.externalSources.some(source => source.url === spot.coordinateSource.url));
    }
  }
});

test("marker eligibility requires verified coordinates, not a harbor category", () => {
  const spot = spots.find(displayable);
  for (const change of [
    { latitude: null }, { longitude: null }, { latitude: "33.3" },
    { longitude: Infinity }, { latitude: 91 }, { longitude: 181 },
    { needsVerification: true }, { needsVerification: undefined },
    { kind: "unknown" },
  ]) assert.equal(displayable({ ...spot, ...change }), false);
  assert.equal(displayable(spot), true);
  for (const kind of ["personal-spot", "landmark", "access-point"]) {
    assert.equal(displayable({ ...spot, kind }), true);
  }
});

test("a personal popup near the map center can compact its scroll area without moving the camera", () => {
  const fitPopup = vm.runInNewContext(
    fs.readFileSync(path.join(root, "script.js"), "utf8") + "\nfitFishingSpotPopup;",
    { document: { querySelector: () => null } }
  );
  const details = { style: {} };
  const dialog = {
    offsetWidth: 280,
    querySelector: selector => selector === ".fishing-popup-header" ? { offsetHeight: 112 }
      : selector === ".fishing-popup-details" ? details : null,
  };
  const popup = { options: {}, getElement: () => dialog, setOffset: () => {} };
  const map = { project: () => ({ x: 200, y: 219 }), getContainer: () => ({ clientWidth: 341, clientHeight: 440 }) };
  fitPopup(map, popup, spots.find(spot => spot.id === 68));
  assert.equal(details.style.maxHeight, "29px");
  assert.equal(popup.options.anchor, "top");
});

test("a favorite button reserves space without reducing mobile details to one line", () => {
  const fitPopup = vm.runInNewContext(
    fs.readFileSync(path.join(root, "script.js"), "utf8") + "\nfitFishingSpotPopup;",
    { document: { querySelector: () => null } }
  );
  const details = { style: {} };
  const dialog = {
    offsetWidth: 280, offsetHeight: 300,
    querySelector: selector => ({
      ".fishing-popup-header": { offsetHeight: 112 },
      ".fishing-popup-details": details,
      ".fishing-popup-actions": { offsetHeight: 44 },
    })[selector] || null,
  };
  let offset;
  const popup = { options: {}, getElement: () => dialog, setOffset: value => { offset = value; } };
  const map = { project: () => ({ x: 200, y: 219 }), getContainer: () => ({ clientWidth: 341, clientHeight: 440 }) };
  fitPopup(map, popup, spots.find(spot => spot.id === 68));
  assert.equal(details.style.maxHeight, "64px");
  assert.equal(popup.options.anchor, "top");
  assert.equal(offset[1], -87);
});

test("a temporarily hidden map keeps its selected popup until layout returns", () => {
  const fitPopup = vm.runInNewContext(
    fs.readFileSync(path.join(root, "script.js"), "utf8") + "\nfitFishingSpotPopup;",
    { document: { querySelector: () => null } }
  );
  let removed = 0;
  const popup = { remove: () => { removed++; } };
  for (const [clientWidth, clientHeight] of [[0, 440], [341, 0], [0, 0]]) {
    fitPopup({ project: () => ({ x: 200, y: 200 }), getContainer: () => ({ clientWidth, clientHeight }) }, popup, spots[0]);
  }
  assert.equal(removed, 0);
  fitPopup({ project: () => ({ x: 400, y: 200 }), getContainer: () => ({ clientWidth: 341, clientHeight: 440 }) }, popup, spots[0]);
  assert.equal(removed, 1);
});

test("personal coastal reference pins describe the building, not a fishing venue", () => {
  for (const [id, latitude, longitude] of [[8, 33.5488969, 126.6550619], [39, 33.5197092, 126.5844851]]) {
    const spot = spots.find(spot => spot.id === id);
    assert.equal(displayable(spot), true);
    assert.equal(spot.latitude, latitude);
    assert.equal(spot.longitude, longitude);
    assert.ok(spot.locationNote.includes("자체는 낚시터가 아닙니다"));
    assert.deepEqual(spot.species, []);
    assert.deepEqual(spot.methods, []);
  }
  for (const id of [13, 30, 31, 34, 36, 41]) {
    assert.equal(displayable(spots.find(spot => spot.id === id)), false);
  }
});

test("Hyeonsa keeps the official species separate from the personal note", () => {
  const spot = spots.find(spot => spot.name === "현사포구");
  assert.equal(spot.latitude, 33.49753);
  assert.equal(spot.longitude, 126.449588);
  assert.equal(spot.address, "제주특별자치도 제주시 테우해안로 143");
  assert.equal(spot.coordinateSource.url, "https://badaon.or.kr/seantour_map/travel/destination/detail.do?destId=DEST023308");
  assert.equal(spot.region, "제주시 이호1동");
  assert.equal(spot.userNote, "자주 가는 포인트");
  assert.deepEqual(spot.species, ["농어", "한치"]);
  assert.deepEqual(spot.methods, []);
  assert.equal(spot.fishingInfoSource.url, "https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_000000000021167");
  assert.equal(displayable(spot), true);
});

test("address corrections update existing records and keep all seven target names unique", () => {
  const targets = [
    [67, "현사포구", "제주특별자치도 제주시 테우해안로 143", 33.49753, 126.449588],
    [15, "수마포구", "제주특별자치도 서귀포시 성산읍 일출로 258-5", 33.460981, 126.933603],
    [4, "성산노외2공영주차장", "제주특별자치도 서귀포시 성산읍 성산리 399-123", 33.4589386, 126.929765],
    [68, "신산리 개인 포인트", "제주특별자치도 서귀포시 성산읍 신산리 565-7", 33.383144200305, 126.88158422146],
    [69, "삼달리 개인 포인트", "제주특별자치도 서귀포시 성산읍 삼달하동로32번길 3", 33.366216557618, 126.87170308046],
  ];
  for (const [id, name, address, latitude, longitude] of targets) {
    const matches = spots.filter(spot => spot.name === name);
    assert.equal(matches.length, 1);
    const spot = matches[0];
    assert.deepEqual([spot.id, spot.address, spot.latitude, spot.longitude], [id, address, latitude, longitude]);
    assert.equal(displayable(spot), true);
    assert.equal(spot.source, "개인 즐겨찾기");
  }
  for (const id of [6, 16]) {
    const spot = spots.find(spot => spot.id === id);
    assert.equal(spots.filter(other => other.name === spot.name).length, 1);
    assert.equal(spot.region, "제주특별자치도 서귀포시 남원읍 태흥리");
  }
  const suma = spots.find(spot => spot.id === 15);
  assert.equal(suma.kind, "fishing-spot");
  assert.equal(suma.coordinateSource.url, "https://badaon.or.kr/seantour_map/travel/destination/detail.do?destId=DEST023367");
  const parking = spots.find(spot => spot.id === 4);
  assert.equal(parking.kind, "access-point");
  assert.equal(parking.userNote, "무늬오징어 포인트");
  assert.ok(parking.verificationNote.includes("406-2-000100"));
  for (const id of [68, 69]) {
    const spot = spots.find(spot => spot.id === id);
    assert.equal(spot.kind, "personal-spot");
    assert.equal(spot.userNote, "");
    assert.deepEqual(spot.species, []);
    assert.deepEqual(spot.methods, []);
    assert.ok(spot.locationNote.includes("건물 자체는 낚시터가 아닙니다"));
  }
});

test("Deokdol keeps its named port coordinates and Taeheung is not replaced by a village centroid", () => {
  const deokdol = spots.find(spot => spot.id === 16);
  assert.deepEqual([deokdol.latitude, deokdol.longitude], [33.2905628, 126.7606705]);
  assert.equal(deokdol.userNote, "벵에돔");
  assert.deepEqual(deokdol.species, ["넙치농어", "벵에돔", "무늬오징어", "참돔", "부시리"]);
  assert.deepEqual(deokdol.methods, ["에깅"]);
  const taeheung = spots.find(spot => spot.id === 6);
  assert.equal(taeheung.address, "제주특별자치도 서귀포시 남원읍 태흥리 1214-6");
  assert.equal(taeheung.userNote, "무늬오징어");
  assert.equal(taeheung.latitude, null);
  assert.equal(taeheung.longitude, null);
  assert.equal(taeheung.needsVerification, true);
  assert.equal(displayable(taeheung), false);
});

test("public fish and methods have a distinct consulted source", () => {
  for (const spot of spots) {
    assert.ok(Array.isArray(spot.species) && Array.isArray(spot.methods));
    assert.equal(new Set(spot.species).size, spot.species.length);
    assert.equal(new Set(spot.methods).size, spot.methods.length);
    assert.ok(spot.species.every(value => typeof value === "string" && value));
    assert.ok(spot.methods.every(value => typeof value === "string" && value));
    if (spot.species.length || spot.methods.length) {
      assert.ok(spot.fishingInfoSource);
      assert.ok(spot.externalSources.some(source => source.url === spot.fishingInfoSource.url));
    }
    for (const source of spot.externalSources) assert.equal(new URL(source.url).protocol, "https:");
  }
  // Personal catches and techniques alone do not establish publicly sourced data.
  for (const id of [1, 2, 5, 7, 37, 38, 40, 42, 48, 50, 51]) {
    assert.deepEqual(spots.find(spot => spot.id === id).species, []);
    assert.deepEqual(spots.find(spot => spot.id === id).methods, []);
  }
});

test("ambiguous places stay unresolved and a nearby port is not substituted", () => {
  for (const id of [9, 10, 11, 14, 22, 25, 26, 30, 31, 34, 35, 36, 41, 42, 44, 48]) {
    assert.equal(spots.find(spot => spot.id === id).needsVerification, true);
  }
  const yongsu = spots.find(spot => spot.id === 40);
  assert.equal(yongsu.latitude, 33.323494);
  assert.equal(yongsu.longitude, 126.16516);
  assert.equal(yongsu.coordinateSource.name, "제주관광공사");
  assert.deepEqual(spots.find(spot => spot.id === 23).aliases, ["애월항 방파제"]);
  assert.deepEqual(spots.find(spot => spot.id === 28).aliases, ["세화항 방파제"]);
});

test("Jeju Port west and east piers reuse original records and remain distinct from the offshore lighthouse", () => {
  for (const [id, latitude, longitude, node] of [
    [43, 33.5227588, 126.5301222, "4488145812"],
    [45, 33.5293798, 126.5416005, "1271043839"],
  ]) {
    const spot = spots.find(spot => spot.id === id);
    assert.equal(displayable(spot), true);
    assert.deepEqual([spot.latitude, spot.longitude], [latitude, longitude]);
    assert.equal(spot.region, "제주시 건입동 · 제주항");
    assert.ok(spot.aliases.includes(`제주항 ${spot.name}`));
    assert.equal(spot.coordinateSource.url, `https://www.openstreetmap.org/node/${node}`);
    assert.ok(spot.coordinateScope.includes("대표 위치"));
    assert.ok(spot.locationNote.includes("개인 저장 발판의 정밀 위치"));
    assert.ok(spot.species.includes("부시리"));
    assert.deepEqual(spot.reportedSpecies, ["갈치", "점다랑어", "잿방어"]);
    assert.ok(spot.reportedSpecies.every(fish => !spot.species.includes(fish)));
    assert.equal(spot.userNote, "");
    assert.deepEqual(spot.methods, []);
    assert.ok(spot.fishingInfoSource.url.includes("no=1020"));
  }
  const lighthouse = spots.find(spot => spot.id === 52);
  assert.deepEqual([lighthouse.latitude, lighthouse.longitude], [33.53277778, 126.5408611]);
  assert.equal(lighthouse.reportedSpecies, undefined);
  assert.ok(spots.find(spot => spot.id === 43).locationNote.includes("긴방파제"));
});

test("additional shore species retain their own source without rewriting the existing Badatime information", () => {
  const aewol = spots.find(spot => spot.id === 23);
  assert.deepEqual(aewol.species, ["감성돔", "농어", "돌돔", "벵에돔", "참돔", "고등어", "독가시치", "갈치"]);
  assert.equal(aewol.fishingInfoSource.name, "바다타임");
  assert.deepEqual(aewol.additionalFishingInfoSources[0].species, ["갈치"]);
  assert.equal(aewol.additionalFishingInfoSources[0].url, "https://pigkim4.tistory.com/14");
  for (const spot of spots) {
    const reported = spot.reportedSpecies || [];
    assert.equal(new Set(reported).size, reported.length);
    assert.ok(reported.every(fish => typeof fish === "string" && fish && !spot.species.includes(fish)));
    for (const source of spot.additionalFishingInfoSources || []) {
      assert.ok(source.name && source.species.length);
      assert.ok(source.species.every(fish => spot.species.includes(fish)));
      assert.ok(spot.externalSources.some(external => external.url === source.url));
      assert.equal(new URL(source.url).protocol, "https:");
    }
  }
  assert.deepEqual(spots.filter(spot => spot.species.includes("갈치")).map(spot => spot.id), [23]);
  assert.deepEqual(spots.filter(spot => spot.reportedSpecies?.includes("갈치")).map(spot => spot.id), [43, 45]);
});
