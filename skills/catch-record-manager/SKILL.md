---
name: catch-record-manager
description: IndexedDB 조과 기록의 추가·수정·삭제, 사진 저장, 누적 마릿수·기록 횟수·수집률과 잠금/해금 상태를 관리합니다. 조과 등록 Form, 사진 저장, IndexedDB 구조, 기록 편집·삭제 또는 해금 로직을 변경할 때 사용합니다.
---

# 조과 기록 관리

## 작업 절차

1. 실제 IndexedDB 코드의 버전·store·index를 조사한다. Phase 1에는 구현이 없으므로 이미 존재한다고 기록하지 않는다.
2. 저장 구조·입력·집계 변경 전에 [indexeddb-schema.md](references/indexeddb-schema.md)를 읽는다. 실제 도감 speciesId와 지도 숫자 ID를 확인한다.
3. 날짜·양의 정수 마릿수·존재하는 speciesId, 사진 형식·크기·실제 디코딩을 검사한다. 사진 미리보기 object URL은 교체·닫기 시 해제한다.
4. 기록 생성/수정/삭제를 transaction으로 처리한다. 요청 success만으로 성공 처리하지 않고 transaction complete 후 UI를 갱신한다.
5. 같은 speciesId의 유효 기록을 다시 집계해 총 마릿수·기록 횟수·수집 종 수·완성률을 계산한다. 첫 기록은 해금, 마지막 삭제는 잠금이다.
6. 실제 구현 모듈에 아래 검증기를 연결해 실행한다. 실패하면 데이터·화면 성공 상태를 보류하고 원인을 수정한다.
7. 같은 출처·브라우저에서 새로고침 후 Blob 사진·기록 복원을 확인한다. 실제 결과를 `docs/SKILL_USAGE.md`에 기록한다.

## 검증 명령

```text
node skills/catch-record-manager/scripts/validate-record-logic.mjs --module <실제-기록-로직-모듈>
```

모듈 인터페이스는 reference에 정의한다. 입력·집계 변경 후 실행하며 2+3, 수정·삭제·다른 종 격리를 확인한다.
`--self-test`는 검증기 입력 규칙만 검사한다. module 생략은 SKIP이며 앱·IndexedDB 검증 통과가 아니다. 오류는 종료 코드 1이다.

## 입력과 출력 예

- 입력: 유효한 사진, 존재하는 speciesId, 날짜, 2마리. 출력: 저장 완료 후 2마리/기록 1회·컬러, 새로고침 후 같은 사진.
- 입력: 같은 종 3마리 추가. 출력: 총 5마리/기록 2회. 마지막 기록까지 삭제한 출력: 0마리/0회·회색, 수집 종 수 감소.

## 예외 처리

0·음수·소수, 알 수 없는 speciesId, 잘못된 날짜·파일·초과 용량은 저장 전에 차단한다.
IndexedDB 열기 실패·upgrade blocked·QuotaExceededError·transaction abort에는 입력과 기존 기록을 보존하고 재시도를 안내한다.
없는 recordId 삭제는 안전한 미변경으로 처리한다. 마지막 기록 삭제에 별도 해금 flag가 남지 않게 한다.
브라우저 데이터 삭제·다른 origin/기기에서는 기록이 공유되지 않는다. LocalStorage 사진·서버 DB·계정 동기화를 추가하지 않는다.
