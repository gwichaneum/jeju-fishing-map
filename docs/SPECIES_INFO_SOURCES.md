# 어종 상세 정보 출처와 감사

검토일: 2026-10-28 (KST). 실제 데이터는 [species-catalog.json](../species-catalog.json), 표시는 [catalog.js](../catalog.js)입니다. 이미지 출처·이용 조건·가공 이력은 [SPECIES_ASSETS.md](./SPECIES_ASSETS.md)에 별도로 유지합니다.

## 감사 전후

| 검사 | 보완 전 | 보완 후 |
| --- | --- | --- |
| 전체 어종 | 31 (어류 25·두족류 6) | 31, ID·분류 유지 |
| methods 누락·빈 배열 | 7 | 0 |
| rigs 누락·빈 배열 | 7 | 0 |
| seasonNote 누락 | 7 | 0 |
| description / habitatNote / sourceUrl 누락 | 각각 0 | 각각 0 |
| 필수 키 누락 / 중복 speciesId | 각각 0 | 각각 0 |
| verified=false / needsVerification=true | 각각 7 | 각각 0 |
| mapSpeciesKey 미존재 필드 / 잘못된 타입·값 | 각각 0 | 각각 0 |
| mapSpeciesKey=null | 검토된 연결 불가 9 | 동일한 9, unavailable 사유 유지 |
| 이미지 경로·SHA-256 변경 | — | 0/31 (실제 파일 해시 대조) |

빈 methods·rigs·seasonNote가 있던 종은 **삼치·전어·조피볼락·자바리·독가시치·붕장어·민어**입니다. 특징·서식·기법의 문구도 한치·무늬오징어·갈치·방어·부시리·벤자리·갑오징어·참문어에서 보완했습니다. 총 15종의 본문을 보완하고 31종의 정보 출처를 정리했습니다.

방어·부시리·벤자리·갑오징어·참문어의 이미지·종 식별 중심 설명은 생물 특징으로 교체했습니다. 자바리의 서식 칸에 있던 지도 명칭 주의문은 검토 주의문으로 옮기고 실제 환경을 설명했습니다. 독가시치는 형태와 가시 주의, 한치·무늬오징어는 체형 차이를 설명했습니다. 의미 없는 임시 문구로 완료 처리하지 않았습니다.

모든 종에 같은 방법이 복사된 상태는 없었습니다. 방어·부시리의 공통 플러깅 채비는 두 대상을 명시한 동일 기사 근거이므로 유지했습니다. 다른 어종의 채비를 잘못 복사한 사례는 발견하지 않았습니다. 무늬오징어의 에깅 안내에 겨울 야엔 사례만 붙어 있던 시기 근거는 에깅 자료로 교체했고, 갈치는 연안 릴찌낚시의 채비와 시기로 범위를 맞췄습니다.

## 검증의 의미와 지역 범위

**verified=true**는 아래 출처와 **표시한 문장·기법·지역 범위**를 대조했다는 뜻입니다. 제주 전역의 현재 조황, 출입 허용 또는 모든 낚시법을 검증했다는 뜻은 아닙니다. 일본의 자바리·벤자리 자료는 학명이 기존 대상과 일치함을 확인하고 일본 사례임을 시기·출처에 표시했습니다. 전어는 경기 화성의 초가을 조과 사례만 사용하며 해당 기사의 제목에 있는 10~11월 망둥어 피크를 전어에 적용하지 않습니다. 식용 제철과 산란기를 곧바로 낚시 추천 시기로 쓰지 않습니다.

필수 13종(볼락·감성돔·참돔·벵에돔·전갱이·고등어·농어·광어·돌돔·쏨뱅이·한치·무늬오징어·갈치)을 포함한 31종 모두 특징·방법·채비·시기·서식의 근거를 기록했습니다. 현재 정보 확인 중으로 남은 항목은 없습니다. 이후 근거가 없는 정보는 **verified=false, needsVerification=true**와 이유를 기록하고 상세에 **정보 확인 중**을 표시합니다. 검증기는 빈 항목을 임의로 채우지 않습니다.

## 31종 필드별 근거

표의 S 번호를 누르면 실제 자료로 이동합니다. 공공기관의 생물 정보, 저자가 명시된 낚시 전문 매체의 기법 안내, 직접 발행한 채비 자료를 사용했습니다. 기존 백과 자료는 확인된 특징의 짧은 요약으로 유지하며, 공공 자료에서 해당 종의 특징을 확인한 경우 그 자료를 우선했습니다. 정보 출처에 이미지 전용 출처는 포함하지 않습니다.

