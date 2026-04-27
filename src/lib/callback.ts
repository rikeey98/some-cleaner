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

  // 운영 환경은 HttpOnly access_token이 실린 /openid/me 응답만 신뢰한다.
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
