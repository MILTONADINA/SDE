import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import type { LabelRow } from '@/types'

/** Fetches all labels for the current user */
export function useLabels() {
  return useQuery({
    queryKey: ['labels'],
    queryFn: async (): Promise<LabelRow[]> => {
      const { data, error } = await supabase
        .from('labels')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      return data ?? []
    },
  })
}

/** Creates a new label */
export function useCreateLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { name: string; color: string }): Promise<LabelRow> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('labels')
        .insert({ ...input, user_id: user.id })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] })
    },
  })
}

/** Deletes a label by ID */
export function useDeleteLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('labels').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labels'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/** Toggles a label assignment on a task */
export function useToggleLabel() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      labelId,
      assigned,
    }: {
      taskId: string
      labelId: string
      assigned: boolean
    }): Promise<void> => {
      if (assigned) {
        const { error } = await supabase
          .from('task_labels')
          .delete()
          .eq('task_id', taskId)
          .eq('label_id', labelId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('task_labels')
          .insert({ task_id: taskId, label_id: labelId })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
