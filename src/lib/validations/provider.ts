import { z } from 'zod'

export const createProviderSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens'),
  icon_name: z.string().max(50).optional(),
  base_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
})

export const updateProviderSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1, 'Name is required').max(50).optional(),
  slug: z
    .string()
    .min(1)
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase alphanumeric with hyphens')
    .optional(),
  icon_name: z.string().max(50).optional().nullable(),
  base_url: z.string().url('Must be a valid URL').optional().or(z.literal('')).nullable(),
  is_active: z.boolean().optional(),
})

export type CreateProviderInput = z.infer<typeof createProviderSchema>
export type UpdateProviderInput = z.infer<typeof updateProviderSchema>
