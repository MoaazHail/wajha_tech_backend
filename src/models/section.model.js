import mongoose from "mongoose";

import { jsonOptions } from "../utils/to-json.js";

/** One band of the landing page, in the order the front end renders them. */
export const SECTION_TYPES = [
  "hero",
  "proof",
  "features",
  "package",
  "services",
  "process",
  "portfolio",
  "cta",
  "footer",
];

const sectionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: SECTION_TYPES, required: true },
    title: { type: String, trim: true, default: "" },
    subtitle: { type: String, trim: true, default: "" },
    order: { type: Number, default: 0 },
    isVisible: { type: Boolean, default: true },
  },
  { timestamps: true, toJSON: jsonOptions },
);

sectionSchema.virtual("contents", { ref: "Content", localField: "_id", foreignField: "section" });

export const Section = mongoose.model("Section", sectionSchema);
