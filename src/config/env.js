const required = ["MONGODB_URI", "JWT_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    console.error(`Missing environment variable: ${key}`);
    process.exit(1);
  }
}

if (/[<>]/.test(process.env.MONGODB_URI)) {
  console.error(
    "MONGODB_URI still contains a placeholder like <user>, <password> or <cluster>.\n" +
      "Copy the real connection string from MongoDB Atlas (Connect > Drivers) into backend/.env.",
  );
  process.exit(1);
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
  admin: {
    name: process.env.ADMIN_NAME ?? "WAJHA Admin",
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  },
};
