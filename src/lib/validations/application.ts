import { z } from 'zod'

export const appStatusSchema = z.enum(['active', 'inactive', 'archived', 'maintenance'])

export const createApplicationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  repository_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  tech_stack: z.array(z.string()).default([]),
  status: appStatusSchema.default('active'),
  tag_ids: z.array(z.string().uuid()).default([]),
})

export const updateApplicationSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(100).optional(),
  description: z.string().max(500).optional().nullable(),
  repository_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
  tech_stack: z.array(z.string()).optional(),
  status: appStatusSchema.optional(),
  tag_ids: z.array(z.string().uuid()).optional(),
})

export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>
