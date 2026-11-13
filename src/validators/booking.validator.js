import { z } from "zod";

/** How far ahead a visitor may book, in days. */
export const MAX_DAYS_AHEAD = 90;

const DAY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;
/** Markup, quotes, backslashes and control characters never belong in an email address. */
const BAD_EMAIL_CHARS = /[<>"'`\\\u0000-\u001f]/;

/** Digits with an optional leading +, spaces, dashes and brackets; 7 to 15 digits once the punctuation is dropped. */
const PHONE_CHARS = /^\+?[\d\s().-]+$/;
const phoneDigits = (value) => value.replace(/\D/g, "").length;

const phoneField = z
  .string()
  .trim()
  .max(30)
  .refine((value) => PHONE_CHARS.test(value) && phoneDigits(value) >= 7 && phoneDigits(value) <= 15, "Invalid phone number");

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
  /** Required on the public form so the agency can call the visitor. */
  phone: phoneField,
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
  /** Optional from the dashboard: older bookings have none. */
  phone: phoneField.or(z.literal("")).optional(),
  date: adminDay,
  status: z.enum(["pending", "confirmed", "cancelled"]).optional(),
  note: z.string().trim().max(500).optional(),
});

export const updateAdminBookingSchema = createAdminBookingSchema.partial();
