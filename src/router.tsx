import { createBrowserRouter, Navigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import AppLayout from '@/components/layout/AppLayout'
import LoginPage from '@/pages/LoginPage'
import DashboardPage from '@/pages/DashboardPage'
import DeleteProcessPage from '@/pages/DeleteProcessPage'
import HistoryPage from '@/pages/HistoryPage'

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
        { index: true, element: <Navigate to="/dashboard" replace /> },
        { path: 'dashboard', element: <DashboardPage /> },
        { path: 'process/new', element: <DeleteProcessPage /> },
        { path: 'history', element: <HistoryPage /> },
        { path: '*', element: <Navigate to="/dashboard" replace /> },
      ],
    },
    { path: '*', element: <Navigate to="/" replace /> },
  ],
  { basename: import.meta.env.BASE_URL },
)
