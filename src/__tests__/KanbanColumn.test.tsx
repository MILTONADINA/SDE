import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { TaskWithRelations } from '@/types'

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({ setNodeRef: vi.fn(), isOver: false }),
}))

vi.mock('@dnd-kit/sortable', () => ({
  SortableContext: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

vi.mock('@dnd-kit/utilities', () => ({
  CSS: { Transform: { toString: () => null } },
}))

vi.mock('@/store/boardStore', () => ({
  useBoardStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({ setSelectedTaskId: vi.fn() })
  ),
}))

vi.mock('@/hooks/useTasks', () => ({
  useCreateTask: () => ({ mutate: vi.fn() }),
}))

import { KanbanColumn } from '@/components/board/KanbanColumn'

const mockTask: TaskWithRelations = {
  id: '1',
  user_id: 'u1',
  title: 'Task One',
  description: null,
  status: 'todo',
  priority: 'normal',
  due_date: null,
  position: 0,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
  assignees: [],
  labels: [],
}

describe('KanbanColumn', () => {
  it('renders column title', () => {
    render(<KanbanColumn id="todo" title="To Do" tasks={[]} />)
    expect(screen.getByText('To Do')).toBeInTheDocument()
  })

  it('renders task count', () => {
    render(<KanbanColumn id="todo" title="To Do" tasks={[mockTask]} />)
    expect(screen.getByText('1')).toBeInTheDocument()
  })

  it('shows empty state when no tasks', () => {
    render(<KanbanColumn id="todo" title="To Do" tasks={[]} />)
    expect(screen.getByText('No tasks here')).toBeInTheDocument()
  })

  it('shows skeleton when loading', () => {
    render(<KanbanColumn id="todo" title="To Do" tasks={[]} isLoading />)
    expect(screen.queryByText('No tasks here')).not.toBeInTheDocument()
  })

  it('has accessible region label', () => {
    render(<KanbanColumn id="todo" title="To Do" tasks={[mockTask]} />)
    expect(screen.getByRole('region', { name: /To Do column, 1 tasks/ })).toBeInTheDocument()
  })

  it('renders task cards', () => {
    render(<KanbanColumn id="todo" title="To Do" tasks={[mockTask]} />)
    expect(screen.getByText('Task One')).toBeInTheDocument()
  })
})
