const SSO_URL = 'https://at-dev.samsungds.net/openid/sso/?sso'
const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1'])

function setCookie(name: string, value: string, domain: string) {
  const expires = new Date(Date.now() + 5 * 60 *1000)
  document.cookie = [
    `${name}=${value}`,
    `Domain=${domain}`,
    `Path=/`,
    'SameSite=None',
    'Secure',
    `Expires=${expires.toUTCString()}`,
  ].join('; ')
}

function getCurrentPath() {
  return `${window.location.pathname}${window.location.search}${window.location.hash}` || '/'
}

function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}

function clearPathCookies(domain: string) {
  const cookies = ['fromPath', 'toPath']
  cookies.forEach((name) => {
    document.cookie = [
      `${name}=`,
      `Domain=${domain}`,
      'Path=/',
      'Max-Age=0',
      'SameSite=None',
      'Secure',
    ].join('; ')
  })
}

export function startSsoLogin(toPath = '/dashboard') {
  const hostname = window.location.hostname
  const cookieDomain = (import.meta.env.VITE_COOKIE_DOMAIN ?? '').trim()

  if (LOCAL_HOSTS.has(hostname)) {
    return {
      ok: false as const,
      message: '로컬 환경에서는 사내 SSO를 지원하지 않습니다. VITE_USE_MOCK=true로 실행해주세요.',
    }
  }

  if (!cookieDomain) {
    return {
      ok: false as const,
      message: 'SSO 설정이 올바르지 않습니다. VITE_COOKIE_DOMAIN이 필요합니다.',
    }
  }

  const normalizedDomain = cookieDomain.replace(/^\./, '')
  if (!hostname.endsWith(normalizedDomain)) {
    return {
      ok: false as const,
      message: `현재 호스트(${hostname})에서는 ${cookieDomain} 쿠키 도메인을 사용할 수 없습니다.`,
    }
  }

  setCookie('fromPath', getCurrentPath(), cookieDomain)
  setCookie('toPath', toPath, cookieDomain)
  window.location.href = SSO_URL

  return { ok: true as const }
}

export function handleSsoCallback() {
  const userId = getCookie('userID')
  const token = getCookie('token')
  const toPath = getCookie('toPath')
  const cookieDomain = (import.meta.env.VITE_COOKIE_DOMAIN ?? '').trim()

  if (userId && token) {
    clearPathCookies(cookieDomain)
    return {
      ok: true as const,
      redirectPath: toPath || '/dashboard',
    }
  }

  return {
    ok: false as const,
    message: 'SSO 인증 정보를 찾을 수 없습니다.',
  }
}
