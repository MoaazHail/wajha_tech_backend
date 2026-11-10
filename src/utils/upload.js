import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import multer from "multer";

import { ApiError } from "./api-error.js";

/** Uploaded images live here (backend/images) and are served at /images/<name>. */
export const IMAGES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../images");

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** The extension comes from the verified mimetype, never from the client's filename. */
const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

fs.mkdirSync(IMAGES_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: IMAGES_DIR,
  // Unique by the moment of upload: 1761923456789.png
  filename: (_req, file, cb) => cb(null, `${Date.now()}${EXTENSIONS[file.mimetype]}`),
});

export const uploadImage = multer({
  storage,
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) =>
    EXTENSIONS[file.mimetype] ? cb(null, true) : cb(new ApiError(400, "Only JPEG, PNG, WebP, GIF or AVIF images are allowed")),
}).single("image");
