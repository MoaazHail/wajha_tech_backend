import { Plan } from "../models/plan.model.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiError } from "../utils/api-error.js";
import { crud } from "./crud.factory.js";

const base = crud(Plan, { sort: "order", filters: ["kind", "isActive"], search: ["title"] });

/** The dashboard's `orders` column: how many clients are on each plan. */
const withOrders = "orders";

export const plans = {
  ...base,
  list: asyncHandler(async (req, res) => {
    const data = await Plan.find().sort("order").populate(withOrders);
    res.json({ success: true, data, meta: { total: data.length } });
  }),
  get: asyncHandler(async (req, res) => {
    const plan = await Plan.findById(req.params.id).populate(withOrders);
    if (!plan) throw new ApiError(404, "Plan not found");
    res.json({ success: true, data: plan });
  }),
};
