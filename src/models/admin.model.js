import mongoose from "mongoose";

import { jsonOptions } from "../utils/to-json.js";

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ["admin", "editor"], default: "admin" },
  },
  {
    timestamps: true,
    toJSON: {
      ...jsonOptions,
      transform: (doc, ret) => {
        jsonOptions.transform(doc, ret);
        delete ret.passwordHash;
        return ret;
      },
    },
  },
);

export const Admin = mongoose.model("Admin", adminSchema);
