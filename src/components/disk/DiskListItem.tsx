import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Disk } from '@/types'

interface DiskListItemProps {
  disk: Disk
  onOpenForm: (disk: Disk) => void
}

export default function DiskListItem({ disk, onOpenForm }: DiskListItemProps) {
  const usagePercent = Math.round(disk.usage)
  const barColor =
    usagePercent >= 90 ? 'bg-destructive' :
    usagePercent >= 70 ? 'bg-yellow-500' :
    'bg-primary'
  const alertLabel = disk.alert === 'y' ? '경고 대상' : '정상'

  return (
    <div className="border rounded-lg px-4 py-3 flex items-center gap-4 bg-card">
      <div className="w-40 shrink-0">
        <p className="font-medium text-sm">{disk.name}</p>
        <p className="text-xs text-muted-foreground">{disk.project || '-'}</p>
      </div>

      <p className="text-xs text-muted-foreground w-28 shrink-0">{alertLabel}</p>

      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>{usagePercent}%</span>
          <span>임계값 {disk.threshold}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div className={cn('h-full rounded-full transition-all', barColor)} style={{ width: `${usagePercent}%` }} />
        </div>
      </div>

      <div className="flex gap-2 shrink-0">
        <Button
          size="sm"
          variant="destructive"
          onClick={() => onOpenForm(disk)}
        >
          삭제 등록
        </Button>
      </div>
    </div>
  )
}