| 어종 | 특징 | 낚시 방법 | 채비 | 시기 | 서식 | 지도 키 | 검증 상태 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 볼락 | [S01][S01] | [S02][S02] | [S02][S02] | [S02][S02] | [S01][S01] · [S02][S02] | 볼락 | 확인 · 출처 범위 한정 |
| 감성돔 | [S03][S03] | [S04][S04] | [S04][S04] | [S04][S04] | [S03][S03] · [S04][S04] | 감성돔 | 확인 · 출처 범위 한정 |
| 참돔 | [S05][S05] | [S06][S06] | [S06][S06] | [S06][S06] | [S05][S05] · [S06][S06] | 참돔 | 확인 · 출처 범위 한정 |
| 벵에돔 | [S07][S07] | [S08][S08] | [S08][S08] | [S08][S08] | [S07][S07] · [S08][S08] | 벵에돔 | 확인 · 출처 범위 한정 |
| 전갱이 | [S05][S05] | [S09][S09] · [S10][S10] | [S09][S09] · [S10][S10] | [S09][S09] · [S10][S10] | [S05][S05] · [S09][S09] · [S10][S10] | 전갱이 | 확인 · 출처 범위 한정 |
| 고등어 | [S05][S05] | [S11][S11] | [S11][S11] | [S11][S11] | [S05][S05] · [S11][S11] | 고등어 | 확인 · 출처 범위 한정 |
| 농어 | [S05][S05] | [S12][S12] | [S12][S12] | [S12][S12] | [S05][S05] · [S12][S12] | 농어 | 확인 · 출처 범위 한정 |
| 광어 | [S05][S05] | [S13][S13] | [S13][S13] | [S13][S13] | [S05][S05] · [S13][S13] | 광어 | 확인 · 출처 범위 한정 |
| 돌돔 | [S14][S14] | [S15][S15] | [S15][S15] | [S15][S15] | [S14][S14] · [S15][S15] | 돌돔 | 확인 · 출처 범위 한정 |
| 쏨뱅이 | [S16][S16] | [S17][S17] | [S17][S17] | [S17][S17] | [S16][S16] · [S17][S17] | null · 연결 없음 | 확인 · 출처 범위 한정 |
| 한치 | [S19][S19] | [S18][S18] | [S18][S18] | [S18][S18] | [S18][S18] | 한치 | 확인 · 출처 범위 한정 |
| 무늬오징어 | [S20][S20] | [S21][S21] | [S21][S21] | [S21][S21] | [S21][S21] | 무늬오징어 | 확인 · 출처 범위 한정 |
| 갈치 | [S22][S22] | [S23][S23] | [S23][S23] | [S23][S23] | [S22][S22] · [S23][S23] | 갈치 | 확인 · 출처 범위 한정 |
| 방어 | [S05][S05] | [S24][S24] | [S24][S24] | [S24][S24] | [S24][S24] | 방어 | 확인 · 출처 범위 한정 |
| 부시리 | [S25][S25] | [S24][S24] | [S24][S24] | [S24][S24] | [S25][S25] · [S24][S24] | 부시리 | 확인 · 출처 범위 한정 |
| 자리돔 | [S26][S26] | [S27][S27] | [S27][S27] | [S27][S27] | [S26][S26] · [S27][S27] | 자리돔 | 확인 · 출처 범위 한정 |
| 숭어 | [S28][S28] | [S29][S29] | [S29][S29] | [S29][S29] | [S28][S28] · [S29][S29] | 숭어 | 확인 · 출처 범위 한정 |
| 벤자리 | [S30][S30] | [S30][S30] · [S31][S31] | [S30][S30] · [S31][S31] | [S30][S30] · [S31][S31] | [S30][S30] | 벤자리 | 확인 · 일본 동종 안내 |
| 학공치 | [S33][S33] | [S34][S34] | [S34][S34] | [S34][S34] | [S33][S33] · [S34][S34] | 학꽁치 | 확인 · 출처 범위 한정 |
| 갑오징어 | [S05][S05] | [S35][S35] | [S35][S35] | [S35][S35] | [S35][S35] | null · 연결 없음 | 확인 · 출처 범위 한정 |
| 살오징어 | [S05][S05] | [S36][S36] | [S36][S36] | [S36][S36] | [S05][S05] · [S36][S36] | null · 연결 없음 | 확인 · 출처 범위 한정 |
| 참문어 | [S37][S37] | [S37][S37] | [S37][S37] | [S37][S37] | [S37][S37] | null · 연결 없음 | 확인 · 출처 범위 한정 |
| 주꾸미 | [S38][S38] | [S39][S39] | [S39][S39] | [S39][S39] | [S38][S38] · [S39][S39] | null · 연결 없음 | 확인 · 출처 범위 한정 |
| 쥐치 | [S40][S40] | [S41][S41] | [S41][S41] | [S41][S41] | [S40][S40] · [S41][S41] | null · 연결 없음 | 확인 · 출처 범위 한정 |
| 삼치 | [S05][S05] | [S42][S42] | [S42][S42] | [S42][S42] | [S05][S05] · [S42][S42] | 삼치 | 확인 · 출처 범위 한정 |
| 전어 | [S05][S05] | [S43][S43] | [S43][S43] | [S44][S44] | [S05][S05] | null · 연결 없음 | 확인 · 초가을 타지역 사례 |
| 조피볼락 | [S45][S45] | [S46][S46] | [S46][S46] | [S46][S46] | [S45][S45] · [S46][S46] | 우럭 | 확인 · 출처 범위 한정 |
| 자바리 | [S47][S47] · [S48][S48] | [S48][S48] · [S49][S49] | [S48][S48] · [S49][S49] | [S48][S48] · [S49][S49] | [S47][S47] · [S48][S48] | null · 연결 없음 | 확인 · 일본 동종 안내 |
| 독가시치 | [S50][S50] · [S51][S51] | [S51][S51] | [S51][S51] | [S51][S51] | [S50][S50] · [S51][S51] | 독가시치 | 확인 · 출처 범위 한정 |
| 붕장어 | [S05][S05] | [S52][S52] | [S52][S52] | [S52][S52] | [S05][S05] · [S52][S52] | 붕장어 | 확인 · 출처 범위 한정 |
| 민어 | [S05][S05] | [S53][S53] | [S53][S53] | [S53][S53] | [S05][S05] · [S53][S53] | null · 연결 없음 | 확인 · 출처 범위 한정 |

