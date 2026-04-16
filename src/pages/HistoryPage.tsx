import { useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useProcessStore } from '@/store/useProcessStore'
import type { DeleteProcess } from '@/types'

const statusConfig: Record<DeleteProcess['status'], { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending:   { label: '대기중', variant: 'secondary' },
  running:   { label: '실행중', variant: 'default' },
  completed: { label: '완료',   variant: 'outline' },
  failed:    { label: '실패',   variant: 'destructive' },
}

export default function HistoryPage() {
  const { processes, isLoading, fetchProcesses } = useProcessStore()

  useEffect(() => { fetchProcesses() }, [fetchProcesses])

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">처리 내역</h1>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">불러오는 중...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>디스크</TableHead>
              <TableHead>내부 경로</TableHead>
              <TableHead>외부 경로</TableHead>
              <TableHead>등록자</TableHead>
              <TableHead>등록일시</TableHead>
              <TableHead>상태</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground">
                  처리 내역이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              processes.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>{p.id}</TableCell>
                  <TableCell className="font-medium">{p.diskName}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {p.internalPaths.map((path) => <div key={path}>{path}</div>)}
                  </TableCell>
                  <TableCell className="font-mono text-xs">
                    {p.externalPaths.map((path) => <div key={path}>{path}</div>)}
                  </TableCell>
                  <TableCell>{p.createdBy}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(p.createdAt).toLocaleString('ko-KR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusConfig[p.status].variant}>
                      {statusConfig[p.status].label}
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
