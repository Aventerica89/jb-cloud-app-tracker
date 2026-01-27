import { z } from 'zod'

export const createTagSchema = z.object({
  name: z.string().min(1, 'Name is required').max(30),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')
    .default('#3b82f6'),
})

export const updateTagSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(30).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'Must be a valid hex color')
    .optional(),
})

export type CreateTagInput = z.infer<typeof createTagSchema>
export type UpdateTagInput = z.infer<typeof updateTagSchema>
