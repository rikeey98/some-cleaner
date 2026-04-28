import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Disk } from '@/types'

interface DiskCardProps {
  disk: Disk
  onOpenForm: (disk: Disk) => void
}

export default function DiskCard({ disk, onOpenForm }: DiskCardProps) {
  const usagePercent = Math.round(disk.usage)
  const barColor =
    usagePercent >= 90 ? 'bg-destructive' :
    usagePercent >= 70 ? 'bg-yellow-500' :
    'bg-primary'
  const alertLabel = disk.alert === 'y' ? '경고 대상' : '정상'

  return (
    <div className="border rounded-lg p-4 space-y-3 bg-card">
      <div>
        <p className="font-medium text-sm">{disk.name}</p>
        <p className="text-xs text-muted-foreground">프로젝트: {disk.project || '-'}</p>
        <p className="text-xs text-muted-foreground">상태: {alertLabel}</p>
      </div>

      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{usagePercent}% 사용 중</span>
          <span>임계값 {disk.threshold}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${usagePercent}%` }} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="destructive"
          className="flex-1"
          onClick={() => onOpenForm(disk)}
        >
          삭제 등록
        </Button>
      </div>
    </div>
  )
}
