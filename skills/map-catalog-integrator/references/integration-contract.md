# 도감 → 지도 연동 계약

## 확정 범위 — Phase 4 변경 (2026-10-28)

기존 양방향 기획에서 도감 탐색 → 지도 포인트 확인을 핵심 흐름으로 확정했다. 지도 Popup에는 정보가 많으므로 가독성을 위해 Popup→도감 연결을 제외한다.
상단 Navigation의 일반 화면 이동은 양쪽에서 제공한다. Popup 도감 버튼·링크·어종 Chip·Badge·수집 상태·수집 마릿수는 후속 미완료 작업이 아니다.

## 실제 파일과 실행 경계

- `npm.cmd start` → `http://127.0.0.1:8080`.
- 지도: `/`, `/index.html`, `index.html`·`script.js`. 도감: `/catalog.html`, `catalog.html`·`catalog.js`·`catalog.css`.
- 공통 UI는 `styles.css`, 공유 데이터/필터/URL helper는 `fishing-spots.js`·`spot-filters.js`다.
- 도감은 MapLibre/지도 전체 JS를 실행하지 않는다. 지도는 도감 JSON을 조회하거나 기록 UI/IndexedDB를 초기화하지 않는다.
- Express의 기존 정확한 파일 allowlist를 유지한다. query는 정적 파일 선택과 무관하며 새 자원/서버 재시작은 필요하지 않다.

## 식별자와 Mapping

| 값 | 역할·검증 |
| --- | --- |
| speciesId | 도감/기록의 안정적 ID. 원본 JSON의 소문자/숫자/하이픈 값, 빈 값·중복 금지 |
| mapSpeciesKey | 원본 JSON에서 읽는 지도 필터 값. createSpotFilterOptions(fishingSpots).species의 정확한 옵션 또는 null |
| mapSpotId | 기존 숫자 포인트 ID. 좌표 확인 여부와 별개 |

`species-catalog.json`의 31개 고유 ID·지원 키 22개/null 9개를 단일 원본으로 사용한다. 지도 옵션은 30개다. 별도 중복 Mapping 파일을 만들지 않는다.
예: `patterned-squid`→`무늬오징어`, `local-hanchi`→`한치`, `largescale-blackfish`→`벵에돔`.
검토된 표기 차이는 `japanese-halfbeak`(학공치)→`학꽁치`, `korean-rockfish`(조피볼락)→`우럭`이다. 쏨뱅이→우럭, 자바리→다금바리, 살오징어→포괄적 오징어 추정은 하지 않는다.
`SPOT_SPECIES_MEMO_ALIASES`의 무늬→무늬오징어·벵에→벵에돔은 필터/관련 수만 보충한다.
기존 noteHasFishingTerm의 시작/공백/쉼표/가운뎃점/슬래시 경계와 끝/구분자/낚시/포인트/갯바위 규칙을 사용한다. 임의 단어나 부분 문자열을 어종으로 해석하지 않는다.
getSpotSpeciesEvidence는 공개 species→reportedSpecies→메모 우선순위로 근거를 구분한다. 공개 배열·메모·좌표 원본을 바꾸지 않는다.

## URL·직접 접근

| 주소 | 의미 |
| --- | --- |
| `/index.html?species=%EB%AC%B4%EB%8A%AC%EC%98%A4%EC%A7%95%EC%96%B4` | 무늬오징어 필터 |
| `/?species=%ED%95%9C%EC%B9%98` | 한치 필터 |
| `/catalog.html` | 기본 도감 |

지도 Parameter는 `species=<mapSpeciesKey>`다. URL/URLSearchParams와 speciesPageUrl로 인코딩하며 query를 HTML 문자열로 삽입하지 않는다.
readSpeciesQuery는 실제 지원 값 하나만 허용한다. 빈 값·중복 값·미지원 값은 species를 제거하고 전체 포인트/제주 전체 보기와 “지원하지 않는 어종 필터입니다. 전체 포인트를 표시합니다.”를 제공한다.
기본 지도·기본 도감·지도 query의 직접 접속과 새로고침이 동작해야 한다.
기존 `/catalog.html?species=patterned-squid` 상세 URL은 호환 기능으로 유지한다. Popup에서 생성/연결하지 않으며 이번 단방향 연결의 필수 역방향 경로가 아니다. 잘못된 도감 ID는 목록/안내로 복귀한다.

