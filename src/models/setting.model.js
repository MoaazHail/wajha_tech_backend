import mongoose from "mongoose";

import { jsonOptions } from "../utils/to-json.js";

/** Singleton: agency identity and contact details (v2's `SITE` constant). */
const settingSchema = new mongoose.Schema(
  {
    singleton: { type: String, default: "site", unique: true, immutable: true },
    name: { type: String, trim: true, default: "" },
    wordmark: { type: String, trim: true, default: "" },
    tagline: { type: String, trim: true, default: "" },
    description: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
    email: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    foundedYear: Number,
  },
  { timestamps: true, toJSON: jsonOptions },
);

export const Setting = mongoose.model("Setting", settingSchema);
