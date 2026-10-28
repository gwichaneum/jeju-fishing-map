# 최종 테스트 보고서

검증일: **2026-10-28 KST**. 대상: 로컬 `http://127.0.0.1:8080`의 Phase 5 작업본. Chrome 156.0.8078.48, Node 25.8.0/npm 11.11.0. `fishing-app-tester`를 명시적으로 읽고 적용했다.

**로컬 T01~T58: 58 PASS. 공개 배포 사이트는 미검증이다.** 아래 PASS는 기재한 방법/환경에 한정된다. GPS는 모의 위치/거부, 모바일은 화면 에뮬레이션이며 실제 휴대폰 인수와 구분한다. 정상/오류 화면의 브라우저 검사와 실제 API 조회를 새로 실행했고 과거 결과를 복사하지 않았다.

## 기능 결과

| ID | 기능 | 테스트 방법 | 기대 결과 | 실제 결과 | 상태 |
|----|------|-------------|-----------|-----------|------|
| T01 | 지도 로딩 | 브라우저 기본 주소 접속 | 로딩 종료·탐색 활성화 | 지도/컨트롤 정상 | PASS |
| T02 | MapLibre/OpenFreeMap | 실제 CDN·타일 로딩/화면 확인 | 제주 지도 표시 | 실제 지도·타일 표시 | PASS |
| T03 | 마커 | DOM 개수·원본 데이터 비교 | 확인된 좌표만 표시 | 69기록 중 44마커, 미확인 25 제외 | PASS |
| T04 | Popup | 3/43/65/67번 선택·Enter/ESC | 해당 포인트 정보/닫기 | 정상 열림·닫힘·반복 5회 중복 없음 | PASS |
| T05 | 검색 | 현사포구·없는 검색·초기화 | 일치 결과/빈 상태 | 67번 검색/이동·빈 결과 정상 | PASS |
| T06 | 어종 필터 | 무늬오징어 선택/해제 | 해당 마커 표시 | 14마커·URL 동기화 | PASS |
| T07 | 방법 필터 | 에깅 단독 선택·AND | 기존 필터와 같은 결과 | 단독 5마커·복합 조건 일치 | PASS |
| T08 | 유형 필터 | personal-spot 단독·AND | 해당 유형만 표시 | 단독 3마커·복합 조건 일치 | PASS |
| T09 | 초기화 | 검색/어종/방법/유형/즐겨찾기 설정 후 실행 | 조건/query 초기화 | 전체 44마커·species 제거 | PASS |
| T10 | 즐겨찾기 | 추가→재조회→제거→재조회 | 추가/제거 모두 보존 | 1개→0개 및 재조회 일치 | PASS |
| T11 | 현재 위치 | 모의 GPS 허용/거부 | 위치/정확도 또는 권한 안내 | 위치 마커·거부 안내 정상, 실제 GPS 별도 | PASS |
| T12 | 가까운 거리 | Haversine 단위 검사·모의 GPS | 올바른 직선거리/순서 | 가까운 최대 5개·필터 반영 | PASS |
| T13 | 화장실 | 실제 Popup·정적 거리 검사 | 500m 내 시설/부재 안내 | 이름/거리/출처·부재 상태 정상 | PASS |
| T14 | 현재 날씨 | 실제 API·정상/오류 UI | 정상 값·오류 격리 | 실제 유한 값 수신, 자동 모델 fallback·UI 확인 | PASS |
| T15 | 해상 정보 | 실제 Marine API·fixture UI | 파고/방향/주기/수온 | 실제 4개 유한 값 및 UI 확인 | PASS |
| T16 | 공식 물때 | 실제 로컬 프록시 오늘/내일·탭 | 공식 기준지점·cm·시간 표시 | 20261028/29 HTTP 200, 4/3개 이벤트·탭 정상 | PASS |
| T17 | API 실패 격리 | Marine 단독/세 API 동시 503 | 다른 기능 유지 | 검색·즐겨찾기·Popup/지도 유지 | PASS |
| T18 | 전체 Grid | 빈 별도 profile 접속 | 30종 이상 표시 | 31종·0/31·0% | PASS |
| T19 | 고유 이미지 | 31개 경로/bytes/디코딩·화면 | 종별 고유 원본 | 31개 고유 경로·SHA·디코딩 정상 | PASS |
| T20 | 미수집 회색 | computed style·저장 전후 비교 | 같은 src/geometry에 회색 적용 | 첫 기록 전 회색·해금 후 filter 해제 | PASS |
| T21 | 어종 검색 | 한치/무늬·불일치 검색 | 일치/빈 목록 | 검색 결과 정상 | PASS |
| T22 | 수집 상태 | 빈 상태·기록 등록 후 필터 | 실제 기록 기반 분류 | 미수집/수집완료·빈 결과 정상 | PASS |
| T23 | 생물 분류 | 어류/두족류·검색/상태 결합 | AND 분류 | 25/6종, 조합/초기화 정상 | PASS |
| T24 | 상세 | 31종 클릭·키보드 Enter/Space | 미수집 상세/닫기 | 전 종 정상·focus 복귀 | PASS |
| T25 | 방법 | 31종 미수집 guide 확인 | 기본 방법 표시 | 누락 없이 표시 | PASS |
| T26 | 채비 | 31종 미수집 guide 확인 | 기본 채비 표시 | 누락 없이 표시 | PASS |
| T27 | 시기/서식 | 실제 JSON·31종 상세 | 검토된 설명 표시 | 시기/서식·범위 안내 정상 | PASS |
| T28 | 출처 | 31종 두 출처 목록 확인 | 정보/이미지 분리 | 두 목록·원본/이용 조건 링크 정상 | PASS |
| T29 | 첫 2마리 | 합성 PNG·날짜·장소/메모 저장 | 컬러·2마리/1회 | transaction 완료 후 해금/집계 | PASS |
| T30 | 같은 종 3마리 | 추가 저장 | 5마리/2회·수집 종 중복 없음 | 기대 집계 일치 | PASS |
| T31 | 기록/사진 복원 | 재조회·같은 profile Chrome 재시작 | Blob/필드 보존 | 바이트·메타데이터·통계 복원 | PASS |
| T32 | 수정 | 3→4 및 2→4·사진 교체 | 같은 ID·재집계 | 6/2 및 7/2, createdAt/미교체 사진 유지 | PASS |
| T33 | 하나 삭제 | 삭제·확인 취소 비교 | 남은 기록 컬러 유지 | 2/1회·취소 시 미변경 | PASS |
| T34 | 마지막 삭제 | 마지막 기록 삭제 | 회색·0/0·진행률 감소 | 미수집 복귀·기본 정보 유지 | PASS |
| T35 | 0마리 차단 | 0/음수/소수/빈 값 제출 | 오류·DB 미변경 | 저장 차단·입력 보존 | PASS |
| T36 | 비이미지 차단 | 텍스트/빈/깨진 PNG/SVG/HEIC/초과 | 거부·해금 없음 | 6종 거부·사진 오류 안내 | PASS |
| T37 | Navigation | 양쪽 일반 링크/aria-current | 일반 화면 전환 | 동일 UI·현재 화면 표시 | PASS |
| T38 | 무늬→지도 | 실제 상세 링크 선택 | 지도 이동 | 실제 index URL 이동 | PASS |
| T39 | 무늬 자동 필터 | query/UI/수·bounds 비교 | 같은 어종 상태 | 23기록/14마커·모두 범위 내 | PASS |
| T40 | 한치→지도 | 실제 상세 링크 선택 | 한치 마커 표시 | 20기록/18마커·범위 정상 | PASS |
| T41 | 관련 없음 | 실제 null 9종·0/1마커 fixture | 안내·가짜 키/좌표 없음 | 일반 지도 링크·0개 제주 전체·1개 적정 zoom | PASS |
| T42 | 무효 species | 미지원/빈/중복/스크립트 모양 | 안전 기본 화면 | 44마커·안내·query 제거·실행 없음 | PASS |
| T43 | Back | 상세→지도→Back·직접 URL/재조회 | 이전 도감 복귀 | 같은 상세 ID·기록 상태 복귀 | PASS |
| T44 | Popup 도감 부재 | 69개 DOM·실제 Popup 감사 | 링크/버튼/Chip 없음 | 전부 없음·기존 정보 구조 동일 | PASS |
| T45 | 모바일 지도 | 320/375/768px·가로 화면 | 지도/Popup 사용 가능 | fit·탐색·API 실패 상태 정상 | PASS |
| T46 | 모바일 Grid | 9개 viewport | 반응형 열/넘침 없음 | 폭별 2~8열·넘침 없음 | PASS |
| T47 | 모바일 상세 | 9개 viewport 상세 열기 | 내용/닫기 접근 | 가로 넘침/화면 초과 없음 | PASS |
| T48 | 모바일 Form | 9개 viewport·긴 장소/메모 | 입력/저장/수정/삭제 | 120자 장소/2000자 메모·조작 정상 | PASS |
| T49 | Modal 스크롤 | 상세/Form/Popup 긴 내용 | 내부 스크롤·버튼 접근 | 정상 스크롤·닫기/저장 접근 | PASS |
| T50 | 키보드 focus | Tab/Enter/Space/ESC·복귀 | 보이는 focus·이동 | Navigation/상세/Form/Popup 정상 | PASS |
| T51 | 터치 영역 | 실제 rect 측정·Form 검사 | 주요 버튼 44px 이상 | 작은 마커/닫기 수정 후 44px 미만 0개 | PASS |
| T52 | 가로 스크롤 | 9개 viewport scrollWidth 비교 | 의도치 않은 넘침 없음 | 지도/Grid/상세/Form 정상 | PASS |
| T53 | 치명적 JS | browser pageerror/console 수집 | fatal 없음 | 0건 | PASS |
| T54 | 미처리 rejection | unhandledrejection/pageerror 수집 | 없음 | 0건 | PASS |
| T55 | 자원 404 | 정상 네트워크 response 감사 | 필수 자원 누락 없음 | 0건, 보안/실패 주입의 의도된 404는 별도 | PASS |
| T56 | 중복 이벤트 | 반복 Popup/재시도·이중 제출 | 중복 동작 없음 | Popup 1개·단일 제출 1건 | PASS |
| T57 | 중복 DB 초기화 | retry factory/open 계측 | 문서당 한 UI·지도 DB 없음 | UI factory 1회·지도 DB open 0회 | PASS |
| T58 | 잘못된 값 노출 | 기본/31종/저장/오류 화면 innerText | null/undefined/NaN 미노출 | 해당 문자열 0건 | PASS |

