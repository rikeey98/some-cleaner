# Some Cleaner — 프로젝트 컨텍스트

## 앱 목적

사내 Linux 서버의 디스크 용량 관리 웹 앱.

- 사용자가 파일 삭제 스크립트의 **아규먼트(경로 등)를 입력**해서 DB에 등록
- 사내 서버에서 **데몬**이 주기적으로 DB를 읽어 스크립트를 실행
- DB의 **한 row = 한 번의 삭제 작업** (재활용 없음, 매번 새로 등록)
- 스크립트 상태: `pending → running → completed / failed`
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
| 차트 | recharts |
| 폰트 | Pretendard |
| API Mock | MSW 2.x |
| 라우팅 | react-router-dom (미설치, 다음 단계) |
| HTTP | axios (미설치, 다음 단계) |

---

## 프로젝트 구조

```
some-cleaner/
├── src/
│   ├── components/ui/        # shadcn/ui 컴포넌트 (npx shadcn add로 추가)
│   ├── hooks/                # 커스텀 훅
│   ├── lib/
│   │   └── utils.ts          # cn() 유틸 (tailwind-merge + clsx)
│   ├── mocks/
│   │   ├── handlers.ts       # MSW API 핸들러 (VITE_API_URL 기준)
│   │   └── browser.ts        # MSW worker 설정
│   ├── store/                # zustand store (미구현)
│   ├── types/                # 타입 정의 (미구현)
│   ├── App.tsx               # 현재 placeholder UI
│   ├── main.tsx              # MSW 조건부 초기화 후 렌더
│   ├── index.css             # Tailwind + shadcn CSS 변수 + Pretendard
│   └── vite-env.d.ts         # VITE_USE_MOCK, VITE_API_URL 타입
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

## MSW Mock 구조

`VITE_USE_MOCK=true` 일 때 MSW가 모든 API 요청을 가로챔.

```ts
// src/mocks/handlers.ts
// BASE_URL = import.meta.env.VITE_API_URL

handlers = [
  http.get(`${BASE_URL}/api/health`, ...),
  // 앞으로 추가할 핸들러들:
  // POST /api/auth/login
  // GET  /api/auth/me
  // GET  /api/scripts/
  // POST /api/scripts/
]
```

`src/main.tsx`에서 `VITE_USE_MOCK=true`이면 `worker.start()` 후 React 렌더.
worker.start() 실패해도 `.catch(render)` 로 앱은 항상 렌더됨.

---

## 인증 (SSO)

사내는 AD SSO 통합 로그인. Django DRF에 SSO 연동 API 존재.

| 환경 | 동작 |
|------|------|
| 사외 (`VITE_USE_MOCK=true`) | 간단한 ID/PW 폼 → MSW mock 토큰 반환 |
| 사내 (`VITE_USE_MOCK=false`) | SSO 페이지로 redirect → 콜백으로 토큰 수신 |

---

## 구현 현재 상태

- [x] Vite + React + TS 프로젝트 초기화
- [x] Tailwind CSS v3 + shadcn/ui 설정
- [x] MSW 2.x 설정 (service worker URL, catch fallback)
- [x] 환경변수 구조 (`VITE_USE_MOCK`, `VITE_API_URL`, `VITE_BASE`)
- [x] GitHub Pages 자동 배포 (GitHub Actions)
- [x] 사내 이전 스크립트 (`copy-to-internal.ps1`)
- [x] Docker + Nginx 빌드 검증 (K8s 배포 확인)
- [ ] react-router-dom 설치 및 라우팅 설정
- [ ] axios client 설정 (Authorization 헤더 자동 주입)
- [ ] zustand auth store
- [ ] LoginPage (mock 폼 / SSO redirect 분기)
- [ ] AppLayout (헤더 + 로그아웃)
- [ ] ScriptsPage (스크립트 목록 테이블 + 상태 badge)
- [ ] ScriptNewPage (스크립트 등록 폼)
- [ ] MSW handlers 확장 (auth + scripts API)
- [ ] 인증 guard (미로그인 시 /login redirect)

---

## 다음 구현 순서

```
1. npm install react-router-dom axios
2. npx shadcn@latest add button input label badge table card
3. src/router.tsx 라우팅 설정
4. src/api/client.ts — axios 인스턴스
5. src/store/useAuthStore.ts
6. src/mocks/handlers.ts — auth + scripts 핸들러 추가
7. src/pages/LoginPage.tsx
8. src/components/layout/AppLayout.tsx
9. src/pages/ScriptsPage.tsx
10. src/pages/ScriptNewPage.tsx
```

---

## 스크립트 데이터 구조 (예상)

```ts
interface Script {
  id: number
  internalPath: string      // 삭제할 파일의 내부 경로
  externalPath: string      // 외부 경로 (아카이브 등)
  createdBy: string         // 등록한 사용자
  createdAt: string         // ISO 8601
  status: 'pending' | 'running' | 'completed' | 'failed'
  executedAt?: string       // 실행 시각
  message?: string          // 실패 시 에러 메시지
}
```

> Django DRF API 스펙 확정 후 실제 필드명으로 수정 필요

---

## 주의사항

- `vite.config.ts`의 `base`는 `process.env.VITE_BASE ?? '/'` 로 설정됨
  - GitHub Pages 배포 시 GitHub Actions에서 `VITE_BASE=/some-cleaner/` 주입
  - 로컬/Docker 빌드는 기본값 `/` 사용 (별도 설정 불필요)
- `.env.production`은 `.gitignore`에 포함 — 사내 PC에서 직접 생성
- shadcn 컴포넌트 추가: `npx shadcn@latest add [component]`
