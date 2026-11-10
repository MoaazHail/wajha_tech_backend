import jwt from "jsonwebtoken";

import { env } from "../config/env.js";

export const signToken = (adminId) => jwt.sign({ sub: adminId }, env.jwtSecret, { expiresIn: env.jwtExpiresIn });

export const verifyToken = (token) => jwt.verify(token, env.jwtSecret);
