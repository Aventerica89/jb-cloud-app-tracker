import { z } from 'zod'

export const createTodoSchema = z.object({
  application_id: z.string().uuid(),
  text: z.string().min(1, 'Text is required').max(500),
})

export const updateTodoSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(500).optional(),
  completed: z.boolean().optional(),
  sort_order: z.number().int().min(0).optional(),
})
