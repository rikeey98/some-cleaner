import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import PathInput from '@/components/process/PathInput'
import { useDiskStore } from '@/store/useDiskStore'
import { useProcessStore } from '@/store/useProcessStore'

export default function DeleteProcessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const diskId = Number(searchParams.get('diskId'))

  const { disks, fetchDisks } = useDiskStore()
  const createProcess = useProcessStore((s) => s.createProcess)

  const [internalPaths, setInternalPaths] = useState<string[]>([])
  const [externalPaths, setExternalPaths] = useState<string[]>([])
  const [toEmail, setToEmail] = useState('')
  const [ccEmail, setCcEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (disks.length === 0) fetchDisks()
  }, [disks.length, fetchDisks])

  const disk = disks.find((d) => d.id === diskId)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (internalPaths.length === 0) { setError('내부 경로를 하나 이상 입력해주세요.'); return }
    if (externalPaths.length === 0) { setError('외부 경로를 하나 이상 입력해주세요.'); return }
    setError('')
    setIsLoading(true)
    try {
      await createProcess({
        diskId,
        diskName: disk?.name ?? '',
        internalPaths,
        externalPaths,
        toEmail,
        ccEmail,
      })
      navigate('/history')
    } catch {
      setError('등록에 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-bold">삭제 프로세스 등록</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">삭제 작업 정보 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label>디스크</Label>
              <Input value={disk ? `${disk.name} (${disk.mountPath})` : '불러오는 중...'} readOnly className="bg-muted" />
            </div>

            <PathInput
              label="내부 경로 (Internal Path)"
              value={internalPaths}
              onChange={setInternalPaths}
              placeholder="/data/project1/logs"
            />

            <PathInput
              label="외부 경로 (External Path)"
              value={externalPaths}
              onChange={setExternalPaths}
              placeholder="/archive/project1/logs"
            />

            <div className="space-y-1">
              <Label htmlFor="toEmail">완료 메일 수신자 (To)</Label>
              <Input
                id="toEmail"
                type="email"
                value={toEmail}
                onChange={(e) => setToEmail(e.target.value)}
                placeholder="recipient@company.com"
                required
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="ccEmail">CC</Label>
              <Input
                id="ccEmail"
                type="email"
                value={ccEmail}
                onChange={(e) => setCcEmail(e.target.value)}
                placeholder="cc@company.com (선택)"
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? '등록 중...' : '등록'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                취소
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
