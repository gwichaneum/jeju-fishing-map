# Species schema — Phase 2 구현 계약

현재 도감 데이터 파일은 없다. Phase 2에 기존 일반 JavaScript 구조에 맞는 실제 파일명을 선택하고 문서·검증 명령을 갱신한다.
검증기 입력은 아래 객체의 JSON 배열 또는 `{ "speciesCatalog": [...] }`이다. 앱 데이터와 JSON 사본을 수동으로 이중 관리하지 말고 필요하면 검사 직전에 내보낸다.

| 필드 | 타입·필수 여부 | 규칙 |
| --- | --- | --- |
| speciesId | string, 필수 | 고유한 소문자/숫자/하이픈 ID, 이름·이미지 변경 시 유지 |
| nameKo | string, 필수 | 표시 이름, 중복도 검사하여 동일 대상 중복 등록 방지 |
| nameEn | string/null, 필수 키 | 확인된 영명만, 없으면 null |
| category | string, 필수 | fish 또는 cephalopod |
| imageSrc | string/null, 필수 키 | assets/ 아래 실제 로컬 PNG/WebP/SVG, 없으면 null |
| imageAlt | string, 필수 | 종 이름과 이미지 의미, 잠금 여부는 별도 텍스트로 제공 |
| mapSpeciesKey | string/null, 필수 키 | 실제 createSpotFilterOptions(fishingSpots).species 원소와 정확히 일치하거나 null |
| description | string/null, 필수 키 | 확인된 특징, 모르면 null |
| methods, rigs | string[], 필수 | 확인된 방법·추천 채비, 모르면 빈 배열 |
| seasonNote, habitatNote | string/null, 필수 키 | 추천 시기·서식 참고, 미확인은 null |
| sourceUrl | string/null, 필수 키 | 정보의 대표 HTTP(S) 출처; 미확인은 null |
| license, attribution | string/null, 필수 키 | 정보의 사용 조건·출처 표기, 모르면 null |
| verified | boolean, 필수 | 설명·방법·시기 등 정보의 검증 여부 |
| needsVerification | boolean, 필수 | 정보·이미지·이름/매핑 중 추가 확인이 필요하면 true |
| verificationNote | string, 조건부 | needsVerification이 true이거나 mapSpeciesKey가 null일 때 이유·미확인 범위 |
| imageSourceUrl | string/null, 필수 키 | 이미지 원본/권한 설명 페이지, 정보 URL과 같아도 명시 |
| imageLicense, imageAttribution | string/null, 필수 키 | 이미지 라이선스·저작자/필수 표기 |
| imageVerified | boolean, 필수 | 사용 권한·종의 정확성을 모두 확인한 이미지에만 true |
| informationSources | object[], 선택 | 여러 정보 출처의 url·필드 범위·확인일. 실제 검증 근거 보완 |
| scientificName | string/null, 선택 | 권위 있는 자료로 확인한 경우만. 한치 지역명만으로 부여 금지 |

최소 20종. 기존 10종(볼락·감성돔·참돔·벵에돔·전갱이·고등어·농어·광어·돌돔·쏨뱅이)과 한치·무늬오징어·갈치를 포함한다.
fish/cephalopod는 생물학적 분류이며 지역명에 대한 정확한 종 판별과 구분한다. 미확인 내용을 채워 verified를 true로 바꾸지 않는다.

## 상태와 지도 키

- verified=false 또는 imageVerified=false이면 needsVerification=true와 구체적 verificationNote가 필요하다.
- 이미지가 준비되지 않았으면 imageSrc=null·imageVerified=false. 사용 권한이 없는 로컬 파일도 표시하지 않는다.
- verified=true이면 description/methods/rigs/seasonNote/habitatNote/sourceUrl/license/attribution은 채워져야 한다.
- needsVerification=false이면 정보와 이미지가 모두 확인되어야 한다. 지도 키가 null이면 관련 포인트 확인 대기로 유지한다.
- 기존 `학꽁치`와 후보 표시명 `학공치`는 동일 대상 확인 후만 연결한다. 광어는 지도 메모 기반이며 별도 공개 근거가 필요하다.
- 쏨뱅이·갑오징어·살오징어·문어·주꾸미·쥐치에는 현재 정확히 일치하는 키가 없다. null과 이유를 사용한다.
- speciesId를 모든 기록·도감 상세 식별의 공통 키로 사용하고, mapSpeciesKey는 기존 한국어 필터와 연결하는 어댑터로 사용한다.

## 미확인 입력 예 (실제 도감 데이터가 아닌 계약 예)

```json
{
  "speciesId": "local-hanchi",
  "nameKo": "한치",
  "nameEn": null,
  "category": "cephalopod",
  "imageSrc": null,
  "imageAlt": "한치의 형태",
  "mapSpeciesKey": "한치",
  "description": null,
  "methods": [],
  "rigs": [],
  "seasonNote": null,
  "habitatNote": null,
  "sourceUrl": null,
  "license": null,
  "attribution": null,
  "verified": false,
  "needsVerification": true,
  "verificationNote": "지역명에 해당하는 종과 설명·이미지 출처 확인 필요",
  "imageSourceUrl": null,
  "imageLicense": null,
  "imageAttribution": null,
  "imageVerified": false
}
```

구조가 유효해도 WARN이 남으면 준비 완료를 뜻하지 않는다. C02의 최종 검증은 `--strict`로 보류 항목을 드러내고 결과를 보고한다.
