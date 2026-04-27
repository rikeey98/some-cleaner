import { handleSsoCallback } from '@/lib/sso'
import { useAuthStore } from '@/store/useAuthStore'
import { getMe } from '@/api/auth'
import { authDebugError, authDebugLog, getAuthDebugSnapshot, toAuthDebugError } from '@/lib/authDebug'

export async function initSsoCallback(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCK === 'true') return

  authDebugLog('callback', 'initSsoCallback:start', getAuthDebugSnapshot())
  const result = handleSsoCallback()
  if (!result.ok) {
    authDebugLog('callback', 'initSsoCallback:skip', getAuthDebugSnapshot({ reason: result.message }))
    return
  }

  if (result.userId && result.token) {
    // non-HttpOnly 쿠키: 직접 읽어서 로그인
    authDebugLog('callback', 'initSsoCallback:using visible cookies', getAuthDebugSnapshot({ redirectPath: result.redirectPath }))
    useAuthStore.getState().login(result.token, {
      id: result.userId,
      name: String(result.userId),
      email: `${result.userId}@samsung.com`,
    })
    return
  }

  // HttpOnly 쿠키: 브라우저가 자동으로 쿠키를 포함해 API 호출
  try {
    authDebugLog('callback', 'initSsoCallback:calling getMe', getAuthDebugSnapshot({ redirectPath: result.redirectPath }))
    const { data: user } = await getMe()
    useAuthStore.getState().setUserFromSession(user)
    authDebugLog('callback', 'initSsoCallback:getMe success', getAuthDebugSnapshot({ userId: user.id }))
  } catch (error) {
    // 세션 쿠키도 없거나 만료됨
    authDebugError('callback', 'initSsoCallback:getMe failed', {
      ...toAuthDebugError(error),
      snapshot: getAuthDebugSnapshot(),
    })
  }
}
