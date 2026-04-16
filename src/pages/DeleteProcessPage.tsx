import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PathInput from '@/components/process/PathInput'
import { useDiskStore } from '@/store/useDiskStore'
import { useDiskConfigStore } from '@/store/useDiskConfigStore'

export default function DeleteProcessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const diskId = Number(searchParams.get('diskId'))

  const { disks, fetchDisks } = useDiskStore()
  const { getConfig, setConfig } = useDiskConfigStore()

  const disk = disks.find((d) => d.id === diskId)
  const saved = getConfig(diskId)

  const [internalPaths, setInternalPaths] = useState<string[]>(saved?.internalPaths ?? [])
  const [externalPaths, setExternalPaths] = useState<string[]>(saved?.externalPaths ?? [])
  const [toEmails, setToEmails] = useState<string[]>(saved?.toEmails ?? [])
  const [ccEmails, setCcEmails] = useState<string[]>(saved?.ccEmails ?? [])
  const [error, setError] = useState('')

  useEffect(() => {
    if (disks.length === 0) fetchDisks()
  }, [disks.length, fetchDisks])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (internalPaths.length === 0) { setError('내부 경로를 하나 이상 입력해주세요.'); return }
    if (externalPaths.length === 0) { setError('외부 경로를 하나 이상 입력해주세요.'); return }
    if (toEmails.length === 0) { setError('수신자 이메일을 하나 이상 입력해주세요.'); return }

    setConfig(diskId, {
      diskId,
      diskName: disk?.name ?? '',
      internalPaths,
      externalPaths,
      toEmails,
      ccEmails,
    })
    navigate('/dashboard')
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-bold">삭제 설정</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">삭제 작업 정보 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <Label>디스크</Label>
              <Input
                value={disk ? `${disk.name} (${disk.mountPath})` : '불러오는 중...'}
                readOnly
                className="bg-muted"
              />
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

            <PathInput
              label="완료 메일 수신자 (To)"
              value={toEmails}
              onChange={setToEmails}
              placeholder="recipient@company.com"
            />

            <PathInput
              label="CC (선택)"
              value={ccEmails}
              onChange={setCcEmails}
              placeholder="cc@company.com"
            />

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-2">
              <Button type="submit">설정 저장</Button>
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
