---
name: fishing-app-tester
description: 제주 낚시 지도와 도감의 잠금·해금, IndexedDB 보존, 누적 집계, 검색·필터·지도 이동과 모바일 UI를 회귀 테스트합니다. 기능 구현 완료, 오류 수정, 배포 전 검증 또는 최종 제출 점검을 요청할 때 사용합니다.
---

# 통합 앱 검증

## 작업 절차

1. 현재 Phase와 실제 변경 파일을 확인한다. 기존 지도 완료 기록을 이번 실행 결과로 복사하지 않는다.
2. 브라우저 검증 전에 [test-cases.md](references/test-cases.md)를 읽고 T01~T14의 사전 조건·절차·기대 결과를 준비한다.
3. 프로젝트 루트에서 `node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=1`로 파일·Skill frontmatter·참조·syntax·기본 자원 검사를 수행한다.
4. Phase 2 이후에는 실제 catalog JSON을 `--catalog <경로>`, Phase 3 이후에는 실제 기록 모듈을 `--record-module <경로>`로 전달해 연결 검사를 실행한다. 미구현은 SKIP으로 남기고 PASS로 세지 않는다.
5. `npm test`로 기존 지도 자동 검사를 실행한다. 이후 실제 브라우저에서 T01~T14 순서대로 검사하며 기록 변경·새로고침·삭제까지 확인한다. 지도 연결은 도감→지도 범위로 검증하며 T11은 Popup 정보 보존과 도감 기능 부재를 확인한다.
6. 모바일 320/375/768px, PC 1440/1920px와 가로 전환·focus·console을 확인한다. 성공·부분 실패·동시 API 실패에서도 지도 기능을 확인한다.
7. `docs/SKILL_USAGE.md`에 날짜·요청·적용 절차·검사 파일·명령·오류·수정·최종 결과와 수동 미검증을 기록한다. 실패를 고친 부분만 재검사하고 필요한 회귀 범위를 확인한다.

## 명령과 실패 처리

```text
node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=1
node skills/fishing-app-tester/scripts/run-static-checks.mjs --phase=3 --catalog <실제.json> --record-module <실제.cjs>
npm test
```

검사 실패는 종료 코드 1이다. `--phase=2` 이상에서 필요한 실제 인자가 없으면 실패로 처리한다.
`--self-test`는 정적 검증기의 frontmatter 검사 자체를 확인한다. 어떤 명령도 브라우저·외부 API 성공을 자동으로 증명하지 않는다.
인증키·`.env` 내용은 읽거나 출력하지 않는다. 외부 실제 물때 재조회와 fixture 테스트를 구분한다.

## 입력과 출력 예

- 입력: “Phase 3 구현 후 검증”. 출력: 정적 검사·기존 테스트·실제 기록 모듈 결과, T01~T09·T11 브라우저 결과, 미구현 도감→지도 연동 T10은 SKIP 사유.
- 입력: “제출 전 전체 점검”. 출력: T01~T14 실제 결과·실패 위치·수정 재검증·실기기/배포 미확인 목록.

## 예외

개인 브라우저 기록을 지워 초기 상태를 만들지 않는다. 별도 테스트 profile/origin을 사용한다.
사진 권한·형태·모바일 조작·Blob 재복원은 직접 확인한다. `node --check`와 순수 함수 검사를 해당 검증 대신 보고하지 않는다.
API 실패 시 오류 영역과 검색·즐겨찾기 유지 동작을 분리해서 확인한다. 실제 GPS·현장 상태를 에뮬레이션 결과로 주장하지 않는다.
