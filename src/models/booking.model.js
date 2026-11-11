import mongoose from "mongoose";

import { jsonOptions } from "../utils/to-json.js";

export const BOOKING_STATUSES = ["pending", "confirmed", "cancelled"];

/** A meeting a visitor asked for from the landing page: the day they picked and the email to reach them. */
const bookingSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    /** Stored as the picked calendar day at 00:00 UTC. */
    date: { type: Date, required: true },
    status: { type: String, enum: BOOKING_STATUSES, default: "pending" },
    /** Private note for the agency (never shown to the visitor). */
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true, toJSON: jsonOptions },
);

bookingSchema.index({ date: 1 });

export const Booking = mongoose.model("Booking", bookingSchema);
