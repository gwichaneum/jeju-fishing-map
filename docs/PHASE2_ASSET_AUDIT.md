# Phase 2 이미지 보완 감사 — 2026-10-28

아래는 이번 실행에서 직접 확인한 결과다. 이전 작업의 검사 결과를 복사한 것이 아니다. Commit·Push·Phase 3 구현·README 수정은 하지 않았다.

1. 기존 전체 어종 수: **31종** (어류 25 / 두족류 6).
2. 최종 전체 어종 수: **31종**. speciesId·지도 키·순서를 보존했다.
3. 기존 이미지 준비 중 18종: **감성돔·벵에돔·농어·돌돔·한치·무늬오징어·부시리·자리돔·숭어·벤자리·주꾸미·쥐치·삼치·조피볼락·자바리·독가시치·붕장어·민어**.
4. 최종 이미지 준비 중: **0건**. 정상 카드 31개 모두 실제 img를 갖는다.
5. 기존 사각 배경 확인: **볼락·참돔·쏨뱅이·학공치·갑오징어, 5종**. 다른 8개는 투명하지만 여백·크기·회전 차이가 있었다.
6. 교체: 기존 이미지가 있던 13종 **볼락·참돔·전갱이·고등어·광어·쏨뱅이·갈치·방어·학공치·갑오징어·살오징어·참문어·전어**. 그중 5개는 실제 배경 제거 파생 파일이며 나머지 8개는 크기·중앙 정렬·여백을 정규화했다. 같은 원본을 가공한 교체와 새 원본 추가를 구분한다.
7. 새로 준비한 이미지: 3번의 18종. 총 신규 WebP 파일은 31개다.
8. 필수 13종: 모두 각각 고유한 로컬 이미지 완료. 볼락·감성돔·참돔·벵에돔·전갱이·고등어·농어·광어·돌돔·쏨뱅이·한치·무늬오징어·갈치를 데이터와 화면에서 확인했다.
9. 최종 needsAsset=true: **0건**.
10. 중복 검사: 중복 speciesId / 경로 / SHA-256 모두 **0건**.
11. 파일 존재: **31/31**, 비어 있는 파일 0건, 브라우저 디코딩 실패 0건. 모두 512×512 투명 WebP.
12. 출처·라이선스: [SPECIES_ASSETS.md](./SPECIES_ASSETS.md)에 31행, [ATTRIBUTION.md](../assets/species/ATTRIBUTION.md)에 31종을 기록했다. 실제 원본·파일 설명·권리자·변경 내용·SA 조건을 기록했다. 참고 앱 Screenshot·검색 결과 Thumbnail·블로그 이미지·출처 미상 생성 이미지를 사용하지 않았다.
13. 실행 명령: `node skills/fish-catalog-manager/scripts/validate-catalog.mjs --catalog species-catalog.json`, 같은 명령에 `--strict`, 검증기 `--self-test`.
14. 일반 결과: **오류 0 / 정보 검토 경고 7 / PASS**. 검증기 자체 검사 PASS. 엄격 결과: **오류 0 / 경고 7 / FAIL**. 삼치·전어·조피볼락·자바리·독가시치·붕장어·민어의 기존 낚시 방법·채비·시기는 이 이미지 작업에서 검증하지 않아 보류했다.
15. fishing-app-tester: Phase 1 정적 검사 27 PASS / 0 FAIL. Phase 2 정적 검사는 27 PASS / 1 FAIL(엄격 도감의 동일 정보 경고 7건). `npm.cmd test` **83 PASS / 0 FAIL**. 브라우저 T01·T02·T03·T12·T13·T14의 Phase 2 범위를 실행했다. T04~T09(기록/IndexedDB), T10~T11(최종 지도 Query 연동)은 범위 밖으로 SKIP했다.
16. 모바일 Grid: 320px 2열, 375px 3열, 390/430px 4열, 768/812px 5열, 1024px 6열, 1440px 7열, 1920px 8열. 9개 viewport 가로 넘침 0건. 모바일/PC에서 31종 전체 상세 src/filter 일치, 검색·분류·상태 필터·키보드·닫기 focus 복귀·실패 시 재시도·접근 가능한 이미지 오류 안내를 확인했다.
17. 기존 지도 회귀: Chrome 320/375/768/1440px × 성공 fixture / Marine 단독 실패 / 세 API 동시 실패의 12조합 PASS. 44개 마커·무늬오징어 필터 14개·검색·초기화·즐겨찾기/새로고침·위치 허용/거부 에뮬레이션·주변 5곳·화장실·Popup 배치·오늘/내일 물때 fixture·일반 Navigation을 확인했다. 치명적 pageerror 0건. 이번에는 외부 날씨/KHOA의 실제 응답을 재검증하지 않았으며 GPS도 실제 기기 검사가 아니다.
18. 이번에 수정: catalog.js, catalog.css, species-catalog.json, TODO.md, docs/SPECIES_ASSETS.md, docs/SKILL_USAGE.md, assets/species/ATTRIBUTION.md, tests/catalog.test.cjs, skills/fish-catalog-manager/SKILL.md, skills/fish-catalog-manager/references/species-schema.md, skills/fish-catalog-manager/scripts/validate-catalog.mjs. 시작부터 변경되어 있던 다른 지도/PRD 파일은 이번에 편집하지 않았다.
19. 추가: scripts/normalize-species-assets.mjs, docs/species-asset-processing.json, 이 감사 문서 및 아래 31개 WebP. 재검사 코드·스크린샷은 Git 제외된 .verify/artifacts/phase2-final/와 .verify/에 있다. 브라우저 검사용 playwright-core·이미지 가공 sharp는 .verify에만 설치했고 package.json·런타임 의존성은 변경하지 않았다.
20. 삭제: 아래 기존 이미지 13개(프로젝트 시작 시 모두 미추적 파일). 원본을 보존용 Commit하지 않았다.
21. 사용자 확인: http://127.0.0.1:8086/catalog.html 에서 모바일·PC의 선화/사진 스타일과 한치의 선화 가독성을 확인한다. 자바리는 어린 개체, 주꾸미는 자연스럽게 팔을 말고 있는 개체임을 확인한다. 실제 휴대폰·다른 브라우저·실제 API 상태는 이번 에뮬레이션으로 확정하지 않는다. 기존 7종의 미검증 낚시 안내가 남아 있으므로 Phase 2 전체 완료로 표시하지 않았다.