## 배포·보안·실기기

| ID | 기능 | 테스트 방법 | 기대 결과 | 실제 결과 | 상태 |
|----|------|-------------|-----------|-----------|------|
| D01 | 깨끗한 설치 | .env 없는 OS 임시 사본 npm ci | 새 설치/서버 실행 | 69 package 설치·Production HTTP 200 | PASS |
| D02 | 플랫폼 설정 | 플랫폼 key/PORT·production bind·단위 검사 | 외부 bind/변수 우선 | PORT 반영·0.0.0.0·합성 key 인식/로그 비노출 | PASS |
| D03 | 키·정적 보안 | Git 텍스트/이력 패턴·HTTP 금지 경로 | 노출 후보 없음 | 23 commit/165 blob 후보 0·금지 파일 404 | PASS |
| D04 | 의존성 | npm audit --omit=dev | 알려진 취약점 없음 | 전이 의존성 수정 후 0건 | PASS |
| D05 | Public GitHub | 인증 없는 공개 API/페이지 | public=true | HTTP 200·Public 확인 | PASS |
| D06 | 공개 URL/HTTPS | 기존 설정·homepage/deployments 확인 | 실제 배포 URL 인수 | 확인된 URL 없음·Marker 유지 | NOT TESTED |
| D07 | 배포 기능 | 배포 지도/도감/API/IndexedDB/모바일 | 배포 origin에서도 정상 | 배포 URL 없어 실행 못함 | NOT TESTED |
| M01 | 실제 기기 | 휴대폰 GPS/사진/키보드·Safari/Firefox | 실기기 조작/복원 | Chrome 에뮬레이션만 완료 | MANUAL CHECK REQUIRED |
| M02 | 최소 Node | Node 22 별도 런타임 | 최소 지원 버전 호환 | Node 25.8.0에서 검증 | MANUAL CHECK REQUIRED |

