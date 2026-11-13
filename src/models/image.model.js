import mongoose from "mongoose";

/**
 * An uploaded image, stored in MongoDB. Vercel (and most hosts) give a backend no permanent
 * disk, so files written there vanish; the database is the one place that survives.
 */
const imageSchema = new mongoose.Schema(
  {
    contentType: { type: String, required: true },
    data: { type: Buffer, required: true },
    size: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Image = mongoose.model("Image", imageSchema);
