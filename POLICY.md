# Some Cleaner — 비즈니스 정책 및 규칙

## 삭제 버튼 활성화 기준

**정책: 권한이 있는 디스크는 항상 삭제 등록 가능**

- 디스크 카드/리스트에서 바로 삭제 등록 폼으로 진입
- 디스크 단위의 별도 "설정 저장" 단계는 없음
- 실제 등록 가능 여부는 삭제 등록 폼의 필수값 검증으로 판단

---

## 실행 스냅샷 저장 방식

| 데이터 | 저장 위치 | 방식 |
|--------|-----------|------|
| 이메일 (to/cc) | 실행 스냅샷 | `POST /api/process/` 시 새 script_id와 함께 저장 |
| 내부 경로 (internal) | 실행 스냅샷 | `POST /api/process/` 시 새 script_id와 함께 저장 |
| 외부 경로 (external) | 실행 스냅샷 | `POST /api/process/` 시 새 script_id와 함께 저장 |

- 이메일/경로 모두 디스크 공용 마스터 설정으로 따로 저장하지 않음
- 한 번의 삭제 실행이 하나의 설정 스냅샷이 됨
- 폼 pre-fill은 해당 디스크의 **마지막 script_id** 기준

---

## 프로세스 생성 흐름

```
1. 삭제 등록 버튼 클릭 → /process/new?diskId=:id
2. 폼 로드 시 GET /api/process/latest-config/:diskId/
3. 이전 실행이 있으면 마지막 script_id의 값으로 pre-fill, 없으면 빈값
4. 사용자 입력 후 "삭제 등록"
5. POST /api/process/ 요청
6. 백엔드가 새 script_id 생성
7. 해당 script_id로 M_CALLBACK + INCLUDE + EXCLUDE + RECIPIENTS 저장
8. /history 이동
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
| `M_CLEANER_RECIPIENTS` | 이메일 수신자 | script_id 기준 실행 스냅샷 |

---

## 프론트엔드 ↔ DB 필드 매핑

| 프론트엔드 필드 | DB 컬럼 |
|----------------|---------|
| `internalPaths[]` | `M_CALLBACK_INCLUDE.include_word` |
| `externalPaths[]` | `M_CALLBACK_EXCLUDE.exclude_word` |
| `toEmails[]` | `M_CLEANER_RECIPIENTS.email` (recipient_type='to', script_id 기준) |
| `ccEmails[]` | `M_CLEANER_RECIPIENTS.email` (recipient_type='cc', script_id 기준) |
| `status` | `M_CALLBACK.status` |
| `createdBy` | `M_CALLBACK.username` |
