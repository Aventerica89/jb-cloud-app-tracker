import { z } from 'zod'

export const maintenanceStatusSchema = z.enum([
  'pending',
  'running',
  'completed',
  'failed',
  'skipped',
])

export const createMaintenanceRunSchema = z.object({
  application_id: z.string().uuid('Invalid application'),
  command_type_id: z.string().uuid('Invalid command type'),
  status: maintenanceStatusSchema.default('completed'),
  results: z.record(z.unknown()).optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
  run_at: z.string().datetime().optional(), // ISO date string
})

export const updateMaintenanceRunSchema = z.object({
  id: z.string().uuid(),
  status: maintenanceStatusSchema.optional(),
  results: z.record(z.unknown()).optional().nullable(),
  notes: z.string().max(1000).optional().nullable(),
})
