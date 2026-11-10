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

const ctaSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    href: { type: String, trim: true },
  },
  { _id: false },
);

/**
 * One item inside a section. The shape is shared on purpose: every landing
 * block in v2 (feature, process step, service, package, avatar, hero copy)
 * is some subset of these fields.
 */
const contentSchema = new mongoose.Schema(
  {
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section", required: true, index: true },
    title: { type: String, trim: true, default: "" },
    body: { type: String, trim: true, default: "" },
    icon: { type: String, trim: true },
    num: { type: String, trim: true },
    badge: { type: String, trim: true },
    items: { type: [String], default: [] },
    price: { type: Number, min: 0 },
    priceBefore: { type: Number, min: 0 },
    currency: { type: String, trim: true },
    cta: ctaSchema,
    image: imageSchema,
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: jsonOptions },
);

export const Content = mongoose.model("Content", contentSchema);
