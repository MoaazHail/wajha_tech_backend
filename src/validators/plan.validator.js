import { z } from "zod";

import { image } from "./common.js";

export const createPlanSchema = z.object({
  title: z.string().trim().min(1),
  kind: z.enum(["package", "website", "profile"]).optional(),
  price: z.number().min(0),
  priceBefore: z.number().min(0).optional(),
  currency: z.string().trim().optional(),
  benefits: z.array(z.string().trim().min(1)).optional(),
  badge: z.string().trim().optional(),
  cta: z.string().trim().optional(),
  image: image.optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updatePlanSchema = createPlanSchema.partial();
