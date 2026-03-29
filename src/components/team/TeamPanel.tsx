import { useState } from 'react'

import { Plus, Trash2, Users, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useCreateTeamMember, useDeleteTeamMember, useTeamMembers } from '@/hooks/useTeam'
import { getInitials } from '@/lib/utils'

const COLORS = [
  '#6366f1',
  '#ec4899',
  '#f59e0b',
  '#22c55e',
  '#3b82f6',
  '#ef4444',
  '#8b5cf6',
  '#14b8a6',
]

/** Slide-in drawer for managing team members */
export default function TeamPanel({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: members = [] } = useTeamMembers()
  const createMember = useCreateTeamMember()
  const deleteMember = useDeleteTeamMember()
  const [name, setName] = useState('')
  const [color, setColor] = useState(COLORS[0] ?? '#6366f1')

  if (!open) return null

  const handleAdd = () => {
    if (!name.trim()) return
    createMember.mutate({ name: name.trim(), color })
    setName('')
    setColor(COLORS[Math.floor(Math.random() * COLORS.length)] ?? '#6366f1')
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} aria-hidden="true" />
      <div
        className="fixed right-0 top-0 bottom-0 w-80 bg-surface border-l border-border z-50 flex flex-col shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-label="Team members panel"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-accent" aria-hidden="true" />
            <h2 className="text-sm font-semibold">Team Members</h2>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close team panel">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-4 border-b border-border">
          <div className="flex gap-2 mb-3">
            <Input
              placeholder="Member name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
              className="flex-1"
              aria-label="New member name"
            />
            <Button
              size="default"
              onClick={handleAdd}
              disabled={!name.trim()}
              aria-label="Add member"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-1.5 flex-wrap" role="radiogroup" aria-label="Member color">
            {COLORS.map((c) => (
              <button
                key={c}
                className={`w-6 h-6 rounded-full transition-all cursor-pointer ${
                  color === c
                    ? 'ring-2 ring-accent ring-offset-2 ring-offset-surface scale-110'
                    : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
                onClick={() => setColor(c)}
                role="radio"
                aria-checked={color === c}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {members.length === 0 && (
            <p className="text-muted text-sm text-center py-8">No team members yet</p>
          )}
          {members.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-card transition-colors group"
            >
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-medium shrink-0"
                style={{ backgroundColor: member.color }}
                aria-hidden="true"
              >
                {getInitials(member.name)}
              </div>
              <span className="text-sm flex-1 truncate">{member.name}</span>
              <Button
                variant="ghost"
                size="icon-sm"
                className="opacity-0 group-hover:opacity-100 text-danger"
                onClick={() => deleteMember.mutate(member.id)}
                aria-label={`Remove ${member.name}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
