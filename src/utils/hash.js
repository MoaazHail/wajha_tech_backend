import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;

/** Hashes a plain-text password (or any secret) with bcrypt. */
export const hashPassword = (plain) => bcrypt.hash(plain, SALT_ROUNDS);

/** Resolves true when `plain` matches the stored bcrypt `hash`. */
export const comparePassword = (plain, hash) => bcrypt.compare(plain, hash);
