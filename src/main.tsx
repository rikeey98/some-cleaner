import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { authDebugError, authDebugLog, getAuthDebugSnapshot, initAuthDebugTools, toAuthDebugError } from '@/lib/authDebug'

async function enableMocking() {
  authDebugLog('main', 'enableMocking:start', getAuthDebugSnapshot())
  if (import.meta.env.VITE_USE_MOCK !== 'true') {
    authDebugLog('main', 'enableMocking:skip', { reason: 'VITE_USE_MOCK is not true' })
    return
  }
  const { worker } = await import('./mocks/browser')
  const result = await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })
  authDebugLog('main', 'enableMocking:done', { serviceWorkerUrl: `${import.meta.env.BASE_URL}mockServiceWorker.js` })
  return result
}

async function handleSso() {
  authDebugLog('main', 'handleSso:start', getAuthDebugSnapshot())
  if (import.meta.env.VITE_USE_MOCK === 'true') {
    authDebugLog('main', 'handleSso:skip', { reason: 'mock mode enabled' })
    return
  }
  const { initSsoCallback } = await import('@/lib/callback')
  await initSsoCallback()
  authDebugLog('main', 'handleSso:done', getAuthDebugSnapshot())
}

async function init() {
  initAuthDebugTools()
  authDebugLog('main', 'init:start', getAuthDebugSnapshot())
  await enableMocking()
  await handleSso()   // React 렌더링 전에 SSO 인증 처리 완료

  authDebugLog('main', 'init:render', getAuthDebugSnapshot())
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

init().catch((error) => {
  authDebugError('main', 'init:failed', toAuthDebugError(error))
  console.error(error)
})
