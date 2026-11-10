import { ApiError } from "../utils/api-error.js";

/** Parses `req[source]` with a Zod schema and replaces it with the clean result. */
export const validate =
  (schema, source = "body") =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      }));
      return next(new ApiError(400, "Validation failed", details));
    }

    // Express 5 makes req.query a getter, so only the body is reassigned.
    if (source === "body") req.body = result.data;
    next();
  };
