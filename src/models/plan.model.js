import mongoose from "mongoose";

import { jsonOptions } from "../utils/to-json.js";

const imageSchema = new mongoose.Schema(
  {
    src: { type: String, trim: true },
    alt: { type: String, trim: true },
    width: Number,
    height: Number,
  },
  { _id: false },
);

const planSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    kind: { type: String, enum: ["package", "website", "profile"], default: "package" },
    price: { type: Number, required: true, min: 0 },
    priceBefore: { type: Number, min: 0 },
    currency: { type: String, default: "ريال", trim: true },
    benefits: { type: [String], default: [] },
    badge: { type: String, trim: true },
    cta: { type: String, trim: true },
    image: imageSchema,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: jsonOptions },
);

/** The clients on this plan. */
planSchema.virtual("users", { ref: "User", localField: "_id", foreignField: "plan" });

/** How many clients are on this plan (the dashboard's "orders"); populate it by name. */
planSchema.virtual("orders", { ref: "User", localField: "_id", foreignField: "plan", count: true });

export const Plan = mongoose.model("Plan", planSchema);
