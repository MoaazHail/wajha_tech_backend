import { Booking } from "../models/booking.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { assertDayFree } from "../utils/booking-days.js";
import { crud } from "./crud.factory.js";

const base = crud(Booking, {
  sort: "-date",
  filters: ["status"],
  search: ["email", "note"],
});

/**
 * Dashboard CRUD for meeting requests. Soonest day first; no emails are sent from here.
 * Like the public form, it will not put two active bookings on the same day.
 */
export const bookings = {
  ...base,
  create: asyncHandler(async (req, res, next) => {
    if (req.body.status !== "cancelled") await assertDayFree(req.body.date);
    return base.create(req, res, next);
  }),
  update: asyncHandler(async (req, res, next) => {
    const current = await Booking.findById(req.params.id).select("date status");
    if (current) {
      const date = req.body.date ?? current.date;
      const status = req.body.status ?? current.status;
      if (status !== "cancelled") await assertDayFree(date, current._id);
    }
    return base.update(req, res, next);
  }),
};
