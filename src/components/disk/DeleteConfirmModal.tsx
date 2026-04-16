import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { DiskConfig } from '@/types'

interface DeleteConfirmModalProps {
  open: boolean
  config: DiskConfig | undefined
  onConfirm: () => void
  onClose: () => void
  isLoading?: boolean
}

function PathList({ paths }: { paths: string[] }) {
  return (
    <div className="space-y-1">
      {paths.length === 0
        ? <span className="text-muted-foreground text-xs">없음</span>
        : paths.map((p) => (
            <div key={p} className="font-mono text-xs bg-muted px-2 py-1 rounded">{p}</div>
          ))
      }
    </div>
  )
}

export default function DeleteConfirmModal({ open, config, onConfirm, onClose, isLoading }: DeleteConfirmModalProps) {
  if (!config) return null

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>삭제 프로세스 등록 확인</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div>
            <p className="font-medium mb-1">디스크</p>
            <p className="text-muted-foreground">{config.diskName}</p>
          </div>
          <div>
            <p className="font-medium mb-1">내부 경로</p>
            <PathList paths={config.internalPaths} />
          </div>
          <div>
            <p className="font-medium mb-1">외부 경로</p>
            <PathList paths={config.externalPaths} />
          </div>
          <div>
            <p className="font-medium mb-1">수신자 (To)</p>
            <PathList paths={config.toEmails} />
          </div>
          {config.ccEmails.length > 0 && (
            <div>
              <p className="font-medium mb-1">CC</p>
              <PathList paths={config.ccEmails} />
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>취소</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? '등록 중...' : '삭제 등록'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
