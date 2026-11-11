import { Booking } from "../models/booking.model.js";
import { ApiError } from "./api-error.js";

export const DAY_TAKEN_MESSAGE = "هذا اليوم محجوز، اختر يوماً آخر";

/** A cancelled booking frees its day again. */
const ACTIVE = { status: { $ne: "cancelled" } };

/** Is another active booking already on this day? `exceptId` skips the booking being edited. */
export async function isDayTaken(date, exceptId) {
  const filter = { date, ...ACTIVE, ...(exceptId ? { _id: { $ne: exceptId } } : {}) };
  return Boolean(await Booking.exists(filter));
}

export async function assertDayFree(date, exceptId) {
  if (await isDayTaken(date, exceptId)) throw new ApiError(409, DAY_TAKEN_MESSAGE);
}

/** Upcoming days that already have an active booking, as `YYYY-MM-DD`. No personal data. */
export async function takenDays() {
  const now = new Date();
  const startOfToday = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - 1));
  const rows = await Booking.find({ date: { $gte: startOfToday }, ...ACTIVE }).select("date");

  return [...new Set(rows.map((row) => row.date.toISOString().slice(0, 10)))].sort();
}
