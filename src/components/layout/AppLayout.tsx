import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/useAuthStore'

export default function AppLayout() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <span className="font-bold text-foreground">Some Cleaner</span>
            <nav className="flex gap-4 text-sm">
              <NavLink
                to="/scripts"
                className={({ isActive }) =>
                  isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                }
              >
                스크립트 목록
              </NavLink>
              <NavLink
                to="/scripts/new"
                className={({ isActive }) =>
                  isActive ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
                }
              >
                스크립트 등록
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center gap-3">
            {user && <span className="text-sm text-muted-foreground">{user.name}</span>}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              로그아웃
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
