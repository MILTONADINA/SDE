import { create } from 'zustand'

import type { TaskPriority } from '@/types'

interface BoardState {
  searchQuery: string
  setSearchQuery: (query: string) => void
  filterPriority: TaskPriority | null
  setFilterPriority: (priority: TaskPriority | null) => void
  filterAssignee: string | null
  setFilterAssignee: (memberId: string | null) => void
  filterLabel: string | null
  setFilterLabel: (labelId: string | null) => void
  selectedTaskId: string | null
  setSelectedTaskId: (id: string | null) => void
  isTeamPanelOpen: boolean
  setTeamPanelOpen: (open: boolean) => void
}

export const useBoardStore = create<BoardState>()((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  filterPriority: null,
  setFilterPriority: (priority) => set({ filterPriority: priority }),
  filterAssignee: null,
  setFilterAssignee: (memberId) => set({ filterAssignee: memberId }),
  filterLabel: null,
  setFilterLabel: (labelId) => set({ filterLabel: labelId }),
  selectedTaskId: null,
  setSelectedTaskId: (id) => set({ selectedTaskId: id }),
  isTeamPanelOpen: false,
  setTeamPanelOpen: (open) => set({ isTeamPanelOpen: open }),
}))
