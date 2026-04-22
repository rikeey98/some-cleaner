import { handleSsoCallback } from '@/lib/sso'
import { useAuthStore } from '@/store/useAuthStore'
import { getMe } from '@/api/auth'

export async function initSsoCallback(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCK === 'true') return

  const result = handleSsoCallback()
  if (!result.ok) return

  if (result.userId && result.token) {
    // non-HttpOnly 쿠키: 직접 읽어서 로그인
    useAuthStore.getState().login(result.token, {
      id: result.userId,
      name: String(result.userId),
      email: `${result.userId}@samsung.com`,
    })
    return
  }

  // HttpOnly 쿠키: 브라우저가 자동으로 쿠키를 포함해 API 호출
  try {
    const { data: user } = await getMe()
    useAuthStore.getState().setUserFromSession(user)
  } catch {
    // 세션 쿠키도 없거나 만료됨
  }
}
