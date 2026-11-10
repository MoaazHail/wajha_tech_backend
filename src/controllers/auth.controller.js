import { Admin } from "../models/admin.model.js";
import { ApiError } from "../utils/api-error.js";
import { asyncHandler } from "../utils/async-handler.js";
import { comparePassword } from "../utils/hash.js";
import { signToken } from "../utils/token.js";

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+passwordHash");
  // Same message for unknown email and wrong password, so accounts can't be probed.
  if (!admin || !(await comparePassword(password, admin.passwordHash))) throw new ApiError(401, "Invalid email or password");

  res.json({ success: true, data: { token: signToken(admin.id), admin } });
});

export const me = (req, res) => {
  res.json({ success: true, data: req.admin });
};
