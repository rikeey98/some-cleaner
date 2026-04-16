# Some Cleaner — 프로젝트 컨텍스트

## 앱 목적

사내 Linux 서버의 디스크 용량 관리 웹 앱.

- 사용자가 파일 삭제 작업의 **경로 아규먼트를 입력**해서 DB에 등록
- 사내 서버에서 **데몬**이 주기적으로 DB를 읽어 스크립트를 실행
- DB의 **한 row = 한 번의 삭제 작업** (재활용 없음, 매번 새로 등록)
- 삭제 작업 상태: `pending → running → completed / failed`
- Airflow UI와 유사한 느낌의 모니터링 + 등록 화면

---

## 인프라 구성

| 구분 | 내용 |
|------|------|
| 프론트엔드 | Nginx (Alpine) on Kubernetes |
| 백엔드 | Django REST Framework (DRF) on Kubernetes |
| DB | Oracle DB (사내) |
| CI/CD | Jenkins — 사내 GitHub push 시 자동 빌드/배포 |
| 인증 | 사내 AD SSO (통합 로그인) |
| 컨테이너 | node:22, nginx:alpine |

---

## 개발 흐름

```
[사외 Mac]
  Claude Code로 개발 (MSW mock으로 백엔드 대체)
  → 사외 GitHub push (https://github.com/rikeey98/some-cleaner)

[사내 Windows 11 PC]
  GitHub zip 다운로드 → copy-to-internal.ps1 실행으로 파일 복사
  → .env.production 생성 → npm run build 확인
  → 사내 GitHub push

[사내 CI/CD]
  Jenkins → Docker 빌드 → K8s 배포
```

### 사내 이전 스크립트

```powershell
# 사내 Windows에서 실행
.\copy-to-internal.ps1 -Source "C:\Downloads\some-cleaner-main" -Target "C:\projects\some-cleaner"
```

---

## 기술 스택

| 분류 | 라이브러리 |
|------|-----------|
| UI | React 19, TypeScript 5.7 |
| 빌드 | Vite 6 (`base`는 env로 제어) |
| 스타일 | Tailwind CSS v3 + shadcn/ui (slate 테마) |
| 상태관리 | zustand |
| 라우팅 | react-router-dom v6 |
| HTTP | axios (interceptor로 Authorization 헤더 자동 주입) |
| 폰트 | Pretendard |
| API Mock | MSW 2.x |

---

## 프로젝트 구조

```
some-cleaner/
├── src/
│   ├── api/
│   │   ├── client.ts         # axios 인스턴스 (baseURL, Authorization 헤더)
│   │   ├── auth.ts           # POST /api/auth/login, GET /api/auth/me
│   │   ├── disks.ts          # GET /api/disks/
│   │   └── process.ts        # GET /api/process/, POST /api/process/
│   ├── components/
│   │   ├── disk/
│   │   │   ├── DiskCard.tsx           # 카드형 디스크 뷰 (사용량 프로그레스바 + 설정/삭제 버튼)
│   │   │   ├── DiskListItem.tsx       # 리스트형 디스크 뷰
│   │   │   └── DeleteConfirmModal.tsx # 삭제 등록 전 설정 확인 모달
│   │   ├── layout/
│   │   │   └── AppLayout.tsx  # 헤더 (사용자명 + 로그아웃) + 사이드 네비
│   │   ├── process/
│   │   │   └── PathInput.tsx  # 다중 경로/이메일 입력 컴포넌트
│   │   └── ui/               # shadcn/ui 컴포넌트
│   ├── lib/
│   │   └── utils.ts          # cn() 유틸 (tailwind-merge + clsx)
│   ├── mocks/
│   │   ├── handlers.ts       # MSW API 핸들러
│   │   └── browser.ts        # MSW worker 설정
│   ├── pages/
│   │   ├── LoginPage.tsx       # ID/PW 로그인 (mock) / SSO redirect (production)
│   │   ├── DashboardPage.tsx   # 디스크 목록 (카드/리스트 토글) + 삭제 확인 모달
│   │   ├── DeleteProcessPage.tsx # 삭제 프로세스 등록 폼
│   │   └── HistoryPage.tsx     # 삭제 작업 이력 테이블
│   ├── store/
│   │   ├── useAuthStore.ts     # 로그인 토큰 + 사용자 정보
│   │   ├── useDiskStore.ts     # 디스크 목록
│   │   ├── useDiskConfigStore.ts # 디스크별 설정 (로컬 상태, API 아님)
│   │   └── useProcessStore.ts  # 삭제 프로세스 목록 + 생성
│   ├── types/
│   │   └── index.ts            # User, Disk, DiskConfig, DeleteProcess
│   ├── router.tsx              # createBrowserRouter 라우팅 설정
│   ├── main.tsx                # MSW 조건부 초기화 후 렌더
│   ├── index.css               # Tailwind + shadcn CSS 변수 + Pretendard
│   └── vite-env.d.ts           # VITE_USE_MOCK, VITE_API_URL 타입
├── public/
│   └── mockServiceWorker.js  # MSW service worker
├── .env.development          # VITE_USE_MOCK=true, VITE_API_URL=http://localhost:8000
├── .env.production           # gitignore됨, 사내에서 직접 생성
├── copy-to-internal.ps1      # 사내 이전용 파일 복사 스크립트 (Windows)
├── components.json           # shadcn/ui 설정
├── tailwind.config.ts        # shadcn CSS 변수 연동
├── vite.config.ts            # base: process.env.VITE_BASE ?? '/'
└── 개발환경-안내.md            # 전체 개발/이전 가이드
```

