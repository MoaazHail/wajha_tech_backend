import mongoose from "mongoose";

import { jsonOptions } from "../utils/to-json.js";

const projectSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: "" },
    bio_image: { type: String, trim: true, default: "" },
    images: { type: [String], default: [] },
    live: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["active", "review", "done"], default: "active" },
    date: { type: Date, default: Date.now },
    /** Shown in the landing page's work rail. */
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: "Plan" },
  },
  { timestamps: true, toJSON: jsonOptions },
);

projectSchema.index({ title: "text", description: "text" });

export const Project = mongoose.model("Project", projectSchema);
