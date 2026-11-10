import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { verifyToken } from "../utils/token.js";

/** Requires `Authorization: Bearer <jwt>` and attaches the admin to `req.admin`. */
export const protect = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization ?? "";
  const [scheme, token] = header.split(" ");

  if (scheme !== "Bearer" || !token) throw new ApiError(401, "Authentication required");

  const payload = verifyToken(token);
  const admin = await Admin.findById(payload.sub);
  if (!admin) throw new ApiError(401, "Account no longer exists");

  req.admin = admin;
  next();
});

export const restrictTo =
  (...roles) =>
  (req, _res, next) =>
    roles.includes(req.admin?.role) ? next() : next(new ApiError(403, "You do not have permission to do this"));
