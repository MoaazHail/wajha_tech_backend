import { z } from "zod";

import { SECTION_TYPES } from "../models/section.model.js";

export const createSectionSchema = z.object({
  key: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Use lowercase letters, digits and dashes"),
  name: z.string().trim().min(1),
  type: z.enum(SECTION_TYPES),
  title: z.string().trim().optional(),
  subtitle: z.string().trim().optional(),
  order: z.number().int().optional(),
  isVisible: z.boolean().optional(),
});

export const updateSectionSchema = createSectionSchema.partial();
