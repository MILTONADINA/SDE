import { lazy, Suspense, useCallback, useMemo, useState } from 'react'

import {
  closestCorners,
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import { toast } from 'sonner'

import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { Skeleton } from '@/components/ui/skeleton'
import { useTasks, useUpdateTask, useLogActivity } from '@/hooks/useTasks'
import { useBoardStore } from '@/store/boardStore'
import { COLUMNS, STATUS_LABELS } from '@/types'
import type { TaskStatus, TaskWithRelations } from '@/types'

const TaskModal = lazy(() => import('./TaskModal'))

/** Root Kanban board with drag-and-drop context and column layout */
export function KanbanBoard() {
  const { data: allTasks = [], isLoading } = useTasks()
  const updateTask = useUpdateTask()
  const logActivity = useLogActivity()
  const searchQuery = useBoardStore((s) => s.searchQuery)
  const filterPriority = useBoardStore((s) => s.filterPriority)
  const filterAssignee = useBoardStore((s) => s.filterAssignee)
  const filterLabel = useBoardStore((s) => s.filterLabel)
  const selectedTaskId = useBoardStore((s) => s.selectedTaskId)

  const [activeTask, setActiveTask] = useState<TaskWithRelations | null>(null)

  const tasks = useMemo(
    () =>
      allTasks.filter((task) => {
        if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false
        }
        if (filterPriority && task.priority !== filterPriority) return false
        if (filterAssignee && !task.assignees.some((a) => a.id === filterAssignee)) return false
        if (filterLabel && !task.labels.some((l) => l.id === filterLabel)) return false
        return true
      }),
    [allTasks, searchQuery, filterPriority, filterAssignee, filterLabel]
  )

  const getColumnTasks = useCallback(
    (status: TaskStatus): TaskWithRelations[] =>
      tasks
        .filter((t) => t.status === status)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [tasks]
  )

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t.id === event.active.id)
      if (task) setActiveTask(task)
    },
    [tasks]
  )

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null)
      const { active, over } = event
      if (!over) return

      const activeTaskId = active.id as string
      const task = allTasks.find((t) => t.id === activeTaskId)
      if (!task) return

      let targetStatus: TaskStatus
      const overData = over.data?.current

      if (overData?.type === 'column') {
        targetStatus = over.id as TaskStatus
      } else if (overData?.type === 'task') {
        const overTask = allTasks.find((t) => t.id === over.id)
        if (!overTask) return
        targetStatus = overTask.status as TaskStatus
      } else {
        if (COLUMNS.some((c) => c.id === over.id)) {
          targetStatus = over.id as TaskStatus
        } else {
          return
        }
      }

      const oldStatus = task.status as TaskStatus

      if (oldStatus === targetStatus) {
        const columnTasks = getColumnTasks(targetStatus)
        const oldIndex = columnTasks.findIndex((t) => t.id === activeTaskId)
        const overTask = columnTasks.find((t) => t.id === over.id)
        const newIndex = overTask ? columnTasks.indexOf(overTask) : columnTasks.length - 1

        if (oldIndex !== newIndex && oldIndex !== -1) {
          const reordered = arrayMove(columnTasks, oldIndex, newIndex)
          reordered.forEach((t, i) => {
            if ((t.position ?? 0) !== i) {
              updateTask.mutate({ id: t.id, position: i })
            }
          })
        }
      } else {
        const targetTasks = getColumnTasks(targetStatus)
        const newPosition = targetTasks.length

        updateTask.mutate(
          { id: activeTaskId, status: targetStatus, position: newPosition },
          {
            onError: () => {
              toast.error('Failed to move task. Rolling back...')
            },
          }
        )

        logActivity.mutate({
          task_id: activeTaskId,
          action: `Moved from ${STATUS_LABELS[oldStatus]} → ${STATUS_LABELS[targetStatus]}`,
        })
      }
    },
    [allTasks, getColumnTasks, updateTask, logActivity]
  )

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 flex-1 overflow-x-auto p-6 pb-4" data-testid="kanban-board">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={getColumnTasks(column.id)}
              isLoading={isLoading}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="opacity-90 rotate-2">
              <TaskCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {selectedTaskId && (
        <Suspense
          fallback={
            <div className="fixed inset-0 bg-black/50 z-40">
              <Skeleton className="fixed right-0 top-0 bottom-0 w-full max-w-lg" />
            </div>
          }
        >
          <TaskModal />
        </Suspense>
      )}
    </>
  )
}
