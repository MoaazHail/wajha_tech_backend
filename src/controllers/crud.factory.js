import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";

/**
 * Standard list/get/create/update/remove handlers for a model.
 *
 * - `populate`: passed to every query
 * - `sort`: default sort for list
 * - `filters`: query-string keys that map straight onto fields (`?status=done`)
 * - `search`: fields matched case-insensitively by `?q=`
 * - `buildFilter`: async hook to add or translate filters (e.g. section key -> id)
 */
export function crud(Model, { populate, sort = "-createdAt", filters = [], search = [], buildFilter } = {}) {
  const label = Model.modelName;

  const list = asyncHandler(async (req, res) => {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 50, 1), 200);

    const filter = {};
    for (const key of filters) {
      if (req.query[key] !== undefined && req.query[key] !== "") filter[key] = req.query[key];
    }

    const q = typeof req.query.q === "string" ? req.query.q.trim() : "";
    if (q && search.length) {
      const pattern = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = search.map((field) => ({ [field]: pattern }));
    }

    if (buildFilter) await buildFilter(req, filter);

    const [data, total] = await Promise.all([
      Model.find(filter)
        .populate(populate ?? [])
        .sort(req.query.sort || sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Model.countDocuments(filter),
    ]);

    res.json({ success: true, data, meta: { page, limit, total, pages: Math.ceil(total / limit) } });
  });

  const get = asyncHandler(async (req, res) => {
    const doc = await Model.findById(req.params.id).populate(populate ?? []);
    if (!doc) throw new ApiError(404, `${label} not found`);
    res.json({ success: true, data: doc });
  });

  const create = asyncHandler(async (req, res) => {
    const doc = await Model.create(req.body);
    res.status(201).json({ success: true, data: await doc.populate(populate ?? []) });
  });

  const update = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).populate(
      populate ?? [],
    );
    if (!doc) throw new ApiError(404, `${label} not found`);
    res.json({ success: true, data: doc });
  });

  const remove = asyncHandler(async (req, res) => {
    const doc = await Model.findByIdAndDelete(req.params.id);
    if (!doc) throw new ApiError(404, `${label} not found`);
    res.json({ success: true, data: { id: doc.id } });
  });

  return { list, get, create, update, remove };
}
