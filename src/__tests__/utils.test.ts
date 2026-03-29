import { describe, expect, it } from 'vitest'

import { cn, getDueDateColor, getDueDateStatus, getInitials } from '@/lib/utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('resolves Tailwind conflicts', () => {
    expect(cn('p-2', 'p-4')).toBe('p-4')
  })

  it('handles conditional classes', () => {
    const hide = false as boolean
    expect(cn('foo', hide && 'bar', 'baz')).toBe('foo baz')
  })
})

describe('getDueDateStatus', () => {
  it('returns null for no date', () => {
    expect(getDueDateStatus(null)).toBeNull()
  })

  it('returns overdue for past dates', () => {
    expect(getDueDateStatus('2020-01-01')).toBe('overdue')
  })

  it('returns soon for dates within 2 days', () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    expect(getDueDateStatus(tomorrow.toISOString().split('T')[0]!)).toBe('soon')
  })

  it('returns normal for future dates beyond 2 days', () => {
    const future = new Date()
    future.setDate(future.getDate() + 10)
    expect(getDueDateStatus(future.toISOString().split('T')[0]!)).toBe('normal')
  })
})

describe('getDueDateColor', () => {
  it('returns text-danger for overdue', () => {
    expect(getDueDateColor('overdue')).toBe('text-danger')
  })

  it('returns text-warning for soon', () => {
    expect(getDueDateColor('soon')).toBe('text-warning')
  })

  it('returns text-success for normal', () => {
    expect(getDueDateColor('normal')).toBe('text-success')
  })

  it('returns text-muted for null', () => {
    expect(getDueDateColor(null)).toBe('text-muted')
  })
})

describe('getInitials', () => {
  it('returns initials for two-word name', () => {
    expect(getInitials('John Doe')).toBe('JD')
  })

  it('returns single initial for one-word name', () => {
    expect(getInitials('Alice')).toBe('A')
  })

  it('returns ? for empty string', () => {
    expect(getInitials('')).toBe('?')
  })

  it('returns ? for whitespace-only', () => {
    expect(getInitials('   ')).toBe('?')
  })

  it('caps at 2 characters', () => {
    expect(getInitials('Jane Mary Doe')).toBe('JM')
  })
})
