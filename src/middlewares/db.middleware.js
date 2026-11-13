import { connectDb } from "../config/db.js";
import { ApiError } from "../utils/api-error.js";

/** Makes sure the database is connected before a handler runs; answers 503 instead of hanging or crashing. */
export const requireDb = async (_req, _res, next) => {
  try {
    await connectDb();
    next();
  } catch {
    next(new ApiError(503, "Database unavailable, try again shortly"));
  }
};
