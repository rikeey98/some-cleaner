import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import ScriptsPage from '@/pages/ScriptsPage'
import ScriptNewPage from '@/pages/ScriptNewPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />
}

export const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <LoginPage />,
    },
    {
      path: '/',
      element: <RequireAuth><AppLayout /></RequireAuth>,
      children: [
        { index: true, element: <Navigate to="/scripts" replace /> },
        { path: 'scripts', element: <ScriptsPage /> },
        { path: 'scripts/new', element: <ScriptNewPage /> },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
)
