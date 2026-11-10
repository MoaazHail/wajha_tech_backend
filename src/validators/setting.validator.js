import { z } from "zod";

export const updateSettingSchema = z.object({
  name: z.string().trim().optional(),
  wordmark: z.string().trim().optional(),
  tagline: z.string().trim().optional(),
  description: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z.string().trim().optional(),
  whatsapp: z.string().trim().optional(),
  address: z.string().trim().optional(),
  foundedYear: z.number().int().optional(),
});
