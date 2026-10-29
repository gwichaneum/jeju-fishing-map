# IndexedDB 계약 — Phase 3 구현 및 장소 선택 확장

실제 공유 모듈은 [catch-records.js](../../../catch-records.js), 입력·목록 UI는 [catch-record-ui.js](../../../catch-record-ui.js), 도감 연결은 catalog.js다. 공개 어종 JSON·이미지는 변경하지 않았다.

## 저장 구조

| 항목 | 실제 구현 |
| --- | --- |
| Database | jejuFishingCollection |
| 초기 버전 | DB_VERSION=1. 기존 DB 코드가 없음을 확인한 후 도입 |
| 현재 버전 | DB_VERSION=2. 2026-10-29 장소 선택 확장. onupgradeneeded에서 기존 기록·사진·index를 보존하고 customLocations 추가 |
| Object store | catchRecords, keyPath: recordId, autoIncrement: false |
| Index | speciesId, caughtAt, createdAt (각 unique: false) |
| 사용자 장소 store | customLocations, keyPath: customLocationId, name index (unique: true) |

어종의 공개 정보는 별도 정적 speciesCatalog로 관리하고 개인 사진·메모를 섞지 않는다.
사진은 해당 기록의 photoBlob에 함께 넣어 transaction 하나로 저장·수정·삭제한다. 별도 사진 store가 필요해지면 원자성과 참조 정리를 먼저 설계한다.

| 필드 | 규칙 |
| --- | --- |
| recordId | 비어 있지 않은 고유 문자열, 생성 시 UUID 권장, 수정 시 유지 |
| speciesId | 실제 speciesCatalog의 안정적 ID, 필수 |
| caughtAt | 실제 존재하는 YYYY-MM-DD 날짜, 필수. 현재 지역 날짜 기본값·미래 날짜 차단. UTC 변환으로 날짜를 바꾸지 않음 |
| count | Number.isSafeInteger이며 >0, 필수. Form의 숫자 문자열은 변환하되 저장된 문자열 count는 불량 기록으로 제외 |
| photoBlob | 실제 디코딩 가능한 원본 Blob, 필수. image/jpeg, image/png, image/webp; 0 초과 최대 10MiB |
| photoName / photoType | 원본 파일명 / Blob.type과 같은 MIME, 필수. 사진 미교체 수정 시 유지 |
| locationName | string, 최대 120자, 선택 입력은 빈 문자열로 정규화 |
| mapSpotId | 기존 fishing-spots.js의 숫자 id 또는 null. 과거 기록은 필드 누락도 허용. 선택 시 공식 name을 locationName에 저장하며 좌표를 추측하지 않음 |
| customLocationId | 사용자 장소 UUID 문자열 또는 null. 과거 기록은 필드 누락 허용. mapSpotId와 동시에 설정 불가. 선택 시 customLocations.name을 locationName에 저장 |
| memo | string, 최대 2,000자, 선택 입력은 빈 문자열; textContent로 표시 |
| createdAt | ISO UTC timestamp, 생성 시 고정 |
| updatedAt | ISO UTC timestamp, 수정 시 갱신, createdAt 이상 |

customLocations는 `{ customLocationId, name, address, latitude, longitude, memo, createdAt, updatedAt }`를 저장한다.
이름은 1~120자, 주소는 300자, 메모는 2,000자 이내다. 좌표는 선택이며 미입력은 null, 입력 시 유한 숫자 위도 -90~90·경도 -180~180이다. ID는 기록과 같은 안전한 UUID 생성기를 사용한다.
지도와 정확히 같은 이름은 등록을 거부한다. 사용자 장소의 동일 이름 확인과 추가는 같은 transaction에서 수행하며 unique name index로 동시 탭 중복도 방지한다. 비슷한 이름은 자동 병합하지 않는다.
기록 저장·수정은 두 store를 포함한 transaction에서 사용자 장소 존재 여부와 공식 이름을 확인하고 기록을 쓴다. 기록 삭제는 사용자 장소를 삭제하지 않는다.
등록·수정 UI는 [catch-location-ui.js](../../../catch-location-ui.js)를 공유한다. 새 기록은 검색 결과 선택 또는 새 장소 등록이 필요하며 장소 미입력은 허용한다. 과거 이름은 사용자가 바꾸지 않으면 그대로 유지한다.
통계는 mapSpotId → customLocationId → 기존 이름 순으로 집계한다. ID가 없는 과거 이름은 유일한 지도 공식 이름과 완전히 같은 경우에만 통계에서 해당 ID와 묶으며, DB에 ID를 자동으로 쓰지 않는다. 지도 표시 이름은 현재 공식 name, 사용자 장소는 현재 등록 name을 사용한다.

