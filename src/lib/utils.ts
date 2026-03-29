import { type ClassValue, clsx } from 'clsx'
import { differenceInDays, isPast, isToday, parseISO } from 'date-fns'
import { twMerge } from 'tailwind-merge'

/** Merges Tailwind classes with conflict resolution */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export type DueDateStatus = 'overdue' | 'soon' | 'normal'

/**
 * Returns urgency status for a due date.
 * - 'overdue': date is in the past (not today)
 * - 'soon': date is within 2 days
 * - 'normal': date is more than 2 days away
 * - null: no due date provided
 */
export function getDueDateStatus(dueDate: string | null): DueDateStatus | null {
  if (!dueDate) return null
  const date = parseISO(dueDate)
  if (isPast(date) && !isToday(date)) return 'overdue'
  if (differenceInDays(date, new Date()) <= 2) return 'soon'
  return 'normal'
}

/** Maps due date status to a Tailwind text color class */
export function getDueDateColor(status: DueDateStatus | null): string {
  switch (status) {
    case 'overdue':
      return 'text-danger'
    case 'soon':
      return 'text-warning'
    case 'normal':
      return 'text-success'
    default:
      return 'text-muted'
  }
}

/**
 * Extracts initials from a name string.
 * Handles single names, multi-word names, and empty strings.
 */
export function getInitials(name: string): string {
  if (!name.trim()) return '?'
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
