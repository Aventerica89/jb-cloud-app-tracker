import { z } from 'zod'

export const createNoteSchema = z.object({
  application_id: z.string().uuid(),
  content: z.string().min(1, 'Content is required').max(5000),
})

export const updateNoteSchema = z.object({
  id: z.string().uuid(),
  content: z.string().min(1).max(5000),
})
