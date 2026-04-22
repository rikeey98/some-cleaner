import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

async function enableMocking() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') return
  const { worker } = await import('./mocks/browser')
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: `${import.meta.env.BASE_URL}mockServiceWorker.js` },
  })
}

async function handleSso() {
  if (import.meta.env.VITE_USE_MOCK === 'true') return
  const { initSsoCallback } = await import('@/lib/callback')
  await initSsoCallback()
}

async function init() {
  await enableMocking()
  await handleSso()   // React 렌더링 전에 SSO 인증 처리 완료

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

init().catch(console.error)
