import { Image } from "../models/image.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { EXTENSIONS, sniffImageType } from "../utils/upload.js";

/** Saves the uploaded image in MongoDB and answers with its public path, e.g. `/images/66f0….png`. */
export const image = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'Send the image as multipart form data in the "image" field');

  // The file's own bytes decide the type, not the header the client sent.
  const contentType = sniffImageType(req.file.buffer);
  if (!contentType) throw new ApiError(400, "The file is not a valid JPEG, PNG, WebP, GIF or AVIF image");

  const doc = await Image.create({ contentType, data: req.file.buffer, size: req.file.size });

  res.status(201).json({ success: true, data: { path: `/images/${doc.id}${EXTENSIONS[contentType]}` } });
});
