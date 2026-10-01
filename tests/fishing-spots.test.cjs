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
  assert.equal(spots.length, 66);
  assert.equal(spots.filter(spot => spot.source === "바다타임").length, 15);
  assert.equal(new Set(spots.map(spot => spot.id)).size, 66);
  assert.equal(new Set(spots.map(spot => spot.name)).size, 66);
  assert.ok(spots.every(spot => !("correctedName" in spot)));
  assert.equal(spots.find(spot => spot.id === 8).address, "제주 제주시 조천읍 조함해안로 356 1층");
});

test("only verified fishing locations have valid, unique coordinates", () => {
  const markers = spots.filter(displayable);
  assert.equal(markers.length, 35);
  assert.equal(spots.filter(spot => spot.needsVerification).length, 31);
  assert.equal(new Set(markers.map(spot => `${spot.latitude},${spot.longitude}`)).size, 35);
  for (const spot of spots) {
    assert.ok(["fishing-spot", "landmark", "access-point"].includes(spot.kind));
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

test("marker eligibility rejects null, strings, flags and non-fishing landmarks", () => {
  const spot = spots.find(displayable);
  for (const change of [
    { latitude: null }, { longitude: null }, { latitude: "33.3" },
    { longitude: Infinity }, { latitude: 91 }, { longitude: 181 },
    { needsVerification: true }, { needsVerification: undefined },
    { kind: "landmark" }, { kind: "access-point" },
  ]) assert.equal(displayable({ ...spot, ...change }), false);
  assert.equal(displayable(spot), true);
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
  for (const id of [9, 10, 11, 14, 22, 25, 26, 30, 31, 34, 35, 36, 41, 42, 43, 44, 45, 48]) {
    assert.equal(spots.find(spot => spot.id === id).needsVerification, true);
  }
  const yongsu = spots.find(spot => spot.id === 40);
  assert.equal(yongsu.latitude, 33.323494);
  assert.equal(yongsu.longitude, 126.16516);
  assert.equal(yongsu.coordinateSource.name, "제주관광공사");
  assert.deepEqual(spots.find(spot => spot.id === 23).aliases, ["애월항 방파제"]);
  assert.deepEqual(spots.find(spot => spot.id === 28).aliases, ["세화항 방파제"]);
});