## 검증 명령과 증거

- `npm.cmd test`: **99 PASS**, 실패·건너뜀 0. 신규 Production 시작 검사 2개 포함.
- `node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=1`: 27 PASS. 실제 도감/기록 검사는 아래 Phase 5 명령으로 별도 확인한다.
- `node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=5 --catalog species-catalog.json --record-module catch-records.js`: 29 PASS. 다른 세 Skill은 frontmatter·로컬 링크만 검사했고 본문을 다시 읽거나 수정하지 않았다.
- 네 Skill YAML·문서/이미지 로컬 링크·공백 검사. 공개 이미지의 종 분류/이용 조건을 이번에 전문가 재감정한 것은 아니다. 기존 출처 기록/고유 SHA/디코딩/동일 회색·컬러 원본을 확인했다.
- 실제 API 결과: Open-Meteo 자동 모델·Marine 유한 값, 공식 물때 HTTP 200 오늘 4/내일 3 이벤트. 성공/부분/동시 실패 UI는 별도 통제 fixture로 검사했다. 조회 시점의 응답이며 장래 가용성 보장이 아니다.
- `.verify/artifacts/phase5/`(Git 제외): map/map-results.json, crud/browser-results.json, integration-results.json, storage-errors/error-results.json, boundaries.json, keyboard.json, final-controls.json, evidence.json, live-api.json, production-smoke.json, repository-security.json 및 최종 검사 로그.
- 제출용 실제 화면: [지도](../assets/screenshots/final-map.png), [31종 도감](../assets/screenshots/final-collection.png), [합성 사진 첫 기록](../assets/screenshots/final-catch.png). 개인 브라우저 기록을 지우지 않고 격리 profile을 사용했다.

