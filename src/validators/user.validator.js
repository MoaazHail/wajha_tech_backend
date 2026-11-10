import { z } from "zod";

import { optionalRef } from "./common.js";

export const createUserSchema = z.object({
  name: z.string().trim().min(1),
  phone: z.string().trim().min(5),
  email: z.string().trim().email().optional().or(z.literal("")),
  plan: optionalRef,
});

export const updateUserSchema = createUserSchema.partial();
