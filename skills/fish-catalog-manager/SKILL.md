---
name: fish-catalog-manager
description: 제주 낚시 도감의 어종·두족류 데이터, 필수 필드, 지도 연결 키, 이미지 출처·라이선스와 회색 잠금 표시를 검증합니다. 도감 어종 추가, 정보 수정, 이미지 교체, 잠금 이미지 또는 데이터 검증을 요청할 때 사용합니다.
---

# 제주 낚시 도감 데이터 관리

## 작업 절차

1. PRD 11장과 실제 도감 파일을 확인한다. 현재 원본은 `species-catalog.json`, 목록·상세는 `catalog.html`·`catalog.js`·`catalog.css`다. 원본을 다른 파일에 수동 복제하지 않는다.
2. 데이터 추가·변경 전에 [species-schema.md](references/species-schema.md)를 읽는다. speciesId 중복, 이름·분류, methods/rigs/seasonNote 등 필수 필드와 확인 필요 상태를 점검한다.
3. `fishing-spots.js`와 `spot-filters.js`의 `createSpotFilterOptions(fishingSpots).species`를 읽어 mapSpeciesKey를 비교한다. `학공치` 후보와 기존 `학꽁치`, `광어`의 메모 출처를 구분한다.
4. 이미지 추가·교체 또는 잠금 표시 변경 시 [image-source-policy.md](references/image-source-policy.md)를 읽는다. 정보·이미지 출처, license/attribution/verified를 각각 확인한다.
5. 단일 생물의 전신·깨끗한 단색/투명 배경·글자/워터마크 없음 기준으로 원본을 직접 확인한다. 부적합 파일은 사용 목록과 assets에서 정리하고 needsAsset=true로 관리한다. 같은 원본 src를 목록·상세·회색·컬러에 사용하고 크기·회전·위치가 유지되는지 확인한다.
6. 실제 파일을 반영하기 전 아래 검증을 실행한다. 오류가 있으면 반영을 보류하고 오류 목록과 수정 결과를 보고한다. 미확인 자료는 추정해 채우지 않는다.
7. 적용 후 검사 파일·명령·결과·보류 이유를 `docs/SKILL_USAGE.md`에 실제 사용 기록으로 남긴다.

## 검증 명령

프로젝트 루트에서 `--catalog species-catalog.json`을 전달한다. 이후 형식이 변경되면 실제 원본에서 JSON으로 내보낸 경로를 전달한다.

```text
node skills/fish-catalog-manager/scripts/validate-catalog.mjs --catalog <실제-도감.json>
node skills/fish-catalog-manager/scripts/validate-catalog.mjs --catalog <실제-도감.json> --strict
```

기본 검사는 정보 확인 필요 항목을 WARN으로 보고한다. Phase 2 이미지 인수에서는 빈 imageSrc·needsAsset=true·누락 파일·중복 바이트를 ERROR로 처리한다. `--strict`는 정보 확인 경고도 실패로 처리하므로 C02 최종 인수 전에 실행한다. 이미지 인수 통과와 전체 정보 인수를 구분해 보고한다.
`--self-test`는 검증기 자체 검사다. 데이터 인자를 생략하면 SKIP이며 도감 검증 통과가 아니다. 오류 시 종료 코드 1, 성공·명시적 SKIP은 0이다.

## 입력과 출력 예

- 입력: “한치를 추가해줘”, 이름·출처 후보·이미지 권한 자료.
- 출력: 확인된 필드와 안정적 ID, 실제 지도 키 `한치`, 근거 없는 학명은 비움, 미확인은 `needsVerification: true`; 검사 결과와 보류 목록.
- 입력: “학공치 이미지 교체”. 출력: 동일 대상 확인 후 기존 지도 키 `학꽁치` 연결 여부, 로컬 이미지 경로·권한 근거, 동일 src의 회색/컬러 검증.

## 예외 처리

- 지도 키 없음: null과 사유를 남긴다. 실제 필터를 대조해 대응 키가 없음을 확인한 경우에만 mapMatchStatus=unavailable로 기록하고, 아직 검토하지 않았으면 needsVerification=true로 둔다. `오징어`를 임의로 `살오징어`에, `우럭`을 `쏨뱅이`에 연결하지 않는다.
- 권한·형태·품질 미확인 이미지: imageSrc=null, imageVerified=false, needsAsset=true와 구체적 assetNote를 남긴다. 기존 생태 정보의 verified와 구분한다. generic 실루엣이나 가짜 이미지를 만들지 않는다.
- 개인 메모·제보: 공개 출처 정보와 분리하며 지도 필터 매칭을 사실 검증으로 해석하지 않는다.
- 중복 ID·원격 이미지·잘못된 경로: 실패로 처리하고 지도 좌표나 원본 포인트를 수정해 우회하지 않는다.
