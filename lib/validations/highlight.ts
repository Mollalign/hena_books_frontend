import { z } from "zod";

const HighlightAreaSchema = z.object({
  height: z.number().min(0),
  left: z.number().min(0),
  pageIndex: z.number().int().min(0),
  top: z.number().min(0),
  width: z.number().min(0),
});

export const HighlightCreateSchema = z.object({
  page_index: z.number().int().min(0),
  color: z.string().min(1).max(32),
  quote: z.string().trim().min(1).max(5000),
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  highlight_areas: z.array(HighlightAreaSchema).min(1),
});
