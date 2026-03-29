import { describe, expect, it, beforeEach } from 'vitest'

import { useBoardStore } from '@/store/boardStore'

describe('boardStore', () => {
  beforeEach(() => {
    useBoardStore.setState({
      searchQuery: '',
      filterPriority: null,
      filterAssignee: null,
      filterLabel: null,
      selectedTaskId: null,
      isTeamPanelOpen: false,
    })
  })

  it('updates search query', () => {
    useBoardStore.getState().setSearchQuery('test')
    expect(useBoardStore.getState().searchQuery).toBe('test')
  })

  it('updates filter priority', () => {
    useBoardStore.getState().setFilterPriority('high')
    expect(useBoardStore.getState().filterPriority).toBe('high')
  })

  it('clears filter priority to null', () => {
    useBoardStore.getState().setFilterPriority('high')
    useBoardStore.getState().setFilterPriority(null)
    expect(useBoardStore.getState().filterPriority).toBeNull()
  })

  it('updates selected task id', () => {
    useBoardStore.getState().setSelectedTaskId('abc')
    expect(useBoardStore.getState().selectedTaskId).toBe('abc')
  })

  it('toggles team panel', () => {
    useBoardStore.getState().setTeamPanelOpen(true)
    expect(useBoardStore.getState().isTeamPanelOpen).toBe(true)
    useBoardStore.getState().setTeamPanelOpen(false)
    expect(useBoardStore.getState().isTeamPanelOpen).toBe(false)
  })
})
