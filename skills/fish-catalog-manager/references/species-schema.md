# Species schema — Phase 2 구현 계약

Phase 2의 실제 원본은 루트 `species-catalog.json`이다. `catalog.js`가 같은 출처에서 읽으며 서버는 이 파일과 등록된 이미지만 제공한다.
검증기 입력은 아래 객체의 JSON 배열 또는 `{ "speciesCatalog": [...] }`이다. 앱 데이터와 JSON 사본을 수동으로 이중 관리하지 말고 필요하면 검사 직전에 내보낸다.

| 필드 | 타입·필수 여부 | 규칙 |
| --- | --- | --- |
| speciesId | string, 필수 | 고유한 소문자/숫자/하이픈 ID, 이름·이미지 변경 시 유지 |
| nameKo | string, 필수 | 표시 이름, 중복도 검사하여 동일 대상 중복 등록 방지 |
| nameEn | string/null, 필수 키 | 확인된 영명만, 없으면 null |
| category | string, 필수 | fish 또는 cephalopod |
| imageSrc | string/null, 필수 키 | assets/species/<speciesId>.png/webp/svg/jpg/jpeg 실제 파일. JPEG는 깨끗한 단색 배경일 때만 허용, 없으면 null |
| needsAsset | boolean, 필수 | 사용 가능한 이미지가 없으면 true·imageSrc=null·imageVerified=false |
| assetNote | string, 이미지 미준비 시 필수 | 제거 사유 또는 후보 이미지 검토 결과 |
| imageQualityVerified, imageBackground | boolean/string, 준비 시 필수 | 전신·단독 개체·글자/워터마크 없음 직접 확인. 배경은 transparent 또는 solid |
| imageScale, imageRotation | number, 선택 | 비율을 유지하는 공통 보정값, 회색/컬러에 동일하게 적용. 전체 몸이 잘리지 않아야 함 |
| imageAlt | string, 필수 | 종 이름과 이미지 의미, 잠금 여부는 별도 텍스트로 제공 |
| mapSpeciesKey | string/null, 필수 키 | 실제 createSpotFilterOptions(fishingSpots).species 원소와 정확히 일치하거나 null |
| mapMatchStatus | string, 선택 | matched / unavailable / pending. 키가 없는 이유를 검토한 unavailable만 미확인 매핑과 구분. null일 때 사유 필수 |
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
| informationSources | object[], 필수 | 각 출처의 title·HTTP(S) url·fields 문자열 배열·reviewedOn(YYYY-MM-DD). 선택 scope로 지역·기법·사용 범위를 기록. 이미지 출처와 분리 |
| scientificName | string/null, 선택 | 권위 있는 자료로 확인한 경우만. 한치 지역명만으로 부여 금지 |
| imageLicenseUrl, imageOriginalUrl, imageDownloadUrl | string, 이미지 조건부 | 라이선스 설명·원본·실제 다운로드 URL을 분리해 기록 |
| imageFileTitle, imageSha256, imageChanges | string, 이미지 조건부 | 원본 파일명/사진 ID·로컬 파일 SHA-256·표시 변경과 이용 조건 기록 |
| reviewedOn | string, 선택 | 검토일 YYYY-MM-DD. 원문 게시일과 구분 |

최소 30종. 볼락·감성돔·참돔·벵에돔·전갱이·고등어·농어·광어·돌돔·쏨뱅이·한치·무늬오징어·갈치·갑오징어·살오징어·참문어·주꾸미·방어·부시리·삼치·숭어·전어·학공치·자리돔·조피볼락·자바리·독가시치·벤자리·붕장어·민어를 포함한다. 기존 쥐치 ID도 유지한다.
fish/cephalopod는 생물학적 분류이며 지역명에 대한 정확한 종 판별과 구분한다. 미확인 내용을 채워 verified를 true로 바꾸지 않는다.

## 상태와 지도 키

- verified=false 또는 imageVerified=false이면 needsVerification=true와 구체적 verificationNote가 필요하다.
- 이미지가 준비되지 않았으면 imageSrc=null·imageVerified=false·needsAsset=true·needsVerification=true와 assetNote를 둔다. 미사용 부적합 파일은 안전하게 삭제하고 감사 문서에 이전 파일명·출처·사유를 남긴다. 단순히 파일이 없음을 숨겨 통과시키지 않는다.
- verified=true이면 description/methods/rigs/seasonNote/habitatNote/sourceUrl/license/attribution은 채워져야 한다.
- verified=true인 특징·방법·채비·시기·서식에는 각각 informationSources의 fields 근거가 필요하며 sourceUrl도 여기에 등록한다. 이미지 도판만으로 낚시법을 입증하지 않는다. 구조 검증 통과는 원문과 사실의 일치를 자동 입증하지 않는다.
- 정보·이미지·지도 검토가 모두 끝났는데 needsVerification=true를 남기지 않는다. 정보가 미확인이라면 verified=false와 needsVerification=true·사유를 사용하며 상세 기본 정보는 “정보 확인 중”으로 표시한다.
- 확인하지 못한 sourceUrl/license/attribution은 null, informationSources는 빈 배열로 남길 수 있다. 일반 검증의 보류 경고와 strict 실패로 구분하며 검증을 통과시키기 위해 출처를 만들어 넣지 않는다.
- needsVerification=false이면 표시하는 정보와 이미지가 모두 확인되어야 한다. 지도 키 null은 기본적으로 확인 대기지만, 실제 필터를 검토해 대응 키가 없음을 확인했으면 mapMatchStatus=unavailable와 사유를 남겨 미확인과 구분한다. 키가 없는데 matched로 표시하거나 근거 없이 다른 종을 연결하지 않는다.
- verified는 출처와 표시 문장을 대조했다는 뜻이다. 특정 지역·연도 사례를 제주 전역의 고정 시즌으로 일반화하지 않고 seasonNote와 verificationNote에 적용 범위를 적는다. 지역명에 대응 학명을 부여하지 않는 선택은 사실 오류와 구분한다.
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
  "needsAsset": true,
  "assetNote": "사용 권한과 품질이 확인된 전신 단독 개체 이미지 필요",
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

구조가 유효해도 WARN이 남으면 전체 자료 준비 완료를 뜻하지 않는다. Phase 2 최종 이미지 인수에서는 imageSrc=null·needsAsset=true가 ERROR다. 위 미확인 입력 예는 조사 중 상태를 설명하며 최종 이미지 인수를 통과하는 예가 아니다. C02의 전체 검증은 `--strict`로 정보 보류 항목까지 드러내고 결과를 보고한다.
