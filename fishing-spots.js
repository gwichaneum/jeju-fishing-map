// Personal notes and public fishing information are intentionally separate.
// Verified coordinates are public representative locations, not exact saved pins.
// null coordinates must never produce a fishing marker.
const fishingSpots = [
  {
    "id": 1,
    "name": "동복방파제",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "무늬오징어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "동복리 방파제의 정확한 좌표 미확인. 바다타임의 동북리 방파제를 동일 장소로 단정하지 않음."
  },
  {
    "id": 2,
    "name": "황우치해변",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "해변",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "서프루어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "공개 자료에 서로 다른 해변 좌표가 있어 저장한 해안 지점 확인 필요."
  },
  {
    "id": 3,
    "name": "신도포구",
    "latitude": 33.27683333,
    "longitude": 126.1691389,
    "region": "제주 서부",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [
      "감성돔",
      "벤자리",
      "삼치",
      "방어",
      "벵에돔",
      "한치"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "지깅"
    ],
    "userNote": "무늬오징어, 발판 좋음",
    "safetyNote": "발판 좋음",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/317/spots"
      },
      {
        "name": "제주관광공사",
        "url": "https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_000000000020929"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/317/spots"
    },
    "coordinateScope": "방파제 대표 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/317/spots"
    },
    "aliases": [
      "신도리등대 방파제"
    ]
  },
  {
    "id": 4,
    "name": "성산노외2공영주차장",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "access-point",
    "kind": "access-point",
    "species": [],
    "methods": [],
    "userNote": "무늬오징어 포인트",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "주차장은 접근 기준점. 주차장 및 실제 낚시 해안의 정확한 위치 확인 필요."
  },
  {
    "id": 5,
    "name": "차귀도선착장",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "선착장",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "무늬오징어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "차귀도행 선착장과 섬의 선착장을 구분할 저장 핀 필요. 고산리 방파제로 임의 대체하지 않음."
  },
  {
    "id": 6,
    "name": "태흥1리어촌계",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "landmark",
    "kind": "landmark",
    "species": [],
    "methods": [],
    "userNote": "무늬오징어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "어촌계 시설과 실제 낚시 해안을 구분할 위치 확인 필요."
  },
  {
    "id": 7,
    "name": "김녕불턱",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "access-point",
    "kind": "access-point",
    "species": [],
    "methods": [],
    "userNote": "벵에돔, 돌돔 포인트",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "불턱은 해녀 작업 기준점. 인근 실제 갯바위 낚시 지점의 좌표 확인 필요."
  },
  {
    "id": 8,
    "name": "무거버거",
    "address": "제주 제주시 조천읍 조함해안로 356 1층",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "landmark",
    "kind": "landmark",
    "species": [],
    "methods": [],
    "userNote": "주변 무늬오징어 포인트",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "제주관광공사",
        "url": "https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_200000000012605"
      }
    ],
    "needsVerification": true,
    "verificationNote": "음식점임을 확인. 조함해안로 356 1층의 주변 낚시 해안은 특정하지 않음."
  },
  {
    "id": 9,
    "name": "신촌포구 빨간등대",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "벵에돔",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "신촌포구 방파제 자료는 있으나 사용자가 지정한 빨간등대의 위치와 일치하는지 미확인."
  },
  {
    "id": 10,
    "name": "한수리방파제",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "무늬오징어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "해양수산부",
        "url": "https://www.korea.kr/multi/policyPhotoView.do?bbsKey=62510"
      }
    ],
    "needsVerification": true,
    "verificationNote": "한림항 한수리방파제 명칭은 확인. 공개 한림항 외측 테트라포트와 동일 지점인지 확인 필요."
  },
  {
    "id": 11,
    "name": "정주항",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "항구",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "제주관광공사",
        "url": "https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_000000000021056"
      },
      {
        "name": "OpenStreetMap",
        "url": "https://www.openstreetmap.org/node/3739792594"
      }
    ],
    "needsVerification": true,
    "verificationNote": "제주 장소명은 확인. 제주관광공사(33.531406, 126.66637)와 OpenStreetMap(33.5471723, 126.6607836) 좌표가 달라 보류."
  },
  {
    "id": 12,
    "name": "평대포구",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "평대포구의 정확한 대표 좌표 미확인. 마을 중심이나 인근 한동 방파제로 대체하지 않음."
  },
  {
    "id": 13,
    "name": "서우봉입구",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "access-point",
    "kind": "access-point",
    "species": [],
    "methods": [],
    "userNote": "",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "접근 기준점. 어느 진입로와 해안 낚시 위치를 의미하는지 확인 필요."
  },
  {
    "id": 14,
    "name": "월령코지",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "갯바위",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "피싱맵",
        "url": "https://fishingmap.co.kr/mobile/m_map_view.php?no=1044"
      }
    ],
    "needsVerification": true,
    "verificationNote": "공개 자료에 갯바위, 구름다리, 월령포구 방파제가 별도 지점으로 나뉨. 저장한 위치 확인 필요."
  },
  {
    "id": 15,
    "name": "수마포구",
    "latitude": null,
    "longitude": null,
    "region": "제주 성산 (사용자 제공)",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "성산 지역 포구의 정확한 좌표 미확인. 성산포항 외 방파제로 대체하지 않음."
  },
  {
    "id": 16,
    "name": "덕돌포구",
    "latitude": 33.2905628,
    "longitude": 126.7606705,
    "region": "제주 남동부",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [
      "넙치농어",
      "벵에돔",
      "무늬오징어",
      "참돔",
      "부시리"
    ],
    "methods": [
      "에깅"
    ],
    "userNote": "벵에돔",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "OpenStreetMap",
        "url": "https://www.openstreetmap.org/node/3739763534"
      },
      {
        "name": "낚시춘추",
        "url": "https://m.fishingseasons.co.kr/news_Detail.asp?b_no=18992"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/node/3739763534"
    },
    "coordinateScope": "포구 대표 위치",
    "fishingInfoSource": {
      "name": "낚시춘추",
      "url": "https://m.fishingseasons.co.kr/news_Detail.asp?b_no=18992"
    }
  },
  {
    "id": 17,
    "name": "하예포구",
    "latitude": 33.23208333,
    "longitude": 126.3772222,
    "region": "제주 남부",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [
      "벵에돔",
      "한치",
      "노래미",
      "독가시치",
      "부시리",
      "우럭"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "지깅"
    ],
    "userNote": "무늬오징어, 원투",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/73/spots"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/73/spots"
    },
    "coordinateScope": "방파제 대표 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/73/spots"
    },
    "aliases": [
      "하예포구 방파제"
    ]
  },
  {
    "id": 18,
    "name": "옹포리포구",
    "latitude": 33.40058,
    "longitude": 126.255325,
    "region": "제주 서부",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "돌돔, 돔 종류",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "제주관광공사",
        "url": "https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_000000000021407"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "제주관광공사",
      "url": "https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_000000000021407"
    },
    "coordinateScope": "포구 대표 위치"
  },
  {
    "id": 19,
    "name": "운진항",
    "latitude": 33.20711111,
    "longitude": 126.257,
    "region": "제주 남서부",
    "category": "항구",
    "kind": "fishing-spot",
    "species": [
      "벵에돔",
      "농어",
      "자리돔",
      "볼락",
      "한치",
      "참돔",
      "부시리"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "지깅"
    ],
    "userNote": "무늬오징어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/73/spots"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/73/spots"
    },
    "coordinateScope": "방파제 대표 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/73/spots"
    },
    "aliases": [
      "운진항 방파제"
    ]
  },
  {
    "id": 20,
    "name": "세천포구",
    "latitude": 33.26858333,
    "longitude": 126.6741944,
    "region": "제주 남동부",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [
      "참돔",
      "돌돔",
      "다금바리",
      "벵에돔",
      "부시리"
    ],
    "methods": [
      "릴찌",
      "원투",
      "민장대",
      "지깅"
    ],
    "userNote": "벵에돔 포인트",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "방파제 대표 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "aliases": [
      "세천포구 방파제"
    ]
  },
  {
    "id": 21,
    "name": "백포포구",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "무늬오징어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "제주시 이호동 해안의 정확한 포구 좌표 확인 필요. 다른 지역의 백포 방파제로 대체하지 않음."
  },
  {
    "id": 22,
    "name": "하귀포구",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "하귀방파제, 동귀항, 미수동포구 중 개인 저장 위치가 어느 지점인지 미확인."
  },
  {
    "id": 23,
    "name": "애월항",
    "latitude": 33.46897222,
    "longitude": 126.3264444,
    "region": "제주 북서부",
    "category": "항구",
    "kind": "fishing-spot",
    "species": [
      "감성돔",
      "농어",
      "돌돔",
      "벵에돔",
      "참돔",
      "고등어",
      "독가시치"
    ],
    "methods": [
      "릴찌",
      "원투",
      "민장대",
      "루어"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "방파제 대표 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "aliases": [
      "애월항 방파제"
    ]
  },
  {
    "id": 24,
    "name": "고내포구",
    "latitude": 33.47138889,
    "longitude": 126.3376389,
    "region": "제주 북서부",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [
      "감성돔",
      "농어",
      "돌돔",
      "벵에돔",
      "참돔",
      "고등어",
      "독가시치"
    ],
    "methods": [
      "릴찌",
      "원투",
      "민장대",
      "루어"
    ],
    "userNote": "좋은 포인트, 발판 편함",
    "safetyNote": "발판 편함",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "방파제 대표 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "aliases": [
      "고내마을 방파제"
    ]
  },
  {
    "id": 25,
    "name": "신흥리포구",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "발판 편함",
    "safetyNote": "발판 편함",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "조천읍과 남원읍의 신흥리 등 동일 지명 중 저장한 포구와 좌표 확인 필요."
  },
  {
    "id": 26,
    "name": "하모 방파제",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "4대 돔 포인트",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "하모 해안의 정확한 방파제 위치 미확인. 모슬포항 또는 운진항으로 합치지 않음."
  },
  {
    "id": 27,
    "name": "협재포구",
    "latitude": 33.39913889,
    "longitude": 126.2418611,
    "region": "제주 서부",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [
      "감성돔",
      "벤자리",
      "삼치",
      "방어",
      "벵에돔",
      "한치"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "지깅"
    ],
    "userNote": "안전하고 좋음, 돔 포인트",
    "safetyNote": "안전하고 좋음",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "방파제 대표 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "aliases": [
      "협재포구 방파제"
    ]
  },
  {
    "id": 28,
    "name": "세화포구",
    "latitude": 33.52991667,
    "longitude": 126.8583889,
    "region": "제주 북동부",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [
      "참돔",
      "돌돔",
      "볼락",
      "벵에돔",
      "무늬오징어",
      "독가시치"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "에깅"
    ],
    "userNote": "원투",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "방파제 대표 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "aliases": [
      "세화항 방파제"
    ]
  },
  {
    "id": 29,
    "name": "두모포구공원",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "access-point",
    "kind": "access-point",
    "species": [],
    "methods": [],
    "userNote": "무늬오징어, 원투",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "공원은 접근 기준점. 공원 및 인근 실제 낚시 지점의 정확한 좌표 미확인."
  },
  {
    "id": 30,
    "name": "제주 서귀포시 대정읍 노을해안로",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "access-point",
    "kind": "access-point",
    "species": [],
    "methods": [],
    "userNote": "에깅 갯바위",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "도로 범위가 넓어 특정 갯바위 지점 확인 필요."
  },
  {
    "id": 31,
    "name": "제주 서귀포시 안덕면 창천리 840-8",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "access-point",
    "kind": "access-point",
    "species": [],
    "methods": [],
    "userNote": "무늬오징어 갯바위",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "지번에 해당하는 해안의 실제 낚시 위치 미확인. 대평포구의 임의 좌표로 대체하지 않음."
  },
  {
    "id": 32,
    "name": "연대포구",
    "latitude": 33.49597222,
    "longitude": 126.4278611,
    "region": "제주 북서부",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [
      "감성돔",
      "농어",
      "돌돔",
      "벵에돔",
      "참돔",
      "고등어",
      "독가시치"
    ],
    "methods": [
      "릴찌",
      "원투",
      "민장대",
      "루어"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "방파제 대표 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "aliases": [
      "연대방파제"
    ]
  },
  {
    "id": 33,
    "name": "화순항",
    "latitude": 33.23186111,
    "longitude": 126.3284444,
    "region": "제주 남서부",
    "category": "항구",
    "kind": "fishing-spot",
    "species": [
      "벵에돔",
      "농어",
      "자리돔",
      "볼락",
      "한치",
      "참돔",
      "부시리"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "지깅"
    ],
    "userNote": "안전함",
    "safetyNote": "안전함",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/73/spots"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/73/spots"
    },
    "coordinateScope": "방파제 대표 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/73/spots"
    },
    "aliases": [
      "화순항 방파제"
    ]
  },
  {
    "id": 34,
    "name": "제주특별자치도 제주시 내도동 465-3",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "access-point",
    "kind": "access-point",
    "species": [],
    "methods": [],
    "userNote": "돌돔, 참돔",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "지번 기준점과 실제 낚시 위치 미확인. 외도천 방파제 좌표로 대체하지 않음."
  },
  {
    "id": 35,
    "name": "동귀방파제",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "농어",
      "참돔",
      "감성돔",
      "벵에돔",
      "돌돔",
      "무늬오징어",
      "한치"
    ],
    "methods": [
      "찌낚시",
      "원투"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "제주콘텐츠진흥원",
        "url": "https://www.ofjeju.kr/bussiness/location/locationsearch.htm?act=view&id=103&page=19"
      },
      {
        "name": "피싱맵",
        "url": "https://fishingmap.co.kr/mobile/m_map_view.php?no=6788&okok=1"
      }
    ],
    "needsVerification": true,
    "verificationNote": "제주콘텐츠진흥원과 피싱맵에서 하귀1리 1624-1의 명칭 확인. 정확한 방파제 좌표는 미확인.",
    "fishingInfoSource": {
      "name": "피싱맵",
      "url": "https://fishingmap.co.kr/mobile/m_map_view.php?no=6788&okok=1"
    }
  },
  {
    "id": 36,
    "name": "제주 서귀포시 대정읍 영락리 2169-4",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "access-point",
    "kind": "access-point",
    "species": [],
    "methods": [],
    "userNote": "고등어, 전갱이",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "해당 지번의 정확한 낚시 위치 미확인. 인근 다른 지번 또는 낚시터로 대체하지 않음."
  },
  {
    "id": 37,
    "name": "삼양해수욕장",
    "latitude": 33.525845,
    "longitude": 126.5863,
    "region": "제주 북부",
    "category": "해변",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "서프루어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "제주관광공사",
        "url": "https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500301"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "제주관광공사",
      "url": "https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500301"
    },
    "coordinateScope": "해변 대표 위치"
  },
  {
    "id": 38,
    "name": "중문색달해수욕장",
    "latitude": 33.2473598,
    "longitude": 126.4066129,
    "region": "제주 남부",
    "category": "해변",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "광어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "제주관광공사",
        "url": "https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500604"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "제주관광공사",
      "url": "https://www.visitjeju.net/kr/detail/view?contentsid=CONT_000000000500604"
    },
    "coordinateScope": "해변 대표 위치"
  },
  {
    "id": 39,
    "name": "제주 제주시 삼봉로2길 34 1층 101호 주변",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "landmark",
    "kind": "landmark",
    "species": [],
    "methods": [],
    "userNote": "주변 양식장 구멍치기 포인트",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "건물은 기준점. 주변 양식장 및 실제 구멍치기 해안의 정확한 위치 미확인."
  },
  {
    "id": 40,
    "name": "용수포구",
    "latitude": 33.323494,
    "longitude": 126.16516,
    "region": "제주 서부",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "무늬오징어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "제주관광공사",
        "url": "https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_000000000021514"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "제주관광공사",
      "url": "https://www.visitjeju.net/kr/detail/view?contentsid=CNTS_000000000021514"
    },
    "coordinateScope": "포구 대표 위치"
  },
  {
    "id": 41,
    "name": "미수포구입구교차로",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "access-point",
    "kind": "access-point",
    "species": [],
    "methods": [],
    "userNote": "무늬오징어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "정확한 제주 교차로 명칭과 좌표 미확인. 미수동포구나 다른 지역 지점으로 바꾸지 않음."
  },
  {
    "id": 42,
    "name": "신칭항",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "항구",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "루어 농어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "오타 가능성은 있지만 신창항과 동일한 저장 장소임을 입증하지 못함. 원래 이름 유지."
  },
  {
    "id": 43,
    "name": "서부두",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "부두",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "항구 또는 주소가 없어 정확한 부두와 저장 지점 미확인."
  },
  {
    "id": 44,
    "name": "조천항",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "항구",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "제주 조천항 명칭은 확인했으나 실제 포구 좌표 미확인. 인근 신촌포구 좌표로 대체하지 않음."
  },
  {
    "id": 45,
    "name": "동부두",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "부두",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "항구 또는 주소가 없어 정확한 부두와 저장 지점 미확인."
  },
  {
    "id": 46,
    "name": "모슬포항",
    "latitude": 33.21558333,
    "longitude": 126.2490278,
    "region": "제주 남서부",
    "category": "항구",
    "kind": "fishing-spot",
    "species": [
      "벵에돔",
      "농어",
      "자리돔",
      "볼락",
      "한치",
      "참돔",
      "부시리"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "지깅"
    ],
    "userNote": "안전 낚시",
    "safetyNote": "안전 낚시",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/73/spots"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/73/spots"
    },
    "coordinateScope": "방파제 대표 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/73/spots"
    },
    "aliases": [
      "모슬포항 방파제"
    ]
  },
  {
    "id": 47,
    "name": "금능포구",
    "latitude": 33.39202778,
    "longitude": 126.22725,
    "region": "제주 서부",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [
      "감성돔",
      "벤자리",
      "삼치",
      "방어",
      "벵에돔",
      "한치"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "지깅"
    ],
    "userNote": "오징어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "방파제 대표 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "aliases": [
      "금능포구 방파제"
    ]
  },
  {
    "id": 48,
    "name": "도두등대",
    "latitude": null,
    "longitude": null,
    "region": "제주 (세부 위치 확인 필요)",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "벵에돔, 한치",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [],
    "needsVerification": true,
    "verificationNote": "도두항 방파제 자료만으로 어느 등대를 저장했는지 입증하지 못함. 정확한 등대 위치 확인 필요."
  },
  {
    "id": 49,
    "name": "강정포구",
    "latitude": 33.22686111,
    "longitude": 126.4779444,
    "region": "제주 남부",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [
      "벵에돔",
      "한치",
      "노래미",
      "독가시치",
      "부시리",
      "우럭"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "지깅"
    ],
    "userNote": "벵에돔, 안전한 테트라",
    "safetyNote": "안전한 테트라",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "방파제 대표 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "aliases": [
      "강정포구 방파제"
    ]
  },
  {
    "id": 50,
    "name": "용담포구",
    "latitude": 33.5185608,
    "longitude": 126.5008844,
    "region": "제주 북부",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "잿방어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "OpenStreetMap",
        "url": "https://www.openstreetmap.org/node/3739793759"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/node/3739793759"
    },
    "coordinateScope": "포구 대표 위치"
  },
  {
    "id": 51,
    "name": "북촌포구",
    "latitude": 33.5508844,
    "longitude": 126.6944545,
    "region": "제주 북동부",
    "category": "포구",
    "kind": "fishing-spot",
    "species": [],
    "methods": [],
    "userNote": "루어낚시, 무늬오징어",
    "safetyNote": "",
    "source": "개인 즐겨찾기",
    "externalSources": [
      {
        "name": "OpenStreetMap",
        "url": "https://www.openstreetmap.org/node/3739786033"
      }
    ],
    "needsVerification": false,
    "verificationNote": "공개 자료의 대표 위치를 확인했으며 개인 저장 핀의 정밀 좌표와는 다를 수 있음.",
    "coordinateSource": {
      "name": "OpenStreetMap",
      "url": "https://www.openstreetmap.org/node/3739786033"
    },
    "coordinateScope": "포구 대표 위치"
  },
  {
    "id": 52,
    "name": "제주항방파제 빨간등대",
    "latitude": 33.53277778,
    "longitude": 126.5408611,
    "region": "제주 북부",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "참돔",
      "돌돔",
      "한치",
      "벵에돔",
      "노래미"
    ],
    "methods": [
      "릴찌",
      "원투",
      "민장대",
      "루어"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  },
  {
    "id": 53,
    "name": "화북포구 방파제",
    "latitude": 33.52727778,
    "longitude": 126.5655556,
    "region": "제주 북부",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "참돔",
      "돌돔",
      "한치",
      "벵에돔",
      "노래미"
    ],
    "methods": [
      "릴찌",
      "원투",
      "민장대",
      "루어"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  },
  {
    "id": 54,
    "name": "별낭포구 방파제",
    "latitude": 33.52738889,
    "longitude": 126.5788333,
    "region": "제주 북부",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "참돔",
      "돌돔",
      "한치",
      "벵에돔",
      "노래미"
    ],
    "methods": [
      "릴찌",
      "원투",
      "민장대",
      "루어"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  },
  {
    "id": 55,
    "name": "용두암 낚시터",
    "latitude": 33.51672222,
    "longitude": 126.5079722,
    "region": "제주 북서부",
    "category": "갯바위",
    "kind": "fishing-spot",
    "species": [
      "감성돔",
      "농어",
      "돌돔",
      "벵에돔",
      "참돔",
      "고등어",
      "독가시치",
      "부시리"
    ],
    "methods": [
      "릴찌",
      "원투",
      "민장대",
      "루어"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  },
  {
    "id": 56,
    "name": "사수동 방파제",
    "latitude": 33.51144444,
    "longitude": 126.4788056,
    "region": "제주 북서부",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "감성돔",
      "농어",
      "돌돔",
      "벵에돔",
      "참돔",
      "고등어",
      "독가시치",
      "부시리"
    ],
    "methods": [
      "릴찌",
      "원투",
      "민장대",
      "루어"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  },
  {
    "id": 57,
    "name": "이호등대 방파제",
    "latitude": 33.50186111,
    "longitude": 126.4518889,
    "region": "제주 북서부",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "감성돔",
      "농어",
      "돌돔",
      "벵에돔",
      "참돔",
      "고등어",
      "독가시치",
      "부시리"
    ],
    "methods": [
      "릴찌",
      "원투",
      "민장대",
      "루어"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  },
  {
    "id": 58,
    "name": "김녕항 방파제",
    "latitude": 33.56097222,
    "longitude": 126.7404167,
    "region": "제주 북동부",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "참돔",
      "돌돔",
      "한치",
      "벵에돔",
      "노래미"
    ],
    "methods": [
      "릴찌",
      "원투",
      "민장대",
      "루어"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  },
  {
    "id": 59,
    "name": "월정 방파제",
    "latitude": 33.55802778,
    "longitude": 126.7961667,
    "region": "제주 북동부",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "참돔",
      "돌돔",
      "볼락",
      "벵에돔",
      "무늬오징어",
      "독가시치"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "에깅"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  },
  {
    "id": 60,
    "name": "귀덕마을 방파제",
    "latitude": 33.4465,
    "longitude": 126.2933333,
    "region": "제주 북서부",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "감성돔",
      "농어",
      "돌돔",
      "벵에돔",
      "참돔",
      "고등어",
      "독가시치"
    ],
    "methods": [
      "릴찌",
      "원투",
      "민장대",
      "루어"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  },
  {
    "id": 61,
    "name": "한림항 외측 테트라포트",
    "latitude": 33.41366667,
    "longitude": 126.2536111,
    "region": "제주 서부",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "감성돔",
      "벤자리",
      "삼치",
      "방어",
      "벵에돔",
      "한치"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "지깅"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  },
  {
    "id": 62,
    "name": "위미항 방파제",
    "latitude": 33.26872222,
    "longitude": 126.6606667,
    "region": "제주 남동부",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "참돔",
      "돌돔",
      "다금바리",
      "벵에돔",
      "부시리"
    ],
    "methods": [
      "릴찌",
      "원투",
      "민장대",
      "지깅"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  },
  {
    "id": 63,
    "name": "법환포구 방파제",
    "latitude": 33.23638889,
    "longitude": 126.5166667,
    "region": "제주 남부",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "벵에돔",
      "한치",
      "노래미",
      "독가시치",
      "부시리",
      "우럭"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "지깅"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  },
  {
    "id": 64,
    "name": "서귀포항 방파제",
    "latitude": 33.23580556,
    "longitude": 126.5709444,
    "region": "제주 남부",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "벵에돔",
      "한치",
      "노래미",
      "독가시치",
      "부시리",
      "우럭"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "지깅"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  },
  {
    "id": 65,
    "name": "표선항 방파제",
    "latitude": 33.32766667,
    "longitude": 126.8470278,
    "region": "제주 동부",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "참돔",
      "돌돔",
      "볼락",
      "벵에돔",
      "무늬오징어",
      "독가시치"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "에깅"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  },
  {
    "id": 66,
    "name": "온평리포구 방파제",
    "latitude": 33.40258333,
    "longitude": 126.9056667,
    "region": "제주 동부",
    "category": "방파제",
    "kind": "fishing-spot",
    "species": [
      "참돔",
      "돌돔",
      "볼락",
      "벵에돔",
      "무늬오징어",
      "독가시치"
    ],
    "methods": [
      "릴찌",
      "원투",
      "루어",
      "에깅"
    ],
    "userNote": "",
    "safetyNote": "",
    "source": "바다타임",
    "externalSources": [
      {
        "name": "바다타임",
        "url": "https://www.badatime.com/67/spots"
      }
    ],
    "needsVerification": false,
    "coordinateSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "coordinateScope": "공개 낚시 포인트 위치",
    "fishingInfoSource": {
      "name": "바다타임",
      "url": "https://www.badatime.com/67/spots"
    },
    "verificationNote": "공개 낚시 자료에 표시된 좌표. 현재 출입 허용 또는 안전 상태를 뜻하지 않음."
  }
];
