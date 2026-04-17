import { useEffect, useState } from 'react'
import axios from 'axios'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import PathInput from '@/components/process/PathInput'
import { getLatestProcessInput } from '@/api/process'
import { useDiskStore } from '@/store/useDiskStore'
import { useProcessStore } from '@/store/useProcessStore'

export default function DeleteProcessPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const diskId = Number(searchParams.get('diskId'))

  const { disks, fetchDisks } = useDiskStore()
  const createProcess = useProcessStore((s) => s.createProcess)

  const disk = disks.find((d) => d.id === diskId)

  const [internalPaths, setInternalPaths] = useState<string[]>([])
  const [externalPaths, setExternalPaths] = useState<string[]>([])
  const [toEmails, setToEmails] = useState<string[]>([])
  const [ccEmails, setCcEmails] = useState<string[]>([])
  const [error, setError] = useState('')
  const [isLoadingDefaults, setIsLoadingDefaults] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (disks.length === 0) fetchDisks()
  }, [disks.length, fetchDisks])

  useEffect(() => {
    let cancelled = false

    if (!Number.isFinite(diskId) || diskId <= 0) {
      setError('유효하지 않은 디스크입니다.')
      setIsLoadingDefaults(false)
      return () => {
        cancelled = true
      }
    }

    setIsLoadingDefaults(true)
    setError('')

    void getLatestProcessInput(diskId)
      .then((latest) => {
        if (cancelled) return
        setInternalPaths(latest.internalPaths)
        setExternalPaths(latest.externalPaths)
        setToEmails(latest.toEmails)
        setCcEmails(latest.ccEmails)
      })
      .catch((err: unknown) => {
        if (cancelled) return

        if (axios.isAxiosError(err) && err.response?.status === 404) {
          setInternalPaths([])
          setExternalPaths([])
          setToEmails([])
          setCcEmails([])
          setError('')
          return
        }

        setError('이전 설정을 불러오지 못했습니다. 직접 입력 후 등록해주세요.')
      })
      .finally(() => {
        if (!cancelled) setIsLoadingDefaults(false)
      })

    return () => {
      cancelled = true
    }
  }, [diskId])

  const handleSubmit = async () => {
    setError('')

    if (!disk) {
      setError('디스크 정보를 불러오는 중입니다.')
      return
    }

    if (internalPaths.length === 0) { setError('내부 경로를 하나 이상 입력해주세요.'); return }
    if (externalPaths.length === 0) { setError('외부 경로를 하나 이상 입력해주세요.'); return }
    if (toEmails.length === 0) { setError('수신자 이메일을 하나 이상 입력해주세요.'); return }

    setIsSubmitting(true)
    try {
      await createProcess({
        diskId,
        diskName: disk.name,
        internalPaths,
        externalPaths,
        toEmails,
        ccEmails,
      })
      navigate('/history')
    } catch {
      setError('삭제 등록에 실패했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-xl font-bold">삭제 등록</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">삭제 작업 정보 입력</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-1">
              <Label>디스크</Label>
              <Input
                value={disk ? `${disk.name} (${disk.mountPath})` : '불러오는 중...'}
                readOnly
                className="bg-muted"
              />
            </div>

            {isLoadingDefaults && (
              <p className="text-sm text-muted-foreground">
                마지막 실행값을 불러오는 중입니다. 이전 이력이 없으면 빈값으로 시작합니다.
              </p>
            )}

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
              <Button type="button" onClick={handleSubmit} disabled={isSubmitting || isLoadingDefaults}>
                {isSubmitting ? '등록 중...' : '삭제 등록'}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')} disabled={isSubmitting}>
                취소
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
