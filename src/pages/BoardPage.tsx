import { lazy, Suspense } from 'react'

import { KanbanBoard } from '@/components/board/KanbanBoard'
import { Header } from '@/components/layout/Header'
import { Skeleton } from '@/components/ui/skeleton'
import { useBoardStore } from '@/store/boardStore'

const TeamPanel = lazy(() => import('@/components/team/TeamPanel'))

/** Main board page with header, columns, and team panel */
export function BoardPage() {
  const isTeamPanelOpen = useBoardStore((s) => s.isTeamPanelOpen)
  const setTeamPanelOpen = useBoardStore((s) => s.setTeamPanelOpen)

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Header />
      <main className="flex-1 overflow-hidden">
        <KanbanBoard />
      </main>
      {isTeamPanelOpen && (
        <Suspense fallback={<Skeleton className="fixed right-0 top-0 bottom-0 w-80" />}>
          <TeamPanel open={isTeamPanelOpen} onClose={() => setTeamPanelOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}
