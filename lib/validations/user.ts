import { z } from "zod";

export const UserUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  password: z.string().min(6).max(100).optional(),
});