## 핵심 세 대상

- **한치:** 선상 이카메탈(스테+이카메탈), 오모리그(봉돌+긴 목줄 끝의 스테/에기). 제주·남해 선상 출처의 5월 시작·6~7월 사례로 한정합니다. 제주 한치의 지역명과 표준명 설명을 구분하며 새 학명을 부여하지 않았습니다.
- **무늬오징어:** 에깅, 합사·쇼크리더·스냅·에기. 여름~가을 에깅 안내를 근거로 하며, 에기의 침강 속도는 수심·조류에 맞춥니다. 겨울 생미끼 야엔 사례를 에깅의 유일한 시기 근거로 쓰지 않습니다.
- **갈치:** 방파제·갯바위의 야간 연안 릴찌낚시, 전지찌·갈치바늘·와이어 목줄·생선살 미끼. 먼바다 선상 외줄·텐야의 채비·시기와 구분합니다. 한치·오징어 채비를 사용하지 않습니다.

## 지도 키 검토

fishing-spots.js와 spot-filters.js의 실제 createSpotFilterOptions(fishingSpots).species 30개 옵션과 비교했습니다. **22종 연결·9종 연결 없음·잘못된 키 0**입니다. **학공치 → 학꽁치**, **조피볼락 → 우럭**은 대상 확인 후 기존 표기를 사용하며, 광어 포인트 1건은 공개 확정 자료가 아닌 기존 개인 메모로 표시합니다.

연결 없음: **쏨뱅이·갑오징어·살오징어·참문어·주꾸미·쥐치·전어·자바리·민어**. **mapSpeciesKey=null, mapMatchStatus=unavailable**이며 상세에 **현재 등록된 관련 포인트 없음**을 표시합니다. 자바리를 다금바리에, 살오징어를 포괄적인 오징어에, 쏨뱅이를 우럭에 임의 연결하지 않았습니다.

상세의 **낚시 지도 열기**는 실제 지도 화면으로 이동합니다. 대응 키가 있으면 기존 지도에서 선택할 어종 필터를 안내합니다. 자동 필터 쿼리와 Popup에서 특정 도감으로 들어오는 양방향 연결은 C06(Phase 4) 범위입니다.

## 실제 출처

