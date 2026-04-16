# Some Cleaner — 비즈니스 정책 및 규칙

## 삭제 버튼 활성화 기준

**정책: 이메일(수신자)이 1개 이상 등록된 디스크만 삭제 버튼 활성화**

- 이메일은 `M_CLEANER_RECIPIENTS` 테이블에 disk_id 기준으로 영구 저장되는 유일한 디스크 단위 설정
- 이메일이 없으면 삭제 완료 알림을 보낼 수 없으므로 삭제 등록 불가
- 경로(internal/external)는 없어도 삭제 등록 가능 (등록 폼에서 입력)

---

## 설정 저장 방식

| 데이터 | 저장 위치 | 방식 |
|--------|-----------|------|
| 이메일 (to/cc) | `M_CLEANER_RECIPIENTS` (DB) | `PUT /api/disk-recipients/:diskId/` |
| 포함 경로 (internal) | 로컬 캐시 (zustand) | 브라우저 메모리, 새로고침 시 초기화 |
| 제외 경로 (external) | 로컬 캐시 (zustand) | 브라우저 메모리, 새로고침 시 초기화 |

- 이메일은 디스크 단위 공유 설정 → 모든 사용자가 동일한 값을 봄
- 경로는 프로세스 실행마다 `M_CALLBACK_INCLUDE` / `M_CALLBACK_EXCLUDE`에 새로 기록됨
- 설정 페이지에서 경로 pre-fill은 해당 디스크의 **마지막 실행 프로세스** 기준

---

## 프로세스 생성 흐름

```
1. 설정 버튼 클릭 → /process/new?diskId=:id
2. 폼 로드 시 GET /api/disk-configs/:diskId/ (이메일 + 마지막 경로 pre-fill)
3. 사용자 입력 후 "설정 저장":
   - 이메일 → PUT /api/disk-recipients/:diskId/ (DB 저장)
   - 경로 → 로컬 캐시만 업데이트
4. 대시보드 복귀
5. 삭제 버튼 클릭 → 확인 모달 (설정 내용 표시)
6. 확인 → POST /api/process/ (M_CALLBACK + INCLUDE + EXCLUDE 생성)
7. /history 이동
```

---

## DB 테이블 역할 정의

| 테이블 | 역할 | 특이사항 |
|--------|------|----------|
| `M_DISK` | 디스크 기본 정보 | quota, usage 등 |
| `M_CALLBACK` | 삭제 프로세스 실행 단위 | script_id로 INCLUDE/EXCLUDE와 연결 |
| `M_CALLBACK_INCLUDE` | 포함(삭제 대상) 경로 | script_id + disk_id 모두 보유 |
| `M_CALLBACK_EXCLUDE` | 제외 경로 | script_id + disk_id 모두 보유 |
| `M_CALLBACK_LOGS` | 실행 로그 | full_log 포함 |
| `M_CLEANER_ACTION_LOG` | 사용자 액션 감사 로그 | action_type으로 버튼 종류 구분 |
| `M_CLEANER_RECIPIENTS` | 이메일 수신자 | disk_id 기준 (script_id 없음) — 디스크 단위 영구 설정 |

---

## 프론트엔드 ↔ DB 필드 매핑

| 프론트엔드 필드 | DB 컬럼 |
|----------------|---------|
| `internalPaths[]` | `M_CALLBACK_INCLUDE.include_word` |
| `externalPaths[]` | `M_CALLBACK_EXCLUDE.exclude_word` |
| `toEmails[]` | `M_CLEANER_RECIPIENTS.email` (recipient_type='to') |
| `ccEmails[]` | `M_CLEANER_RECIPIENTS.email` (recipient_type='cc') |
| `status` | `M_CALLBACK.status` |
| `createdBy` | `M_CALLBACK.username` |
