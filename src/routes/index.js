import { Router } from "express";
import rateLimit from "express-rate-limit";

import { login, me } from "../controllers/auth.controller.js";
import { bookings } from "../controllers/booking-admin.controller.js";
import { createBooking, listTakenDays } from "../controllers/booking.controller.js";
import { plans } from "../controllers/plan.controller.js";
import { projects } from "../controllers/project.controller.js";
import { landing } from "../controllers/public.controller.js";
import { image } from "../controllers/upload.controller.js";
import { getSettings, updateSettings } from "../controllers/setting.controller.js";
import { stats } from "../controllers/stats.controller.js";
import { users } from "../controllers/user.controller.js";
import { connectDb, dbHint, dbState, lastDbError } from "../config/db.js";
import { missingEnv } from "../config/env.js";
import { protect } from "../middlewares/auth.middleware.js";
import { requireDb } from "../middlewares/db.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { uploadImage } from "../utils/upload.js";
import { loginSchema } from "../validators/auth.validator.js";
import {
  createAdminBookingSchema,
  createBookingSchema,
  updateAdminBookingSchema,
} from "../validators/booking.validator.js";
import { createPlanSchema, updatePlanSchema } from "../validators/plan.validator.js";
import { createProjectSchema, updateProjectSchema } from "../validators/project.validator.js";
import { updateSettingSchema } from "../validators/setting.validator.js";
import { createUserSchema, updateUserSchema } from "../validators/user.validator.js";
import { resourceRouter } from "./resource.router.js";

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many login attempts, try again later" },
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 10,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { success: false, message: "Too many booking requests, try again later" },
});

/**
 * Liveness plus a diagnosis: whether the database is reachable and which required variables
 * are missing (names only). Never includes secrets or the connection string.
 */
router.get("/health", async (_req, res) => {
  await connectDb().catch(() => {});
  const db = dbState();
  const ok = db === "connected" && missingEnv.length === 0;

  res.status(ok ? 200 : 503).json({
    success: ok,
    status: ok ? "ok" : "degraded",
    db,
    ...(lastDbError && db !== "connected"
      ? {
          dbError: [lastDbError.name, lastDbError.codeName ?? lastDbError.code].filter(Boolean).join(": "),
          hint: dbHint(lastDbError),
        }
      : {}),
    ...(missingEnv.length ? { missingEnv } : {}),
  });
});

// Everything below needs the database.
router.use(requireDb);

// Public
router.get("/public/landing", landing);
router.get("/public/bookings/taken", listTakenDays);
router.post("/public/bookings", bookingLimiter, validate(createBookingSchema), createBooking);

// Auth
router.post("/auth/login", loginLimiter, validate(loginSchema), login);
router.get("/auth/me", protect, me);

// Everything below needs a valid JWT.
router.use(protect);

router.get("/stats", stats);
router.post("/uploads/image", uploadImage, image);
router.route("/settings").get(getSettings).put(validate(updateSettingSchema), updateSettings);

router.use("/users", resourceRouter(users, { create: createUserSchema, update: updateUserSchema }));
router.use("/plans", resourceRouter(plans, { create: createPlanSchema, update: updatePlanSchema }));
router.use("/bookings", resourceRouter(bookings, { create: createAdminBookingSchema, update: updateAdminBookingSchema }));
router.use("/projects", resourceRouter(projects, { create: createProjectSchema, update: updateProjectSchema }));

export default router;
