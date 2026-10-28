# Skill 생성 및 사용 기록

[PRD 확장](../PRD.md#11-낚시-도감-확장-요구사항) · [TODO](../TODO.md#낚시-도감-확장)

현재 상태는 문서 끝의 **Phase 4 도감→지도 범위 변경** 기록을 따른다. 이전 양방향 구현·검증은 당시의 이력이며 Popup 도감 기능은 가독성을 위해 제거했다. 공통 Navigation·도감→지도 query·기존 Popup/지도/도감/IndexedDB 회귀가 현재 인수 범위다. Phase 5 미진행. [이미지 출처](./SPECIES_ASSETS.md) · [정보 감사·출처](./SPECIES_INFO_SOURCES.md)

## Phase 1 — 생성 기록 (2026-10-28, KST)

프로젝트 루트에 아래 네 Skill과 실제 후속 작업에 필요한 reference·검증 스크립트를 생성했다.

| 생성 Skill | 자원 |
| --- | --- |
| [fish-catalog-manager](../skills/fish-catalog-manager/SKILL.md) | species-schema.md, image-source-policy.md, validate-catalog.mjs |
| [catch-record-manager](../skills/catch-record-manager/SKILL.md) | indexeddb-schema.md, validate-record-logic.mjs |
| [map-catalog-integrator](../skills/map-catalog-integrator/SKILL.md) | integration-contract.md |
| [fishing-app-tester](../skills/fishing-app-tester/SKILL.md) | test-cases.md, run-static-checks.mjs |

요청 범위는 기존 프로젝트 분석, PRD/TODO 확장, 네 Skill과 자원 생성·제작 검증이다.
제작 시 시스템 `skill-creator` 지침을 읽어 핵심 절차·조건별 reference·실행 가능한 검증기로 나눴다.
네 프로젝트 Skill을 실제 앱 기능에 적용한 사용 기록은 아직 없다. Phase 1의 syntax·검증기 자체 검사는 제작 확인이며
어종 데이터·이미지·IndexedDB·집계·브라우저·지도 연동을 구현하거나 검증했다는 의미가 아니다.

### 제작 검증 결과

아래는 2026-10-28에 실제 실행한 제작 검사다. 네 Skill의 기능 적용 이력과 구분한다.

| 검사·명령 | 실제 결과 |
| --- | --- |
| skill-creator의 `scripts/quick_validate.py` | 네 SKILL.md 모두 `Skill is valid!`; YAML 구조·이름·description·미완성 scaffold 검사 통과 |
| `node skills/fish-catalog-manager/scripts/validate-catalog.mjs --self-test` | 유효/확인 필요 fixture 및 11개 잘못된 입력 사례 검사 통과. 실제 어종 데이터 검증 아님 |
| `node skills/catch-record-manager/scripts/validate-record-logic.mjs --self-test` | 계획된 기록 schema 및 17개 잘못된 입력 사례 검사 통과. 앱 집계·IndexedDB 미검증 |
| `node skills/fishing-app-tester/scripts/run-static-checks.mjs --self-test` | 정상 frontmatter와 5개 잘못된 사례 검사 통과 |
| `node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=1` | 27개 검사 통과: 네 frontmatter·필수 자원·로컬 문서 링크·22개 JS/CJS/MJS syntax·HTML 자원·Git 제외 경로 |
| 검증기 CLI 정상/실패 처리 | 데이터/모듈 미지정은 SKIP(종료 0), 명시한 파일 없음은 FAIL(종료 1), Phase 3 필수 인자 누락도 FAIL(종료 1); 5개 흐름 확인 |
| `npm.cmd test` | 기존 지도 자동 테스트 75개 통과, 실패·건너뜀 0. 새 브라우저·실제 API 재조회 결과는 아님 |
| 기존 문서·앱 보존 비교 | 기존 TODO 원문·상태와 PRD 핵심 요약~10장 원문 보존. Git 추적 파일 변경은 PRD.md·TODO.md 두 개뿐 |
| `git diff --check` | 공백 오류 없음 |
| `node .verify/phase2c-final-check.cjs` | 보호 대상 13개 파일이 HEAD와 내용 동일(CRLF 정규화). 새 이미지 문서 두 개의 로컬 링크 34개 존재 확인 |

표준 검증기 최초 실행은 `ModuleNotFoundError: yaml`로 실패했다. Git 제외 폴더 `.verify/phase1-python`에 검증 전용 PyYAML을 설치하고
해당 경로를 Python 모듈 검색 경로에 지정해 네 Skill을 재검증하여 통과했다. 앱의 package.json/package-lock.json은 변경하지 않았다.
새 배포 대상 파일은 Skill 자원 12개와 이 문서 1개, 수정 파일은 PRD.md·TODO.md이다. 검증용 Python 패키지는 배포/커밋 대상이 아니다.

실제 어종 데이터·이미지·조과 모듈·IndexedDB·양방향 이동·T01~T14 브라우저 테스트는 미구현/미실행이다.
실제 배포 URL과 원격 GitHub 공개 상태도 이번 단계에서는 확인하지 않았다. README 축약, commit, push는 수행하지 않았다.

## 이후 Phase의 사용 기록 양식

실제 해당 SKILL.md를 읽고 절차를 적용한 뒤에만 새 항목을 추가한다. 빈 실행 기록을 미리 만들거나 사용 예정인 Skill을 사용 완료로 쓰지 않는다.

```text
날짜 (KST) / Phase:
사용한 Skill과 SKILL.md 경로:
명시적 사용 요청:
적용한 절차:
검사한 실제 파일:
실행한 명령/Script:
발견한 오류:
수정 결과:
최종 검증 결과 (PASS/FAIL/SKIP, 증거·한계):
```

Phase 2에는 fish-catalog-manager, Phase 3에는 catch-record-manager, Phase 4에는 map-catalog-integrator를 명시적으로 읽고 적용한다.
기능 구현 후 fishing-app-tester로 실제 회귀 검증을 수행한다. 미실행·자료 미준비·외부 API 미연결·실기기 미확인은 구분해 기록한다.

## Phase 2 — fish-catalog-manager 최초 구현 기록 (2026-10-28, KST)

아래는 최초 구현 시점의 기록이다. 당시 보류 항목은 문서 마지막의 **Phase 2 자료 보완·최종 검증**에서 해결하고 재검증했다. 과거의 실패 결과는 이력으로 유지한다.

| 항목 | 실제 적용 내용 |
| --- | --- |
| 사용한 Skill | `skills/fish-catalog-manager/SKILL.md`를 명시적으로 읽고 사용 |
| 사용 요청 | “Phase 2 진행해줘. fish-catalog-manager Skill을 명시적으로 사용해서 작업하고, 완료 후 멈춰줘.” |
| 읽고 적용한 reference | species-schema.md, image-source-policy.md; 실제 원본·파일명과 JPEG 원본 사진 보존 정책을 구현에 맞게 갱신 |
| 적용 절차 | 기존 필터 재조사 → 24개 고유 ID·어류/두족류 분류 → 실제 mapSpeciesKey/null 연결 → 공개/제보/메모 구분 → 정보·이미지 출처·라이선스 조사 → 로컬 파일·SHA-256 기록 → 반영 전 staging 검증 → 회색/컬러 형태 직접 비교 |
| 검사 파일 | PRD.md·TODO.md·fishing-spots.js·spot-filters.js·server.js·index.html·styles.css, 신규 species-catalog.json·catalog.html·catalog.js·catalog.css·assets/species/*·tests/catalog.test.cjs |
| 실행 Script | `node skills/fish-catalog-manager/scripts/validate-catalog.mjs --catalog .verify/phase2-catalog-staging.json`, 실제 반영 후 `--catalog species-catalog.json`, `--strict`, `--self-test` |
| 발견한 문제 | 한국어 백과 학공치 대표 이미지가 Hyporhamphus meeki로 식별되어 제외. 한치 블로그 사진은 이용 권한을 확인하지 못했고 Commons 후보는 초밥 사진으로 개체 형태에 부적합. 일부 자동 저작자 정보는 비어 있거나 self로만 표기됨 |
| 수정 결과 | 학공치는 국립해양생물자원관·제주 표본 연구의 Hyporhamphus sajori로 대조. OpenCage·Almandine 등 저작자 표기를 원본 페이지/이력에서 보완. 부시리·주꾸미 분류 대응은 WoRMS로 추가 대조. 갈치·무늬오징어·갑오징어는 온전한 형태가 잘 보이는 자료로 교체 |
| 최종 검증 | 24항목·서로 다른 로컬 이미지 23개, 일반 검증은 구조 오류 0·경고 21로 통과. 엄격 검증은 경고 때문에 종료 1이며 자료 전체 준비 완료로 기록하지 않음 |

주요 출처:

- [국립수산과학원 꼴뚜기 미니백과](https://m.blog.naver.com/nifskorea1/223618822751): 제주한치/창꼴뚜기, 무늬오징어/흰꼴뚜기 명칭 참고. 사진은 복제하지 않았다.
- [국립해양생물자원관 학공치 자료](https://www.mbris.kr/pub/about/gallery.do?pageIndex=504): 국명과 Hyporhamphus sajori 대조. 갤러리 사진은 복제하지 않았다.
- [무늬오징어 야엔 기사](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=18159), [감성돔 가을 채비](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=4071), [참돔 찌낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=90820), [벵에돔낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=90670), [문어낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=90743): 확인한 방법·채비·시기를 문맥에 한정해 짧게 재서술. 원문 문장·사진·과거 금어기 규정을 가져오지 않았다.
- [WoRMS 주꾸미 원본 표기의 동의어](https://www.marinespecies.org/aphia.php?p=taxdetails&id=342008), [부시리 원본 표기의 분류 대응](https://www.marinespecies.org/aphia.php?p=taxdetails&id=302501): 원본 학명과의 대응을 검토했다. 지역명을 임의 학명으로 바꾸지 않았다.
- 이미지 23개의 원본·저작자·개별 라이선스는 [ATTRIBUTION](../assets/species/ATTRIBUTION.md)과 실제 JSON에 기록했다. hotlink 없이 로컬 파일을 사용한다.

### 최초 검토에서 남았던 자료

한치 이미지는 `imageSrc: null`, `imageVerified: false`로 남겼다. 나머지 항목도 추천 채비·시기·서식·지도 연결 중 확인되지 않은 범위를 `needsVerification`과 사유로 표시했다.
정보 전체 검증 4항목, 추가 확인 필요 20항목이며, 엄격 검증 경고 21개는 20항목과 한치 이미지 준비 경고다.
빈 필드를 상식이나 추정으로 채우지 않았다. C02의 이미지 전체 준비·엄격 검증 완료 체크는 미완료로 유지한다.

## Phase 2 — fishing-app-tester 사용 (2026-10-28, KST)

| 항목 | 실제 적용 내용 |
| --- | --- |
| 사용한 Skill | `skills/fishing-app-tester/SKILL.md` 및 references/test-cases.md를 읽고 현재 Phase의 회귀 항목 적용 |
| 사용 요청 | 최초 요청의 “기능 구현 후에는 fishing-app-tester Skill을 사용해서 전체 회귀 테스트” 조건을 Phase 2 구현 범위에 적용 |
| 검사 파일 | catalog.html·catalog.css·catalog.js·species-catalog.json·index.html·styles.css·server.js·로컬 이미지, 기존 지도 기능 모듈과 tests/*.test.cjs |
| 실행 명령 | `npm.cmd test`, `node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=2 --catalog species-catalog.json`, `git diff --check`; 검증 전용 `.verify/phase2-browser.cjs`, `.verify/phase2-map-regression.cjs` |
| 발견한 오류 | 검색창 blur의 change 이벤트가 카드를 다시 만들어 검색 직후 카드 클릭/Enter 포커스를 잃음. 초기에 도감 favicon 요청이 404 |
| 수정 결과 | change 핸들러를 radio 입력으로 제한하고 검색은 input/compositionend에서 처리. 기존 로컬 map.svg를 favicon으로 지정. 수정 후 click·Enter·Space·Escape·Tab·focus 복귀 통과 |
| 자동 검증 | 기존 75개 + 신규 도감 7개 = 82개 통과, 실패·SKIP 0. 데이터·검색·근거 구분·이미지 hash/출처·미확인 처리·잘못된 응답·서버 허용 목록 확인 |
| 정적 검증 | frontmatter·문서 링크·24개 JS/CJS/MJS syntax·HTML 자원·Git 제외 등 27개 통과. 실제 도감 엄격 검증 1개는 보류 자료 때문에 실패. 전체 정적 검사 성공으로 쓰지 않음 |
| 브라우저 | 별도 Chrome profile에서 320×740 / 375×812 / 768×1024 / 1024×768 / 1440×1000 / 1920×1080 / 812×375, 가로 넘침 없음·24카드·23이미지·한치 준비 중 확인 |
| 실패 복구 | HTTP 503·잘못된 JSON 구조·네트워크 실패 후 재시도 성공, 이미지 요청 실패 시 텍스트 대체. 필수 로컬 파일의 예상하지 못한 404·치명적 pageerror 없음 |
| 지도 회귀 | 실제 MapLibre 44개 마커, 어종 필터/초기화, Popup·화장실·즐겨찾기/재접속·공통 메뉴. 320/375/768/1440px에서 날씨/Marine/물때 동시 503 주입 후에도 기존 탐색·저장·모의 위치·가까운 5곳 유지 |
| 증거 | Git 제외 `.verify/artifacts/phase2/results.json`, map-regression.json, catalog-*.png, detail-*.png, map-*.png; 컬러 참고 화면은 원본 비교용 CSS 변경이며 실제 해금이 아님 |

| 테스트 | Phase 2 결과와 범위 |
| --- | --- |
| T01 | PASS: 초기 0/24·0%, 전체 미수집, 분류/상태/검색·수집완료 빈 결과 |
| T02 | PASS: 미수집 상세와 준비 중 카드 상세, click·Enter·Space, 닫기·Escape·focus 복귀 |
| T03 | PARTIAL: 23개 출처 이미지의 회색/컬러와 형태를 직접 비교. 한치 이미지 1개는 준비 중 |
| T04~T09 | SKIP: Phase 3의 Form·저장·집계·해금·새로고침 보존은 구현하지 않음 |
| T10~T11 | SKIP: Phase 4의 어종별 지도 이동·Popup 도감 링크·query는 구현하지 않음. 일반 Navigation은 확인 |
| T12 | 현재 회귀 범위 PASS: 자동 75개와 별도 profile의 지도·환경 API 실패 격리·모의 위치·즐겨찾기 보존. 실제 공식 API 재조회·실제 GPS/현장 검증은 미실행 |
| T13 | 현재 UI PASS: 7개 viewport의 도감 Grid·상세, 4개 viewport의 지도 Popup/스크롤/버튼. 미구현 기록 Form은 SKIP |
| T14 | 실행한 시나리오에서 치명적 JS 오류·미처리 rejection·예상 밖 필수 자원 404 없음. 의도한 실패 주입은 관련 안내로 처리 |

`.env`·실제 API key는 읽거나 수정하지 않았다. 검증 서버는 createApp()의 키 미설정 상태와 통제된 실패 응답을 사용했다.
포인트·좌표·화장실·즐겨찾기·위치·날씨·물때 모듈과 package.json/package-lock.json, README는 보존했다.
Phase 3로 넘어가지 않았으며 commit/push·배포·README 최종 축약도 수행하지 않았다.

## Phase 2 자료 보완·최종 검증 (2026-10-28, KST)

| 항목 | 실제 적용 내용 |
| --- | --- |
| 명시적 사용 요청 | “Phase 2 진행해줘. fish-catalog-manager Skill을 명시적으로 사용해서 작업하고, 완료 후 멈춰줘.” 재요청에 따라 기존 구현의 보류 자료를 보완 |
| 사용한 Skill | `skills/fish-catalog-manager/SKILL.md`와 species-schema.md·image-source-policy.md를 다시 읽고 적용. 검증에는 `skills/fishing-app-tester/SKILL.md`와 test-cases.md도 읽고 적용 |
| 적용 절차 | 실제 JSON과 기존 필터 재대조 → 전문 기사·현장 기록 원문에서 남은 20항목의 안내 확인 → 지역·시점 범위 명시 → 한치 이미지의 식별·저자·CC 조건 확인 → 별도 staging 엄격 검사 → 실제 파일 반영 → 화면·지도 재검증 |
| 검사·변경 파일 | species-catalog.json·assets/species/local-hanchi.jpg·ATTRIBUTION.md, catalog.html·catalog.js·catalog.css·tests/catalog.test.cjs, fish Skill·schema·검증기, PRD.md·TODO.md·이 문서 |
| 정보 보완 | 24항목의 특징·방법·채비·시기·서식 참고를 표시할 수 있도록 출처를 대조. 서해 광어·남해 갈치·서해 주꾸미 자료는 해당 지역으로 표시하고 제주 고정 시즌으로 쓰지 않음. 벤자리는 2021년 7월 제주 개인 출조 사례로 한정하며 붉벤자리와 구분 |
| 한치 이미지 | 국립수산과학원 제주한치/창꼴뚜기 설명과 WoRMS의 옛 이름 Loligo edulis → Uroteuthis edulis를 대조. iNaturalist 관찰 69139625(Research Grade), りなべる의 사진 112123093 원본 페이지에서 CC BY 4.0 확인. 일본 관찰 개체의 참고 사진이며 지역명 전체에 학명을 부여하지 않음 |
| 지도 키 검증 수정 | null 키를 무조건 미확인으로 처리하던 규칙을 보완. 실제 필터를 검토해 정확한 대응 키가 없으면 mapMatchStatus=unavailable·null·사유가 모두 필요. 검토 전 null은 계속 needsVerification=true 요구. 기존 포인트·필터를 변경하지 않음 |
| 발견·수정한 오류 | 원본 출처 링크에 Commons 문구가 고정되어 있어 일반 명칭으로 수정. 세로 사진의 grid 자식이 프레임보다 커져 한치 몸통이 잘리고 모바일 마지막 이미지가 보이지 않던 문제는 프레임 기준 절대 배치·object-fit:contain으로 수정. 24개 이미지가 각 프레임 안에 들어오는지 검사 추가 |
| 적용 전 검증 | `.verify/phase2b-catalog-staging.json --strict` 오류 0·보류 경고 0. 한치 로컬 파일은 저작자·권한·종 식별 및 직접 시각 검토 후 사용 |
| 데이터 최종 검증 | `node skills/fish-catalog-manager/scripts/validate-catalog.mjs --catalog species-catalog.json` 및 `--strict`: 모두 PASS, 오류 0·보류 경고 0. 24항목·고유 로컬 이미지 24개·needsVerification 0. verified는 표시한 정보와 출처의 대조이며 현장 상태 보증이 아님 |
| 검증기 자체 검사 | `node skills/fish-catalog-manager/scripts/validate-catalog.mjs --self-test` PASS. 정상·보류 fixture와 16개 잘못된 사례. 새로 확인된 연결 없음은 허용하되 사유 누락·검토 전 null·불일치 상태·잘못된 enum은 실패 |
| 자동 테스트 | `npm.cmd test`: 82개 PASS, 실패·SKIP 0. 이미지 바이트/SHA-256·24개 등록 경로·출처와 기존 지도 회귀 포함 |
| 정적 검사 | `node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=2 --catalog species-catalog.json`: 28개 PASS·실패 0. Phase 3 기록 로직은 명시적 SKIP |
| Skill·변경 형식 | 표준 skill-creator `quick_validate.py skills/fish-catalog-manager`: `Skill is valid!`. `git diff --check` 공백 오류 없음 |
| 브라우저 | Chrome 별도 profile, 7개 viewport에서 목록·검색·분류·상태·상세·키보드·focus 복귀·24개 이미지 로드/프레임 적합·한치 저작자/라이선스·실패 후 재시도 PASS. 치명적 pageerror·예상 밖 로컬 404 없음 |
| 시각 재검증 | 375px와 1440px에서 한치 상세 회색/컬러의 동일 src·크기·좌표 검사 PASS. 전체 컬러 참고와 회색 목록, 마지막 행의 주꾸미·쥐치, 한치 전체 몸통·지느러미·팔을 직접 비교. CSS 비교용이며 실제 해금 기능 아님 |
| 지도 재검증 | 실제 MapLibre 44개 마커·어종 필터 14개/초기화·Popup·즐겨찾기 재접속·공통 Navigation PASS. 320/375/768/1440px에서 API 동시 실패 격리·화장실·Popup 스크롤·모의 GPS 가까운 5곳 유지 |
| 증거 | Git 제외 `.verify/artifacts/phase2/results.json`, map-regression.json, catalog-*.png·detail-*.png·hanchi-gray/color-*.png. 실행 스크립트는 `.verify/phase2-browser.cjs`, phase2-map-regression.cjs, phase2b-visual.cjs |

추가 조사에서 사용한 주요 원문:

- [한치낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=89780), [전갱이](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=90192), [쏨뱅이](https://fishingseasons.co.kr/contents_view_detail.asp?b_no=1669), [자리돔](https://fishingseasons.co.kr/contents_view_detail.asp?b_no=11727): 해당 종의 안내와 형태·지역 문맥 대조.
- [제주 벤자리 현장 기록](https://m.blog.naver.com/jarok7/222448739064), [제주 쇼어 플러깅](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=13252): 특정 장소·시점의 낚시 사례로 표시. 기사 속 이동 경로·과거 가격·금어기·위험 행동을 앱의 안내로 가져오지 않았다.
- [한치 사진 원본·저작자·CC BY 4.0](https://www.inaturalist.org/photos/112123093), [관찰 식별](https://www.inaturalist.org/observations/69139625), [WoRMS 동의어](https://www.marinespecies.org/aphia.php?p=taxdetails&id=574558). 24개 이미지의 개별 조건은 [ATTRIBUTION](../assets/species/ATTRIBUTION.md)에 기록했다.

T01·T02·T03·T13·T14는 현재 Phase 2 구현 범위에서 PASS다. T12도 실행한 지도 회귀 범위에서 PASS이며 실제 공식 API 성공 재조회·실제 휴대폰/GPS·현장 확인은 미실행이다.
T04~T09(기록·IndexedDB·해금)와 T10~T11(어종별 지도 양방향 연결)은 각각 Phase 3·4 미구현이므로 SKIP이다.
기존 포인트·좌표·지도 모듈·README·package.json/package-lock.json 13개 파일은 HEAD와 내용이 동일하다(CRLF/LF 정규화 비교). `.env`와 실제 키는 읽거나 수정하지 않았다.

### Phase 2 변경 파일·인계

- 신규: catalog.html·catalog.css·catalog.js·species-catalog.json·tests/catalog.test.cjs, assets/species의 고유 이미지 24개와 ATTRIBUTION.md (30개 파일).
- 수정: index.html·styles.css·server.js, PRD.md·TODO.md·docs/SKILL_USAGE.md, fish-catalog-manager의 SKILL.md·references 2개·검증기, map-catalog-integrator의 integration-contract.md (11개 파일).
- C02·C03 완료. 다음 단계는 사용자 요청 후 Phase 3의 C04·C05: IndexedDB 조과 기록과 파생 집계·컬러 해금이다.
- 실기기·현장·배포 검증은 남겨 두며 Phase 3로 넘어가지 않았다. commit·push·배포는 수행하지 않는다.

## Phase 2 재작업 — 이미지 감사·Grid 수정 (2026-10-28, KST)

사용자의 최신 요청은 기존 Phase 2 이미지와 Grid를 다시 감사·수정하고, fish-catalog-manager 및 fishing-app-tester를 명시적으로 사용한 뒤 멈추는 것이다. Phase 3 구현·commit·push는 제외했다.
초기에는 참고 화면 파일을 받지 못했으나 재요청에서 제공한 `KakaoTalk_20261028_014644572.jpg`, `_01.jpg`, `_02.jpg` 세 장을 직접 확인했다. 링·전신·이름/상태·4열 밀도를 참고했으며 화면 속 어종 이미지를 잘라 사용하지 않았다.

| 항목 | 이번에 실제 적용한 내용 |
| --- | --- |
| fish-catalog-manager | 작업 시작 전 [SKILL.md](../skills/fish-catalog-manager/SKILL.md)를 읽었다. 데이터 변경 전에 references/species-schema.md, 이미지 교체 전에 references/image-source-policy.md를 읽고 순서에 따라 적용했다. 실제 반영 전 별도 staging JSON을 검증했다. |
| fishing-app-tester | 검증 단계에서 [SKILL.md](../skills/fishing-app-tester/SKILL.md)와 references/test-cases.md를 읽고 Phase 2에 해당하는 T01~T03·T12~T14를 적용했다. 미구현 단계는 SKIP으로 구분했다. |
| 출처 조사 보조 | Firecrawl Skill을 읽고 공개 출처 검색·원문 확인에 사용했다. 추가 조회가 크레딧 부족으로 중단되어 웹 도구와 원본 HTML로 계속 확인했다. Commons API 429도 우회 재시도 대신 공개 원문·다른 공식 출처로 보완했다. |
| 감사 대상 | species-catalog.json, assets/species 전체 24개 파일, catalog.html·catalog.css·catalog.js, 실제 지도 필터와 서버 제공 목록. 최초 잘못된 경로·hotlink·0바이트·중복 src/바이트·미사용 파일은 없었다. |
| 처음 발견한 품질 문제 | 수중/수조·암반/바닥·손·낚시 도구·다른 개체·글자/숫자·꼬리 잘림 등 21개. 정확한 라이선스가 있어도 새 품질 기준에 미달하면 제외했다. |
| 파일 정리 | 기존 21개 중 7개 교체·14개 준비 중 전환, 적합 3개 유지. 전어 이미지 신규 추가. 안전한 절대 경로·단일 파일 목록을 확인한 후 미사용 옛 파일 20개 삭제. 볼락은 동일 경로의 내용을 교체했다. 삭제·교체 전 목록과 SHA-256을 감사 자료에 남겼다. |
| 데이터 | 필수 30종+기존 쥐치=31종(어류 25·두족류 6). 기존 ID 유지, 문어 표시명은 참문어. 새 7종은 국립수산과학원 국명·기본 특징과 대조했지만 낚시 방법·채비·제주 시기는 빈 배열/null·verified=false로 보류했다. |
| 이미지 계약 | needsAsset·assetNote·imageQualityVerified·imageBackground 추가. 미준비는 imageSrc=null·imageVerified=false·needsAsset=true·needsVerification=true. 준비 파일은 모두 로컬·종별 고유 파일명이며 출처·저자·이용 조건을 별도로 기록했다. |
| 한치·무늬오징어 | 한치의 기존 CC BY 4.0 사진은 손이 포함되어 삭제했다. 무늬오징어의 수중 사진과 숫자가 있는 공개 도판 후보도 제외했다. 두 종 모두 대체 이미지 미확보로 준비 중이며 다른 오징어 이미지로 대신하지 않았다. |
| 갈치·새 출처 | 갈치는 국립수산과학원 투명 PNG·Trichiurus japonicus·공공누리 제1유형을 대조했다. DBCLS Togo gallery 원문의 정확한 학명·CC BY 4.0·설계자·편집자를 확인해 전갱이·방어·살오징어·참문어에 서로 다른 원본을 사용했다. 볼락은 H. Patterson의 공개 도판이다. |
| Grid·상세 수정 | 큰 개별 흰 카드 제거, 차분한 링·이름·상태의 촘촘한 구조. 기존 바다/밝은 Glass/blue·teal 디자인 유지. imageScale·imageRotation으로 원본 비율을 유지하며 배치했다. 준비 11종은 목록·상세에서 같은 src·scale·rotation·회색 filter를 사용한다. |
| 발견·수정한 UI 오류 | 목록과 상세의 brightness 값 차이를 공통 CSS 변수로 통일했다. HTML의 고정 수집 수를 제거하고 유효 speciesId 집합에서 수집 수·전체·비율을 계산하는 순수 함수로 바꿨다. 실제 해금·기록 저장은 구현하지 않았다. |
| 검증기 보강 | 최소 30종·needsAsset·품질 메타데이터·파일명/ID·0바이트·중복 바이트/SHA-256·SVG 활성/외부 참조·finite scale/rotation 검사를 추가했다. 보류를 정상 이미지처럼 취급하지 않으며 strict 실패를 숨기지 않는다. |
| 문서 | PRD·TODO의 옛 24개 전체 준비 상태를 현재 31/11/20과 엄격 인수 미완료로 수정했다. [SPECIES_ASSETS](./SPECIES_ASSETS.md)에 31종 표·원본/라이선스·이전 24개 감사·삭제 20개·교체 7개·남은 자료를 기록했다. |

### 데이터·자동·정적 검증

| 실행 명령 | 실제 결과 |
| --- | --- |
| `node skills/fish-catalog-manager/scripts/validate-catalog.mjs --catalog .verify/phase2c-staging.json` | 반영 전 구조 PASS: 오류 0·보류 경고 41 |
| 위 staging 명령 + `--strict` | FAIL: 오류 0·보류 경고 41, 미준비를 반영 전에 확인 |
| `node skills/fish-catalog-manager/scripts/validate-catalog.mjs --catalog species-catalog.json` | 실제 데이터 구조 PASS: 오류 0·보류 경고 41 |
| 위 실제 데이터 명령 + `--strict` | FAIL: 이미지 미준비 20개+needsVerification 21개. C02 전체 준비·엄격 인수 미완료 |
| `node skills/fish-catalog-manager/scripts/validate-catalog.mjs --self-test` | PASS: 정상/보류 fixture와 잘못된 사례 20개. 앱 검증과 구분 |
| `npm.cmd test` | 83개 PASS, 실패·SKIP 0. 기존 75개+도감 8개; 필수 30종·진행률·지도 키·이미지 hash/경로·출처·미확인 처리·서버 허용 목록 포함 |
| `node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=2 --catalog species-catalog.json` | 구조/자원/문서/문법 등 27개 PASS, 실제 도감 strict 1개 FAIL(보류 41개). Phase 3 기록 검증은 SKIP. 전체 성공으로 기록하지 않음 |
| `git diff --check` | 공백 오류 없음 |

### 브라우저·이미지·기존 지도

Chrome의 별도 profile과 키가 없는 검증 서버를 사용했다. 실제 개인 브라우저 저장소는 사용하지 않았다.

| 화면 | 열 수 | 확인 결과 |
| --- | --- | --- |
| 320×740 | 2 | 31카드·11이미지 로드·20준비 중, 넘침 없음 |
| 375×812 | 3 | 동일 |
| 390×844, 430×932 | 4 | 동일, 모바일 4열 및 44px 이상 터치 영역 |
| 768×1024, 812×375 가로 | 5 | 동일 |
| 1024×768 | 6 | 동일 |
| 1440×1000 | 7 | 동일 |
| 1920×1080 | 8 | 동일 |

- 목록·상세: 모든 미수집 카드 상세 열기, 분류/상태/검색 AND·빈 결과·초기화·한치/무늬오징어/갈치 존재 확인. click·Enter·Space·Escape·Tab·focus 복귀 통과.
- 390px/1440px에서 준비된 11종 각각의 목록/상세 src·동일 회색 filter를 검사했다. CSS 컬러 참고 상태에서도 11종 모두 src·bounding box·scale/rotation/위치가 동일하고 filter만 제거된다. 이 비교는 실제 저장·해금이 아니다.
- 회색 목록·컬러 참고 화면·갈치 상세를 직접 시각 확인했다. 준비된 이미지의 전신·서로 다른 형태·깨끗한 배경을 확인했다. 이미지 없는 종의 형태를 확인했다고 기록하지 않는다.
- HTTP 503·잘못된 구조·네트워크 오류→재시도 성공, 이미지 요청 실패→텍스트 대체를 확인했다. 치명적 pageerror·예상하지 못한 필수 로컬 404 없음.
- 실제 MapLibre 44마커→무늬오징어 필터 14→초기화 44, 검색·Popup·즐겨찾기 재접속 보존·지도↔도감 공통 Navigation 통과. 도감으로 돌아와 31종 모두의 상세 이름·이미지/준비 중 표시와 보류 사유를 확인했다.
- 320/375/768/1440px에서 날씨/Marine/물때 동시 503에도 지도·검색·초기화·즐겨찾기·화장실·Popup 화면 적합/내부 스크롤 유지. 모의 GPS와 가까운 5곳 확인. 공식 API 성공 응답·실제 GPS 검증으로 해석하지 않는다.

| 테스트 | 현재 Phase 2 결과 |
| --- | --- |
| T01 | PASS: 31종·초기 0/31·0%·전체 미수집·데이터 기반 수집 수·분류/상태/검색 |
| T02 | PASS: 준비/미준비 모두 상세 열기·출처/보류 안내·키보드·focus 복귀 |
| T03 | PARTIAL: 준비 11종의 동일 원본·고유 형태·회색/컬러·전신 확인. 나머지 20종의 형태 및 한치/무늬오징어·참문어/주꾸미 비교 미완료 |
| T04~T09 | SKIP: Phase 3의 Form·기록·IndexedDB·실제 해금/저장 미구현 |
| T10~T11 | SKIP: Phase 4의 어종별 지도 query·Popup 도감 상세 연결 미구현 |
| T12 | 실행한 지도 회귀 범위 PASS; 실제 API·실기기·현장 확인 미실행 |
| T13 | 현재 목록·상세 9개 viewport와 지도 4개 viewport PASS; 기록 Form SKIP |
| T14 | 실행한 시나리오에서 치명적 오류·미처리 실패·예상 밖 필수 로컬 404 없음 |

증거는 Git 제외 `.verify/artifacts/phase2c/results.json`, navigation.json, catalog-*.png·detail-*.png·color-reference-*.png 및 `.verify/artifacts/phase2/map-regression.json`·map-*.png에 있다. 실행 스크립트는 `.verify/phase2c-browser.cjs`, phase2c-navigation.cjs, phase2-map-regression.cjs다.

### 남은 자료와 변경 파일

needsAsset 20종: 감성돔·벵에돔·농어·돌돔·쏨뱅이·한치·무늬오징어·부시리·자리돔·숭어·벤자리·갑오징어·주꾸미·쥐치·삼치·조피볼락·자바리·독가시치·붕장어·민어.
새 7종(삼치·전어·조피볼락·자바리·독가시치·붕장어·민어)의 낚시 안내도 검토가 남는다. C02 전체 준비는 미완료이며 C03의 데이터/준비 중 처리·반응형 목록/상세 UI는 완료했다.

- 이번 재작업 수정: species-catalog.json·catalog.html·catalog.css·catalog.js·tests/catalog.test.cjs, assets/species/rockfish.jpg·ATTRIBUTION.md, PRD.md·TODO.md·docs/SKILL_USAGE.md, fish-catalog-manager의 SKILL.md·references 2개·validate-catalog.mjs, fishing-app-tester의 references/test-cases.md.
- 이번 신규: docs/SPECIES_ASSETS.md, assets/species/horse-mackerel.svg·olive-flounder.png·hairtail.png·japanese-amberjack.png·japanese-flying-squid.png·common-octopus.png·konoshiro-gizzard-shad.png. 유지한 3개 이미지는 red-seabream.jpg·chub-mackerel.png·japanese-halfbeak.jpg다.
- Phase 1 HEAD 대비 전체 Phase 2 신규: catalog.html·catalog.css·catalog.js·species-catalog.json·tests/catalog.test.cjs·docs/SPECIES_ASSETS.md·assets/species/ATTRIBUTION.md와 현재 이미지 11개. 이전 Phase 2의 index.html·styles.css·server.js·map-catalog-integrator/references/integration-contract.md 변경은 유지했다.
- 보호: 포인트·좌표·화장실·검색/필터·즐겨찾기·위치·날씨·물때 모듈, README·package.json/package-lock.json은 HEAD와 내용 동일(CRLF 정규화). `.env`·실제 키는 읽거나 수정하지 않았다.

직접 확인할 항목은 미준비 이미지 20종의 권한/형태, 새 7종의 안내 자료, 실제 휴대폰의 가독성·네트워크·GPS와 공식 API다. Phase 3의 예정 작업은 조과 Form·IndexedDB·기록 CRUD·파생 집계·동일 이미지 컬러 해금이며 이번에 구현하지 않았다. commit·push·배포 없이 이 Phase에서 멈춘다.

## Phase 2 후속 보완 — 갑오징어·쏨뱅이 (2026-10-28, KST)

같은 참고 화면 3장과 재작업 요청을 다시 받아 이미 반영된 Grid·31종 데이터·이전 감사 결과를 확인한 뒤 남은 이미지 후보를 추가 조사했다. 이번 실행의 현재 상태는 **31종·이미지 13종·needsAsset 18종**이다. 앞 절의 11종 준비 기록과 구분한다.

| 항목 | 실제 수행 |
| --- | --- |
| fish-catalog-manager 명시적 사용 | SKILL.md를 작업 시작 전에 직접 읽었다. 데이터 변경 전에 references/species-schema.md, 이미지 변경 전에 references/image-source-policy.md를 읽고 staging 검증 후 실제 JSON에 반영했다. |
| fishing-app-tester 명시적 사용 | 검증 단계에서 SKILL.md와 references/test-cases.md를 직접 읽고 현재 Phase 2 범위를 다시 실행했다. 개인 브라우저 저장소 대신 별도 Chrome profile·키 없는 createApp 검증 서버를 사용했다. |
| 갑오징어 | [국립수산과학원](https://www.nifs.go.kr/contents/actionContentsCons0088.do)의 참갑오징어·Sepia esculenta·Golden cuttlefish와 해당 항목의 공공누리 제1유형을 확인했다. 공개 원본 MF0009730_2.jpg는 단독 개체 전신·흰 배경·글자/워터마크 없음. assets/species/golden-cuttlefish.jpeg로 원본 바이트를 저장했다. |
| 쏨뱅이 | [FMIB 52974](https://commons.wikimedia.org/wiki/File:FMIB_52974_Sebastes_marmoratus.jpeg)의 Sebastiscus marmoratus 동의어 설명, 저자 James Carson Brevoort(1856), University of Washington Freshwater and Marine Image Bank의 public domain 표시를 원본 HTML에서 확인했다. 전신·단독 개체·크림색 배경·글자/워터마크 없음. assets/species/marbled-rockfish.jpeg로 원본 바이트를 저장했다. |
| 부적합·접근 실패 | 감성돔 Naturalis 도판 2개는 글자, 벤자리 Isaki0912는 수조·복수 개체 때문에 제외했다. 독가시치 공개 흑백 도판은 컬러 원본 보완을 위해 미채택했다. 벵에돔 원본 429·한치 CC0 3D 모델 페이지 403은 접근 실패로 기록했다. 3D 모델의 CC0 표기를 실제 이미지 검증으로 세지 않았다. |
| 기존 감사와 정리 | 이번에 추가 삭제한 앱 이미지는 없다. 최초 부적합 21개 중 누적 교체 9·준비 중 12·기존 적합 유지 3. 이전 미사용 파일 삭제 20개는 유지한다. 두 신규 파일은 옛 .jpg와 구분되는 .jpeg 경로이며 옛 파일을 함께 사용하지 않는다. |
| 정보·키 보존 | 두 종의 기존 정보·verified와 지도 키 null/unavailable 사유를 보존했다. 이미지 검증 후 needsAsset=false·imageVerified=true·needsVerification=false로 바꾸고 미준비 문구만 제거했다. 새 7종의 안내 보류는 유지했다. |
| 적용 전 검증 | `node skills/fish-catalog-manager/scripts/validate-catalog.mjs --catalog .verify/phase2d-staging.json`: 오류 0·보류 경고 37, 구조 PASS. 같은 명령의 --strict는 FAIL. 보류를 숨기지 않고 실제 데이터에 반영했다. |

| 검증 명령 | 현재 결과 |
| --- | --- |
| `node skills/fish-catalog-manager/scripts/validate-catalog.mjs --catalog species-catalog.json` | PASS: 오류 0·보류 경고 37 |
| 위 명령 + `--strict` | FAIL: 오류 0·보류 경고 37. 이미지 18개+needsVerification 19개가 남음 |
| `node skills/fish-catalog-manager/scripts/validate-catalog.mjs --self-test` | PASS: 정상/보류 fixture와 잘못된 사례 20개 |
| `npm.cmd test` | 83 PASS, 실패·SKIP 0. 실제 새 이미지 경로·바이트·SHA-256·라이선스 메타데이터와 서버 제공 목록 포함 |
| `node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=2 --catalog species-catalog.json` | 27 PASS·1 FAIL(실제 도감 strict의 보류 37개), 기록 로직 SKIP |
| `node .verify/phase2c-final-check.cjs` | 기존 보호 파일 13개 내용 유지(CRLF 정규화), 현재 이미지 문서의 로컬 링크 확인 |
| `git diff --check` | 공백 오류 없음 |

브라우저 검증은 `.verify/phase2d-browser.cjs`, phase2d-navigation.cjs, phase2d-detail-layout.cjs, phase2-map-regression.cjs로 실행했다. 결과는 아래와 같다.

- T01·T02 PASS: 31카드·초기 0/31·0%·전체 미수집, 분류/상태/검색·빈 결과·초기화. 31종 모두 상세 이름과 이미지/준비 중·보류 사유 확인. click·Enter·Space·Escape·Tab·focus 복귀 통과.
- T03 PARTIAL: 준비된 13종의 원본 로드·고유 이미지·회색 filter·목록/상세 동일 src 확인. 390/1440px에서 CSS 컬러 전환 시 src·크기·위치·회전 유지. 새 2종의 원본과 회색 상세·컬러 참고 화면을 직접 확인했다. 미준비 18종의 형태와 한치/무늬오징어·참문어/주꾸미 비교는 미완료다.
- T13 PASS: 320px 2열, 375px 3열, 390/430px 4열, 768px 및 812×375 가로 5열, 1024px 6열, 1440px 7열, 1920px 8열. 9개 viewport에서 31카드·13이미지·18준비 중, 가로 넘침 없음·44px 이상 터치 영역. 상세를 아래까지 스크롤한 뒤 닫고 다른 종을 열 때도 390px에서 scrollTop=0·상단 도구 모음과 화면 범위 유지 확인.
- T12 실행 범위 PASS: MapLibre 44마커→무늬오징어 14→초기화 44, 검색·Popup·즐겨찾기 재접속·지도↔도감 공통 메뉴. 320/375/768/1440px의 환경 API 동시 503에도 지도·화장실·Popup 적합/스크롤·모의 GPS 가까운 5곳 유지.
- T14 PASS: 실행한 목록/상세·재시도·지도 시나리오에서 치명적 pageerror·예상 밖 필수 로컬 404 없음. HTTP 503/잘못된 응답/네트워크 실패 후 재시도와 이미지 실패 대체 표시 확인.
- T04~T09, T10~T11 SKIP: Phase 3의 기록·IndexedDB·실제 해금/저장과 Phase 4의 어종별 query 연동은 구현하지 않았다. CSS 컬러 참고는 저장/해금 동작이 아니다.

증거는 Git 제외 `.verify/artifacts/phase2d/results.json`, navigation.json, detail-layout.json, catalog-*.png·detail-*.png·settled-detail-*.png·color-reference-*.png 및 `.verify/artifacts/phase2/map-regression.json`에 남겼다. 빠른 반복 열기 중 저장한 상세 스크린샷은 레이아웃 확정 전 프레임이 있어, 두 animation frame 뒤의 settled-detail 화면과 DOM 경계를 추가로 확인했다. 앱의 상세 초기 scrollTop=0 동작은 정상이며 UI 코드는 바꾸지 않았다.

이번 수정 파일: species-catalog.json, PRD.md, TODO.md, docs/SKILL_USAGE.md, docs/SPECIES_ASSETS.md, assets/species/ATTRIBUTION.md.
이번 신규 파일: assets/species/golden-cuttlefish.jpeg, assets/species/marbled-rockfish.jpeg. 목록·상세 HTML/CSS/JS와 기존 지도 코드는 이번 후속 실행에서 변경하지 않았다.

needsAsset 18종: 감성돔·벵에돔·농어·돌돔·한치·무늬오징어·부시리·자리돔·숭어·벤자리·주꾸미·쥐치·삼치·조피볼락·자바리·독가시치·붕장어·민어. 새 7종의 낚시 안내 출처도 추가 검토가 필요하다. C02 전체 준비·엄격 인수는 미완료, C03 UI는 완료 상태를 유지한다. 실제 휴대폰·GPS·공식 API 성공 응답·현장·배포는 확인하지 않았다. `.env`·키 열람/수정·commit·push·Phase 3 구현 없이 멈춘다.

## 2026-10-28 — Phase 2 전체 이미지 추가 감사 및 보완

- 요청: 현재 Working Tree의 전체 어종 이미지 감사, 누락·사각 배경·크기·잠금 표시 보완. Git Commit/Push 없음.
- 명시적으로 읽고 사용한 Skill: fish-catalog-manager, fishing-app-tester. PRD 11장·실제 species-catalog.json·catalog.js/css/html과 지도 키 생성 코드를 먼저 읽었다.
- 변경 전에 읽은 references: skills/fish-catalog-manager/references/species-schema.md, skills/fish-catalog-manager/references/image-source-policy.md. 브라우저 검증 전에 skills/fishing-app-tester/references/test-cases.md를 읽었다.
- 출처 조회를 위해 firecrawl Skill도 읽었으나 검색·조회 두 호출은 크레딧 부족으로 실행되지 않았다. 일반 웹 검색과 Commons/NIFS/BHL 원본 직접 조회로 계속했다. Firecrawl에서 확인한 것으로 기록하지 않는다.
- 최초 전체 31종 / 누락 18종 / 기존 사각 배경 5종(볼락·참돔·쏨뱅이·학공치·갑오징어). 실제 파일을 브라우저 contact sheet로 확인했다. 누락 목록과 파일별 크기·투명도는 .verify/asset-audit.json 및 docs/PHASE2_ASSET_AUDIT.md에 기록했다.
- 누락 18종을 새로 준비하고 기존 13종을 투명 WebP로 교체·정규화했다. 최종 실제 이미지 31개 / needsAsset=true 0 / 중복 ID·경로·SHA-256 0 / 원격 imageSrc 0 / 존재하지 않는 파일 0. 기존 이미지 13개를 삭제했으며 보존용 Commit은 만들지 않았다.
- 자료는 원본 생물 픽셀을 추출한 것이다. 한치·무늬오징어는 공개영역 과학 도판, 자바리는 CC BY 논문 Figure 1a의 어린 개체, 주꾸미는 CC BY-SA 사진을 사용했다. 잘못된 종·워터마크·전신이 잘린 후보는 제외했다. 출처·가공 매니페스트·SA 조건을 31종 모두 기록했다.
- 실행한 개발 Script: node scripts/normalize-species-assets.mjs --input .verify/species-sources --output .verify/normalized-species --manifest docs/species-asset-processing.json. 31개를 512x512 sRGB 투명 WebP로 만들고 원형 안전 반경 206px를 적용했다. sharp/playwright-core는 .verify에만 설치했고 런타임 의존성은 추가하지 않았다.
- 적용 전: node skills/fish-catalog-manager/scripts/validate-catalog.mjs --catalog .verify/final-catalog-staging.json. 최초 2개 이미지 출처 필드 누락을 발견해 NIFS 원문 근거로 고친 뒤 오류 0을 확인하고 실제 JSON에 반영했다.
- 적용 후 실행: node skills/fish-catalog-manager/scripts/validate-catalog.mjs --catalog species-catalog.json; 같은 명령 + --strict; 검증기 --self-test. 일반 PASS(오류 0·정보 경고 7), 자체 검사 PASS. --strict는 기존 7종 낚시 안내 검토 경고 때문에 FAIL이다. 확인하지 않은 내용을 verified=true로 바꾸지 않았다.
- fishing-app-tester 실행: node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=1: 27 PASS/0 FAIL. --phase=2 --catalog species-catalog.json: 27 PASS/1 FAIL(동일 엄격 도감 경고 7건). npm.cmd test: 83 PASS/0 FAIL.
- 실제 Chrome 브라우저: .verify/final-browser.cjs 실행. 9개 viewport(320/375/390/430/768/1024/1440/1920px와 812px 가로), 각 31개 카드·31개 디코딩 이미지, 누락/Placeholder/정상 오류 안내 0, 가로 넘침 0. 모바일/PC의 31종 전체 목록·상세 src/filter가 같았고 잠금/컬러 CSS 비교에서 위치·크기가 같았다. 컬러 비교는 DOM에 테스트 상태만 적용했으며 실제 저장 기능은 구현하지 않았다. 검색·어류25/두족류6·미수집/수집완료·빈 결과·Enter/Space·Escape·focus 복귀·접근 가능한 이미지 실패 안내·도감 오류 재시도를 확인했다.
- 시각 검사: 원본 contact sheet, 최종 컬러 contact sheet, 실제 catalog-390.png/catalog-1440.png 및 한치·무늬오징어·갈치·갑오징어·주꾸미 상세를 열어 확인했다. 사각 배경·다른 개체·문자·워터마크·심한 잘림·동일 이미지 반복은 최종 사용 파일에서 보이지 않았다. 갈치/붕장어/학공치의 긴 형태와 두족류별 몸통/지느러미/팔 차이를 확인했다. 선화와 사진의 매체 차이는 유지한다. 실기기·다른 브라우저·분류 전문가 감정은 미수행이다.
- 지도 회귀: .verify/final-map-regression.cjs 새 실행. 4개 viewport x API 성공 fixture/Marine만 실패/세 API 동시 실패의 12조합, 위치 거부 1건 PASS. 44개 마커·무늬오징어 필터14·검색·초기화·즐겨찾기 새로고침 보존·GPS 좌표/거부 에뮬레이션·주변5곳·화장실·Popup·물때 오늘/내일 fixture·지도/도감 Navigation·치명적 pageerror 0을 확인했다. 실제 KHOA/Open-Meteo 응답·휴대폰 GPS를 검증했다고 주장하지 않는다.
- T01/T02/T03/T12/T13/T14의 Phase 2 적용 범위 검사. T04~T09(기록/IndexedDB), T10~T11(최종 Query 연결)은 미구현 범위로 SKIP.
- 최종 상태: 이미지 보완 완료. 삼치·전어·조피볼락·자바리·독가시치·붕장어·민어의 기존 낚시 안내 검증이 남아 Phase 2 전체 자료 인수는 보류. TODO의 이미지 항목만 완료하고 정보/엄격 인수는 미완료로 유지했다. 자세한 21항목 보고는 docs/PHASE2_ASSET_AUDIT.md.

## Phase 2 전체 상세 정보 감사·인수 (2026-10-28, KST)

사용자 요청: 모든 어종의 특징·낚시 방법·채비·시기·서식·지도 키·정보 출처를 감사하고 fish-catalog-manager와 fishing-app-tester를 명시적으로 사용해 Phase 2를 마무리한다. Phase 3 구현·commit·push는 하지 않는다.

| 항목 | 실제 수행 |
| --- | --- |
| fish-catalog-manager | 작업 시작 전 SKILL.md, 데이터 변경 직전 references/species-schema.md를 읽고 적용했다. 이미지를 교체하거나 잠금 스타일을 바꾸지 않아 image-source-policy.md의 추가 열람 시점은 발생하지 않았다. |
| 최초 감사 | 31종의 요청 필드·타입·빈 값·기법·설명과 실제 지도 옵션을 확인했다. methods/rigs/seasonNote 누락은 각각 7종. description/habitatNote/sourceUrl 및 필수 식별 키의 누락은 0이다. 검토된 지도 연결 불가 null은 9종이며 누락된 필드와 구분했다. |
| 보완 | 삼치·전어·조피볼락·자바리·독가시치·붕장어·민어의 빈 안내를 채웠다. 한치·무늬오징어·갈치·방어·부시리·벤자리·갑오징어·참문어의 특징·서식·기법 문구도 보완했다. 본문 보완 15종, 전체 31종 정보 출처 정리. |
| 출처 확인 | 국립수산과학원·FSIS·낚시춘추의 저자/편집부 자료·바다타임의 전어 채비·Honda의 동종 안내를 열어 대조했다. 실제 사용한 53개 URL과 필드별 근거를 SPECIES_INFO_SOURCES.md에 기록했다. 일본 자료·타지역 사례·식용 제철의 한계를 표시했다. |
| 적용 전 검사 | .verify/species-info-candidate.json을 생성하고 검증기 --catalog 실제 후보 경로 --strict를 실행해 오류 0·경고 0을 확인한 뒤 루트 JSON에 반영했다. |
| 검증기 보강 | 정보 필드의 빈 값·지도 키 타입·상태 플래그 모순, 필드별 정보 근거·출처 URL·검토일을 검사한다. 이미지 출처를 낚시 정보 근거로 인정하지 않는다. 구조 검사와 원문의 사실 대조를 구분한다. |
| 남은 미확인 | 표시한 출처 범위 안에서 정보 확인 중으로 남은 어종 0. verified=true 31종·needsVerification=false 31종. 제주 전역의 현재 조황·출입·정확한 현지 시즌을 보장하는 뜻은 아니다. |
| 키·이미지 | 실제 지도 옵션 30개와 비교해 22종 연결·검토된 null 9종·잘못된 키 0. 기존 31종 ID·이미지 경로·실제 파일 SHA-256을 모두 유지했다. |
| fishing-app-tester | 검증 단계에 SKILL.md와 브라우저 실행 전 references/test-cases.md를 읽고 현재 Phase 2 범위에 적용했다. 별도 Chrome context와 인증키 없는 기존 createApp 검증 서버(127.0.0.1:8086)를 사용했다. |

### 실행 명령과 결과

| 명령 | 결과 |
| --- | --- |
| node skills/fish-catalog-manager/scripts/validate-catalog.mjs --catalog species-catalog.json | PASS, 오류 0·경고 0 |
| node skills/fish-catalog-manager/scripts/validate-catalog.mjs --catalog species-catalog.json --strict | PASS, 오류 0·경고 0 |
| node skills/fish-catalog-manager/scripts/validate-catalog.mjs --self-test | PASS, 정상/보류 fixture 및 잘못된 입력 32종 검사. 앱 사실 검증과 구분 |
| node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=1 | 27 PASS·0 FAIL. 이 모드의 catalog/기록 SKIP을 완료 성과로 세지 않음 |
| node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=2 --catalog species-catalog.json | 28 PASS·0 FAIL, 실제 도감 엄격 검사 포함. 기록 저장은 SKIP |
| npm.cmd test | 83 PASS·0 FAIL |
| node .verify/info-browser.cjs | 아래 도감 브라우저 검사 PASS |
| node .verify/info-map-regression.cjs | 아래 지도 회귀 검사 PASS |

### 실제 Chrome 결과

- T01·T02 PASS: 31카드·어류25/두족류6·초기 0/31·0%, 검색/분류/상태/빈 결과/초기화. 390px·1440px에서 각 31종 상세(62회)를 열어 이름·특징·방법·채비·시기·서식·지도 키/연결 없음·모든 정보 출처 링크·최종 주의문·순서를 실제 DOM과 대조했다. 미수집 상태에서도 모두 표시됐다.
- 한치·무늬오징어는 서로 다른 특징·방법·채비·이미지를 유지하고 갈치는 연안 릴찌와 생선살 미끼를 표시한다. 갈치에 한치/오징어 채비를 넣지 않았다.
- 미확인 fixture를 브라우저 문서에만 주입해 verified=false·빈 methods/rigs·null 설명/시기/서식·없는 정보 출처를 확인했다. 5개 본문 항목에 정확히 “정보 확인 중”, 지도에는 “현재 등록된 관련 포인트 없음”을 표시하고 undefined/null/[]·빈 제목은 없었다. 일반 지도 버튼 클릭·뒤로 가기 PASS.
- T03·T13 PASS(변경 보호 범위): 320/375/390/430/768/1024/1440/1920px와 812×375 가로의 9개 viewport. 31개 이미지 디코딩·512×512·투명 여백·정상 화면 Placeholder/가로 넘침 0, 미수집 회색 필터·목록/상세 같은 src, 테스트 DOM의 컬러 전환 시 위치/크기/회전 동일. Enter/Space·Escape·닫기·focus 복귀·44px 터치·이미지 요청 실패 안내·도감 HTTP/JSON/network 실패 후 재시도 PASS. 실제 해금 저장은 구현하지 않음.
- 시각 확인: 이번 실행의 detail-local-hanchi-390.png와 detail-patterned-squid-1440.png를 직접 열어 특징·기법·채비·레이아웃을 확인했다. 모든 이미지 바이트가 이전 감사 결과와 동일하므로 원본 재가공은 하지 않았다.
- T12 PASS(에뮬레이션 범위): 320/375/768/1440px × 성공 fixture/Marine만 실패/기상·해상·물때 동시 실패의 12조합. 마커44→무늬오징어14→초기화44, 검색·Popup·화장실·즐겨찾기 새로고침 보존·에뮬레이션 GPS/주변5곳·물때 오늘/내일 fixture·지도/도감 Navigation을 확인했다. 위치 권한 거부 1건도 별도 PASS.
- T14 PASS(관찰 범위): 정상 시나리오 pageerror 0, 필수 로컬 자원 404 없음. 의도한 실패 요청은 안내·복구 동작으로 확인했다.
- T04~T09(IndexedDB·기록·집계), T10~T11(어종 query/Popup 양방향 연결)은 미구현 단계로 SKIP이다. 실제 휴대폰·다른 브라우저·현장 출입·실제 GPS·공식 API 응답 재조회·배포는 이번 검증에 포함하지 않았다.

검증 스크립트·자료 캐시·스크린샷은 Git 제외된 .verify 아래에만 생성했다. 도감 결과는 .verify/artifacts/phase2-info/browser-results.json, 지도 결과는 이번 실행이 기록한 .verify/artifacts/phase2-final/map-results.json이다. TODO의 요청된 정보 확인 6항목과 엄격 인수를 완료 표시하고 PRD·이미지 감사 문서의 현재 상태를 맞췄다. 이전 실패 이력은 보존했다. Phase 2 범위 완료 후 멈추며 Phase 3·commit·push는 수행하지 않았다.

## Phase 3 조과 저장·집계·해금 (2026-10-28, KST)

사용자 요청: Phase 3만 구현하고 catch-record-manager·fishing-app-tester를 명시적으로 사용해 사진 포함 IndexedDB 저장·수정/삭제·해금·집계·복원을 검증한다. Phase 4 자동 지도 연결·서버 DB·로그인·동기화·일괄 삭제·README 최종 축약·commit/push는 제외한다.

### 실제 Skill 사용과 구조 조사

| 항목 | 실제 수행 |
| --- | --- |
| catch-record-manager 명시적 사용 | 작업 시작 전 [SKILL.md](../skills/catch-record-manager/SKILL.md)를 직접 읽었다. 기존 IndexedDB 코드가 없음을 조사한 뒤 저장·입력·집계 변경 전에 [indexeddb-schema.md](../skills/catch-record-manager/references/indexeddb-schema.md)를 읽었다. 인터페이스 확인 후 validate-record-logic.mjs를 읽고 실제 공유 모듈에 연결했다. |
| fishing-app-tester 명시적 사용 | 작업 시작 전 [SKILL.md](../skills/fishing-app-tester/SKILL.md)를 읽었다. 실제 브라우저 실행 전에 [test-cases.md](../skills/fishing-app-tester/references/test-cases.md)를 읽고 사용자 첨부의 T번호와 구분했다. |
| 기존 구조 확인 | species-catalog.json의 31개 speciesId·고유 이미지, catalog.html/js/css의 상세/회색 CSS·고정 미수집 상태·Progress·필터·dialog, package.json·서버 허용 목록·실제 지도 숫자 ID·기존 즐겨찾기 LocalStorage를 확인했다. 기존 DB·store·version 구현은 없었다. |
| 코드 분리 | [catch-records.js](../catch-records.js)는 순수 검증·집계와 IndexedDB 저장소를 브라우저/Node에서 함께 사용한다. [catch-record-ui.js](../catch-record-ui.js)는 사진 미리보기·등록/수정 Form·통계·기록 목록·개별 삭제를 담당한다. catalog.js가 기록에서 수집 상태·상세·필터·Progress를 계산한다. |
| 보호 범위 | 어종 JSON과 이미지 경로·실제 SHA-256을 작업 전후 비교했다. 공개 어종 정보에 사용자 사진·마릿수·해금 flag를 쓰지 않는다. package.json/lock과 기존 지도 로직·즐겨찾기 키는 변경하지 않았다. |

### 실제 저장 계약

- Database: jejuFishingCollection, DB_VERSION=1.
- Store: catchRecords, keyPath=recordId, autoIncrement=false.
- Index: speciesId, caughtAt, createdAt (모두 unique=false). Phase 3에서 사용하지 않는 지도 선택 UI·mapSpotId 인덱스는 추가하지 않았다.
- Record 필드: recordId, speciesId, caughtAt, count, photoBlob, photoName, photoType, locationName, mapSpotId, memo, createdAt, updatedAt.
- recordId는 crypto.randomUUID(), 미지원 시 crypto.getRandomValues() 기반 UUID v4다. add는 기존 ID를 덮어쓰지 않는다. 수정은 같은 ID/speciesId/createdAt을 유지하고 updatedAt을 증가시킨다. 새 사진이 없으면 기존 Blob·파일명·MIME을 유지한다.
- 사진은 원본 Blob(0 초과·10MiB 이하), JPEG/PNG/WebP만 직접 저장한다. MIME·용량·파일 시그니처·브라우저 디코딩을 확인하고 저장소에서 읽을 때도 검사한다. 자동 압축·EXIF 분석·재인코딩을 하지 않으며 HEIC/HEIF는 변환 안내를 한다. JPEG 방향 fixture의 120×80 원본이 브라우저에서 80×120으로 표시됨을 확인했다.
- 날짜는 현재 지역의 YYYY-MM-DD, 미래 날짜는 오류다. Form의 정수 숫자 문자열은 Number로 바꾸고 저장된 문자열 count는 집계에서 제외한다. 장소 최대 120자·메모 최대 2,000자이며 textContent로 표시한다. mapSpotId는 null 기본값, 지정 시 실제 지도 숫자 ID인지 검증한다.
- totalCount=sum(count), recordCount=유효 기록 수, collected=recordCount>0. firstCaughtAt/min·lastCaughtAt/max는 caughtAt 기준이다. 수집 종 수/전체 종 수×100의 내부 정밀도를 유지하고 UI만 반올림한다. 목록은 caughtAt 내림차순, 동률이면 createdAt 내림차순·recordId 오름차순이다.
- transaction complete 후에만 화면을 갱신한다. 요청 success 후 실제 abort를 주입해 조기 성공·해금이 없음을 확인했다. 쓰기 완료 후 다시 읽기가 실패해도 이미 완료된 저장을 실패로 되돌려 알리지 않고 마지막 확인 상태와 재조회 안내를 유지한다.
- onupgradeneeded는 없는 store/index만 추가한다. versionchange에서는 연결을 닫고 안내하며 blocked에서는 다른 탭 닫기·재시도를 안내한다. 불량 기록은 자동 삭제하지 않고 제외 개수를 표시한다. 저장소 불가 시 확인 중/마지막 snapshot을 표시하며 0종으로 단정하지 않는다.
- 사진·미리보기 URL·해금 flag를 LocalStorage에 저장하지 않는다. object URL은 사진 교체·Form/상세 닫기·목록 교체에서 해제한다. 서버 업로드·외부 API 전송·Cloud 저장은 없다. 브라우저 검증 중 POST 등 데이터 전송 요청 0을 확인했다.

### 실제 실행 명령

| 명령 | 결과 |
| --- | --- |
| node skills/catch-record-manager/scripts/validate-record-logic.mjs --module catch-records.js | PASS: 실제 함수의 9개 집계 시나리오·정상 입력·25개 거부 입력. 중복 ID/불량 저장 값 제외와 정확한 1/31 비율도 확인 |
| node skills/catch-record-manager/scripts/validate-record-logic.mjs --self-test | PASS: 검증기 자체 fixture·25개 거부 입력. 실제 IndexedDB 검증과 구분 |
| node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=1 | 27 PASS·0 FAIL. 이 모드의 도감/기록 SKIP은 Phase 3 완료 성과로 세지 않음 |
| node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=3 --catalog species-catalog.json --record-module catch-records.js | 29 PASS·0 FAIL, 실제 도감 엄격 검사·실제 기록 모듈 포함 |
| npm.cmd test | 92 PASS·0 FAIL (기존 83개 + 실제 수집 필터 1개 + 기록 모듈 8개) |
| node .verify/phase3-browser.cjs | 아래 사용자 T01~T12·9개 viewport PASS |
| node .verify/phase3-errors.cjs | 저장소 오류·손상 데이터·버전·사진 교체/방향·지역 날짜의 11개 결과 그룹 PASS |
| node .verify/phase3-photo-console.cjs | WebP 저장·실제 디코딩·새로고침 복원, 위장된 JPEG 헤더 거부 PASS. 해당 실제 흐름 console error/pageerror 0 |
| node .verify/phase3-map.cjs | 지도 12조합·위치 거부 별도 1건 PASS |

검증기는 사진 파일명/MIME·미래 날짜·숫자 문자열/NaN/Infinity·6마리 수정 시나리오·첫/마지막 삭제·불량 중복 기록·내부 정밀도 검사를 보강했다. 별도 adapter에 집계를 복제하지 않고 실제 catch-records.js export를 호출한다. 바이트 fixture만으로 실제 사진 디코딩·IndexedDB 영속성을 주장하지 않는다.

### 사용자 첨부 순서의 T01~T14 실제 결과

실제 Chrome headless, 별도 origin 127.0.0.1:8087·새 context 또는 .verify/profiles의 전용 profile, 합성 테스트 사진만 사용했다. 개인 브라우저 기록을 삭제하거나 실제 사용자 사진을 사용하지 않았다.

| 사용자 ID | 결과·관찰값 |
| --- | --- |
| T01 | PASS: 최초 31종 회색·0/31·0%, 수집완료 필터 빈 결과 |
| T02 | PASS: 참돔 상세·낚시법·채비·출처와 등록 버튼 접근 |
| T03 | PASS: 사진+날짜+2마리 → 컬러·2마리/1회·1/31. 첫 add 요청 success 순간에는 수집 수 0. 이중 submit에도 DB 1건 |
| T04 | PASS: 같은 참돔 3마리 추가 → 5마리/2회·수집 종 수 1 유지 |
| T05 | PASS: 새로고침 후 두 사진의 실제 바이트·날짜·마릿수·장소·메모·ID·시각·컬러 복원. 브라우저를 닫고 같은 profile/origin의 새 Chrome 프로세스로 재접속해 동일 상태 확인 |
| T06 | PASS: 3마리 기록을 4마리로 변경 → 6마리/2회, ID/createdAt/미교체 사진 유지·updatedAt 증가 |
| T07 | PASS: 4마리 기록 삭제 → 2마리/1회·컬러 유지. 삭제 취소도 원본 보존 |
| T08 | PASS: 마지막 2마리 삭제 → 0마리/0회·미수집 회색·수집 종 수 0. 어종 Card와 낚시 안내 유지·다시 등록 가능 |
| T09 | PASS: 브라우저에서 0·음수·소수·빈 값 차단. 실제 모듈에서 문자·NaN·Infinity·없는 어종 등 거부. 미래 날짜도 차단 |
| T10 | PASS: 텍스트·빈 PNG·손상 PNG·SVG·HEIC·10MiB 초과 사진 차단. 위장 image/png 시그니처도 실제 함수 검사에서 거부 |
| T11 | PASS: 참돔 2마리/1회·한치 3마리/2회 독립, 수집 종 수 2. 수집 상태·분류·검색 AND와 필터 초기화 후 DB 3건 유지 |
| T12 | PASS(에뮬레이션): 320/375/390/430/768/1024/1440/1920px·812×375 가로의 9개 viewport. 입력·Form/목록·2,000자 메모·120자 장소·저장/수정/삭제·44px 입력/터치 영역·ESC/닫기/focus 복귀·가로 넘침 없음 |
| T13 | PASS(회귀 범위): 4개 viewport×성공 fixture/Marine만 실패/기상·해상·물때 동시 실패=12조합. 마커44→무늬오징어14→초기화44, 검색·즐겨찾기 재접속·에뮬레이션 GPS/주변5곳·화장실·Popup·물때 오늘/내일·도감 Navigation. 위치 권한 거부도 별도 PASS |
| T14 | PASS(관찰 범위): 정상/예외 흐름 pageerror·미처리 rejection 없음, 정상 흐름 필수 자원 404 없음·데이터 전송 요청 없음. 추가 WebP 등록/복원 흐름은 console error 0도 직접 계측 |

Skill 참고 표의 T01~T09·T12~T14를 Phase 3 범위에 적용했다. T07 숫자 예시는 사용자가 지정한 3→4(6/2회)를 브라우저에서 실행했고, 2→4(7/2회)도 실제 순수 모듈에서 확인했다. **Skill 참고 표의 T10~T11(최종 지도 query/Popup 연동)은 Phase 4 미구현이므로 SKIP**이다. 위 사용자 T10~T11(잘못된 파일·다른 어종 격리)과 혼동하지 않는다.

### 저장 예외·사진·복원 추가 검증

- IndexedDB 미지원·open 실패·getAll 실패에도 31종과 기본 정보가 열렸다. 수집 수는 확인 중으로 남고 open/read 복구 후 재조회가 성공했다.
- QuotaExceededError 및 add success 뒤의 실제 transaction.abort()에서 사진/날짜/count/장소/메모를 유지했다. DB 0건·회색·수집 수 0, 실패 후 재시도 저장은 1건이었다. 상세/Form을 닫은 뒤 계측한 live object URL은 0개였다.
- 저장된 불량 기록 8개(count 문자열/0·없는 종·없는 Blob·불가능/미래 날짜·깨진 사진·MIME 불일치)를 주입했다. 유효 기록만 2마리/1회로 집계했고 DB의 전체 9개 원본은 유지했다.
- 다른 연결에서 삭제한 기록의 수정은 오류로 안내하고 Form 값을 유지했으며 기록이 되살아나지 않았다. 없는 ID 삭제는 false·미변경이었다.
- native versionchange와 기존 store/index에 대한 v1→v2 schema 추가 호출에서 원본이 유지됐다. 미래 버전 DB는 삭제/재생성 없이 오류 안내했다. v1 연결을 유지해 native blocked를 만든 별도 test factory에서도 다른 탭 안내·차단 연결 닫기 후 재시도가 성공했다.
- 기존 사진 미교체·교체 저장을 각각 확인했다. 교체는 같은 recordId/1건을 유지하고 새 Blob이 새로고침 후 표시됐다. JPEG orientation=6 fixture는 원본 120×80에서 브라우저 표시 80×120이며 원본 용량이 유지됐다. UTC 15:30/14:30 경계 두 경우 모두 한국 지역 날짜를 기본값으로 표시했다.

### 발견·수정과 증거·남은 범위

초기 검토에서 저장 후 disabled 버튼으로 focus를 돌리거나 재조회 때 성공 안내/focus가 사라질 수 있는 흐름을 고쳤다. 완료 후 버튼을 복원한 다음 focus를 돌리고, 상세 재렌더링에서 안내/focus를 유지했다. 파일명·MIME만 믿지 않도록 파일 시그니처 확인도 추가했다. 첫 스크린샷에서 lazy thumbnail이 로드되기 전 촬영된 부분은 현재 DOM 이미지 decode 완료를 기다린 후 다시 촬영했다. 브라우저 전체·예외 검증과 92개 자동 테스트를 최종 코드로 다시 통과했다.

- .verify/artifacts/phase3/browser-results.json: 사용자 흐름·9개 viewport.
- .verify/artifacts/phase3/error-results.json: 저장 예외·불량 원본 보존·버전·사진·날짜.
- .verify/artifacts/phase3/console-photo-results.json: WebP·MIME/시그니처 불일치·console error 0.
- .verify/artifacts/phase3-map/map-results.json: 기존 지도 12조합·위치 거부.
- .verify/artifacts/phase3/desktop-records.png, form-375.png, records-375.png, form-1440.png: 실제 렌더링. 모바일 Form과 PC 기록 화면을 직접 열어 시각 확인했다.

미확인 범위는 실제 휴대폰의 소프트 키보드/파일 선택·Safari/Firefox·브라우저별 HEIC 변환·실제 저장 공간 한도·실제 GPS·외부 공식 API 실응답·배포다. 사진은 자동 압축하지 않아 용량을 사용할 수 있고, 기기·브라우저·origin이 다르거나 사이트 데이터를 지우면 기록이 공유/보존되지 않는다. .verify의 profile·사진은 합성 검증 자료이며 앱이 사용자 사진을 프로젝트 파일이나 GitHub에 저장하는 기능은 없다.

현재 C04·C05 Phase 3 완료. README 축약·지도 자동 필터/Popup/최종 query 연결·서버 업로드·로그인·동기화·일괄 삭제·commit/push는 하지 않았다. 다음 Phase는 사용자 요청 후 진행한다.

구현 시 확인한 Web API 근거: [MDN transaction complete](https://developer.mozilla.org/en-US/docs/Web/API/IDBTransaction/complete_event), [MDN blocked](https://developer.mozilla.org/en-US/docs/Web/API/IDBOpenDBRequest/blocked_event), [MDN image decode](https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/decode). 실제 앱의 동작 증거는 위 테스트 결과와 구분한다.

## Phase 3 도감 초기화 오류 수정 (2026-10-28, KST)

사용자 증상: “저장된 조과 기록을 확인하고 있어요.”가 남고 전체 도감 로드 오류·Grid 0개가 표시된다. 새로운 기능 없이 실제 원인을 확인해 수정하고 기존 데이터·이미지·지도·키·환경 설정을 보호한다.

### 실제 원인과 재현

- 작업 시작 전 catch-record-manager/SKILL.md·fishing-app-tester/SKILL.md를 직접 읽어 명시적으로 적용했다. 저장·집계 변경 전 catch-record-manager/references/indexeddb-schema.md, 브라우저 실행 전 fishing-app-tester/references/test-cases.md를 읽었다.
- package.json의 실제 명령은 npm.cmd start → node server.js다. 최초 실행은 이미 사용 중인 8080 때문에 시작 실패했다. 실행 중인 8080과 8086은 catch-records.js·catch-record-ui.js를 404/application/json으로, 새 검증 서버 8087은 200/JavaScript로 반환하는 차이를 확인했다.
- 실제 8080 Chrome Console의 최초 오류는 catch-records.js HTTP 404다. 이어 “Refused to execute script … MIME type ('application/json') is not executable”이 발생했고 catch-record-ui.js도 같은 상태였다. 모듈 import/export 방식 불일치나 정적 JSON 누락은 없었다. species-catalog.json은 HTTP 200·31종이었다.
- CDP의 caught-exception 일시정지로 **ReferenceError: CatchRecords is not defined, at load (catalog.js:391:7)**를 확인했다. 원문과 호출 위치는 .verify/artifacts/startup-fix/before.json에 기록했다. 일반 Console에 이 예외가 보이지 않은 이유는 기존 load의 catch가 삼키고 도감 전체 오류 문구로 바꿨기 때문이다.
- 기존 load는 JSON을 읽은 뒤 Grid 렌더링 전에 CatchRecords.summarizeCollection([], …)를 호출했다. 정적 데이터와 기록 모듈 초기화가 같은 try/catch에 있었고, 기록 스크립트가 없으면 아직 숨겨진 Grid를 렌더링하지 못했다. 이 재현에서는 IndexedDB 연결 시도 전 예외였으며 DB 버전/사용자 기록을 추정 원인으로 쓰지 않았다. 초기화에 catalog/DB를 묶은 Promise.all은 없었다. 사진 디코딩용 Promise.all과 구분했다.
- 이전 Phase 3 검증은 별도로 새로 시작한 8087 서버를 사용해 기본 8080의 오래된 허용 목록 프로세스를 놓쳤다. 이번에는 8080의 HTML·JS·JSON 응답 해시가 현재 작업 폴더와 같은지, 포트 소유 PID가 node.exe의 server.js인지 확인한 뒤 해당 장기 실행 서버만 재시작했다. npm.cmd start가 같은 8080에서 정상 실행되며 두 기록 파일은 현재 200/text/javascript다. .env·키·브라우저 데이터를 직접 읽거나 변경하지 않았다.

### 수정 범위와 현재 초기화

1. catalog.html에서 기록 스크립트의 선행 defer 의존을 제거했다. catalog.js는 정적 JSON만 먼저 검증하고 독립적인 빈 집계로 31종 회색 Grid·0/31·0%·필터·상세를 렌더링한다.
2. 그 뒤 기록 JS를 로드하고 API를 검증해 IndexedDB와 기록 UI를 초기화한다. 원본 경로·파일 이름·공개 어종 데이터는 유지했다. DB/store/index/버전도 jejuFishingCollection v1 / catchRecords / recordId / speciesId·caughtAt·createdAt 그대로다. 기존 store/index는 없는 경우에만 만드는 로직을 보존했다.
3. 기록 실패는 기록 영역의 비차단 경고로 한정한다. 미조회 상태는 회색 기본 도감으로 유지하고, 이미 확인한 snapshot이 있으면 보존한다. 검색·분류·수집 상태 필터·상세를 차단하지 않는다. 기록 없음은 정상 0종이며 오류가 아니다.
4. 정적 실패는 “도감 기본 데이터를 불러오지 못했습니다”, 기록 실패는 “저장된 조과 기록을 불러오지 못했습니다. 도감은 미수집 상태로 계속 사용할 수 있습니다”와 실제 원인별 안내로 구분한다. 오류를 인터넷 연결 문제로 통합하지 않는다. Console에는 stage와 오류 code/name만 남기며 사진·메모·파일명은 출력하지 않는다.
5. 재시도는 정적 JSON 재검증 → 필요한 기록 파일 재시도 → 같은 저장소 재조회다. 중복 실행을 막고 기존 기록 UI를 재사용한다. 모듈 실패는 재시도 가능하며 JS 로드 10초·기록 조회 15초 제한 뒤에도 기본 Grid를 유지한다.
6. catch-records.js의 records/speciesIds가 null·undefined·비배열인 경우 빈 집계를 반환하도록 보강했다. 잘못된 행·null 사진·문자열 count·없는 speciesId는 안전하게 제외한다. 미지원 오류의 기본 code 문자열 대신 한국어 안내를 표시한다. 기록·DB를 삭제하거나 초기화하지 않았다.

이번 수정 파일은 catalog.html·catalog.js·catch-records.js·tests/catalog.test.cjs·tests/catch-records.test.cjs·TODO.md·PRD.md·이 문서·catch-record-manager/references/indexeddb-schema.md다. server.js의 기존 Phase 3 허용 목록은 이미 올바르므로 이번에는 추가 수정 없이 실행 프로세스를 갱신했다. 공개 JSON·31종 이미지 경로와 바이트의 작업 전후 해시가 모두 일치한다.

### 실제 명령·검증 결과

| 명령 / 검사 | 결과 |
| --- | --- |
| npm.cmd start | 최초는 기존 8080 점유로 실패. 확인한 기존 프로젝트 서버 재시작 뒤 같은 8080에서 정상 실행 |
| node skills/catch-record-manager/scripts/validate-record-logic.mjs --module catch-records.js | PASS: 실제 모듈 9개 집계 시나리오·정상 입력·25개 거부 입력. 별도 IndexedDB 검증과 구분 |
| npm.cmd test | 94 PASS·0 FAIL. 정적 도감의 기록 모듈 독립성과 null/undefined 집계 회귀 2개 추가 |
| node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=1 | 27 PASS·0 FAIL. 이 모드의 도감/기록 SKIP은 완료 성과로 세지 않음 |
| node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=3 --catalog species-catalog.json --record-module catch-records.js | 29 PASS·0 FAIL, 실제 도감 엄격 검사와 실제 기록 모듈 포함 |
| node .verify/catalog-startup-diagnose.cjs | 수정 전 실제 Console/Network/미정의 모듈·caught ReferenceError 재현 |
| node .verify/startup-old-server-fallback.cjs | 서버가 여전히 기록 JS를 404로 반환하는 상태에서도 31종·회색·0%·검색·상세·출처 유지, pageerror 0 |
| node .verify/startup-restart-recovery.cjs | 같은 8080의 별도 테스트 context에 보관한 합성 기존 기록·사진 바이트를 서버 재시작 후 재시도만으로 복원. 정적 JSON 재검증·새로고침도 PASS |
| node .verify/startup-boundaries.cjs | 아래 11개 경계 결과 그룹 PASS |
| node .verify/startup-crud.cjs | 실제 8080의 조과 등록·수정/삭제·사진/필드/컬러 복원·브라우저 재실행·9개 viewport PASS |
| node .verify/startup-map.cjs | 실제 8080의 기존 지도 12조합·위치 거부 1건 PASS (API/GPS는 fixture/에뮬레이션) |

### 브라우저 결과와 인수

| 사용자 요청 테스트 | 실제 결과 |
| --- | --- |
| Test 1 기록 없음 | PASS: 31종·전체 미수집·0/31·0%, 기록 안내는 제거되고 전체 오류 화면 없음 |
| Test 2 정상 IndexedDB | PASS: 실제 기록의 컬러·통계·사진 표시. 2+3=5마리/2회, 수정 후 6/2회, 삭제 후 2/1회→마지막 삭제 0/0회·회색 |
| Test 3 강제 실패 | PASS: 기록 core/UI JS 404·잘못된 모듈 export·open 오류·미지원·미래 DB 버전·기록 조회 지연에도 Grid 31종 유지. 각 경우 검색·분류/상태 필터·상세/방법/채비/출처와 이미지 디코딩 PASS |
| Test 4 새로고침 | PASS: 정상 0개 상태, 기존 사진/기록 상태 모두 복원. 같은 profile/origin으로 Chrome 프로세스를 재실행해 사진 바이트·메타데이터·수집 상태 복원 |
| Test 5 다시 불러오기 | PASS: 모듈/open/조회 실패를 복구한 뒤 JSON 재검증과 기록 재조회 성공. 반복 실패 재시도 후에도 UI factory 초기화 1회·단일 제출 DB 1건·Card 31개 |

11개 경계 그룹은 core JS 누락·UI JS 누락·잘못된 모듈·open 오류·미지원·미래 버전·조회 timeout·정상 빈 기록·느린 기록 JS·정적 JSON 실패 구분/복구·반복 재시도다. 모듈 로드를 일부러 지연시켜 CatchRecords가 아직 undefined인 동안에도 Grid·검색·상세를 조작했다. 정적 JSON 자체가 실패한 경우에만 기본 데이터 오류를 표시하고 기록 초기화 요청은 하지 않았다. 이들 통제된 404에는 예상된 브라우저 resource/MIME 오류와 안전한 경고가 있으나 미처리 JS 예외/pageerror는 없었다. 정상 초기화에서는 필수 파일 404·치명적 JS 오류가 없었다.

CRUD는 초기화 수정 후 8080에서 다시 실행했다. 수정·삭제·재등록·서로 다른 종 격리·필터 초기화 후 기록 보존·잘못된 입력/사진 차단과 9개 viewport의 긴 메모·44px 입력·닫기/ESC/focus·가로 넘침을 확인했다. 단순 단위 검사만으로 사진 영속성을 주장하지 않는다. SKILL 참고 표 T01~T09·T12~T14의 현재 범위를 적용했고 T10~T11 최종 지도 query/Popup 연결은 미구현 Phase 4로 SKIP이다. 실제 휴대폰·Safari/Firefox·실제 GPS/공식 API 재조회·배포는 이번 실행 범위 밖이다.

증거는 Git 제외된 .verify/artifacts/startup-fix/before.json, server-recovery.json, boundaries.json, crud/browser-results.json, map/map-results.json 및 empty-mobile.png·restored-8080.png에 있다. PC 복원 화면·모바일 기본 화면을 직접 열어 시각 확인했다. 모바일 전체 스크린샷은 .verify/startup-visual.cjs로 31개 lazy 이미지의 실제 decode 완료를 기다린 뒤 촬영했다. 자동화 초기 한 건은 dialog 닫기 focus 복귀 전에 다음 검색 입력을 시작한 검증 순서 문제였으며, close/focus 완료를 기다리도록 검증 코드를 고친 뒤 전체 경계 검사를 통과했다. 이 검증 순서 문제를 실제 404/ReferenceError 원인으로 기록하지 않는다.

원본 사용자 브라우저 DB를 열어 수정/삭제하지 않았다. DB/schema 버전을 올리거나 deleteDatabase/clear로 해결하지 않았고 공개 데이터·이미지·.env·API Key·지도 로직·Framework를 변경하지 않았다. 테스트용 합성 기록은 격리된 브라우저 context/profile에만 사용했다. 재검증 완료 후 TODO의 현재 Phase 3 인수를 완료 표시하며, commit/push 없이 오류 수정 범위에서 멈춘다.

## 이전 Phase 4 지도·도감 양방향 연결 이력 (2026-10-28, KST)

이 절은 이전 요청의 당시 실행 기록이다. 이후 단방향 범위 변경으로 Popup 도감 기능을 제거했으며 최신 인수는 문서 마지막 기록을 따른다.

사용자 요청: Phase 4만 구현하여 지도↔도감 연결, query 직접 접근, History·모바일·기존 지도/도감/IndexedDB 전체 회귀를 검증한다. README 최종 축약·배포 URL·발표 자료·commit/push는 수행하지 않는다.

### 명시적으로 적용한 Skill과 실제 조사

- [map-catalog-integrator](../skills/map-catalog-integrator/SKILL.md)를 작업 전에 직접 읽었다. 구현 전에 [integration-contract](../skills/map-catalog-integrator/references/integration-contract.md)를 읽고 실제 HTML·필터·Popup·서버 allowlist를 확인했다. 실제 경로/키 확인→양방향 연결→query/History/공통 UI→회귀 순서로 적용했다.
- [fishing-app-tester](../skills/fishing-app-tester/SKILL.md)를 작업 전에 직접 읽고 브라우저 검증 전에 [T01~T14](../skills/fishing-app-tester/references/test-cases.md)를 읽었다. 실제 데이터/기록 모듈 인자로 정적 검사, Node 자동 검사, 격리된 Chrome 브라우저 검증을 실행했다.
- `package.json`은 Node >=22·Express·순수 HTML/CSS/JS이며 `npm.cmd start`는 `node server.js`다. 실제 실행 중인 같은 프로젝트의 8080 프로세스와 HTTP 응답을 확인했다. 새 브라우저 자원이 없어 allowlist 확장/서버 재시작이 필요하지 않았다. 별도 배포 설정 파일은 발견하지 않았고 실제 배포는 하지 않았다.
- MapLibre fitBounds 옵션 확인에는 read-docs/Firecrawl 지침도 읽었다. Firecrawl developer search가 402로 실패하여 웹 도구로 [MapLibre 공식 옵션 문서](https://maplibre.org/maplibre-gl-js/docs/API/type-aliases/FitBoundsOptions/)를 확인했다. 문서는 버전 고정 URL이 아니며 실제 앱의 기존 6.11.2에서 범위 이동을 따로 브라우저 검증했다.

### 구현·식별자·URL

| 항목 | 실제 결과 |
| --- | --- |
| 지도 | `http://127.0.0.1:8080/`, `/index.html` |
| 도감 | `http://127.0.0.1:8080/catalog.html` |
| 지도 query | `species=<mapSpeciesKey>`, 예 `/index.html?species=%EB%AC%B4%EB%8A%AC%EC%98%A4%EC%A7%95%EC%96%B4` |
| 도감 query | `species=<speciesId>`, 예 `/catalog.html?species=patterned-squid` |
| 단일 Mapping 원본 | `species-catalog.json`: 고유 ID 31개, 실제 지도 키 22개/null 9개. 빈/중복 ID·누락/불일치 키 없음. 지도 옵션 30개 중 도감 대응이 없는 값은 일반 텍스트 |
| 표기 차이 | 학공치 ID→지도 학꽁치, 조피볼락 ID→지도 우럭. 무늬오징어/한치는 각각 patterned-squid/local-hanchi이며 한글 표시명 추정으로 ID를 만들지 않음 |
| 메모 축약어 | 기존 spot-filters에 무늬→무늬오징어, 벵에→벵에돔의 명시적 용어 경계만 보충. 임의 메모 단어를 어종으로 변환하지 않음 |
| 관련 수 | 기존 filterSpots를 공유해 전체 기록/위치 확인 수 분리. 무늬 23/14, 한치 20/18, 전체 69/44. 좌표 미확인은 마커·bounds 제외 |
| 공통 UI | 동일 Navigation·aria-current·44px·Glass·font·hover/focus·상단/좌우 여백·Footer, 기존 Hero/지도/Grid 유지 |
| 지도 URL 동기화 | 옵션 준비 뒤 query 자동 선택, 다른 조건 기본값. 어종 변경 replaceState, 전체 선택/초기화 species 제거. 다른 필터는 기존 AND |
| Popup | JSON의 mapSpeciesKey로 종별 ID 링크. 공개/제보/메모 근거 유지, 미매핑 종은 일반 텍스트. 기존 포인트/화장실/날씨/해상/물때/즐겨찾기 보존 |
| 없는 포인트 | 정확한 “현재 등록된 관련 포인트가 없습니다.” 안내. null/무매칭은 query 없는 일반 지도 링크. 0마커 제주 전체, 1마커 zoom 11.5, 복수 fitBounds/최대 11.5/모바일 32px·PC 48px padding |
| 무효 query | 빈/중복/미지원 값 제거. 지도 전체 포인트와 안내, 도감 목록과 해당 어종 없음 안내. 삽입 문자열로 실행되지 않음 |
| History | 상세 pushState·닫기 replaceState·popstate 반영. HTML 사이는 일반 링크. 뒤로 가기 후 같은 상세/지도 어종 복원. Popup 자체 열린 상태/임의 camera 영속화는 보장하지 않음 |
| 기록 보호/실행 경계 | dirty Form beforeunload 및 같은 문서 Back 확인 취소 시 입력 보존, 저장 후 경고 없음. 지도 DB open 0회·기록 모듈 없음, 도감 MapLibre/지도 인스턴스 없음 |

도감은 JSON 기본 상세를 먼저 열고 뒤이어 기록을 갱신한다. 기존 기록 모듈 지연 로드와 초기화 1회 원칙을 유지한다. DB 실패도 query 상세/방법/채비/지도 링크를 막지 않는다. 지도에서 도감 JSON 조회 실패 시 어종은 일반 텍스트로 남고 지도 기능은 유지된다.

### 명령·정적 검사

| 명령 | 결과 |
| --- | --- |
| `npm.cmd test` | 97개 PASS, 실패/건너뜀 0. 기존 94개와 신규 query/관련 수/메모 경계 검사 3개 |
| `node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=1` | 27개 PASS. 이 모드의 실제 도감/기록 검사는 SKIP이며 아래 Phase 4 명령으로 별도 확인 |
| `node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=4 --catalog species-catalog.json --record-module catch-records.js` | 29개 PASS, 필수 인자/네 Skill frontmatter/로컬 링크/JS syntax/HTML/자원 경로/실제 도감/실제 기록 모듈 검사 |
| 위 명령 내부의 도감 strict validator | 오류 0·미확인 경고 0, 고유 ID/실제 필터 키/31종 이미지 SHA 검사 |
| 위 명령 내부의 기록 logic validator | 실제 모듈 9개 집계 시나리오·25개 잘못된 입력 거부 PASS. 이 결과만으로 IndexedDB I/O 성공을 주장하지 않음 |
| `py -X utf8 .verify/check-phase4-yaml.py` | PyYAML로 네 Skill의 두 delimiter·YAML 파싱·name/description 검사 PASS. description의 기능과 사용 시점을 직접 읽어 확인. python 명령 별칭 실패 후 실제 py 실행기로 복구 |
| `git diff --check` 및 보존 비교 | 공백 오류 없음. 도감 JSON·낚시 포인트 데이터·README·31종 이미지 총 34개 SHA-256 동일 |

### 사용자 A~M 브라우저 결과

실제 기본 origin의 Chrome에서 별도 context/profile과 합성 사진을 사용했다. 다음은 이번 Phase에서 새로 실행한 결과다.

| Test | 결과와 관찰 |
| --- | --- |
| A 무늬 상세→지도 | PASS: 미수집 상세의 링크, 지도 무늬 자동 선택, 14마커/14개, 23기록과 좌표 확인 수 구분, 모든 관련 마커 범위 |
| B Popup→무늬 상세 | PASS: 표선항 방파제 65번 Popup의 실제 종 링크→patterned-squid 상세. 처음 미수집, 합성 2마리 저장 후 왕복 시 컬러/2마리·1회/사진 복원 |
| C 한치 | PASS: local-hanchi 상세→한치 18마커, 관련 20기록/위치 18곳 |
| D 없는 포인트 | PASS: 쏨뱅이 null 키의 정확한 안내와 query 없는 일반 지도 링크. 광어 1마커/zoom 11.5와 해당 좌표만 미확인으로 만든 브라우저 fixture의 0마커/제주 전체 보기 별도 확인. 원본 데이터 미수정 |
| E 잘못된 지도 query | PASS: 없는어종/도감 ID/스크립트 모양 문자열/빈 값도 44마커·안내·필터 제거, 코드 실행 없음 |
| F 잘못된 도감 ID | PASS: 목록 31종·안내·상세 닫힘, 전체 오류 없음 |
| G 상세→지도→Back | PASS: 모바일/PC 모두 같은 상세 ID 복귀, 조과/사진/해금 상태 유지 |
| H Popup→도감→Back | PASS: 원래 지도 URL/어종/마커 복귀 |
| I 지도 회귀 | PASS: 아래 지도 12조합·위치 거부, 기본 44마커, 검색/필터/즐겨찾기/화장실/날씨/물때 유지 |
| J 도감 회귀 | PASS: 아래 CRUD·사진·진행률·상태/분류/검색·마지막 삭제 재잠금, 9개 viewport |
| K 직접 URL/새로고침 | PASS: 기본 지도/도감, 루트 /?species=무늬오징어, index/catalog query 모두 복원 |
| L 모바일 Navigation | PASS: 320/375/390/430/768/1024/1440/1920px 및 812×375, 44px/aria-current/같은 높이·너비·font/넘침·겹침 없음 |
| M console/초기화 | PASS: 치명적 예외/pageerror/미처리 rejection 없음. 정상 자원 404 없음, 기록 UI factory 1회·한 제출 1건, 지도 canvas 1개·Popup Enter/ESC 5회에 중복 열림 없음 |

T01~T14 전체를 실제 적용했다. T01~T03은 빈 도감·Enter/Space·ESC/focus·동일 이미지/geometry·상세/출처, T04~T09는 아래 실제 CRUD/저장 예외, T10~T11은 A~H/K, T12~T14는 지도/모바일/오류·console 검사로 확인했다.
T07의 2→4 수정도 별도 실행하여 2+3=5/2회→7/2회와 query 새로고침 복원을 확인했다. 기본 CRUD 회귀에서는 3→4 수정 후 6/2회도 확인했다. T03의 기존 이미지 라이선스·형태를 새로 재감사한 것은 아니며, 교체 없이 검증된 원본 31종의 SHA/디코딩/회색·컬러 geometry를 확인했다.

### 기존 기능·실패 회귀와 증거

- `.verify/phase4-browser.cjs`: 375/1440px A~H/K/M, 0/1마커, 기록 실패/query 상세, 지도 도감 JSON 실패, 9개 Navigation 크기. `integration-results.json` 14그룹 PASS.
- `.verify/phase4-crud.cjs`: 실제 Form·IndexedDB·사진. 최초 2/1→2+3=5/2→3→4 수정 후 6/2→삭제 2/1→마지막 삭제 0/0·회색, 다른 종 격리/필터, 잘못된 마릿수 4종/사진 6종/미래 날짜, 중복 제출 1건. 같은 profile의 Chrome 프로세스 재시작과 새로고침 후 원본 Blob 바이트/모든 필드 복원. 모바일 9크기와 2,000자 메모·44px 입력·Tab/ESC/focus. `crud/browser-results.json` 13그룹 PASS.
- `.verify/phase4-map.cjs`: 320/375/768/1440px×날씨/Marine/물때 성공 fixture·Marine 실패·세 API 동시 실패 12조합과 위치 거부. 기본 44/무늬 14마커, 검색·초기화·즐겨찾기 저장/재조회·모의 GPS/가까운 5곳·화장실·오늘/내일 물때·Popup fit PASS. `map/map-results.json` 13그룹 PASS.
- `.verify/phase4-boundaries.cjs`: core/UI JS 404·잘못된 export·open 오류·미지원·미래 DB 버전·조회 timeout·정상 빈 DB·느린 모듈·도감 JSON 실패/복구·반복 재시도. 정적 도감 31종과 검색/분류/상세 유지, UI factory 1회/단일 제출 1건. `boundaries.json` 11그룹 PASS.
- `.verify/phase4-storage-errors.cjs`: 미지원/open/read 실패, quota/요청 성공 뒤 실제 transaction abort에서 입력·사진 보존/거짓 해금 없음, 손상 8건 제외하되 DB 보존, stale edit로 삭제 기록 부활 금지, 없는 ID 삭제 false, versionchange/future version, native blocked upgrade/해제 후 재시도, EXIF 회전 JPEG 80×120와 원본 바이트/사진 교체 동일 ID/새로고침, KST 자정 경계. `storage-errors/error-results.json` 11그룹 PASS.
- `.verify/phase4-finish-probes.cjs`: 375/1440px 공개/제보/개인 메모 링크 구분·미매핑 일반 텍스트·학꽁치 표기·다금바리 오매핑 없음·69개 전체 Popup 링크 감사, 정상 console error 0. MapLibre 강제 실패 뒤 Navigation으로 도감 정상 사용. `finish-probes.json` 3그룹 PASS.
- `.verify/phase4-keyboard.cjs`: 카드 Enter/Space·ESC/focus, 2→4 수정 7/2회, 루트 query, 어종/방법/유형 AND, Popup 키보드 반복 5회·지도 인스턴스 1개. `keyboard.json` PASS.

모든 증거는 Git 제외된 `.verify/artifacts/phase4/`에 있다. collection-375/1440은 31개 lazy 이미지 디코딩 완료 후 촬영했다. 모바일 관련 링크·공개/메모 Popup·도감 컬러/통계·지도 필터 화면을 직접 열어 시각 확인했다.
초기 브라우저 검증은 현사포구 67번에 무늬가 있다고 잘못 가정해 Popup 대기 timeout이 났다. 실제 67번은 농어/한치이며 무늬 필터에서 제외되는 것이 정상이다. 실제 공개 무늬 포인트인 65번으로 검증 대상을 고쳐 통과했다. 새 순수 검사도 무늬에 제보가 있다고 가정했다가 실패하여 실제 제보가 있는 종의 근거 검사를 사용했다. 데이터나 앱을 가정에 맞춰 수정하지 않았다.
보조 Popup 검사에서는 3번의 공개 어종 전체가 비었다고 가정했던 검증을 무늬 링크만 공개 영역에 없는지 검사하도록 바로잡았다. 셸 인용 오류는 검증 준비 코드를 별도 CJS로 작성해 복구했다. 위 검증 문제를 앱 결함으로 기록하지 않는다.

예상한 API/모듈 실패 fixture에는 브라우저 network/MIME error와 제어된 경고가 있을 수 있다. 치명적 JS 예외/무한 초기화와 구분한다. API 회귀의 성공/부분/동시 실패 판정은 fixture 기준이며 실제 공식 API 실응답 성공·실제 GPS·현장 상태·휴대폰/Safari/Firefox는 확인하지 않았다. 브라우저 기본 이탈 경고의 문구·표시 조건도 기기별 확인이 필요하다.

실제 조과 원본 사용자 profile은 열거나 지우지 않았고 테스트용 격리 profile만 사용했다. DB/schema 버전·어종 JSON·이미지·좌표 원본·의존성·서버/키/.env·README를 변경하지 않았다. PRD 현재 상태·TODO C06/Phase 4 검증·integration contract를 실제 결과로 갱신했고, SKILL.md는 기존 “파서 없음” 단정 한 문장만 재사용 가능한 조건문으로 고쳤다. Phase 4 완료 후 멈추며 Phase 5·commit/push는 진행하지 않는다.

## Phase 4 도감→지도 범위 변경 (2026-10-28, KST)

### 요청·Skill 적용·제외 결정

이번 사용자 요청은 **공통 Navigation·도감→지도 이동·지도 species 필터·기존 기능 회귀**다. 이전 양방향 구현 중 Popup 도감 버튼/링크/Chip은 정보량과 가독성을 고려해 제외하고 제거한다. 기존 도감 상세 직접 query는 유지 가능하되 Popup에서 연결하지 않는다.

- [map-catalog-integrator](../skills/map-catalog-integrator/SKILL.md)와 [fishing-app-tester](../skills/fishing-app-tester/SKILL.md)를 작업 전에 직접 읽고 명시적으로 적용했다.
- integrator 절차에 따라 구현 전에 [integration-contract](../skills/map-catalog-integrator/references/integration-contract.md)를 읽었다. 실제 HTML/script/style/JSON·기존 필터/query·Navigation·Express allowlist·package.json·8080 실행 프로세스를 확인했다.
- tester 절차에 따라 브라우저 실행 전에 [test-cases](../skills/fishing-app-tester/references/test-cases.md)를 읽었다. 사용자 최신 범위가 기존 Skill의 역방향 요구보다 우선하므로 integrator 목적/description/절차/예제를 도감→지도로 수정하고 tester T11을 Popup 기존 정보/도감 기능 부재 검사로 변경한 뒤 검증했다. Skill name은 유지했다.
- PRD F6·UI/URL 설계·완성 기준·Phase 표와 TODO C06을 단방향 범위로 정리했다. 초기 기획과 이전 실행 결과는 이력으로 구분하고 변경 이유를 기록했다. 제외된 기능을 미완료 항목으로 남기지 않았다.

### 실제 구현 결과

| 항목 | 현재 결과 |
| --- | --- |
| 지도 URL | `http://127.0.0.1:8080/`, `http://127.0.0.1:8080/index.html` |
| 도감 URL | `http://127.0.0.1:8080/catalog.html` |
| 지도 query | `species=<mapSpeciesKey>`, URLSearchParams로 생성. 예 `/index.html?species=%EB%AC%B4%EB%8A%AC%EC%98%A4%EC%A7%95%EC%96%B4` |
| 식별자 | 기존 species-catalog.json이 단일 원본. speciesId 31개 고유/빈 값 없음, 지원 키 22개/null 9개, 실제 지도 옵션 30개와 불일치/누락 없음 |
| 어종 검증 | 무늬오징어 patterned-squid, 한치 local-hanchi, 벵에돔 largescale-blackfish. 학공치→학꽁치·조피볼락→우럭은 검토된 키만 사용. 쏨뱅이/자바리/살오징어에 임의 키를 대신 연결하지 않음 |
| 메모 | 무늬/벵에의 명시적 경계 규칙을 필터/관련 수에만 유지. 공개/제보/메모 근거 구분과 원본 배열 보존 |
| 도감→지도 | 기존 필터·마커를 재사용해 관련 수/선택 상태/범위 적용. 무늬 23기록/14마커, 한치 20/18. 앱 수치는 데이터 계산값 |
| 0개/무효 | null 9종은 정확한 없음 안내/일반 지도 링크. 무효·빈·중복 query는 제거하고 44개 전체 포인트와 안전 안내. 0마커는 제주 전체, 1마커 zoom 11.5, 복수 bounds/padding 유지 |
| 초기화 | 검색/어종/방법/유형/즐겨찾기 조건과 species query를 비우고 전체 지도 복귀. 저장된 즐겨찾기 ID는 보존. 추가 필터 AND·수동 어종 URL 동기화 유지 |
| Popup 제거 | updateFishingSpotCatalogLinks/loadMapCatalogLinks/setCatalogLinks, 메모 어종 추가 영역, 도감 링크/Chip CSS와 지도 도감 조회/오류 안내 제거 |
| Popup 보존 | 기존 createFishingSpotPopupContent 함수와 69개 DOM이 Phase 3 원본과 동일. 이름/지역/유형/공개·제보 어종/방법/메모/출처/즐겨찾기/화장실/날씨/Marine/물때 유지 |
| 실행 분리 | 지도에서 species-catalog.json/catalog.js/기록 모듈 요청 0회·DB open 0회·canvas 1개. 도감은 지도 JS/MapLibre를 실행하지 않음 |
| 호환/History | 기존 도감 speciesId 상세 직접 URL 유지, Popup 연결 없음. 도감→지도→Back의 상세/이전 도감 복귀, 직접 지도 query/새로고침 유지 |

앱 변경은 script.js와 styles.css의 Popup 연결 제거뿐이다. 기존 Navigation·Hero/Layout·도감/기록/필터 코드는 이번 요청에서 수정하지 않았다. Git HEAD 대비 script.js 차이는 기존 단방향 범위 이동 메서드뿐이며 Popup 생성 함수/CSS는 기존 상태다.

### 이번 요청의 A~J 실행 결과

실제 기본 origin에서 별도 Chrome context/profile과 합성 사진을 사용했다. 아래는 이전 결과를 복사한 것이 아니라 Popup 제거 후 다시 실행한 결과다.

| Test | 결과 |
| --- | --- |
| A 무늬 상세→지도 | PASS, 375/1440px에서 링크→무늬 자동 선택·14마커/결과 개수·전체 관련 bounds, 다른 탐색 조건 기본값 |
| B 한치 상세→지도 | PASS, local-hanchi→한치 필터·18마커·20기록/위치 18곳·범위 |
| C 관련 포인트 없음 | PASS, 실제 null 9종 전부 정확한 안내와 query 없는 일반 지도 링크. 별도 광어 1마커 및 그 좌표만 미확인으로 만든 브라우저 fixture의 0마커/제주 전체 보기 확인. 원본 좌표/데이터 미변경 |
| D 잘못된 query | PASS, 없는어종/도감 ID/빈 값/중복 값/스크립트 모양 문자열은 44마커 기본 상태·안내·query 제거·코드 실행 없음 |
| E Back | PASS, 무늬 상세→지도→Back으로 상세/같은 ID 복귀. 지도 직접 URL·루트 URL·새로고침/초기화도 정상 |
| F Popup 보호 | PASS, 69개 전체 Popup 생성 DOM과 기존 원본 비교 차이 0. 3/43/65/67번 실제 Popup에서 도감 문구/링크/Chip 없음, 원래 어종 문자열/공개·제보·메모·화장실·날씨/해상/물때·즐겨찾기 및 모바일 fit/스크롤 유지 |
| G 지도 탐색 | PASS, 기존 검색/필터/AND/초기화·즐겨찾기 저장/새로고침·현재 위치/가까운 5곳·화장실·제주 전체 보기·API fixture 회귀 |
| H 조과/IndexedDB | PASS, 사진/필드 등록·수정·삭제·컬러 해금/마지막 삭제 재잠금·집계/완성률·새로고침/같은 profile 브라우저 재시작 복원·저장 실패 입력 보존 |
| I 모바일 Navigation | PASS, 320/375/390/430/768/1024/1440/1920px 및 812×375. 실제 link/aria-current·44px·같은 크기/font/radius·키보드 focus, 넘침/제목·검색·Control 겹침 없음 |
| J Console/초기화 | PASS, 치명적 JS 예외/pageerror/미처리 rejection 없음·정상 자원 404 없음. 반복 재시도 UI factory 1회/한 제출 1건·지도 canvas 1개·Popup Enter/ESC 반복 5회 중복 없음 |

### 회귀·명령·증거

| 실행 | 실제 결과/증거 |
| --- | --- |
| `npm.cmd test` | 97 PASS, 실패·건너뜀 0. 기존 데이터/지도/기록 검사와 실제 키·관련 수·메모 경계 검사 |
| `node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=1` | 27 PASS. 도감/기록 항목 SKIP은 아래 Phase 4 명령으로 실제 확인 |
| `node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=4 --catalog species-catalog.json --record-module catch-records.js` | 29 PASS. 실제 catalog strict 오류 0/경고 0, 실제 기록 모듈 9개 집계 시나리오/25개 거부 입력, 네 Skill frontmatter/참조/로컬 링크/syntax/자원 검사 |
| `py -X utf8 .verify/check-phase4-yaml.py` | 네 Skill YAML 파싱·구분자·name/description PASS, description의 기능·사용 시점 직접 확인 |
| `node .verify/phase4-oneway-browser.cjs` | A~G/J·0/1마커·Navigation, integration-results.json 12그룹 PASS |
| `node .verify/oneway-map.cjs` | 320/375/768/1440px×성공 fixture/Marine 실패/세 API 동시 실패 12조합+GPS 거부, map/map-results.json 13그룹 PASS. 오늘/내일 물때·Popup fit·화장실·즐겨찾기/모의 GPS/가까운 5곳 유지 |
| `node .verify/oneway-crud.cjs` | crud/browser-results.json 13그룹 PASS. 2+3=5/2회·3→4 수정 6/2회·삭제 2/1→0/0, 다른 종 격리/필터·잘못된 count 4종/사진 6종·미래 날짜 차단·중복 제출 1건·사진 바이트/필드 재시작 복원·9개 viewport/긴 메모/focus |
| `node .verify/oneway-storage-errors.cjs` | storage-errors/error-results.json 11그룹 PASS. open/read/미지원·quota/요청 성공 뒤 실제 transaction abort 입력 보존·손상 8건 제외/DB 보존·stale edit·없는 ID 삭제·versionchange/future version/blocked·EXIF JPEG/사진 교체·KST 날짜 |
| `node .verify/oneway-boundaries.cjs` | boundaries.json 11그룹 PASS. 모듈/DB 실패·모듈 지연에도 31종·검색/분류/상세 유지, JSON 실패 구분/복구·반복 재시도 factory 1회/단일 제출 1건 |
| `node .verify/oneway-keyboard.cjs` | keyboard.json PASS. 카드 Enter/Space/ESC/focus, T07의 2→4 수정 7/2회/query 복원, 루트 지도 query, 3조건 AND, Popup 키보드 반복 5회 |
| `node .verify/phase4-oneway-preservation.cjs` | preservation.json: 이번 요청 전후 44개 파일 SHA 동일, 기존 Popup 함수 동일, 실제 8080 자원 10개 HTTP 200/로컬 내용 동일 |
| `git diff --check` | 공백 오류 없음 |

증거는 Git 제외 `.verify/artifacts/phase4-oneway/`에 저장했다. 모바일 Popup·무늬 필터 지도·Navigation 스크린샷을 직접 열어 일반 문자열의 정보 밀도/fit/focus를 확인했다. T01~T14는 현재 T11(Popup 보호)을 기준으로 적용했으며 이전 Popup 역방향 이동 검사로 대체하지 않았다. 31종 이미지의 권리/형태를 새로 감사한 것은 아니고 기존 검토된 이미지 바이트/경로·실제 디코딩·회색/컬러 geometry를 유지했다.

이번 검증에서 앱 실패는 없었다. 계약 문서 교체 준비 중 PowerShell ConvertTo-Json이 확장 객체를 반환해 문자열 처리에 실패한 도구 코드 한 건은 명시적 string 변환 뒤 복구했다. 최종 공백 검사에서 계약 문서 EOF의 추가 빈 줄 한 건을 제거한 뒤 재검사했다. 앱/데이터는 그 실패에서 변경되지 않았으며 브라우저 실패로 기록하지 않는다.

### 수정 파일·보존·한계·다음 단계

이번 요청에서 추가 수정한 파일은 script.js, styles.css, PRD.md, TODO.md, docs/SKILL_USAGE.md, integrator SKILL.md·integration-contract.md, tester SKILL.md·test-cases.md의 9개다. 이전 미커밋 변경은 보존했다. 새 배포 앱 파일/의존성/서버 경로는 추가하지 않았다. 검증용 CJS/증거는 .verify에만 추가했다.
이번 요청 전후 보존한 44개에는 도감 JSON/31종 이미지/낚시 데이터·좌표/README/기록 core/UI/도감 UI/필터/서버/의존성 파일이 포함된다. 사용자 원본 브라우저 DB를 열어 지우거나 수정하지 않았고 schema 변경/.env·키 열람/수정·commit/push는 하지 않았다.
실제 휴대폰·Safari/Firefox·실제 GPS/현장 상태·공식 API 실응답 성공·배포는 미확인이다. 날씨/해상/물때 성공·오류 판정은 통제된 fixture이며 API 실패 시 예상된 network/MIME 메시지를 치명적 JS 오류와 구분했다.
확정 범위의 Phase 4/C06을 완료했다. Phase 5의 README 최종 축약·실제 배포 URL/공개 상태 확인·최종 문서/발표 정리는 이번에 수행하지 않고 멈춘다.