## 추가 WebP 파일

- assets/species/rockfish.webp
- assets/species/black-seabream.webp
- assets/species/red-seabream.webp
- assets/species/largescale-blackfish.webp
- assets/species/horse-mackerel.webp
- assets/species/chub-mackerel.webp
- assets/species/japanese-seabass.webp
- assets/species/olive-flounder.webp
- assets/species/striped-beakfish.webp
- assets/species/marbled-rockfish.webp
- assets/species/local-hanchi.webp
- assets/species/patterned-squid.webp
- assets/species/hairtail.webp
- assets/species/japanese-amberjack.webp
- assets/species/yellowtail-amberjack.webp
- assets/species/pearl-spot-chromis.webp
- assets/species/flathead-mullet.webp
- assets/species/chicken-grunt.webp
- assets/species/japanese-halfbeak.webp
- assets/species/golden-cuttlefish.webp
- assets/species/japanese-flying-squid.webp
- assets/species/common-octopus.webp
- assets/species/webfoot-octopus.webp
- assets/species/thread-sail-filefish.webp
- assets/species/japanese-spanish-mackerel.webp
- assets/species/konoshiro-gizzard-shad.webp
- assets/species/korean-rockfish.webp
- assets/species/longtooth-grouper.webp
- assets/species/mottled-spinefoot.webp
- assets/species/whitespotted-conger.webp
- assets/species/mi-iuy-croaker.webp

## 삭제 이미지

- assets/species/rockfish.jpg
- assets/species/red-seabream.jpg
- assets/species/horse-mackerel.svg
- assets/species/chub-mackerel.png
- assets/species/olive-flounder.png
- assets/species/marbled-rockfish.jpeg
- assets/species/hairtail.png
- assets/species/japanese-amberjack.png
- assets/species/japanese-halfbeak.jpg
- assets/species/golden-cuttlefish.jpeg
- assets/species/japanese-flying-squid.png
- assets/species/common-octopus.png
- assets/species/konoshiro-gizzard-shad.png

## 검사 증거 (로컬, Git 제외)

- .verify/asset-audit.json, asset-before-review.png: 최초 31종/18종 누락/기존 13개 크기·투명도 감사.
- .verify/artifacts/phase2-final/browser-results.json: 9개 viewport, 전체 31종 상세, 필터·검색·상태·회색/컬러·오류 재시도 검사.
- .verify/artifacts/phase2-final/map-results.json: 12개 지도 조합·위치 거부 검사.
- 같은 폴더 catalog-390.png, catalog-1440.png, color-reference-390.png, 상세 이미지: 실제 렌더링 시각 확인.

다음 Phase 3는 조과 사진·날짜·마릿수·장소·메모와 IndexedDB 저장, 추가/수정/삭제, 누적 집계와 컬러 해금/잠금 복귀다. 이번에는 구현하지 않았다.

## 후속 정보 감사 상태 (2026-10-28)

위 21항목은 이미지 보완 작업 당시의 감사 이력이다. 이후 별도 전체 정보 감사에서 기존 7종의 낚시 안내를 보완했다. 현재 31종·이미지 31종·정보 31종, needsAsset/needsVerification 0이며 일반·엄격 검증 오류 0·경고 0이다. 이미지 경로·실제 SHA-256은 31개 모두 당시 결과와 같다. 상세한 근거·적용 범위와 지도 키는 [SPECIES_INFO_SOURCES](./SPECIES_INFO_SOURCES.md), 실행 결과는 [SKILL_USAGE](./SKILL_USAGE.md)의 마지막 기록을 따른다.
