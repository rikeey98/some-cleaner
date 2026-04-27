import axios from 'axios'
import { authDebugError, authDebugLog, getAuthDebugSnapshot, toAuthDebugError } from '@/lib/authDebug'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

function shouldLogAuthRequest(url?: string) {
  return Boolean(url && (url.includes('/openid/') || url.includes('/api/auth/')))
}

function buildRequestUrl(baseURL?: string, url?: string) {
  if (!url) return baseURL || ''
  if (/^https?:\/\//.test(url)) return url
  return `${baseURL || ''}${url}`
}

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`

  if (shouldLogAuthRequest(config.url)) {
    authDebugLog('api', 'request', {
      method: config.method?.toUpperCase() || 'GET',
      url: buildRequestUrl(config.baseURL, config.url),
      withCredentials: config.withCredentials ?? client.defaults.withCredentials ?? false,
      hasLocalToken: Boolean(token),
      snapshot: getAuthDebugSnapshot(),
    })
  }

  return config
})

client.interceptors.response.use(
  (response) => {
    if (shouldLogAuthRequest(response.config.url)) {
      authDebugLog('api', 'response', {
        method: response.config.method?.toUpperCase() || 'GET',
        url: buildRequestUrl(response.config.baseURL, response.config.url),
        status: response.status,
      })
    }

    return response
  },
  (error) => {
    if (shouldLogAuthRequest(error.config?.url)) {
      authDebugError('api', 'response error', {
        ...toAuthDebugError(error),
        method: error.config?.method?.toUpperCase() || 'GET',
        url: buildRequestUrl(error.config?.baseURL, error.config?.url),
        snapshot: getAuthDebugSnapshot(),
      })
    }

    return Promise.reject(error)
  },
)

export default client
