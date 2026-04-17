import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { login } from '@/api/auth'
import { startSsoLogin } from '@/lib/sso'
import { useAuthStore } from '@/store/useAuthStore'

const isMock = import.meta.env.VITE_USE_MOCK === 'true'

export default function LoginPage() {
  const navigate = useNavigate()
  const loginStore = useAuthStore((s) => s.login)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleMockLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const { data } = await login(username, password)
      loginStore(data.token, data.user)
      navigate('/dashboard')
    } catch {
      setError('로그인에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSsoLogin = () => {
    setError('')
    const result = startSsoLogin('/dashboard')
    if (!result.ok) setError(result.message)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Some Cleaner</CardTitle>
          <CardDescription>디스크 용량 관리 시스템</CardDescription>
        </CardHeader>
        <CardContent>
          {isMock ? (
            <form onSubmit={handleMockLogin} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="username">사번</Label>
                <Input
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="사번 입력"
                  required
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  required
                />
              </div>
              {error && <p className="text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? '로그인 중...' : '로그인 (개발용)'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4">
              <Button className="w-full" type="button" onClick={handleSsoLogin}>
                사내 SSO 로그인
              </Button>
              {error && <p className="text-sm text-destructive">{error}</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
