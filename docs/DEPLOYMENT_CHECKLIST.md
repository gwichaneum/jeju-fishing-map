# 배포·보안 점검

기준일: 2026-10-28 KST. 실제 서비스 URL: **LIVE_SITE_URL_REQUIRED**. 로컬/깨끗한 Production 사본 검증과 공개 배포 인수를 구분한다.

## 현재 상태

| 항목 | 결과 |
| --- | --- |
| Public 저장소 | [gwichaneum/jeju-fishing-map](https://github.com/gwichaneum/jeju-fishing-map), 공개 API HTTP 200·private=false 확인 |
| 기존 배포 | 공개 API homepage=null·has_pages=false·deployments 0건. 로컬 배포 플랫폼 설정 파일도 없음. 다른 외부 호스팅의 존재까지 단정하지 않음 |
| 실행 | Node.js >=22, npm install 또는 lockfile 기준 npm ci, npm start → node server.js. 별도 frontend build 없음 |
| 런타임 검증 | 로컬 Node 25.8.0/npm 11.11.0. 최소 지원 Node 22의 별도 실행은 미확인 |
| 공개 배포/HTTPS | 미실행. 사이트 URL을 추측하거나 계정/호스팅을 새로 만들지 않음 |
| Git 상태 | 로컬 HEAD는 저장된 origin/main보다 4 commit 앞섬. 원격 최신 기능 동기화·최종 commit/push는 사용자가 수행해야 함 |

## 배포에 필요한 조건

정적 GitHub Pages는 Node 프록시를 실행하지 않는다. 공식 물때를 포함한 전체 앱에는 Express 서버와 같은 출처의 `/api/tides`가 필요하다. 아래는 특정 플랫폼에 가입하거나 실제 배포했다는 기록이 아니다.

| 설정 | 값/동작 |
| --- | --- |
| 설치 | npm ci (lockfile 사용) 또는 npm install |
| 실행 | npm start |
| Node | 22 이상 |
| NODE_ENV | production |
| PORT | 플랫폼이 지정한 포트 사용, 미지정 시 8080 |
| HOST | 환경변수와 무관하게 0.0.0.0 고정. NODE_ENV 미지정 또는 기존 HOST=127.0.0.1/localhost에서도 Render 포트 탐지 가능 |
| DATA_GO_KR_SERVICE_KEY | 플랫폼의 서버 환경변수로 설정. 실제 값은 문서/코드에 기록하지 않음 |
| HTTPS | 플랫폼 또는 reverse proxy에서 TLS 종료. 모바일 위치 권한도 검증 |
| 정적 자원 | 기존 server.js allowlist의 HTML/CSS/JS·공개 데이터·등록 이미지 경로 |
| API | GET /api/tides?station=DT_0004&date=YYYYMMDD, 서버가 허용하는 오늘/내일 날짜 |

서버는 플랫폼 API Key 환경변수를 우선 사용하고 로컬 `.env`를 fallback으로 사용한다. 명시적 빈 환경변수는 물때를 비활성화한다. 키가 없으면 물때가 503/KEY_NOT_CONFIGURED로 안내되고 나머지 화면은 작동한다. `.env.example`에는 `DATA_GO_KR_SERVICE_KEY=YOUR_SERVICE_KEY_HERE`만 둔다.

## 이번에 수정하고 확인한 배포 차단 요인

1. 서버가 `.env`의 parsed 값만 읽던 문제를 플랫폼 환경변수 우선으로 수정했다. Production 기본 bind도 0.0.0.0으로 설정했다. 기존 PORT 지원/로컬 실행 방식은 유지했다.

   Render 포트 탐지 수정: 이후 host를 항상 0.0.0.0으로 고정했다. PORT 환경변수 우선/기본 8080과 start=node server.js를 유지하므로 npm start와 pnpm start 모두 같은 서버를 실행한다. [Render 포트 바인딩 조건](https://render.com/docs/web-services#port-binding)을 따른다.
2. npm audit에서 body-parser 2.3.0(high), qs 6.16.0(moderate)이 발견됐다. 직접 의존성 Express/dotenv 버전은 유지하고 lockfile의 body-parser를 2.4.0, qs를 6.17.0으로 갱신했다. 이후 설치·npm audit --omit=dev에서 취약점 0건을 확인했다. 근거: [body-parser 공지](https://github.com/advisories/GHSA-27r3-jxmh-p828), [qs 공지](https://github.com/advisories/GHSA-6pq8-jhm2-2vcw).
3. `.env` 없는 OS 임시 폴더에 실제 공개 앱 파일 69개를 복사하고 npm ci로 새 설치했다. Production 환경의 독립 포트/공개 bind·HTML/JS/이미지 200·비공개 파일 404·키 없음 503·합성 플랫폼 키 인식/로그 비노출을 검증했다. 실제 자격증명은 사본에 넣지 않았다.

최종 설치 버전도 확인했다. 기존 작업 폴더의 node_modules가 lockfile 갱신 뒤에도 구버전인 상태를 발견해 명시적 npm ci로 재설치했다. 작업 폴더와 깨끗한 사본 모두 body-parser 2.4.0/qs 6.17.0을 확인했고 서버 재시작 후 자동 검사·실제 API/UI 검증을 통과했다. 배포에서도 lockfile 기준의 깨끗한 설치를 권장한다.

초기 검증 사본을 `.verify` 안에 만들었을 때 Express의 기본 dotfile 경로 보호로 정적 파일이 차단됐다. 검증 사본을 숨김 상위 디렉터리가 없는 OS 임시 폴더로 옮겨 통과했다. 이를 해결하려고 정적 공개 범위/dotfile 보호를 완화하지 않았다.

## Public GitHub·키 점검 범위

- `.gitignore`의 `.env`/`.env.*`/node_modules/.verify 제외 및 `.env.example` 예외를 확인했다. 실제 `.env` 내용을 읽거나 출력하지 않았다.
- 로컬 reachable Git 이력 23 commit의 텍스트 blob 165개를 패턴 검사했다. 비예시 `.env` 추적 이력·키/토큰/private-key 패턴 후보가 없었다. 현재 추적/추가 예정 텍스트도 검사한다. 패턴 검사는 모든 비밀 부재를 증명하는 전체 보안 감사가 아니다.
- Express allowlist로 `.env`, 서버 소스, package.json, `.git`, 의존성, 테스트 파일은 HTTP 404다. 브라우저는 station/date만 프록시에 전달한다. 실제 키·상위 API URL/원본 오류는 응답에 넣지 않는다.
- 사진/조과는 IndexedDB, 즐겨찾기는 LocalStorage에만 저장한다. 제출 스크린샷은 격리 profile과 합성 사진이며 사용자 원본 DB를 수정/삭제하지 않았다.
- `package.json`의 private=true는 npm 배포 방지 설정이며 GitHub 저장소의 공개 여부와 다르다.

## 실제 배포 후 남은 인수

- [ ] Node/환경변수/HTTPS 설정 후 실제 서비스 URL 확인
- [ ] 배포 사이트의 지도·도감·species query·Back·모바일 화면 확인
- [ ] 배포 사이트의 날씨·Marine·공식 물때 오늘/내일 및 실패 안내 확인
- [ ] 배포 origin의 IndexedDB 사진/기록·새로고침/브라우저 재실행 확인
- [ ] 실제 휴대폰 위치 권한·GPS·사진 선택·소프트 키보드 확인
- [ ] README 맨 위 Marker를 검증된 실제 웹앱 링크로 교체
- [ ] 사용자 검토 후 최종 commit/push와 공개 저장소 파일 확인

로컬과 새 배포 origin의 저장소는 별개다. 새 URL에서 로컬 조과가 자동으로 보이지 않는다. 자세한 기능 결과는 [최종 테스트](./FINAL_TEST_REPORT.md), 실행 이력은 [SKILL_USAGE](./SKILL_USAGE.md)를 참고한다.
