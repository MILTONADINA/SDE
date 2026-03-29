import type { Database, Tables } from './database.types'

export type { Database, Tables }

export type TaskRow = Tables<'tasks'>
export type TeamMemberRow = Tables<'team_members'>
export type LabelRow = Tables<'labels'>
export type CommentRow = Tables<'comments'>
export type ActivityLogRow = Tables<'activity_log'>

export type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done'
export type TaskPriority = 'low' | 'normal' | 'high'

/** Task with joined assignees and labels */
export interface TaskWithRelations extends TaskRow {
  assignees: TeamMemberRow[]
  labels: LabelRow[]
}

export interface Column {
  id: TaskStatus
  title: string
}

export const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'in_progress', title: 'In Progress' },
  { id: 'in_review', title: 'In Review' },
  { id: 'done', title: 'Done' },
]

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; borderColor: string }
> = {
  low: { label: 'Low', color: '#3b82f6', borderColor: 'border-l-blue-500' },
  normal: { label: 'Normal', color: '#8b8aa8', borderColor: 'border-l-transparent' },
  high: { label: 'High', color: '#f59e0b', borderColor: 'border-l-amber-500' },
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
}
