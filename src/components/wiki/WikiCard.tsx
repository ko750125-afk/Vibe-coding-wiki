import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { WikiEntry } from '@/lib/types'

import { cn } from '@/lib/utils'

interface WikiCardProps {
  entry: WikiEntry
  onClick: (entry: WikiEntry) => void
  onDelete: (id: string) => Promise<void>
}

export function WikiCard({ entry, onClick, onDelete }: WikiCardProps) {
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false)
  const isChild = !!entry.parentId

  return (
    <div className={cn("relative", isChild && "ml-8")}>
      {isChild && (
        <div className="absolute -left-6 top-0 h-7 w-4 rounded-bl-xl border-b-2 border-l-2 border-muted-foreground/30" />
      )}
      <Card
        className="group relative cursor-pointer transition-shadow hover:shadow-md"
        onClick={() => onClick(entry)}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-4">
            <CardTitle className="text-base font-medium">{entry.title}</CardTitle>

            <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
              {isConfirmingDelete ? (
                <>
                  <span className="text-xs text-destructive">삭제할까요?</span>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={async (e) => {
                      e.stopPropagation()
                      await onDelete(entry.id)
                      setIsConfirmingDelete(false)
                    }}
                  >
                    확인
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsConfirmingDelete(false)
                    }}
                  >
                    취소
                  </Button>
                </>
              ) : (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7 text-destructive hover:text-destructive"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsConfirmingDelete(true)
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