## 관련 수·필터·지도 범위

`filterSpots(fishingSpots, {species: mapSpeciesKey})`를 재사용한다. 전체 기록과 위치 확인 마커를 구분하며 숫자를 UI에 하드코딩하지 않는다.
현재 전체 69기록/44마커, 무늬오징어 23기록/14마커, 한치 20기록/18마커다.
지원 키/관련 기록이 있으면 “지도에서 관련 포인트 보기”를 제공한다. null/미지원/관련 기록 없음이면 “현재 등록된 관련 포인트가 없습니다.”와 query 없는 일반 제주 지도 링크다.
위치 미확인 기록만 있으면 위치 확인 0곳과 같은 안내를 표시하고 가짜 마커를 만들지 않는다.
지도는 옵션 준비 뒤 query를 적용하고 기존 filterSpots·renderMarkers를 사용한다. 다른 탐색 조건은 기본값이며 저장된 즐겨찾기 ID는 보존한다. 이후 조건은 기존 AND 필터다.

- 0마커: 제주 전체 보기와 “현재 등록된 관련 포인트가 없습니다.”
- 1마커: 실제 좌표, zoom 11.5.
- 복수: 실제 좌표 bounds, 최대 zoom 11.5, 지도 폭 640px 미만 padding 32px/그 외 48px.
- 좌표 미확인·비정상 위치는 마커/범위 제외. 제주 전체 보기·내 위치 버튼 유지.

수동 어종 변경은 replaceState로 URL을 동기화하고 전체 선택은 species를 제거한다.
초기화는 검색·어종·방법·유형·즐겨찾기 조건과 species query를 비우고 전체 제주 포인트를 표시한다. 즐겨찾기 저장 목록은 지우지 않는다.

## Popup 보호·오류 경계

createFishingSpotPopupContent는 기존 구조를 유지한다. 이름·지역·유형·공개/제보 어종·방법·개인 메모·출처·즐겨찾기·화장실·날씨·Marine·공식 물때를 보존한다.
어종은 기존 일반 문자열이다. 기존 출처/화장실 등의 외부 링크는 유지하되 도감 버튼·링크·Chip·메모 어종 추가 영역은 없다.
지도에는 도감 JSON 조회/색인/이동 이벤트가 없다. 도감 데이터 실패는 지도에 영향을 주지 않는다.
MapLibre 실패에도 상단 Navigation/도감 접근이 가능하며, 기록 모듈/IndexedDB 실패는 도감 기본 정보/지도 링크를 막지 않는다.

## History·Navigation·모바일

도감 상세 → 일반 지도 링크 → Back은 이전 상세 또는 도감으로 돌아온다. SPA Router를 추가하지 않는다.
기존 상세 pushState·닫기 replaceState·popstate와 상세 URL을 유지한다. 기록 UI/DB를 중복 초기화하지 않는다.
pagehide에서 Blob URL/DB 연결을 정리하고 BFCache 복귀 시 기록을 재조회한다. dirty Form은 beforeunload/같은 문서 Back 확인으로 입력을 보호한다.
Navigation은 실제 링크·aria-current·동일 font/높이/radius/Glass/hover/focus·44px 터치 영역을 사용한다. 기존 Hero/Grid/지도 배치를 유지한다.
320/375/390/430/768/1024/1440/1920px와 812×375 가로에서 넘침·제목/검색/Control 겹침·focus·Popup 스크롤을 검증한다.

## 검사·인수

[tester T01~T14](../../fishing-app-tester/references/test-cases.md)의 T10은 도감→지도 연결, T11은 Popup 정보/도감 기능 부재 검사다.
사용자 A~J와 지도/도감/IndexedDB 회귀를 변경 후 다시 실행한다. 이전 양방향 검사를 현재 실행 결과로 복사하지 않는다.
명령·테스트 어종·오류·결과·실기기/GPS/API 미확인 범위는 [SKILL_USAGE](../../../docs/SKILL_USAGE.md)의 마지막 단방향 범위 변경 기록을 따른다.
