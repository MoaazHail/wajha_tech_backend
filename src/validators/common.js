import { z } from "zod";

export const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

/** An optional reference that the dashboard may clear by sending null or "". */
export const optionalRef = z.preprocess((v) => (v === "" ? null : v), objectId.nullish());

export const image = z.object({
  src: z.string().trim().optional(),
  alt: z.string().trim().optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
});

export const cta = z.object({
  label: z.string().trim().optional(),
  href: z.string().trim().optional(),
});
