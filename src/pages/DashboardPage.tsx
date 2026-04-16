import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import DiskCard from '@/components/disk/DiskCard'
import DiskListItem from '@/components/disk/DiskListItem'
import DeleteConfirmModal from '@/components/disk/DeleteConfirmModal'
import { useDiskStore } from '@/store/useDiskStore'
import { useDiskConfigStore } from '@/store/useDiskConfigStore'
import { useProcessStore } from '@/store/useProcessStore'
import type { Disk } from '@/types'

export default function DashboardPage() {
  const navigate = useNavigate()
  const { disks, isLoading, fetchDisks } = useDiskStore()
  const { configs, getConfig, fetchAllConfigs } = useDiskConfigStore()
  const createProcess = useProcessStore((s) => s.createProcess)

  const [viewMode, setViewMode] = useState<'card' | 'list'>('card')
  const [selectedDisk, setSelectedDisk] = useState<Disk | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchDisks()
    fetchAllConfigs()
  }, [fetchDisks, fetchAllConfigs])

  const handleConfig = (disk: Disk) => {
    navigate(`/process/new?diskId=${disk.id}`)
  }

  const handleDeleteClick = (disk: Disk) => {
    setSelectedDisk(disk)
    setModalOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!selectedDisk) return
    const config = getConfig(selectedDisk.id)
    if (!config) return

    setSubmitting(true)
    try {
      await createProcess({
        diskId: config.diskId,
        diskName: config.diskName,
        internalPaths: config.internalPaths,
        externalPaths: config.externalPaths,
        toEmails: config.toEmails,
        ccEmails: config.ccEmails,
      })
      setModalOpen(false)
      navigate('/history')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">대시보드</h1>
          <p className="text-sm text-muted-foreground">권한이 있는 디스크 목록입니다.</p>
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
              config={configs[disk.id]}
              onConfig={handleConfig}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {disks.map((disk) => (
            <DiskListItem
              key={disk.id}
              disk={disk}
              config={configs[disk.id]}
              onConfig={handleConfig}
              onDelete={handleDeleteClick}
            />
          ))}
        </div>
      )}

      <DeleteConfirmModal
        open={modalOpen}
        config={selectedDisk ? getConfig(selectedDisk.id) : undefined}
        onConfirm={handleConfirmDelete}
        onClose={() => setModalOpen(false)}
        isLoading={submitting}
      />
    </div>
  )
}
