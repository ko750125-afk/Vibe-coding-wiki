import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import type { WikiEntry } from '@/lib/types'

import { cn } from '@/lib/utils'

interface WikiCardProps {
  entry: WikiEntry
  onClick: (entry: WikiEntry) => void
}

export function WikiCard({ entry, onClick }: WikiCardProps) {
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
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