- **S01** [위키백과: 볼락](https://ko.wikipedia.org/w/index.php?oldid=40934351)
- **S02** [볼락루어 마스터 플랜: 시즌별 낚시 특징](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=11585)
- **S03** [위키백과: 감성돔](https://ko.wikipedia.org/w/index.php?oldid=42447401)
- **S04** [가을 감성돔 성공전략](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=4071)
- **S05** [국립수산과학원: 참돔 — 기본 정보](https://www.nifs.go.kr/contents/actionContentsCons0088.do)
- **S06** [입문자교실: 참돔 찌낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=90820)
- **S07** [위키백과: 벵에돔](https://ko.wikipedia.org/w/index.php?oldid=41101094)
- **S08** [입문자교실: 벵에돔낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=90670)
- **S09** [제주 무늬오징어 야엔: 미끼용 전갱이 포획 사례](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=18159)
- **S10** [입문자 교실: 전갱이 낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=90192)
- **S11** [겨울바다의 파시: 고등어낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=2626)
- **S12** [세상 쉬운 바다루어 6: 농어 루어낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=14378)
- **S13** [입문자교실: 광어낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=16337)
- **S14** [위키백과: 돌돔](https://ko.wikipedia.org/w/index.php?oldid=41696102)
- **S15** [입문자교실: 돌돔낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=18681)
- **S16** [위키백과: 쏨뱅이](https://ko.wikipedia.org/w/index.php?oldid=39161896)
- **S17** [명정구 박사의 조어박물지: 쏨뱅이](https://fishingseasons.co.kr/contents_view_detail.asp?b_no=1669)
- **S18** [입문자 교실: 한치낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=89780)
- **S19** [국립수산물품질관리원 FSIS: 오징어보다 한 수 위, 한치](https://www.fsis.go.kr/front/contents/cmsView.do?cate_id=0301&cnts_id=18408&select_list_no=110)
- **S20** [Honda釣り倶楽部: アオリイカ — 형태 특징](https://www.honda.co.jp/fishing/picture-book/aoriika/)
- **S21** [낚시춘추 최훈: 여름을 더 뜨겁게 만드는 무늬오징어 에깅 (2020.08)](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=13558)
- **S22** [위키백과: 갈치](https://ko.wikipedia.org/w/index.php?oldid=42447399)
- **S23** [최훈의 바다낚시 입문: 갈치 릴찌낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=12863)
- **S24** [제주 문섬: 쇼어 플러깅](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=13252)
- **S25** [위키백과: 부시리](https://ko.wikipedia.org/w/index.php?oldid=41393092)
- **S26** [위키백과: 자리돔](https://ko.wikipedia.org/w/index.php?oldid=41174600)
- **S27** [김지민의 신자산어보: 자리돔](https://fishingseasons.co.kr/contents_view_detail.asp?b_no=11727)
- **S28** [위키백과: 숭어](https://ko.wikipedia.org/w/index.php?oldid=40906911)
- **S29** [입문자교실: 숭어낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=18942)
- **S30** [Honda釣り倶楽部: イサキ — 벤자리 특징·생태](https://www.honda.co.jp/fishing/picture-book/isaki/)
- **S31** [Honda釣り倶楽部: イサキ — 찌낚시 채비](https://www.honda.co.jp/fishing/picture-book/isaki/trap01/)
- **S32** [국립해양생물자원관: 학공치](https://www.mbris.kr/pub/about/gallery.do?pageIndex=504)
- **S33** [위키백과: 학공치](https://ko.wikipedia.org/w/index.php?oldid=40910380)
- **S34** [시즌 개막: 학꽁치의 귀환](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=5346)
- **S35** [세상 쉬운 바다루어 8: 갑오징어 에깅](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=14625)
- **S36** [거제 홍도 먼바다: 살오징어 현장기](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=15252)
- **S37** [입문자교실: 문어낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=90743)
- **S38** [위키백과: 주꾸미](https://ko.wikipedia.org/w/index.php?oldid=42443805)
- **S39** [입문자교실: 주꾸미낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=18879)
- **S40** [위키백과: 쥐치](https://ko.wikipedia.org/w/index.php?oldid=41174516)
- **S41** [세상 쉬운 바다루어 13: 쥐치 루어낚시](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=15114)
- **S42** [낚시춘추 편집부: 입문자 교실 — 삼치낚시 (2024.12)](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=19004)
- **S43** [바다타임: 전어 낚시 채비](https://www.badatime.com/gearing/13)
- **S44** [낚시춘추 이영규: 화성 궁평항 — 초가을 전어 조과 언급](https://fishingseasons.co.kr/contents_view_detail.asp?b_no=3271)
- **S45** [국립수산과학원: 조피볼락 기본 정보](https://www.nifs.go.kr/board/actionBoard0008View.do?BBS_CL_CD=G&BBS_ID=20250828100256207LBN&MENU_ID=M0000054)
- **S46** [낚시춘추: 동해 우럭·개볼락 루어낚시 — 우럭 시즌·장비 항목](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=2336)
- **S47** [국립수산과학원: 자바리 기본 정보](https://www.nifs.go.kr/portal/pcon0000298/systA/actionConts.do)
- **S48** [Honda釣り倶楽部: クエ — 특징·서식·낚시](https://www.honda.co.jp/fishing/picture-book/kue/)
- **S49** [Honda釣り倶楽部: クエ — 생미끼 바닥낚시·외줄 채비](https://www.honda.co.jp/fishing/picture-book/kue/trap01/)
- **S50** [국립수산과학원: 독가시치 기본 정보](https://www.nifs.go.kr/portal/bt/frctA/actionSpeciesSearchView.do?taxonId=11822)
- **S51** [낚시춘추 명정구 박사의 조어박물지: 독가시치](https://fishingseasons.co.kr/contents_view_detail.asp?b_no=1477)
- **S52** [낚시춘추 최훈: 여름밤 붕장어를 낚아보자 (2020.07)](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=13452)
- **S53** [낚시춘추 이영규: 전북 격포 민어낚시 (2023.08)](https://m.fishingseasons.co.kr/news_Detail.asp?b_no=16523)

[S01]: https://ko.wikipedia.org/w/index.php?oldid=40934351
[S02]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=11585
[S03]: https://ko.wikipedia.org/w/index.php?oldid=42447401
[S04]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=4071
[S05]: https://www.nifs.go.kr/contents/actionContentsCons0088.do
[S06]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=90820
[S07]: https://ko.wikipedia.org/w/index.php?oldid=41101094
[S08]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=90670
[S09]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=18159
[S10]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=90192
[S11]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=2626
[S12]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=14378
[S13]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=16337
[S14]: https://ko.wikipedia.org/w/index.php?oldid=41696102
[S15]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=18681
[S16]: https://ko.wikipedia.org/w/index.php?oldid=39161896
[S17]: https://fishingseasons.co.kr/contents_view_detail.asp?b_no=1669
[S18]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=89780
[S19]: https://www.fsis.go.kr/front/contents/cmsView.do?cate_id=0301&cnts_id=18408&select_list_no=110
[S20]: https://www.honda.co.jp/fishing/picture-book/aoriika/
[S21]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=13558
[S22]: https://ko.wikipedia.org/w/index.php?oldid=42447399
[S23]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=12863
[S24]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=13252
[S25]: https://ko.wikipedia.org/w/index.php?oldid=41393092
[S26]: https://ko.wikipedia.org/w/index.php?oldid=41174600
[S27]: https://fishingseasons.co.kr/contents_view_detail.asp?b_no=11727
[S28]: https://ko.wikipedia.org/w/index.php?oldid=40906911
[S29]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=18942
[S30]: https://www.honda.co.jp/fishing/picture-book/isaki/
[S31]: https://www.honda.co.jp/fishing/picture-book/isaki/trap01/
[S32]: https://www.mbris.kr/pub/about/gallery.do?pageIndex=504
[S33]: https://ko.wikipedia.org/w/index.php?oldid=40910380
[S34]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=5346
[S35]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=14625
[S36]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=15252
[S37]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=90743
[S38]: https://ko.wikipedia.org/w/index.php?oldid=42443805
[S39]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=18879
[S40]: https://ko.wikipedia.org/w/index.php?oldid=41174516
[S41]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=15114
[S42]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=19004
[S43]: https://www.badatime.com/gearing/13
[S44]: https://fishingseasons.co.kr/contents_view_detail.asp?b_no=3271
[S45]: https://www.nifs.go.kr/board/actionBoard0008View.do?BBS_CL_CD=G&BBS_ID=20250828100256207LBN&MENU_ID=M0000054
[S46]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=2336
[S47]: https://www.nifs.go.kr/portal/pcon0000298/systA/actionConts.do
[S48]: https://www.honda.co.jp/fishing/picture-book/kue/
[S49]: https://www.honda.co.jp/fishing/picture-book/kue/trap01/
[S50]: https://www.nifs.go.kr/portal/bt/frctA/actionSpeciesSearchView.do?taxonId=11822
[S51]: https://fishingseasons.co.kr/contents_view_detail.asp?b_no=1477
[S52]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=13452
[S53]: https://m.fishingseasons.co.kr/news_Detail.asp?b_no=16523
