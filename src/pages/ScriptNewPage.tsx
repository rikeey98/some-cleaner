import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useScriptStore } from '@/store/useScriptStore'

export default function ScriptNewPage() {
  const navigate = useNavigate()
  const createScript = useScriptStore((s) => s.createScript)
  const [internalPath, setInternalPath] = useState('')
  const [externalPath, setExternalPath] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      await createScript({ internalPath, externalPath })
      navigate('/scripts')
    } catch {
      setError('등록에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-lg">
      <h1 className="text-xl font-bold mb-4">스크립트 등록</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">삭제 작업 정보 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="internalPath">내부 경로 (Internal Path)</Label>
              <Input
                id="internalPath"
                value={internalPath}
                onChange={(e) => setInternalPath(e.target.value)}
                placeholder="/data/logs/2024"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="externalPath">외부 경로 (External Path)</Label>
              <Input
                id="externalPath"
                value={externalPath}
                onChange={(e) => setExternalPath(e.target.value)}
                placeholder="/archive/logs/2024"
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '등록 중...' : '등록'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/scripts')}>
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
