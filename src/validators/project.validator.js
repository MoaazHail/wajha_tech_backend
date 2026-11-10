import { z } from "zod";

import { optionalRef } from "./common.js";

export const createProjectSchema = z.object({
  title: z.string().trim().min(1),
  description: z.string().trim().optional(),
  bio_image: z.string().trim().optional(),
  images: z.array(z.string().trim()).optional(),
  live: z.string().trim().optional(),
  status: z.enum(["active", "review", "done"]).optional(),
  date: z.coerce.date().optional(),
  featured: z.boolean().optional(),
  order: z.number().int().optional(),
  user: optionalRef,
  plan: optionalRef,
});

export const updateProjectSchema = createProjectSchema.partial();
