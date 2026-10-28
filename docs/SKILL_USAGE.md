# Skill 생성 및 사용 기록

[PRD 확장](../PRD.md#11-낚시-도감-확장-요구사항) · [TODO](../TODO.md#낚시-도감-확장)

현재 상태는 문서 끝의 **Phase 2 전체 상세 정보 감사·인수** 기록을 따른다. 이전 24종·13이미지·이미지 준비 대기·엄격 실패 기록은 각 실행 당시의 이력이다. 현재 31종·이미지 31종·정보 31종, needsAsset/needsVerification 0이며 C02·C03 완료다. [이미지 출처](./SPECIES_ASSETS.md) · [정보 감사·출처](./SPECIES_INFO_SOURCES.md)

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
