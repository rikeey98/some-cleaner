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

function initSsoCallback() {
  if (import.meta.env.VITE_USE_MOCK !== 'true') {
    import('@/lib/callback').then(({ initSsoCallback }) => {
      initSsoCallback()
    }).catch(() => {
      console.log('No SSO callback initialization needed')
    })
  }
}

function render() {
  initSsoCallback()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

enableMocking().then(render).catch(render)
