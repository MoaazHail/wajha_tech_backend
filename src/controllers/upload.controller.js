import { ApiError } from "../utils/api-error.js";

/** Answers with the public path of the image multer just saved, e.g. `/images/1761923456789.png`. */
export const image = (req, res) => {
  if (!req.file) throw new ApiError(400, 'Send the image as multipart form data in the "image" field');

  res.status(201).json({ success: true, data: { path: `/images/${req.file.filename}` } });
};
