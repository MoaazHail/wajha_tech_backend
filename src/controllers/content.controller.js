import { Content } from "../models/content.model.js";
import { Section } from "../models/section.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { crud } from "./crud.factory.js";

const OBJECT_ID = /^[a-f\d]{24}$/i;

const base = crud(Content, {
  populate: { path: "section", select: "key name type" },
  sort: "order",
  filters: ["isActive"],
  search: ["title", "body"],
  // `?section=` takes either the section id or its key ("hero", "why", ...).
  buildFilter: async (req, filter) => {
    const ref = req.query.section;
    if (typeof ref !== "string" || !ref) return;

    if (OBJECT_ID.test(ref)) {
      filter.section = ref;
      return;
    }

    const section = await Section.findOne({ key: ref.toLowerCase() }).select("_id");
    filter.section = section?._id ?? null;
  },
});

export const contents = {
  ...base,
  create: asyncHandler(async (req, res, next) => {
    if (!(await Section.exists({ _id: req.body.section }))) throw new ApiError(400, "Section does not exist");
    return base.create(req, res, next);
  }),
};
