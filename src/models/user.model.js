import mongoose from "mongoose";

import { jsonOptions } from "../utils/to-json.js";

/** A client of the agency (العملاء). Not a login account: admins live in Admin. */
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, lowercase: true, trim: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  },
  { timestamps: true, toJSON: jsonOptions },
);

userSchema.index({ name: "text", email: "text", phone: "text" });

export const User = mongoose.model("User", userSchema);
