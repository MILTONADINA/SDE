import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import type { TeamMemberRow } from '@/types'

/** Fetches all team members for the current user */
export function useTeamMembers() {
  return useQuery({
    queryKey: ['team-members'],
    queryFn: async (): Promise<TeamMemberRow[]> => {
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .order('created_at', { ascending: true })

      if (error) throw error
      return data ?? []
    },
  })
}

/** Creates a new team member */
export function useCreateTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: { name: string; color: string }): Promise<TeamMemberRow> => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('team_members')
        .insert({ ...input, user_id: user.id })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
    },
  })
}

/** Deletes a team member by ID */
export function useDeleteTeamMember() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from('team_members').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/** Toggles a team member assignment on a task */
export function useToggleAssignee() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      taskId,
      memberId,
      assigned,
    }: {
      taskId: string
      memberId: string
      assigned: boolean
    }): Promise<void> => {
      if (assigned) {
        const { error } = await supabase
          .from('task_assignees')
          .delete()
          .eq('task_id', taskId)
          .eq('member_id', memberId)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('task_assignees')
          .insert({ task_id: taskId, member_id: memberId })
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
