import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DiskCard from '@/components/disk/DiskCard'
import DiskListItem from '@/components/disk/DiskListItem'
import { useDiskStore } from '@/store/useDiskStore'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { disks, isLoading, fetchDisks } = useDiskStore()

  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')

  useEffect(() => {
    fetchDisks()
  }, [fetchDisks])

  const handleOpenForm = (disk: { id: number }) => {
    navigate(`/process/new?diskId=${disk.id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">대시보드</h1>
          <p className="text-sm text-muted-foreground">삭제 등록 시 마지막 실행값이 자동으로 채워집니다.</p>
        </div>
        <div className="flex gap-1 border rounded-md p-1">
          <Button
            size="sm"
            variant={viewMode === 'card' ? 'secondary' : 'ghost'}
            className="h-7 w-7 p-0"
            onClick={() => setViewMode('card')}
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            className="h-7 w-7 p-0"
            onClick={() => setViewMode('list')}
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">불러오는 중...</p>
      ) : viewMode === 'card' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {disks.map((disk) => (
            <DiskCard
              key={disk.id}
              disk={disk}
              onOpenForm={handleOpenForm}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {disks.map((disk) => (
            <DiskListItem
              key={disk.id}
              disk={disk}
              onOpenForm={handleOpenForm}
            />
          ))}
        </div>
      )}
    </div>
  )
}
