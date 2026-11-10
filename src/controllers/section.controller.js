import { Content } from "../models/content.model.js";
import { Section } from "../models/section.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { crud } from "./crud.factory.js";

const base = crud(Section, { sort: "order", filters: ["type", "isVisible"], search: ["name", "key"] });

export const sections = {
  ...base,
  /** Deleting a section also removes its content items. */
  remove: asyncHandler(async (req, res) => {
    const section = await Section.findByIdAndDelete(req.params.id);
    if (!section) throw new ApiError(404, "Section not found");
    await Content.deleteMany({ section: section._id });
    res.json({ success: true, data: { id: section.id } });
  }),
};
