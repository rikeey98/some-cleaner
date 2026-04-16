import { http, HttpResponse } from 'msw'

const BASE_URL = import.meta.env.VITE_API_BASE_URL

export const handlers = [
  // 예시 핸들러 — 실제 API 스펙에 맞게 수정하세요
  http.get(`${BASE_URL}/api/health`, () => {
    return HttpResponse.json({ status: 'ok' })
  }),
]
