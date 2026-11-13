import path from "node:path";
import { fileURLToPath } from "node:url";

import multer from "multer";

import { ApiError } from "./api-error.js";

/**
 * Images uploaded before they moved into MongoDB sit here and are still served from disk
 * when the folder exists (local development). New uploads never touch the disk.
 */
export const IMAGES_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../images");

/**
 * Vercel functions reject request bodies over 4.5 MB, so a bigger limit could never be reached there.
 * Keep the frontend's check (v2 `uploads.action.ts`) in step with this.
 */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

/** The extension comes from the verified content type, never from the client's filename. */
export const EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
};

export const CONTENT_TYPES = Object.fromEntries(Object.entries(EXTENSIONS).map(([type, ext]) => [ext, type]));

const startsWith = (buffer, bytes, offset = 0) => bytes.every((byte, index) => buffer[offset + index] === byte);

/**
 * The real type of an image, read from its first bytes. The `Content-Type` a browser sends is
 * only a claim; trusting it would let a script or HTML file be stored and served as an "image".
 */
export function sniffImageType(buffer) {
  if (!buffer || buffer.length < 12) return null;
  if (startsWith(buffer, [0xff, 0xd8, 0xff])) return "image/jpeg";
  if (startsWith(buffer, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) return "image/png";
  if (startsWith(buffer, [0x47, 0x49, 0x46, 0x38])) return "image/gif";
  if (startsWith(buffer, [0x52, 0x49, 0x46, 0x46]) && startsWith(buffer, [0x57, 0x45, 0x42, 0x50], 8)) return "image/webp";
  // AVIF is an ISO base media file: "ftyp" at byte 4, then the brand.
  if (startsWith(buffer, [0x66, 0x74, 0x79, 0x70], 4) && /^(avif|avis)$/.test(buffer.toString("latin1", 8, 12))) return "image/avif";
  return null;
}

export const uploadImage = multer({
  // Held in memory, then written to MongoDB by the controller.
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
  fileFilter: (_req, file, cb) =>
    EXTENSIONS[file.mimetype] ? cb(null, true) : cb(new ApiError(400, "Only JPEG, PNG, WebP, GIF or AVIF images are allowed")),
}).single("image");
