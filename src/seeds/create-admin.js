/**
 * Creates (or updates the password of) one admin without touching any other
 * collection.
 *
 *   npm run create-admin -- "Name" email@example.com "password"
 *
 * With no arguments it falls back to ADMIN_NAME / ADMIN_EMAIL / ADMIN_PASSWORD.
 */
import mongoose from "mongoose";

import { connectDb } from "../config/db.js";
import { env } from "../config/env.js";
import { Admin } from "../models/admin.model.js";
import { hashPassword } from "../utils/hash.js";

const [argName, argEmail, argPassword] = process.argv.slice(2);

const name = argName && argEmail ? argName : env.admin.name;
const email = (argEmail ?? env.admin.email)?.toLowerCase();
const password = argPassword ?? env.admin.password;

try {
  if (!email || !password) throw new Error("Provide name, email and password, or set ADMIN_EMAIL / ADMIN_PASSWORD.");
  if (password.length < 8) throw new Error("Password must be at least 8 characters.");

  await connectDb();

  const passwordHash = await hashPassword(password);
  const existing = await Admin.findOne({ email });

  if (existing) {
    existing.passwordHash = passwordHash;
    await existing.save();
    console.log(`Updated the password of ${email}`);
  } else {
    await Admin.create({ name, email, passwordHash });
    console.log(`Admin created: ${email}`);
  }
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await mongoose.disconnect();
}
