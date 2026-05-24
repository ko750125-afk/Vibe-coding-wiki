import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { addEntry, updateEntry } from '@/lib/entriesService'
import type { WikiEntry } from '@/lib/types'

interface EntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  entry: WikiEntry | null
  userId: string
  entries: WikiEntry[]
  onDelete: (id: string) => Promise<void>
}

export function EntryDialog({ open, onOpenChange, entry, userId, entries, onDelete }: EntryDialogProps) {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [parentId, setParentId] = useState<string>('')
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)

  useEffect(() => {
    if (open) {
      setTitle(entry?.title ?? '')
      setContent(entry?.content ?? '')
      setParentId(entry?.parentId ?? '')
      setIsEditing(!entry)
      setIsConfirmingDelete(false)
    }
  }, [open, entry])

  async function handleSave() {
    if (!title.trim()) return
    setSaving(true)
    const selectedParentId = parentId || null
    try {
      if (entry) {
        await updateEntry(userId, entry.id, title.trim(), content.trim(), selectedParentId)
        // 저장 후 다시 보기 모드로
        setIsEditing(false)
      } else {
        await addEntry(userId, title.trim(), content.trim(), selectedParentId)
        onOpenChange(false)
      }
    } finally {
      setSaving(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!isEditing) return
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSave()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto" onKeyDown={handleKeyDown} aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className={!isEditing ? "text-2xl" : ""}>
            {!isEditing ? title : (!entry ? '새 글 작성' : '')}
          </DialogTitle>
        </DialogHeader>
        
        {!isEditing ? (
          <div className="py-4">
            <div className="whitespace-pre-wrap leading-relaxed text-base">
              {content || <span className="italic text-muted-foreground">내용 없음</span>}
            </div>
          </div>
        ) : (
          <div className="grid gap-3 py-2">
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-base shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring md:text-sm"
            >
              <option value="">상위 카드 선택 안 함</option>
              {entries
                .filter((e) => e.id !== entry?.id && !e.parentId) // 최상위 카드만 부모로 지정 가능하도록 제한
                .sort((a, b) => a.title.localeCompare(b.title, 'en'))
                .map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title}
                  </option>
                ))}
            </select>
            <Input
              placeholder="제목"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
            />
            <Textarea
              placeholder="내용을 입력하세요..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[50vh] resize-y"
            />
          </div>
        )}

        <div className="flex items-center justify-between mt-2">
          {isEditing ? (
            <span className="text-xs text-muted-foreground">Ctrl+Enter로 저장</span>
          ) : (
            <div>
              {entry && (
                isConfirmingDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-destructive">정말 삭제할까요?</span>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={async () => {
                        await onDelete(entry.id)
                        setIsConfirmingDelete(false)
                        onOpenChange(false)
                      }}
                    >
                      확인
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setIsConfirmingDelete(false)}
                    >
                      취소
                    </Button>
                  </div>
                ) : (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5"
                    onClick={() => setIsConfirmingDelete(true)}
                  >
                    <Trash2 className="w-4 h-4" />
                    삭제
                  </Button>
                )
              )}
            </div>
          )}
          <div className="flex gap-2">
            {!isEditing ? (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  닫기
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  수정
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    if (!entry) {
                      onOpenChange(false)
                    } else {
                      setTitle(entry.title)
                      setContent(entry.content)
                      setParentId(entry.parentId ?? '')
                      setIsEditing(false)
                    }
                  }}
                >
                  취소
                </Button>
                <Button onClick={handleSave} disabled={!title.trim() || saving}>
                  {saving ? '저장 중...' : '저장'}
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
