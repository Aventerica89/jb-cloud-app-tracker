import { describe, it, expect } from 'vitest'
import {
  createDeploymentSchema,
  updateDeploymentSchema,
  deploymentStatusSchema,
} from './deployment'

describe('deploymentStatusSchema', () => {
  it('accepts valid statuses', () => {
    expect(deploymentStatusSchema.parse('pending')).toBe('pending')
    expect(deploymentStatusSchema.parse('building')).toBe('building')
    expect(deploymentStatusSchema.parse('deployed')).toBe('deployed')
    expect(deploymentStatusSchema.parse('failed')).toBe('failed')
    expect(deploymentStatusSchema.parse('rolled_back')).toBe('rolled_back')
  })

  it('rejects invalid statuses', () => {
    expect(() => deploymentStatusSchema.parse('invalid')).toThrow()
    expect(() => deploymentStatusSchema.parse('')).toThrow()
  })
})

describe('createDeploymentSchema', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000'

  it('accepts valid deployment data', () => {
    const result = createDeploymentSchema.parse({
      application_id: validUuid,
      provider_id: validUuid,
      environment_id: validUuid,
      url: 'https://my-app.vercel.app',
      branch: 'main',
      commit_sha: 'abc123def456',
      status: 'deployed',
    })

    expect(result.application_id).toBe(validUuid)
    expect(result.provider_id).toBe(validUuid)
    expect(result.environment_id).toBe(validUuid)
    expect(result.url).toBe('https://my-app.vercel.app')
    expect(result.branch).toBe('main')
    expect(result.status).toBe('deployed')
  })

  it('requires application_id, provider_id, and environment_id', () => {
    expect(() =>
      createDeploymentSchema.parse({
        provider_id: validUuid,
        environment_id: validUuid,
      })
    ).toThrow()

    expect(() =>
      createDeploymentSchema.parse({
        application_id: validUuid,
        environment_id: validUuid,
      })
    ).toThrow()

    expect(() =>
      createDeploymentSchema.parse({
        application_id: validUuid,
        provider_id: validUuid,
      })
    ).toThrow()
  })

  it('validates UUIDs', () => {
    expect(() =>
      createDeploymentSchema.parse({
        application_id: 'not-a-uuid',
        provider_id: validUuid,
        environment_id: validUuid,
      })
    ).toThrow()
  })

  it('provides default status', () => {
    const result = createDeploymentSchema.parse({
      application_id: validUuid,
      provider_id: validUuid,
      environment_id: validUuid,
    })

    expect(result.status).toBe('deployed')
  })

  it('accepts empty optional fields', () => {
    const result = createDeploymentSchema.parse({
      application_id: validUuid,
      provider_id: validUuid,
      environment_id: validUuid,
      url: '',
      branch: '',
      commit_sha: '',
    })

    expect(result.url).toBe('')
    expect(result.branch).toBe('')
    expect(result.commit_sha).toBe('')
  })

  it('rejects invalid URLs', () => {
    expect(() =>
      createDeploymentSchema.parse({
        application_id: validUuid,
        provider_id: validUuid,
        environment_id: validUuid,
        url: 'not-a-url',
      })
    ).toThrow()
  })

  it('rejects commit_sha over 40 characters', () => {
    expect(() =>
      createDeploymentSchema.parse({
        application_id: validUuid,
        provider_id: validUuid,
        environment_id: validUuid,
        commit_sha: 'a'.repeat(41),
      })
    ).toThrow()
  })
})

describe('updateDeploymentSchema', () => {
  const validUuid = '123e4567-e89b-12d3-a456-426614174000'

  it('requires valid UUID id', () => {
    expect(() =>
      updateDeploymentSchema.parse({
        id: 'not-a-uuid',
      })
    ).toThrow()
  })

  it('accepts valid update data', () => {
    const result = updateDeploymentSchema.parse({
      id: validUuid,
      url: 'https://updated.vercel.app',
      status: 'failed',
    })

    expect(result.id).toBe(validUuid)
    expect(result.url).toBe('https://updated.vercel.app')
    expect(result.status).toBe('failed')
  })

  it('allows partial updates', () => {
    const result = updateDeploymentSchema.parse({
      id: validUuid,
    })

    expect(result.id).toBe(validUuid)
    expect(result.application_id).toBeUndefined()
    expect(result.status).toBeUndefined()
  })
})
