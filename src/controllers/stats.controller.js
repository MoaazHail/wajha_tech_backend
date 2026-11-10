import { Project } from "../models/project.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/async-handler.js";

/** The four dashboard cards. Revenue is the price of the plan on every finished project. */
export const stats = asyncHandler(async (_req, res) => {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [projects, active, clients, projectsThisMonth, clientsThisMonth, revenue] = await Promise.all([
    Project.countDocuments(),
    Project.countDocuments({ status: "active" }),
    User.countDocuments(),
    Project.countDocuments({ createdAt: { $gte: startOfMonth } }),
    User.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Project.aggregate([
      { $match: { status: "done", plan: { $ne: null } } },
      { $lookup: { from: "plans", localField: "plan", foreignField: "_id", as: "plan" } },
      { $unwind: "$plan" },
      { $group: { _id: null, total: { $sum: "$plan.price" } } },
    ]),
  ]);

  res.json({
    success: true,
    data: {
      projects,
      active,
      clients,
      revenue: revenue[0]?.total ?? 0,
      projectsThisMonth,
      clientsThisMonth,
    },
  });
});
