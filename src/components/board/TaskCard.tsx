import { memo } from 'react'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { format, parseISO } from 'date-fns'
import { Calendar, GripVertical } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { AvatarStack } from '@/components/team/AvatarStack'
import { cn, getDueDateColor, getDueDateStatus } from '@/lib/utils'
import { useBoardStore } from '@/store/boardStore'
import { PRIORITY_CONFIG } from '@/types'
import type { TaskPriority, TaskWithRelations } from '@/types'

interface TaskCardProps {
  task: TaskWithRelations
}

/** Draggable task card with priority border, labels, avatars, and due date */
const TaskCard = memo(function TaskCard({ task }: TaskCardProps) {
  const setSelectedTaskId = useBoardStore((s) => s.setSelectedTaskId)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: 'task', task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const dueDateStatus = getDueDateStatus(task.due_date)
  const priority = task.priority as TaskPriority
  const priorityConfig = PRIORITY_CONFIG[priority]

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-testid="task-card"
      className={cn(
        'bg-card rounded-xl p-3 border-l-[3px] shadow-sm cursor-pointer group',
        'hover:-translate-y-0.5 hover:shadow-md transition-all duration-200',
        priorityConfig.borderColor,
        isDragging && 'opacity-50 scale-105 shadow-xl z-50'
      )}
      onClick={() => setSelectedTaskId(task.id)}
      role="button"
      tabIndex={0}
      aria-label={`Task: ${task.title}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setSelectedTaskId(task.id)
        }
      }}
    >
      <div className="flex items-start gap-2">
        <button
          className="mt-0.5 text-muted/50 hover:text-muted cursor-grab active:cursor-grabbing shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Drag to reorder"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text leading-snug">{task.title}</p>

          {task.labels.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {task.labels.map((label) => (
                <span
                  key={label.id}
                  className="px-1.5 py-0.5 rounded text-[10px] font-medium"
                  style={{
                    backgroundColor: `${label.color}20`,
                    color: label.color,
                  }}
                >
                  {label.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between mt-2.5">
            <div className="flex items-center gap-2">
              {task.assignees.length > 0 && <AvatarStack members={task.assignees} />}
              {priority !== 'normal' && (
                <Badge
                  variant={priority === 'high' ? 'warning' : 'secondary'}
                  className="text-[10px]"
                >
                  {priorityConfig.label}
                </Badge>
              )}
            </div>

            {task.due_date && (
              <div
                className={cn(
                  'flex items-center gap-1 text-[11px]',
                  getDueDateColor(dueDateStatus)
                )}
              >
                <Calendar className="w-3 h-3" aria-hidden="true" />
                {format(parseISO(task.due_date), 'MMM d')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
})

export { TaskCard }
