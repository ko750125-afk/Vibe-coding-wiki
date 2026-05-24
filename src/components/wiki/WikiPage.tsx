import { useState, useEffect, useMemo } from 'react'
import { Plus, Search } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { subscribeEntries, deleteEntry } from '@/lib/entriesService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { WikiCard } from '@/components/wiki/WikiCard'
import { EntryDialog } from '@/components/wiki/EntryDialog'
import type { WikiEntry } from '@/lib/types'

export function WikiPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<WikiEntry[]>([])
  const [search, setSearch] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<WikiEntry | null>(null)

  useEffect(() => {
    if (!user) return
    const unsubscribe = subscribeEntries(user.uid, setEntries)
    return unsubscribe
  }, [user])

  const sortedEntries = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    const matched = entries.filter(
      (e) =>
        !keyword ||
        e.title.toLowerCase().includes(keyword) ||
        e.content.toLowerCase().includes(keyword)
    )

    const childrenMap = new Map<string, WikiEntry[]>()
    const rootNodes: WikiEntry[] = []

    matched.forEach((entry) => {
      if (entry.parentId) {
        const parentExistsInMatched = matched.some((p) => p.id === entry.parentId)
        if (parentExistsInMatched) {
          if (!childrenMap.has(entry.parentId)) {
            childrenMap.set(entry.parentId, [])
          }
          childrenMap.get(entry.parentId)!.push(entry)
        } else {
          rootNodes.push(entry)
        }
      } else {
        rootNodes.push(entry)
      }
    })

    rootNodes.sort((a, b) => a.title.localeCompare(b.title, 'en'))

    const result: WikiEntry[] = []
    rootNodes.forEach((root) => {
      result.push(root)
      const children = childrenMap.get(root.id)
      if (children) {
        children.sort((a, b) => a.title.localeCompare(b.title, 'en'))
        result.push(...children)
      }
    })

    return result
  }, [entries, search])

  function openCreate() {
    setEditTarget(null)
    setDialogOpen(true)
  }

  function openEdit(entry: WikiEntry) {
    setEditTarget(entry)
    setDialogOpen(true)
  }

  async function handleDelete(id: string) {
    if (!user) return
    await deleteEntry(user.uid, id)
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Knowledge</h1>
        <div className="flex w-full items-center gap-3 sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="검색..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
          <Button onClick={openCreate} className="shrink-0 h-9">
            <Plus className="h-4 w-4" />
            새 글
          </Button>
        </div>
      </div>

      {sortedEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <p className="text-muted-foreground">
            {search ? '검색 결과가 없습니다.' : '아직 기록된 지식이 없습니다.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {sortedEntries.map((entry) => (
            <WikiCard
              key={entry.id}
              entry={entry}
              onClick={openEdit}
            />
          ))}
        </div>
      )}

      <EntryDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        entry={editTarget}
        userId={user?.uid ?? ''}
        entries={entries}
        onDelete={handleDelete}
      />
    </div>
  )
}
