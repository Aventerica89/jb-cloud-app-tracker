import { z } from 'zod'

export const sessionSourceSchema = z.enum([
  'claude-code',
  'claude-ai',
  'mixed',
])

export const createSessionSchema = z.object({
  application_id: z.string().uuid('Invalid application'),
  started_at: z.string().datetime().optional(),
  ended_at: z.string().datetime().optional(),
  duration_minutes: z.number().int().min(0).optional(),
  starting_branch: z.string().max(200).optional().or(z.literal('')),
  ending_branch: z.string().max(200).optional().or(z.literal('')),
  commits_count: z.number().int().min(0).default(0),
  context_id: z.string().max(100).optional().or(z.literal('')),
  session_source: sessionSourceSchema.default('claude-code'),
  tokens_input: z.number().int().min(0).optional(),
  tokens_output: z.number().int().min(0).optional(),
  tokens_total: z.number().int().min(0).optional(),
  summary: z.string().max(5000).optional().or(z.literal('')),
  accomplishments: z.array(z.string()).default([]),
  next_steps: z.array(z.string()).default([]),
  files_changed: z.array(z.string()).default([]),
  maintenance_runs: z.array(z.string().uuid()).default([]),
  security_findings: z.record(z.string(), z.unknown()).optional(),
})

export const updateSessionSchema = z.object({
  id: z.string().uuid(),
  ended_at: z.string().datetime().optional(),
  duration_minutes: z.number().int().min(0).optional(),
  ending_branch: z.string().max(200).optional().nullable(),
  commits_count: z.number().int().min(0).optional(),
  session_source: sessionSourceSchema.optional(),
  tokens_input: z.number().int().min(0).optional(),
  tokens_output: z.number().int().min(0).optional(),
  tokens_total: z.number().int().min(0).optional(),
  summary: z.string().max(5000).optional().nullable(),
  accomplishments: z.array(z.string()).optional(),
  next_steps: z.array(z.string()).optional(),
  files_changed: z.array(z.string()).optional(),
  maintenance_runs: z.array(z.string().uuid()).optional(),
  security_findings: z.record(z.string(), z.unknown()).optional().nullable(),
})

// API input schema (for external POST from Claude Code)
export const apiCreateSessionSchema = z.object({
  application_id: z.string().uuid('Invalid application'),
  started_at: z.string().datetime(),
  ended_at: z.string().datetime().optional(),
  starting_branch: z.string().max(200).optional(),
  ending_branch: z.string().max(200).optional(),
  commits_count: z.number().int().min(0).default(0),
  context_id: z.string().max(100).optional(),
  session_source: sessionSourceSchema.default('claude-code'),
  tokens_input: z.number().int().min(0).optional(),
  tokens_output: z.number().int().min(0).optional(),
  summary: z.string().max(5000).optional(),
  accomplishments: z.array(z.string()).default([]),
  next_steps: z.array(z.string()).default([]),
  files_changed: z.array(z.string()).default([]),
  maintenance_runs: z.array(z.string().uuid()).default([]),
  security_findings: z.record(z.string(), z.unknown()).optional(),
})

export type CreateSessionInput = z.infer<typeof createSessionSchema>
export type UpdateSessionInput = z.infer<typeof updateSessionSchema>
export type ApiCreateSessionInput = z.infer<typeof apiCreateSessionSchema>
