import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DiskCard from '@/components/disk/DiskCard'
import { useDiskStore } from '@/store/useDiskStore'
import type { Disk } from '@/types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { disks, isLoading, fetchDisks } = useDiskStore()

  useEffect(() => { fetchDisks() }, [fetchDisks])

  const handleDelete = (disk: Disk) => {
    navigate(`/process/new?diskId=${disk.id}`)
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">대시보드</h1>
      <p className="text-sm text-muted-foreground">권한이 있는 디스크 목록입니다.</p>

      {isLoading ? (
        <p className="text-muted-foreground text-sm">불러오는 중...</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {disks.map((disk) => (
            <DiskCard key={disk.id} disk={disk} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}
