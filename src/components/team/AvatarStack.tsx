import { memo } from 'react'

import { cn, getInitials } from '@/lib/utils'
import type { TeamMemberRow } from '@/types'

interface AvatarStackProps {
  members: TeamMemberRow[]
  max?: number
  size?: 'sm' | 'md'
}

/** Overlapping avatar circles for team member display */
const AvatarStack = memo(function AvatarStack({ members, max = 3, size = 'sm' }: AvatarStackProps) {
  const visible = members.slice(0, max)
  const remaining = members.length - max

  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs'

  return (
    <div className="flex -space-x-1.5">
      {visible.map((member) => (
        <div
          key={member.id}
          className={cn(
            'rounded-full flex items-center justify-center font-medium ring-2 ring-card',
            sizeClasses
          )}
          style={{ backgroundColor: member.color }}
          title={member.name}
          aria-label={member.name}
        >
          {member.avatar_url ? (
            <img
              src={member.avatar_url}
              alt={`${member.name}'s avatar`}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-white" aria-hidden="true">
              {getInitials(member.name)}
            </span>
          )}
        </div>
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full flex items-center justify-center font-medium bg-surface text-muted ring-2 ring-card',
            sizeClasses
          )}
          aria-label={`${remaining} more members`}
        >
          +{remaining}
        </div>
      )}
    </div>
  )
})

export { AvatarStack }
