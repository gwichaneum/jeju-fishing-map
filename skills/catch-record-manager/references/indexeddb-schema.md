# IndexedDB 계약 — Phase 3 설계, 현재 미구현

## 저장 구조

| 항목 | 제안 |
| --- | --- |
| Database | jejuFishingCollection |
| 초기 버전 | 1 (실제 기존 DB가 발견되면 버전·migration을 먼저 확인) |
| Object store | catchRecords, keyPath: recordId, autoIncrement: false |
| Index | speciesId, caughtAt, mapSpotId (각 unique: false) |

어종의 공개 정보는 별도 정적 speciesCatalog로 관리하고 개인 사진·메모를 섞지 않는다.
사진은 해당 기록의 photoBlob에 함께 넣어 transaction 하나로 저장·수정·삭제한다. 별도 사진 store가 필요해지면 원자성과 참조 정리를 먼저 설계한다.

| 필드 | 규칙 |
| --- | --- |
| recordId | 비어 있지 않은 고유 문자열, 생성 시 UUID 권장, 수정 시 유지 |
| speciesId | 실제 speciesCatalog의 안정적 ID, 필수 |
| caughtAt | 실제 존재하는 YYYY-MM-DD 날짜, 필수. UTC 변환으로 날짜를 바꾸지 않음 |
| count | Number.isSafeInteger이며 >0, 필수 |
| photoBlob | Blob, 필수. 제안 허용 MIME: image/jpeg, image/png, image/webp; 0 초과 최대 10MiB |
| locationName | string, 선택 입력은 빈 문자열로 정규화 |
| mapSpotId | 기존 fishing-spots.js의 숫자 id 또는 null. 저장 좌표를 추측하지 않음 |
| memo | string, 선택 입력은 빈 문자열; textContent로 표시 |
| createdAt | ISO UTC timestamp, 생성 시 고정 |
| updatedAt | ISO UTC timestamp, 수정 시 갱신, createdAt 이상 |

10MiB와 허용 MIME은 초기 설계값이다. 변경하면 UI·검증기·문서를 함께 수정한다.
MIME·확장자 검사만으로 실제 이미지를 확정하지 않으며 브라우저 디코딩 실패도 차단한다. SVG는 조과 업로드에서 허용하지 않는다.
입력·삭제 실패 시 기존 레코드를 손상시키지 않는다. 사진 미리보기 URL은 DB에 저장하지 않고 Blob으로 다시 생성한다.
즐겨찾기의 기존 LocalStorage 키 `jejuFishingFavorites`는 변경하지 않는다.

## 저장소 lifecycle과 오류

- onupgradeneeded에서 store/index를 생성한다. 이미 있는 데이터는 삭제하지 않는다.
- blocked에는 다른 탭 닫기 안내, versionchange에는 이전 연결을 닫는 처리를 제공한다.
- transaction complete 후 읽기/집계를 갱신한다. error/abort는 성공·해금으로 표시하지 않는다.
- 저장소 불가·용량 초과에는 입력을 보존하고 안내한다. 다른 저장소로 사진을 몰래 옮기지 않는다.
- 없는 recordId 삭제는 변경 없이 처리한다. 새로고침 후 같은 출처에서 Blob과 필드가 복원되는지 실제 브라우저로 확인한다.
- 브라우저·기기·접속 출처별 저장이며 사이트 데이터 삭제·비공개 모드 등으로 소실 가능하다. 이번 범위에는 서버 동기화가 없다.

## 집계와 검증기 연결

같은 speciesId의 유효 기록만 합산한다. totalCount=sum(count), recordCount=기록 수, collected=(totalCount>0).
수집 종 수는 collected 종 수, progress는 collectedSpecies/totalSpecies×100이며 전체 0종이면 0이다.
집계·잠금·완성률은 DB의 별도 flag로 중복 저장하지 않는다.

Phase 3의 실제 순수 로직 모듈은 아래 두 함수를 export하거나 실제 함수를 재노출하는 얇은 adapter를 제공한다.
adapter에 집계 로직을 다시 구현해 검사를 통과시키지 않는다. 프레임워크나 런타임 의존성을 추가할 필요는 없다.

```text
validateCatchRecord(record, speciesIds: string[], mapSpotIds: number[])
  -> { valid: boolean, errors: string[] }
summarizeCollection(records, speciesIds: string[])
  -> {
       bySpecies: { [speciesId]: { totalCount, recordCount, collected } },
       collectedSpecies: number, totalSpecies: number, progress: number
     }
```

Node에서 로드할 수 있는 실제 .cjs/.mjs 또는 프로젝트 모듈 형식으로 연결한다.
검증기는 2+3=5/2회, 2→4 수정 후 7/2회, 하나 삭제 후 3/1회, 마지막 삭제 후 0/0회와 다른 종 격리,
0/음수/소수·날짜·사진·ID 입력 거부를 실제 export로 확인한다. 불량 저장 기록은 집계 전 검증하여 격리한다.
이 검사로 IndexedDB I/O·트랜잭션·Blob 영속성은 증명되지 않으므로 브라우저 테스트를 별도로 수행한다.
