import { memo } from 'react'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { LayoutList } from 'lucide-react'

import { AddTaskButton } from './AddTaskButton'
import { TaskCard } from './TaskCard'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { TaskStatus, TaskWithRelations } from '@/types'

interface KanbanColumnProps {
  id: TaskStatus
  title: string
  tasks: TaskWithRelations[]
  isLoading?: boolean
}

/** Droppable column that holds sorted task cards */
const KanbanColumn = memo(function KanbanColumn({
  id,
  title,
  tasks,
  isLoading,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id, data: { type: 'column' } })

  return (
    <div
      className="flex-shrink-0 w-[300px] flex flex-col max-h-full"
      data-testid={`column-${id}`}
      role="region"
      aria-label={`${title} column, ${tasks.length} tasks`}
    >
      <div className="flex items-center justify-between px-2 pb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-muted">{title}</h3>
          <span
            className="bg-surface text-muted text-[11px] font-medium rounded-full px-2 py-0.5"
            aria-label={`${tasks.length} tasks`}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto space-y-2 p-1 rounded-xl transition-colors min-h-[120px]',
          isOver && 'bg-accent/5 ring-2 ring-accent/20 ring-inset rounded-xl'
        )}
      >
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </div>
        ) : (
          <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))}
          </SortableContext>
        )}

        {!isLoading && tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-border/50 rounded-xl text-muted">
            <LayoutList className="w-8 h-8 mb-2 opacity-30" aria-hidden="true" />
            <p className="text-xs">No tasks here</p>
          </div>
        )}
      </div>

      <div className="pt-2 px-1">
        <AddTaskButton status={id} taskCount={tasks.length} />
      </div>
    </div>
  )
})

export { KanbanColumn }