## 발견·수정·재검사

- Production key가 `.env` parsed 값으로 한정되던 문제: 플랫폼 환경변수 우선으로 최소 수정, 로컬 fallback 유지. Production 공개 bind와 PORT/자원/키 없음 상태를 별도 사본에서 검증했다.
- body-parser/qs 취약점: 직접 버전 변경 없이 lockfile 호환 보안 업데이트 후 audit 0건·HTTP/브라우저/자동 회귀. [배포·보안 점검](./DEPLOYMENT_CHECKLIST.md)에 공지 링크를 기록했다.
- T51 최초 마커 24px/닫기 36px: 클릭 영역 44px로 확대하고 dot 크기·badge/닫기 glyph 중심을 유지했다. 수정 후 측정 44px 미만 0개와 지도/API/Popup fit를 재검증했다.
- 검증 사본의 숨김 상위 폴더에 대한 Express 보호 및 출처 목록 두 개를 하나로 가정한 검증 코드는 검사 환경/기대값을 고쳐 재실행했다. 앱의 정적 보호를 완화하거나 정상 출처 UI를 삭제하지 않았다.

## 남은 문제

현재 로컬 필수 기능 FAIL은 없다. **D06/D07 공개 배포·HTTPS는 NOT TESTED**이므로 전체 공개 서비스 인수 완료로 표시하지 않는다. 실제 배포 후 URL 교체, 배포 사이트/API/IndexedDB 검사, 실제 휴대폰·최소 Node 확인이 남았다. 최종 commit/push는 사용자 검토 후 수행한다. 이 보고서 작성 중 commit/push하지 않았다.
