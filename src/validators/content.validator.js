import { z } from "zod";

import { cta, image, objectId } from "./common.js";

export const createContentSchema = z.object({
  section: objectId,
  title: z.string().trim().optional(),
  body: z.string().trim().optional(),
  icon: z.string().trim().optional(),
  num: z.string().trim().optional(),
  badge: z.string().trim().optional(),
  items: z.array(z.string().trim().min(1)).optional(),
  price: z.number().min(0).optional(),
  priceBefore: z.number().min(0).optional(),
  currency: z.string().trim().optional(),
  cta: cta.optional(),
  image: image.optional(),
  order: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export const updateContentSchema = createContentSchema.partial();
