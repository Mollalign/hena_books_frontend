import { z } from "zod";

const BookCategoryEnum = z.enum([
  "BIBLICAL_STUDIES",
  "THEOLOGY",
  "DEVOTIONAL",
  "CHRISTIAN_LIVING",
  "PRAYER_WORSHIP",
  "CHURCH_HISTORY",
  "APOLOGETICS",
  "FAMILY_MARRIAGE",
  "YOUTH_CHILDREN",
  "MISSIONS_EVANGELISM",
  "SPIRITUAL_GROWTH",
  "BIOGRAPHY_TESTIMONY",
  "COMMENTARY",
  "REFERENCE",
  "OTHER",
]);

export type BookCategoryValue = z.infer<typeof BookCategoryEnum>;

export const BookUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  author: z.string().max(255).optional(),
  description: z.string().optional(),
  category: BookCategoryEnum.optional(),
  scripture_focus: z.string().max(255).optional(),
  page_count: z.number().int().positive().optional(),
  published_date: z.string().optional(),
  is_featured: z.boolean().optional(),
  is_published: z.boolean().optional(),
});

export const BookFilterSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  per_page: z.coerce.number().int().min(1).max(50).default(12),
  search: z.string().optional(),
  category: BookCategoryEnum.optional(),
  featured_only: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
});
