import { useCallback, useEffect, useRef, useState } from 'react'

import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { Activity, Calendar, Check, MessageSquare, Tag, Trash2, Users, X } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useActivityLog } from '@/hooks/useActivityLog'
import { useComments, useCreateComment } from '@/hooks/useComments'
import { useLabels, useToggleLabel } from '@/hooks/useLabels'
import { useDeleteTask, useLogActivity, useTasks, useUpdateTask } from '@/hooks/useTasks'
import { useTeamMembers, useToggleAssignee } from '@/hooks/useTeam'
import { cn, getInitials } from '@/lib/utils'
import { useBoardStore } from '@/store/boardStore'
import { COLUMNS, PRIORITY_CONFIG, STATUS_LABELS } from '@/types'
import type { TaskPriority, TaskStatus } from '@/types'

/**
 * Slide-in task detail panel. Supports inline editing of title,
 * status/priority/date changes, assignee/label toggles, comments, and activity log.
 */
export default function TaskModal() {
  const selectedTaskId = useBoardStore((s) => s.selectedTaskId)
  const setSelectedTaskId = useBoardStore((s) => s.setSelectedTaskId)
  const { data: tasks = [] } = useTasks()
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()
  const logActivity = useLogActivity()
  const { data: teamMembers = [] } = useTeamMembers()
  const { data: labels = [] } = useLabels()
  const toggleAssignee = useToggleAssignee()
  const toggleLabel = useToggleLabel()
  const { data: comments = [] } = useComments(selectedTaskId)
  const createComment = useCreateComment()
  const { data: activity = [] } = useActivityLog(selectedTaskId)

  const [commentText, setCommentText] = useState('')
  const [isEditingTitle, setIsEditingTitle] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [trackedTaskId, setTrackedTaskId] = useState<string | null>(null)
  const commentsEndRef = useRef<HTMLDivElement>(null)

  const task = tasks.find((t) => t.id === selectedTaskId)

  if (task && task.id !== trackedTaskId) {
    setTrackedTaskId(task.id)
    setEditTitle(task.title)
    setEditDescription(task.description ?? '')
  }

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [comments.length])

  const handleClose = useCallback(() => {
    setSelectedTaskId(null)
  }, [setSelectedTaskId])

  if (!selectedTaskId || !task) return null

  const taskStatus = task.status as TaskStatus
  const taskPriority = task.priority as TaskPriority

  const handleStatusChange = (status: TaskStatus) => {
    const oldStatus = taskStatus
    updateTask.mutate({ id: task.id, status })
    logActivity.mutate({
      task_id: task.id,
      action: `Moved from ${STATUS_LABELS[oldStatus]} → ${STATUS_LABELS[status]}`,
    })
  }

  const handlePriorityChange = (priority: TaskPriority) => {
    updateTask.mutate({ id: task.id, priority })
    logActivity.mutate({
      task_id: task.id,
      action: `Priority changed to ${PRIORITY_CONFIG[priority].label}`,
    })
  }

  const handleTitleSave = () => {
    if (editTitle.trim() && editTitle !== task.title) {
      updateTask.mutate({ id: task.id, title: editTitle.trim() })
    }
    setIsEditingTitle(false)
  }

  const handleDescriptionSave = () => {
    if (editDescription !== (task.description ?? '')) {
      updateTask.mutate({ id: task.id, description: editDescription || null })
    }
  }

  const handleDueDateChange = (date: string) => {
    updateTask.mutate({ id: task.id, due_date: date || null })
    logActivity.mutate({
      task_id: task.id,
      action: date
        ? `Due date set to ${format(parseISO(date), 'MMM d, yyyy')}`
        : 'Due date removed',
    })
  }

  const handleDelete = () => {
    deleteTask.mutate(task.id, {
      onSuccess: () => {
        setSelectedTaskId(null)
        toast.success('Task deleted')
      },
    })
  }

  const handleAddComment = () => {
    if (!commentText.trim()) return
    createComment.mutate({ task_id: task.id, body: commentText.trim() })
    setCommentText('')
  }

  const isAssigned = (memberId: string) => task.assignees.some((a) => a.id === memberId)

  const hasLabel = (labelId: string) => task.labels.some((l) => l.id === labelId)

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={handleClose} aria-hidden="true" />
      <div
        className="fixed right-0 top-0 bottom-0 w-full max-w-lg bg-surface border-l border-border z-50 flex flex-col shadow-2xl overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-modal-title"
        data-testid="task-modal"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2 text-muted text-sm">
            <span>{STATUS_LABELS[taskStatus]}</span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="danger" size="icon-sm" onClick={handleDelete} aria-label="Delete task">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="icon-sm" onClick={handleClose} aria-label="Close panel">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Title */}
          {isEditingTitle ? (
            <Input
              // eslint-disable-next-line jsx-a11y/no-autofocus
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={(e) => e.key === 'Enter' && handleTitleSave()}
              className="text-lg font-semibold"
              aria-label="Task title"
            />
          ) : (
            <button
              id="task-modal-title"
              type="button"
              className="text-lg font-semibold cursor-text hover:bg-card/50 rounded px-1 -mx-1 py-0.5 transition-colors text-left w-full"
              onClick={() => setIsEditingTitle(true)}
            >
              {task.title}
            </button>
          )}

          {/* Status */}
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-1.5 mb-2">
              Status
            </p>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Task status">
              {COLUMNS.map((col) => (
                <button
                  key={col.id}
                  onClick={() => handleStatusChange(col.id)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                    taskStatus === col.id
                      ? 'bg-accent text-white'
                      : 'bg-card text-muted hover:text-text'
                  )}
                  role="radio"
                  aria-checked={taskStatus === col.id}
                >
                  {col.title}
                </button>
              ))}
            </div>
          </div>

          {/* Priority */}
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide mb-2 block">
              Priority
            </p>
            <div className="flex gap-1.5" role="radiogroup" aria-label="Task priority">
              {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => handlePriorityChange(p)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer',
                    taskPriority === p
                      ? 'ring-2 ring-accent bg-card text-text'
                      : 'bg-card text-muted hover:text-text'
                  )}
                  role="radio"
                  aria-checked={taskPriority === p}
                >
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Due date */}
          <div>
            <label
              htmlFor="due-date-input"
              className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-1.5 mb-2"
            >
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              Due Date
            </label>
            <input
              id="due-date-input"
              type="date"
              value={task.due_date ?? ''}
              onChange={(e) => handleDueDateChange(e.target.value)}
              className="bg-card border border-border rounded-lg px-3 py-1.5 text-sm text-text [color-scheme:dark]"
            />
          </div>

          {/* Assignees */}
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Users className="w-3.5 h-3.5" aria-hidden="true" />
              Assignees
            </p>
            <div className="space-y-1" role="group" aria-label="Task assignees">
              {teamMembers.length === 0 && (
                <p className="text-xs text-muted">No team members. Add some in the Team panel.</p>
              )}
              {teamMembers.map((member) => {
                const assigned = isAssigned(member.id)
                return (
                  <button
                    key={member.id}
                    onClick={() =>
                      toggleAssignee.mutate({
                        taskId: task.id,
                        memberId: member.id,
                        assigned,
                      })
                    }
                    className={cn(
                      'w-full flex items-center gap-2 p-2 rounded-lg text-sm transition-colors cursor-pointer',
                      assigned ? 'bg-accent/10 text-text' : 'hover:bg-card text-muted'
                    )}
                    aria-pressed={assigned}
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium text-white shrink-0"
                      style={{ backgroundColor: member.color }}
                      aria-hidden="true"
                    >
                      {getInitials(member.name)}
                    </div>
                    <span className="flex-1 text-left">{member.name}</span>
                    {assigned && <Check className="w-4 h-4 text-accent" aria-hidden="true" />}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Labels */}
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Tag className="w-3.5 h-3.5" aria-hidden="true" />
              Labels
            </p>
            <div className="flex flex-wrap gap-1.5" role="group" aria-label="Task labels">
              {labels.length === 0 && <p className="text-xs text-muted">No labels yet.</p>}
              {labels.map((label) => {
                const active = hasLabel(label.id)
                return (
                  <button
                    key={label.id}
                    onClick={() =>
                      toggleLabel.mutate({
                        taskId: task.id,
                        labelId: label.id,
                        assigned: active,
                      })
                    }
                    className={cn(
                      'px-2.5 py-1 rounded-full text-xs font-medium transition-all cursor-pointer',
                      active
                        ? 'ring-2 ring-offset-1 ring-offset-surface'
                        : 'opacity-60 hover:opacity-100'
                    )}
                    style={{
                      backgroundColor: `${label.color}20`,
                      color: label.color,
                      borderColor: active ? label.color : 'transparent',
                    }}
                    aria-pressed={active}
                  >
                    {label.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label
              htmlFor="task-description"
              className="text-xs font-medium text-muted uppercase tracking-wide mb-2 block"
            >
              Description
            </label>
            <Textarea
              id="task-description"
              placeholder="Add a description..."
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onBlur={handleDescriptionSave}
              rows={3}
            />
          </div>

          {/* Comments */}
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
              Comments
            </p>
            <div className="space-y-3 mb-3 max-h-48 overflow-y-auto">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-card rounded-lg p-3">
                  <p className="text-sm text-text">{comment.body}</p>
                  <p className="text-[11px] text-muted mt-1">
                    {comment.created_at
                      ? formatDistanceToNow(parseISO(comment.created_at), { addSuffix: true })
                      : 'just now'}
                  </p>
                </div>
              ))}
              <div ref={commentsEndRef} />
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
                data-testid="comment-input"
                aria-label="Add a comment"
              />
              <Button size="default" onClick={handleAddComment} disabled={!commentText.trim()}>
                Send
              </Button>
            </div>
          </div>

          {/* Activity */}
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wide flex items-center gap-1.5 mb-2">
              <Activity className="w-3.5 h-3.5" aria-hidden="true" />
              Activity
            </p>
            <div className="space-y-2">
              {activity.length === 0 && <p className="text-xs text-muted">No activity yet</p>}
              {activity.map((entry) => (
                <div key={entry.id} className="flex items-start gap-2">
                  <div
                    className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0"
                    aria-hidden="true"
                  />
                  <div>
                    <p className="text-xs text-text">{entry.action}</p>
                    <p className="text-[11px] text-muted">
                      {entry.created_at
                        ? formatDistanceToNow(parseISO(entry.created_at), { addSuffix: true })
                        : 'just now'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
