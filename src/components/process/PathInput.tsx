import { useState, useRef, useLayoutEffect } from 'react'
import { X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface PathInputProps {
  label: string
  value: string[]
  onChange: (paths: string[]) => void
  placeholder?: string
}

export default function PathInput({ label, value, onChange, placeholder = '경로 입력 후 Enter' }: PathInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')
  const shouldFocus = useRef(false)

  useLayoutEffect(() => {
    if (shouldFocus.current) {
      shouldFocus.current = false
      inputRef.current?.focus()
    }
  })

  const addPaths = (raw: string) => {
    const newPaths = raw
      .split('\n')
      .map((p) => p.trim())
      .filter((p) => p.length > 0 && !value.includes(p))
    if (newPaths.length > 0) onChange([...value, ...newPaths])
  }

  const handleAdd = () => {
    const val = inputValue.trim()
    if (!val) return
    addPaths(val)
    setInputValue('')
    shouldFocus.current = true
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.nativeEvent.isComposing) {
      e.preventDefault()
      e.nativeEvent.stopImmediatePropagation()
      e.stopPropagation()
      handleAdd()
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData('text')
    if (pasted.includes('\n')) {
      e.preventDefault()
      e.stopPropagation()
      addPaths(pasted)
      setInputValue('')
      requestAnimationFrame(() => inputRef.current?.focus())
    }
  }

  const removePath = (path: string) => onChange(value.filter((p) => p !== path))

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {value.length > 0 && (
          <button
            type="button"
            onClick={() => onChange([])}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors"
          >
            전체 삭제
          </button>
        )}
      </div>

      <div className={cn('border rounded-md p-2 space-y-1 bg-muted/30', value.length === 0 && 'hidden')}>
        {value.map((path) => (
          <div
            key={path}
            className="flex items-center justify-between gap-2 px-2 py-1 bg-background rounded text-sm font-mono"
          >
            <span className="truncate">{path}</span>
            <button
              type="button"
              onClick={() => removePath(path)}
              className="shrink-0 text-muted-foreground hover:text-destructive transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      <Input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        className="font-mono text-sm"
      />
      <p className="text-xs text-muted-foreground">
        Enter로 추가 · 여러 경로는 줄바꿈으로 구분하여 한 번에 붙여넣기 가능
      </p>
    </div>
  )
}
