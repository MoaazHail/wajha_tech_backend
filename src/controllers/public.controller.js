import { Content } from "../models/content.model.js";
import { Plan } from "../models/plan.model.js";
import { Project } from "../models/project.model.js";
import { Section } from "../models/section.model.js";
import { Setting } from "../models/setting.model.js";
import { asyncHandler } from "../utils/async-handler.js";

/**
 * Everything the landing page renders, in one request: visible sections (each
 * with its active items), the featured projects for the work rail, active
 * plans and the site settings.
 */
export const landing = asyncHandler(async (_req, res) => {
  const [sections, contents, projects, plans, settings] = await Promise.all([
    Section.find({ isVisible: true }).sort("order"),
    Content.find({ isActive: true }).sort("order"),
    Project.find({ featured: true }).sort("order").select("title description bio_image images live"),
    Plan.find({ isActive: true }).sort("order"),
    Setting.findOne({ singleton: "site" }),
  ]);

  const bySection = new Map();
  for (const item of contents) {
    const key = String(item.section);
    if (!bySection.has(key)) bySection.set(key, []);
    bySection.get(key).push(item);
  }

  res.json({
    success: true,
    data: {
      settings,
      sections: sections.map((section) => ({ ...section.toJSON(), contents: bySection.get(String(section._id)) ?? [] })),
      projects,
      plans,
    },
  });
});
