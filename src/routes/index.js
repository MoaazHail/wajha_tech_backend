import { Router } from "express";
import rateLimit from "express-rate-limit";

import { login, me } from "../controllers/auth.controller.js";
import { contents } from "../controllers/content.controller.js";
import { plans } from "../controllers/plan.controller.js";
import { projects } from "../controllers/project.controller.js";
import { landing } from "../controllers/public.controller.js";
import { image } from "../controllers/upload.controller.js";
import { sections } from "../controllers/section.controller.js";
import { getSettings, updateSettings } from "../controllers/setting.controller.js";
import { stats } from "../controllers/stats.controller.js";
import { users } from "../controllers/user.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { validate } from "../middlewares/validate.middleware.js";
import { uploadImage } from "../utils/upload.js";
import { loginSchema } from "../validators/auth.validator.js";
import { createContentSchema, updateContentSchema } from "../validators/content.validator.js";
import { createPlanSchema, updatePlanSchema } from "../validators/plan.validator.js";
import { createProjectSchema, updateProjectSchema } from "../validators/project.validator.js";
import { createSectionSchema, updateSectionSchema } from "../validators/section.validator.js";
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

router.get("/health", (_req, res) => res.json({ success: true, status: "ok" }));

// Public
router.get("/public/landing", landing);

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
router.use("/projects", resourceRouter(projects, { create: createProjectSchema, update: updateProjectSchema }));
router.use("/sections", resourceRouter(sections, { create: createSectionSchema, update: updateSectionSchema }));
router.use("/contents", resourceRouter(contents, { create: createContentSchema, update: updateContentSchema }));

export default router;
