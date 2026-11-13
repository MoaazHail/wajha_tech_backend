import { Image } from "../models/image.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { CONTENT_TYPES } from "../utils/upload.js";

const FILE = /^([a-f\d]{24})(\.(?:jpg|png|webp|gif|avif))$/i;

/** Public. Serves an uploaded image from MongoDB: `GET /images/<id>.<ext>`. */
export const serveImage = asyncHandler(async (req, res) => {
  const match = FILE.exec(req.params.file);
  if (!match) throw new ApiError(404, "Image not found");

  const doc = await Image.findById(match[1]).select("contentType data");
  if (!doc) throw new ApiError(404, "Image not found");

  res.set({
    "Content-Type": doc.contentType ?? CONTENT_TYPES[match[2].toLowerCase()],
    // The id never changes what it points at, so browsers and the CDN can keep it for a year.
    "Cache-Control": "public, max-age=31536000, immutable",
    // The site loads these through its own domain, but other origins may embed them too.
    "Cross-Origin-Resource-Policy": "cross-origin",
  });
  res.send(doc.data);
});
