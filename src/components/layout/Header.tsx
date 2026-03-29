import { useMemo, useState } from 'react'

import { isPast, isToday, parseISO } from 'date-fns'
import { Filter, Plus, Search, Tag, Users, X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useLabels, useCreateLabel } from '@/hooks/useLabels'
import { useTasks } from '@/hooks/useTasks'
import { useTeamMembers } from '@/hooks/useTeam'
import { useBoardStore } from '@/store/boardStore'
import { PRIORITY_CONFIG } from '@/types'
import type { TaskPriority } from '@/types'

const LABEL_COLORS = ['#ef4444', '#f59e0b', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899']

/** App header with search, filters, stats, and team access */
export function Header() {
  const { data: tasks = [] } = useTasks()
  const { data: teamMembers = [] } = useTeamMembers()
  const { data: labels = [] } = useLabels()
  const createLabel = useCreateLabel()

  const searchQuery = useBoardStore((s) => s.searchQuery)
  const setSearchQuery = useBoardStore((s) => s.setSearchQuery)
  const filterPriority = useBoardStore((s) => s.filterPriority)
  const setFilterPriority = useBoardStore((s) => s.setFilterPriority)
  const filterAssignee = useBoardStore((s) => s.filterAssignee)
  const setFilterAssignee = useBoardStore((s) => s.setFilterAssignee)
  const filterLabel = useBoardStore((s) => s.filterLabel)
  const setFilterLabel = useBoardStore((s) => s.setFilterLabel)
  const setTeamPanelOpen = useBoardStore((s) => s.setTeamPanelOpen)

  const [showFilters, setShowFilters] = useState(false)
  const [showLabelCreator, setShowLabelCreator] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0] ?? '#ef4444')

  const stats = useMemo(() => {
    const total = tasks.length
    const done = tasks.filter((t) => t.status === 'done').length
    const overdue = tasks.filter((t) => {
      if (!t.due_date || t.status === 'done') return false
      const date = parseISO(t.due_date)
      return isPast(date) && !isToday(date)
    }).length
    const rate = total > 0 ? Math.round((done / total) * 100) : 0
    return { total, done, overdue, rate }
  }, [tasks])

  const hasActiveFilters = filterPriority || filterAssignee || filterLabel

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) return
    createLabel.mutate({ name: newLabelName.trim(), color: newLabelColor })
    setNewLabelName('')
    setShowLabelCreator(false)
  }

  return (
    <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-30">
      <div className="flex items-center justify-between px-6 h-14">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <h1 className="text-[20px] font-semibold text-text">PlayBoard</h1>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md mx-6">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              aria-hidden="true"
            />
            <Input
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-bg border-border"
              data-testid="search-input"
              aria-label="Search tasks"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <div
            className="hidden md:flex items-center gap-3 bg-bg rounded-full px-4 py-1.5 text-[11px] text-muted mr-2"
            aria-label="Board statistics"
          >
            <span>{stats.total} tasks</span>
            <span className="text-success">{stats.done} done</span>
            {stats.overdue > 0 && <span className="text-danger">{stats.overdue} overdue</span>}
            <div
              className="w-16 h-1.5 bg-border rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={stats.rate}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label="Completion rate"
            >
              <div
                className="h-full bg-accent rounded-full transition-all"
                style={{ width: `${stats.rate}%` }}
              />
            </div>
          </div>

          <Button
            variant={showFilters ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
            aria-label="Toggle filters"
            aria-expanded={showFilters}
          >
            <Filter className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && (
              <span
                className="absolute -top-1 -right-1 w-2 h-2 bg-accent rounded-full"
                aria-hidden="true"
              />
            )}
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setTeamPanelOpen(true)}
            aria-label="Open team panel"
          >
            <Users className="w-4 h-4" aria-hidden="true" />
            <span className="hidden sm:inline">Team</span>
          </Button>
        </div>
      </div>

      {/* Filter bar */}
      {showFilters && (
        <div className="px-6 py-3 border-t border-border bg-bg/50 space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted">Priority:</span>
              {(Object.keys(PRIORITY_CONFIG) as TaskPriority[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setFilterPriority(filterPriority === p ? null : p)}
                  className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                    filterPriority === p
                      ? 'bg-accent text-white'
                      : 'bg-card text-muted hover:text-text'
                  }`}
                  aria-pressed={filterPriority === p}
                >
                  {PRIORITY_CONFIG[p].label}
                </button>
              ))}
            </div>

            {teamMembers.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted">Assignee:</span>
                {teamMembers.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setFilterAssignee(filterAssignee === m.id ? null : m.id)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                      filterAssignee === m.id
                        ? 'bg-accent text-white'
                        : 'bg-card text-muted hover:text-text'
                    }`}
                    aria-pressed={filterAssignee === m.id}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            )}

            {labels.length > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted">Label:</span>
                {labels.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => setFilterLabel(filterLabel === l.id ? null : l.id)}
                    className={`px-2 py-0.5 rounded text-xs font-medium transition-colors cursor-pointer ${
                      filterLabel === l.id ? 'ring-2 ring-accent' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: `${l.color}20`,
                      color: l.color,
                    }}
                    aria-pressed={filterLabel === l.id}
                  >
                    {l.name}
                  </button>
                ))}
              </div>
            )}

            <button
              onClick={() => setShowLabelCreator(!showLabelCreator)}
              className="flex items-center gap-1 text-xs text-muted hover:text-text cursor-pointer"
              aria-label="Create new label"
            >
              <Tag className="w-3 h-3" aria-hidden="true" />
              <Plus className="w-3 h-3" aria-hidden="true" />
            </button>

            {hasActiveFilters && (
              <button
                onClick={() => {
                  setFilterPriority(null)
                  setFilterAssignee(null)
                  setFilterLabel(null)
                }}
                className="text-xs text-danger hover:underline cursor-pointer"
              >
                Clear all
              </button>
            )}
          </div>

          {showLabelCreator && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Label name"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()}
                className="w-40"
                aria-label="New label name"
              />
              <div className="flex gap-1" role="radiogroup" aria-label="Label color">
                {LABEL_COLORS.map((c) => (
                  <button
                    key={c}
                    className={`w-5 h-5 rounded-full cursor-pointer ${
                      newLabelColor === c ? 'ring-2 ring-accent ring-offset-1 ring-offset-bg' : ''
                    }`}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewLabelColor(c)}
                    role="radio"
                    aria-checked={newLabelColor === c}
                    aria-label={`Color ${c}`}
                  />
                ))}
              </div>
              <Button size="sm" onClick={handleCreateLabel} disabled={!newLabelName.trim()}>
                Create
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowLabelCreator(false)}>
                Cancel
              </Button>
            </div>
          )}

          {hasActiveFilters && (
            <div className="flex flex-wrap gap-1.5">
              {filterPriority && (
                <Badge className="gap-1">
                  Priority: {PRIORITY_CONFIG[filterPriority].label}
                  <button
                    onClick={() => setFilterPriority(null)}
                    className="cursor-pointer"
                    aria-label="Remove priority filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filterAssignee && (
                <Badge className="gap-1">
                  Assignee: {teamMembers.find((m) => m.id === filterAssignee)?.name}
                  <button
                    onClick={() => setFilterAssignee(null)}
                    className="cursor-pointer"
                    aria-label="Remove assignee filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {filterLabel && (
                <Badge className="gap-1">
                  Label: {labels.find((l) => l.id === filterLabel)?.name}
                  <button
                    onClick={() => setFilterLabel(null)}
                    className="cursor-pointer"
                    aria-label="Remove label filter"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
      )}
    </header>
  )
}
