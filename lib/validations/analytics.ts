import { z } from "zod";

export const ReadingSessionCreateSchema = z.object({
  book_id: z.string().uuid(),
});

export const ReadingSessionUpdateSchema = z.object({
  last_page_read: z.number().int().min(1),
  time_spent_seconds: z.number().int().min(0),
});
