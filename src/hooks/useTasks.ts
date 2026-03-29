import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import type {
  LabelRow,
  TaskPriority,
  TaskRow,
  TaskStatus,
  TaskWithRelations,
  TeamMemberRow,
} from '@/types'

interface UseTasksReturn {
  data: TaskWithRelations[] | undefined
  isLoading: boolean
  error: Error | null
}

/**
 * Fetches all tasks for the current guest user with joined assignees and labels.
 * RLS ensures user_id isolation at database level.
 */
export function useTasks(): UseTasksReturn {
  const query = useQuery({
    queryKey: ['tasks'],
    queryFn: async (): Promise<TaskWithRelations[]> => {
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .order('position', { ascending: true })

      if (error) throw error

      const { data: assigneeRows } = await supabase
        .from('task_assignees')
        .select('task_id, member_id, team_members(*)')

      const { data: labelRows } = await supabase
        .from('task_labels')
        .select('task_id, label_id, labels(*)')

      return (tasks ?? []).map((task) => ({
        ...task,
        assignees: (assigneeRows ?? [])
          .filter((r) => r.task_id === task.id)
          .map((r) => r.team_members)
          .filter((m): m is TeamMemberRow => m !== null),
        labels: (labelRows ?? [])
          .filter((r) => r.task_id === task.id)
          .map((r) => r.labels)
          .filter((l): l is LabelRow => l !== null),
      }))
    },
  })

  return { data: query.data, isLoading: query.isLoading, error: query.error }
}

/** Creates a new task and logs activity */
export function useCreateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      title: string
      status: TaskStatus
      priority?: TaskPriority
      description?: string
      due_date?: string | null
      position?: number
    }): Promise<TaskRow> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          title: input.title,
          status: input.status,
          priority: input.priority ?? 'normal',
          description: input.description ?? null,
          due_date: input.due_date ?? null,
          position: input.position ?? 0,
          user_id: user.id,
        })
        .select()
        .single()

      if (error) throw error

      await supabase.from('activity_log').insert({
        task_id: data.id,
        user_id: user.id,
        action: 'Task created',
        metadata: { status: input.status },
      })

      return data
    },
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<TaskWithRelations[]>(['tasks'])

      const optimisticTask: TaskWithRelations = {
        id: `temp-${Date.now()}`,
        user_id: '',
        title: input.title,
        description: input.description ?? null,
        status: input.status,
        priority: input.priority ?? 'normal',
        due_date: input.due_date ?? null,
        position: input.position ?? 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        assignees: [],
        labels: [],
      }

      queryClient.setQueryData<TaskWithRelations[]>(['tasks'], (old) => [
        ...(old ?? []),
        optimisticTask,
      ])

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/** Updates a task with optimistic UI. Rolls back on error. */
export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<TaskRow> & { id: string }): Promise<TaskRow> => {
      const { data, error } = await supabase
        .from('tasks')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onMutate: async (updatedTask) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'] })
      const previous = queryClient.getQueryData<TaskWithRelations[]>(['tasks'])

      queryClient.setQueryData<TaskWithRelations[]>(['tasks'], (old) =>
        (old ?? []).map((t) => (t.id === updatedTask.id ? { ...t, ...updatedTask } : t))
      )

      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['tasks'], context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/** Deletes a task by ID */
export function useDeleteTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('tasks').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/** Writes an entry to the activity_log table for a task */
export function useLogActivity() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      task_id: string
      action: string
      metadata?: Record<string, string | number | boolean | null>
    }): Promise<void> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error } = await supabase.from('activity_log').insert({
        task_id: input.task_id,
        user_id: user.id,
        action: input.action,
        metadata: input.metadata ?? null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity'] })
    },
  })
}
