import { describe, it, expect } from 'vitest'
import {
  createApplicationSchema,
  updateApplicationSchema,
  appStatusSchema,
} from './application'

describe('appStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(appStatusSchema.parse('active')).toBe('active')
    expect(appStatusSchema.parse('inactive')).toBe('inactive')
    expect(appStatusSchema.parse('archived')).toBe('archived')
    expect(appStatusSchema.parse('maintenance')).toBe('maintenance')
  })

  it('rejects invalid statuses', () => {
    expect(() => appStatusSchema.parse('invalid')).toThrow()
    expect(() => appStatusSchema.parse('')).toThrow()
  })
})

describe('createApplicationSchema', () => {
  it('accepts valid application data', () => {
    const result = createApplicationSchema.parse({
      name: 'My App',
      description: 'A great app',
      repository_url: 'https://github.com/user/repo',
      tech_stack: ['React', 'Node.js'],
      status: 'active',
      tag_ids: [],
    })

    expect(result.name).toBe('My App')
    expect(result.description).toBe('A great app')
    expect(result.repository_url).toBe('https://github.com/user/repo')
    expect(result.tech_stack).toEqual(['React', 'Node.js'])
    expect(result.status).toBe('active')
  })

  it('requires name', () => {
    expect(() =>
      createApplicationSchema.parse({
        description: 'A great app',
      })
    ).toThrow()
  })

  it('rejects empty name', () => {
    expect(() =>
      createApplicationSchema.parse({
        name: '',
      })
    ).toThrow()
  })

  it('rejects name over 100 characters', () => {
    expect(() =>
      createApplicationSchema.parse({
        name: 'a'.repeat(101),
      })
    ).toThrow()
  })

  it('provides default values', () => {
    const result = createApplicationSchema.parse({
      name: 'My App',
    })

    expect(result.tech_stack).toEqual([])
    expect(result.status).toBe('active')
    expect(result.tag_ids).toEqual([])
  })

  it('accepts empty repository_url', () => {
    const result = createApplicationSchema.parse({
      name: 'My App',
      repository_url: '',
    })

    expect(result.repository_url).toBe('')
  })

  it('rejects invalid repository_url', () => {
    expect(() =>
      createApplicationSchema.parse({
        name: 'My App',
        repository_url: 'not-a-url',
      })
    ).toThrow()
  })

  it('rejects description over 500 characters', () => {
    expect(() =>
      createApplicationSchema.parse({
        name: 'My App',
        description: 'a'.repeat(501),
      })
    ).toThrow()
  })
})

describe('updateApplicationSchema', () => {
  const validId = '123e4567-e89b-12d3-a456-426614174000'

  it('requires valid UUID id', () => {
    expect(() =>
      updateApplicationSchema.parse({
        id: 'not-a-uuid',
        name: 'Updated Name',
      })
    ).toThrow()
  })

  it('accepts valid update data', () => {
    const result = updateApplicationSchema.parse({
      id: validId,
      name: 'Updated Name',
      status: 'maintenance',
    })

    expect(result.id).toBe(validId)
    expect(result.name).toBe('Updated Name')
    expect(result.status).toBe('maintenance')
  })

  it('allows partial updates', () => {
    const result = updateApplicationSchema.parse({
      id: validId,
    })

    expect(result.id).toBe(validId)
    expect(result.name).toBeUndefined()
    expect(result.description).toBeUndefined()
  })

  it('accepts null for nullable fields', () => {
    const result = updateApplicationSchema.parse({
      id: validId,
      description: null,
      repository_url: null,
    })

    expect(result.description).toBeNull()
    expect(result.repository_url).toBeNull()
  })
})
