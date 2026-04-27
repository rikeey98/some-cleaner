import axios from 'axios'

const AUTH_DEBUG_STORAGE_KEY = 'some-cleaner:auth-debug'
const ENABLED_VALUES = new Set(['1', 'true', 'on'])
const DISABLED_VALUES = new Set(['0', 'false', 'off'])

let didSyncQueryFlag = false
let didInitAuthDebugTools = false

function safeLocalStorageGet(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function safeLocalStorageSet(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // ignore storage failures in debug helper
  }
}

function safeLocalStorageRemove(key: string) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // ignore storage failures in debug helper
  }
}

function getVisibleCookieNames(): string[] {
  if (typeof document === 'undefined' || !document.cookie) return []

  return document.cookie
    .split(';')
    .map((chunk) => chunk.trim().split('=')[0])
    .filter(Boolean)
}

function syncAuthDebugFlagFromQuery() {
  if (didSyncQueryFlag || typeof window === 'undefined') return

  didSyncQueryFlag = true

  const value = new URLSearchParams(window.location.search).get('authDebug')
  if (!value) return

  const normalized = value.toLowerCase()
  if (ENABLED_VALUES.has(normalized)) {
    safeLocalStorageSet(AUTH_DEBUG_STORAGE_KEY, '1')
  } else if (DISABLED_VALUES.has(normalized)) {
    safeLocalStorageRemove(AUTH_DEBUG_STORAGE_KEY)
  }
}

export function isAuthDebugEnabled(): boolean {
  syncAuthDebugFlagFromQuery()
  if (typeof window === 'undefined') return false
  return safeLocalStorageGet(AUTH_DEBUG_STORAGE_KEY) === '1'
}

export function setAuthDebug(enabled: boolean) {
  if (typeof window === 'undefined') return

  if (enabled) {
    safeLocalStorageSet(AUTH_DEBUG_STORAGE_KEY, '1')
  } else {
    safeLocalStorageRemove(AUTH_DEBUG_STORAGE_KEY)
  }
}

export function getAuthDebugSnapshot(extra?: Record<string, unknown>) {
  const visibleCookieNames = getVisibleCookieNames()

  return {
    href: typeof window !== 'undefined' ? window.location.href : '',
    baseUrl: import.meta.env.BASE_URL,
    apiUrl: import.meta.env.VITE_API_URL,
    useMock: import.meta.env.VITE_USE_MOCK,
    cookieDomain: import.meta.env.VITE_COOKIE_DOMAIN,
    hasLocalToken: typeof window !== 'undefined' ? Boolean(safeLocalStorageGet('token')) : false,
    visibleCookieNames,
    hasVisibleTokenCookie: visibleCookieNames.includes('token'),
    hasVisibleUserIdCookie: visibleCookieNames.includes('userID'),
    hasVisibleToPathCookie: visibleCookieNames.includes('toPath'),
    hasVisibleFromPathCookie: visibleCookieNames.includes('fromPath'),
    ...extra,
  }
}

export function toAuthDebugError(error: unknown): Record<string, unknown> {
  if (axios.isAxiosError(error)) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      status: error.response?.status,
      responseData: error.response?.data,
      requestUrl: error.config?.url,
      requestBaseUrl: error.config?.baseURL,
      withCredentials: error.config?.withCredentials,
    }
  }

  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
    }
  }

  return {
    value: error,
  }
}

export function authDebugLog(scope: string, message: string, details?: unknown) {
  if (!isAuthDebugEnabled()) return

  const prefix = `[AUTH DEBUG][${scope}] ${message}`
  if (details === undefined) {
    console.log(prefix)
    return
  }

  console.log(prefix, details)
}

export function authDebugWarn(scope: string, message: string, details?: unknown) {
  if (!isAuthDebugEnabled()) return

  const prefix = `[AUTH DEBUG][${scope}] ${message}`
  if (details === undefined) {
    console.warn(prefix)
    return
  }

  console.warn(prefix, details)
}

export function authDebugError(scope: string, message: string, details?: unknown) {
  if (!isAuthDebugEnabled()) return

  const prefix = `[AUTH DEBUG][${scope}] ${message}`
  if (details === undefined) {
    console.error(prefix)
    return
  }

  console.error(prefix, details)
}

export function initAuthDebugTools() {
  if (didInitAuthDebugTools || typeof window === 'undefined') return

  didInitAuthDebugTools = true
  syncAuthDebugFlagFromQuery()

  window.__setSomeCleanerAuthDebug = (enabled: boolean) => {
    setAuthDebug(enabled)
    console.info(`[AUTH DEBUG] ${enabled ? 'enabled' : 'disabled'}`)
  }

  window.__getSomeCleanerAuthDebug = () => isAuthDebugEnabled()

  authDebugLog('init', 'auth debug tools ready', getAuthDebugSnapshot())
}

declare global {
  interface Window {
    __setSomeCleanerAuthDebug?: (enabled: boolean) => void
    __getSomeCleanerAuthDebug?: () => boolean
  }
}
