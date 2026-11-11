import { env } from "../config/env.js";
import { ApiError } from "../utils/api-error.js";

export const notFound = (req, _res, next) => next(new ApiError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, _req, res, _next) => {
  let status = err.status ?? 500;
  let message = err.message;
  let details = err.details;

  if (err.name === "ValidationError" && err.errors) {
    status = 400;
    message = "Validation failed";
    details = Object.values(err.errors).map((e) => ({ path: e.path, message: e.message }));
  } else if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = `Duplicate value for: ${Object.keys(err.keyValue ?? {}).join(", ")}`;
  } else if (err.name === "MulterError") {
    status = 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Image is too large (max 5 MB)" : err.message;
  } else if (err.name === "JsonWebTokenError" || err.name === "TokenExpiredError") {
    status = 401;
    message = err.name === "TokenExpiredError" ? "Token expired" : "Invalid token";
  }

  if (status >= 500) {
    console.error(err);
    // ApiError messages are written for the client on purpose; only unexpected errors are hidden.
    if (env.nodeEnv === "production" && err.name !== "ApiError") message = "Internal server error";
  }

  res.status(status).json({
    success: false,
    message,
    ...(details ? { details } : {}),
    ...(env.nodeEnv !== "production" && status >= 500 ? { stack: err.stack } : {}),
  });
};
