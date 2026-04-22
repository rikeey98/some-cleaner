import { handleSsoCallback } from '@/lib/sso'
import { useAuthStore } from '@/store/useAuthStore'

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

export async function initSsoCallback(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCK === 'true') return

  const result = handleSsoCallback()
  if (!result.ok) return

  const userId = getCookie('userID')
  const token = getCookie('token')

  if (userId && token) {
    useAuthStore.getState().login(token, {
      id: userId,
      name: String(userId),
      email: `${userId}@samsung.com`,
    })
    // Django가 이미 toPath로 리다이렉트했으므로 추가 navigation 불필요
  }
}
