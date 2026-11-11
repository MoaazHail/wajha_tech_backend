import { Plan } from "../models/plan.model.js";
import { Project } from "../models/project.model.js";
import { Setting } from "../models/setting.model.js";
import { asyncHandler } from "../utils/async-handler.js";

/**
 * What the landing page needs from the database, in one request: the featured
 * projects for the work rail, active plans and the site settings. The page's
 * copy itself is static in the frontend.
 */
export const landing = asyncHandler(async (_req, res) => {
  const [projects, plans, settings] = await Promise.all([
    Project.find({ featured: true }).sort("order").select("title description bio_image images live"),
    Plan.find({ isActive: true }).sort("order"),
    Setting.findOne({ singleton: "site" }),
  ]);

  res.json({ success: true, data: { settings, projects, plans } });
});
