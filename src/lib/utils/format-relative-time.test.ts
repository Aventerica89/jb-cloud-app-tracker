import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { formatRelativeTime } from './format-relative-time'

describe('formatRelativeTime', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-02-06T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns "just now" for times less than 60 seconds ago', () => {
    expect(formatRelativeTime('2026-02-06T11:59:30Z')).toBe('just now')
    expect(formatRelativeTime('2026-02-06T11:59:55Z')).toBe('just now')
  })

  it('returns minutes ago for times less than an hour ago', () => {
    const result = formatRelativeTime('2026-02-06T11:55:00Z')
    expect(result).toMatch(/5 minutes ago/)
  })

  it('returns hours ago for times less than a day ago', () => {
    const result = formatRelativeTime('2026-02-06T09:00:00Z')
    expect(result).toMatch(/3 hours ago/)
  })

  it('returns days ago for times less than a month ago', () => {
    const result = formatRelativeTime('2026-02-03T12:00:00Z')
    expect(result).toMatch(/3 days ago/)
  })

  it('returns yesterday for 1 day ago', () => {
    const result = formatRelativeTime('2026-02-05T12:00:00Z')
    expect(result).toMatch(/yesterday/)
  })

  it('returns months ago for times less than a year ago', () => {
    const result = formatRelativeTime('2025-11-06T12:00:00Z')
    expect(result).toMatch(/3 months ago/)
  })

  it('returns years ago for times over a year ago', () => {
    const result = formatRelativeTime('2024-02-06T12:00:00Z')
    expect(result).toMatch(/2 years ago/)
  })

  it('handles future dates', () => {
    const result = formatRelativeTime('2026-02-06T15:00:00Z')
    expect(result).toMatch(/in 3 hours/)
  })

  it('returns "just now" for the current time', () => {
    expect(formatRelativeTime('2026-02-06T12:00:00Z')).toBe('just now')
  })
})