10MiB와 허용 MIME을 변경하면 UI·검증기·문서를 함께 수정한다. 저장 전 MIME·용량·PNG/JPEG/WebP 파일 시그니처와 브라우저의 실제 이미지 디코딩을 확인한다. 저장소에서 다시 읽은 사진도 검증하여 손상된 파일을 집계에서 제외한다. SVG·HEIC/HEIF 직접 저장은 지원하지 않고 변환 안내를 제공한다.
자동 압축·EXIF 분석·방향 재인코딩은 하지 않는다. 원본 바이트를 보관하고 브라우저의 이미지 표시 방향을 사용한다. 10MiB를 넘는 사진은 사용자가 줄여서 다시 선택하도록 안내한다.
입력·삭제 실패 시 기존 레코드를 손상시키지 않는다. 사진 미리보기 URL은 DB에 저장하지 않고 Blob으로 다시 생성한다.
즐겨찾기의 기존 LocalStorage 키 `jejuFishingFavorites`는 변경하지 않는다.

## 저장소 lifecycle과 오류

- onupgradeneeded에서 store/index를 생성한다. 이미 있는 데이터는 삭제하지 않는다.
- crypto.randomUUID()가 없으면 crypto.getRandomValues()로 UUID v4를 만든다. add는 기존 ID를 덮어쓰지 않는다. 수정은 같은 recordId·speciesId·createdAt을 유지하고 updatedAt을 증가시킨다.
- blocked에는 다른 탭 닫기 안내, versionchange에는 이전 연결을 닫는 처리를 제공한다.
- transaction complete 후 읽기/집계를 갱신한다. error/abort는 성공·해금으로 표시하지 않는다.
- 저장소 불가·용량 초과에는 입력을 보존하고 안내한다. 다른 저장소로 사진을 몰래 옮기지 않는다.
- 없는 recordId 삭제는 변경 없이 처리한다. 새로고침 후 같은 출처에서 Blob과 필드가 복원되는지 실제 브라우저로 확인한다.
- 브라우저·기기·접속 출처별 저장이며 사이트 데이터 삭제·비공개 모드 등으로 소실 가능하다. 이번 범위에는 서버 동기화가 없다.
- 불량 레코드를 자동 삭제하지 않는다. 제외 개수를 알리고 저장소를 읽지 못한 경우 마지막 확인 상태 또는 확인 중을 표시한다. 별도 해금 flag나 LocalStorage 사진 저장은 없다.
- 정적 도감은 기록 모듈/IndexedDB보다 먼저 빈 기록 기준의 회색 Grid·0%로 렌더링한다. 기록을 아직 읽지 못했다는 안내는 기록 영역에 표시한다. 기록 실패 시 이 기본 화면 또는 이미 확인한 snapshot을 유지하며 전체 도감 데이터 오류로 취급하지 않는다. 재시도는 정적 JSON 재검증·기록 모듈 재시도·같은 저장소 재조회만 수행하고 데이터는 초기화하지 않는다.

## 집계와 검증기 연결

같은 speciesId의 유효 기록만 합산한다. totalCount=sum(count), recordCount=기록 수, collected=(totalCount>0).
수집 종 수는 collected 종 수, progress는 collectedSpecies/totalSpecies×100이며 전체 0종이면 0이다.
집계·잠금·완성률은 DB의 별도 flag로 중복 저장하지 않는다.
firstCaughtAt=min(caughtAt), lastCaughtAt=max(caughtAt). 목록은 caughtAt 내림차순, 동률이면 createdAt 내림차순·recordId 오름차순이다. 내부 progress는 반올림하지 않고 UI만 반올림한다.
집계의 records/speciesIds 입력이 배열이 아니면 빈 배열로 처리한다. null 행·없는 사진·잘못된 count·없는 speciesId는 검증에서 제외하며 잘못된 입력 때문에 기본 도감을 숨기지 않는다.

catch-records.js는 브라우저의 CatchRecords와 Node CommonJS에서 같은 함수를 사용한다. 별도 adapter나 이중 집계 구현은 없다. 프레임워크·런타임 의존성은 추가하지 않았다.

```text
validateCatchRecord(record, speciesIds: string[], mapSpotIds: number[])
  -> { valid: boolean, errors: string[] }
summarizeCollection(records, speciesIds: string[], mapSpotIds?: number[])
  -> {
       bySpecies: { [speciesId]: { totalCount, recordCount, collected, firstCaughtAt, lastCaughtAt } },
       collectedSpecies: number, totalSpecies: number, progress: number
     }
```

실제 검증 명령: `node skills/catch-record-manager/scripts/validate-record-logic.mjs --module catch-records.js`.
앱에서는 실제 어종 ID·지도 숫자 ID를 모두 전달한다. 2인자 순수 집계에서는 지도 키의 타입만 검사하며 실제 지도 소속 검증은 저장소 읽기·쓰기와 앱 호출에서 수행한다.
검증기는 2+3=5/2회, 2→4 수정 후 7/2회·3→4 수정 후 6/2회, 하나 삭제 후 3/1회 또는 2/1회, 마지막 삭제 후 0/0회와 다른 종 격리,
0/음수/소수·날짜·사진·ID 입력 거부를 실제 export로 확인한다. 불량 저장 기록은 집계 전 검증하여 격리한다.
이 검사로 IndexedDB I/O·트랜잭션·Blob 영속성은 증명되지 않으므로 브라우저 테스트를 별도로 수행한다.
