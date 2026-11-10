import { Setting } from "../models/setting.model.js";
import { asyncHandler } from "../utils/async-handler.js";

export const getSettings = asyncHandler(async (_req, res) => {
  const settings = await Setting.findOneAndUpdate({ singleton: "site" }, {}, { upsert: true, new: true });
  res.json({ success: true, data: settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.findOneAndUpdate({ singleton: "site" }, req.body, {
    upsert: true,
    new: true,
    runValidators: true,
  });
  res.json({ success: true, data: settings });
});
