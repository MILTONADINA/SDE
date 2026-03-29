import { useQuery } from '@tanstack/react-query'

import { supabase } from '@/lib/supabase'
import type { ActivityLogRow } from '@/types'

/** Fetches activity log entries for a specific task, newest first */
export function useActivityLog(taskId: string | null) {
  return useQuery({
    queryKey: ['activity', taskId],
    queryFn: async (): Promise<ActivityLogRow[]> => {
      if (!taskId) return []

      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data ?? []
    },
    enabled: !!taskId,
  })
}
