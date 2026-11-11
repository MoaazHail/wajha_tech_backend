import { z } from "zod";

/** How far ahead a visitor may book, in days. */
export const MAX_DAYS_AHEAD = 90;

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;
/** Markup, quotes, backslashes and control characters never belong in an email address. */
const BAD_EMAIL_CHARS = /[<>"'`\\\u0000-\u001f]/;

const startOfTodayUtc = () => {
  const now = new Date();
  return Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
};

export const createBookingSchema = z.object({
  email: z
    .string()
    .trim()
    .max(254)
    .email()
    .refine((value) => !BAD_EMAIL_CHARS.test(value), "Invalid characters"),
  /** A calendar day, `YYYY-MM-DD`. */
  date: z
    .string()
    .regex(DAY, "Use YYYY-MM-DD")
    .refine((value) => {
      const time = Date.parse(`${value}T00:00:00Z`);
      return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
    }, "Not a real date")
    .refine((value) => {
      const time = Date.parse(`${value}T00:00:00Z`);
      const today = startOfTodayUtc();
      // A day of slack either side so a visitor in another timezone is not rejected for "today".
      return time >= today - DAY_MS && time <= today + MAX_DAYS_AHEAD * DAY_MS;
    }, "Pick a day from today up to 90 days ahead"),
});

const adminDay = z
  .string()
  .regex(DAY, "Use YYYY-MM-DD")
  .refine((value) => {
    const time = Date.parse(`${value}T00:00:00Z`);
    return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
  }, "Not a real date")
  .transform((value) => new Date(`${value}T00:00:00Z`));

/** Dashboard bookings: any real day (past ones too, for records), plus a status and a private note. */
export const createAdminBookingSchema = z.object({
  email: createBookingSchema.shape.email,
  date: adminDay,
  status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
  note: z.string().trim().max(500).optional(),
});

export const updateAdminBookingSchema = createAdminBookingSchema.partial();
