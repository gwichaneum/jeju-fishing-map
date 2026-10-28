# 지도·도감 연동 계약

## Phase 1 관찰 — 2026-10-28

- 지도 URL: `/`, `/index.html`. 단일 HTML, 기능별 defer script, 라우터 없음.
- `spot-filters.js`: `createSpotFilterOptions`로 한국어 필터를 생성하고 `filterSpots`로 AND 조건을 적용한다.
- `initializeSpotControls` 내부 `applyFilters`는 아직 외부 API가 아니다. URLSearchParams·species query 처리가 없다.
- `script.js`: `initializeJejuMap`의 map load 뒤 controls 초기화. `createFishingSpotPopupContent`가 정보 DOM을 만들며 `focusSpot`이 실제 표시 포인트로 이동한다.
- 도감 HTML·데이터·상세 경로는 아직 없다. `server.js`는 파일 allowlist 방식이므로 파일 생성만으로 서비스되지 않는다.

## Phase 2 반영

- 실제 도감 URL은 `/catalog.html`, 원본은 `species-catalog.json`, 목록/상세는 `catalog.js`, 스타일은 `catalog.css`다.
- 공통 Navigation의 일반 페이지 이동만 구현했다. 도감 상세는 native dialog이며 URL species query를 아직 처리하지 않는다.
- 상세의 관련 포인트 이름·근거 표시는 기존 filterSpots를 읽어 계산한다. 어종별 지도 이동 버튼은 비활성이다.
- 현재 서버는 도감 파일과 JSON에 등록된 로컬 이미지만 추가로 제공한다. Phase 4에서는 실제 parser·Popup 링크·뒤로 가기를 연결해야 한다.

## 식별자

| 값 | 의미 | 규칙 |
| --- | --- | --- |
| speciesId | 도감·기록의 공통 안정적 ID | 소문자/숫자/하이픈, 실제 데이터에 존재해야 함 |
| mapSpeciesKey | 기존 지도 필터 어댑터 | 정확한 실제 한국어 옵션 또는 null, 표시명으로 추정 금지 |
| mapSpotId | 기존 포인트 ID | 숫자, fishing-spots.js 기준. 좌표 확인 여부는 별도 판단 |

`학공치` 후보→`학꽁치`는 동일 대상 확인 후 연결한다. `오징어`→살오징어, `우럭`→쏨뱅이 자동 매핑은 금지한다.
공개 species·reportedSpecies·개인 메모로 매칭된 포인트의 근거 구분을 팝업에서 유지한다.

## 후속 어종별 이동 후보 (현재 query 처리 미지원)

| 이동 | 후보 계약 | 구현 전에 확정할 사항 |
| --- | --- | --- |
| 도감→지도 | `index.html?species=<URL 인코딩된 mapSpeciesKey>` | 실제 parser·검증·옵션 준비 후 적용·뒤로 가기 |
| 지도→도감 | `catalog.html?species=<URL 인코딩된 speciesId>` | Phase 2에서 정한 실제 파일/route·상세 열기·서버 allowlist |

실제 파일·route를 선택한 뒤 이 표를 구현과 일치시킨다. 현재 지원하지 않는 주소를 앱 링크로 노출하지 않는다.
URL은 URL/URLSearchParams 등으로 인코딩하고 query 값을 HTML 문자열에 삽입하지 않는다.
필터 초기화 시 query와 UI가 충돌하지 않게 하고, URL 상태를 동기화하면 popstate도 함께 처리한다.

## UI·이동 동작

- 공통 `[낚시 지도] [나의 도감]` Navigation, 현재 항목 표시와 aria-current 등 의미 제공.
- 기존 바다 배경·밝은 Glass Card·둥근 UI·system font·파란색/청록 포인트·그림자 재사용.
- 도감에서 관련 포인트 이동 시 이전 검색·방법·유형·즐겨찾기 조건이 의도치 않게 결과를 막지 않도록 기준을 정한다.
  기본 제안은 관련 어종만 적용하고 다른 탐색 조건은 비우되 저장된 즐겨찾기는 보존하는 것이다.
- mapSpeciesKey=null이면 어종 필터를 적용하지 않는다. mapMatchStatus=unavailable는 검토한 대응 키 없음, 그 외는 관련 정보 확인 대기로 구분하고 일반 지도 이동을 제공한다.
- 알 수 없는 query는 기본 지도 또는 도감 찾을 수 없음 안내로 복귀한다. 정확한 키라도 좌표 미확인이면 마커를 만들지 않는다.
- Popup 링크는 도감에 매핑된 종마다 제공한다. 여러 종인 포인트는 임의의 한 종으로 몰지 않는다.
- 뒤로 가기 시 이전 목록/필터·선택 종으로 돌아가는지 확인한다. 이동 시 불필요한 새 탭을 만들지 않는다.
- 모바일은 터치 영역·focus·스크롤·가로 넘침과 필요 시 지도 resize를 검증한다.

## 회귀 경계

지도 표시·마커·Popup·검색/필터 AND·초기화·즐겨찾기 지속·위치·가까운 목록·화장실·날씨/Marine·공식 물때·API 오류 격리 전부 유지한다.
새 리소스는 필요한 경로만 allowlist에 추가하고 `/api/tides`·키 처리·좌표 원본은 보존한다.
정적 파일 200 응답뿐 아니라 실제 query 직접 접속·양방향 이동·뒤로 가기를 브라우저로 검사한다.
