import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useScriptStore } from '@/store/useScriptStore'
import type { Script } from '@/types'

const statusConfig: Record<Script['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending:   { label: '대기중',  variant: 'secondary' },
  running:   { label: '실행중',  variant: 'default' },
  completed: { label: '완료',    variant: 'outline' },
  failed:    { label: '실패',    variant: 'destructive' },
}

export default function ScriptsPage() {
  const navigate = useNavigate()
  const { scripts, isLoading, fetchScripts } = useScriptStore()

  useEffect(() => { fetchScripts() }, [fetchScripts])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">스크립트 목록</h1>
        <Button onClick={() => navigate('/scripts/new')}>+ 스크립트 등록</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">불러오는 중...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>내부 경로</TableHead>
              <TableHead>외부 경로</TableHead>
              <TableHead>등록자</TableHead>
              <TableHead>등록일시</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scripts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  등록된 스크립트가 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              scripts.map((script) => (
                <TableRow key={script.id}>
                  <TableCell>{script.id}</TableCell>
                  <TableCell className="font-mono text-sm">{script.internalPath}</TableCell>
                  <TableCell className="font-mono text-sm">{script.externalPath}</TableCell>
                  <TableCell>{script.createdBy}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(script.createdAt).toLocaleString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[script.status].variant}>
                      {statusConfig[script.status].label}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
