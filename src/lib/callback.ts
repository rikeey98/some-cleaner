import { handleSsoCallback } from '@/lib/sso'
import { useAuthStore } from '@/store/useAuthStore'

class SsoCallbackHandler {
  private authStore = useAuthStore.getState()

  constructor() {
    this.init()
  }

  private getCookie(name: string): string | null {
    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) return parts.pop()?.split(';').shift() || null
    return null
  }

  private async init() {
    const isMock = import.meta.env.VITE_USE_MOCK === 'true'
    if (isMock) {
      return 
    }

    const result = handleSsoCallback()
    if (result.ok) {
      const userId = this.getCookie('userID')
      const token = this.getCookie('token')

      if (userId && token) {
        this.authStore.login(token, {id: userId, name: String(userId), email:`${userId}@samsung.com`})
        window.location.href = result.redirectPath
      }
    }
  }
}

export function initSsoCallback() {
  new SsoCallbackHandler()
}
