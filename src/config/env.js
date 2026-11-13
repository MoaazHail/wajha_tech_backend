const required = ["MONGODB_URI", "JWT_SECRET"];

/**
 * Names of required variables that are missing or still hold a placeholder. Locally the
 * process stops right away; on Vercel it keeps running so /api/v1/health can say what is
 * wrong instead of every request failing with a bare FUNCTION_INVOCATION_FAILED.
 */
export const missingEnv = required.filter((key) => !process.env[key]);
if (/[<>]/.test(process.env.MONGODB_URI ?? "")) missingEnv.push("MONGODB_URI (still a <placeholder>)");

if (missingEnv.length) {
  console.error(`Missing or invalid environment variables: ${missingEnv.join(", ")}`);
  if (!process.env.VERCEL) process.exit(1);
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d",
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  mail: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.MAIL_FROM ?? "WAJHA <no-reply@wajha.sa>",
    /** Where booking requests go. Falls back to the contact email saved in the dashboard settings. */
    notify: process.env.BOOKING_NOTIFY_EMAIL,
  },
  admin: {
    name: process.env.ADMIN_NAME ?? "WAJHA Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
};