---

## 환경변수

| 변수 | 사외 값 | 사내 값 | 설명 |
|------|---------|---------|------|
| `VITE_USE_MOCK` | `true` | `false` | MSW 활성화 여부 |
| `VITE_API_URL` | `http://localhost:8000` | 실제 Django URL | Django API base URL |
| `VITE_BASE` | 미설정 (`/`) | 미설정 (`/`) | GitHub Pages 배포 시만 `/some-cleaner/` |

---

## 라우팅

| 경로 | 페이지 | 비고 |
|------|--------|------|
| `/login` | LoginPage | 인증 불필요 |
| `/` | → `/dashboard` redirect | |
| `/dashboard` | DashboardPage | RequireAuth |
| `/process/new?diskId=:id` | DeleteProcessPage | RequireAuth |
| `/history` | HistoryPage | RequireAuth |
| `*` | → `/dashboard` redirect | |

`RequireAuth` — `useAuthStore.isAuthenticated`가 false면 `/login` 리다이렉트.

---

## MSW Mock 핸들러

```ts
POST /api/auth/login    → { token, user }
GET  /api/auth/me       → User
GET  /api/disks/        → Disk[]
GET  /api/process/      → DeleteProcess[]
POST /api/process/      → DeleteProcess (status: 'pending', 201)
```

---

## 주요 타입

```ts
interface Disk {
  id: number; name: string; mountPath: string
  server: string; usedGB: number; quotaGB: number
}

interface DiskConfig {          // 로컬 zustand 상태 (API 아님)
  diskId: number; diskName: string
  internalPaths: string[]; externalPaths: string[]
  toEmails: string[]; ccEmails: string[]
}

interface DeleteProcess {
  id: number; diskId: number; diskName: string
  internalPaths: string[]; externalPaths: string[]
  toEmails: string[]; ccEmails: string[]
  createdBy: string; createdAt: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  executedAt?: string; message?: string
}
```

---

## 인증 (SSO)

사내는 AD SSO 통합 로그인. Django DRF에 SSO 연동 API 존재.

| 환경 | 동작 |
|------|------|
| 사외 (`VITE_USE_MOCK=true`) | ID/PW 폼 → MSW mock 토큰 반환 |
| 사내 (`VITE_USE_MOCK=false`) | SSO 페이지로 redirect → 콜백으로 토큰 수신 |

---

## PathInput 컴포넌트 동작

`src/components/process/PathInput.tsx` — 경로와 이메일 모두에 사용.

- **Enter** → 현재 입력값을 배열에 추가
- **붙여넣기** → `\n` 기준 split → 빈 줄/중복 제거 후 일괄 추가
- **개별 ×** → 해당 항목 제거
- **전체 삭제** → 배열 초기화
- props: `value: string[]`, `onChange: (paths: string[]) => void`, `label?: string`, `placeholder?: string`

---

## 대시보드 흐름

1. **설정 버튼** → `/process/new?diskId=:id` 이동 → PathInput으로 경로/이메일 입력 → `useDiskConfigStore`에 저장 → `/dashboard` 복귀
2. **삭제 버튼** (설정 없으면 disabled) → `DeleteConfirmModal` 열림 → 저장된 설정 표시 → 확인 → `POST /api/process/` → `/history` 이동
3. 카드형/리스트형 토글 (LayoutGrid / List 아이콘)

---

## 구현 완료 상태

- [x] Vite + React + TS 프로젝트 초기화
- [x] Tailwind CSS v3 + shadcn/ui 설정
- [x] MSW 2.x 설정
- [x] 환경변수 구조
- [x] GitHub Pages 자동 배포 (GitHub Actions)
- [x] 사내 이전 스크립트 (`copy-to-internal.ps1`)
- [x] Docker + Nginx 빌드 검증
- [x] react-router-dom + RequireAuth guard
- [x] axios client (Authorization 헤더 자동 주입)
- [x] zustand stores (auth, disk, process, diskConfig)
- [x] LoginPage
- [x] AppLayout (헤더 + 네비)
- [x] DashboardPage (카드/리스트 토글, 설정/삭제 버튼, 삭제 확인 모달)
- [x] DeleteProcessPage (다중 경로/이메일 입력)
- [x] HistoryPage (삭제 이력 테이블 + 상태 badge)
- [x] MSW handlers (auth + disks + process API)
- [ ] Django DRF 백엔드 연동 (사내 배포 시)
- [ ] HistoryPage 상태 실시간 폴링

---

## 정책 관리

비즈니스 정책/규칙이 변경될 때마다 `POLICY.md`를 함께 업데이트할 것.

`POLICY.md`에서 관리하는 항목:
- 삭제 버튼 활성화 기준
- 이메일 vs 경로의 저장 방식 차이
- 프로세스 생성 흐름
- DB 테이블 역할 및 프론트엔드 필드 매핑

---

## 주의사항

- `vite.config.ts`의 `base`는 `process.env.VITE_BASE ?? '/'` 로 설정됨
  - GitHub Pages 배포 시 GitHub Actions에서 `VITE_BASE=/some-cleaner/` 주입
  - 로컬/Docker 빌드는 기본값 `/` 사용
- `.env.production`은 `.gitignore`에 포함 — 사내 PC에서 직접 생성
- shadcn 컴포넌트 추가: `npx shadcn@latest add [component]`
- `useDiskConfigStore`는 API 없이 브라우저 메모리에만 저장됨 (새로고침 시 초기화)
