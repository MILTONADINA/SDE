import { useState } from 'react'

import { Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateTask } from '@/hooks/useTasks'
import type { TaskStatus } from '@/types'

interface AddTaskButtonProps {
  status: TaskStatus
  taskCount: number
}

/** Inline task creation at the bottom of each column */
export function AddTaskButton({ status, taskCount }: AddTaskButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [title, setTitle] = useState('')
  const createTask = useCreateTask()

  const handleSubmit = () => {
    if (!title.trim()) return

    createTask.mutate(
      { title: title.trim(), status, position: taskCount },
      {
        onSuccess: () => {
          setTitle('')
          setIsAdding(false)
          toast.success('Task created')
        },
        onError: () => {
          toast.error('Failed to create task')
        },
      }
    )
  }

  if (!isAdding) {
    return (
      <button
        onClick={() => setIsAdding(true)}
        className="w-full flex items-center gap-2 p-2 text-sm text-muted hover:text-text hover:bg-card/50 rounded-lg transition-colors cursor-pointer"
        data-testid={`add-task-${status}`}
        aria-label={`Add task to ${status.replace('_', ' ')}`}
      >
        <Plus className="w-4 h-4" aria-hidden="true" />
        Add task
      </button>
    )
  }

  return (
    <div className="p-2 bg-card rounded-xl space-y-2">
      <Input
        // eslint-disable-next-line jsx-a11y/no-autofocus
        autoFocus
        placeholder="Task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') handleSubmit()
          if (e.key === 'Escape') {
            setIsAdding(false)
            setTitle('')
          }
        }}
        data-testid="task-title-input"
        aria-label="New task title"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handleSubmit} disabled={!title.trim()}>
          Add
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => {
            setIsAdding(false)
            setTitle('')
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}
