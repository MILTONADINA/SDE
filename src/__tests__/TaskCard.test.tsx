import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import type { TaskWithRelations } from '@/types'

// Mock dnd-kit
vi.mock('@dnd-kit/sortable', () => ({
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

// Must mock before importing component
vi.mock('@/store/boardStore', () => ({
  useBoardStore: vi.fn((selector: (s: Record<string, unknown>) => unknown) =>
    selector({ setSelectedTaskId: vi.fn() })
  ),
}))

import { TaskCard } from '@/components/board/TaskCard'

const baseTask: TaskWithRelations = {
  id: '1',
  user_id: 'u1',
  title: 'Test Task',
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

describe('TaskCard', () => {
  it('renders task title', () => {
    render(<TaskCard task={baseTask} />)
    expect(screen.getByText('Test Task')).toBeInTheDocument()
  })

  it('shows priority badge for high priority', () => {
    render(<TaskCard task={{ ...baseTask, priority: 'high' }} />)
    expect(screen.getByText('High')).toBeInTheDocument()
  })

  it('does not show priority badge for normal', () => {
    render(<TaskCard task={baseTask} />)
    expect(screen.queryByText('Normal')).not.toBeInTheDocument()
  })

  it('renders label chips', () => {
    const task: TaskWithRelations = {
      ...baseTask,
      labels: [
        {
          id: 'l1',
          user_id: 'u1',
          name: 'Bug',
          color: '#ef4444',
          created_at: '2026-01-01T00:00:00Z',
        },
      ],
    }
    render(<TaskCard task={task} />)
    expect(screen.getByText('Bug')).toBeInTheDocument()
  })

  it('renders due date', () => {
    render(<TaskCard task={{ ...baseTask, due_date: '2026-06-15' }} />)
    expect(screen.getByText('Jun 15')).toBeInTheDocument()
  })

  it('has accessible role and label', () => {
    render(<TaskCard task={baseTask} />)
    const card = screen.getByRole('button', { name: /Task: Test Task/ })
    expect(card).toBeInTheDocument()
  })
})
