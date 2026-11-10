import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env.js";
import { errorHandler, notFound } from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";
import { IMAGES_DIR } from "./utils/upload.js";

export const app = express();

app.use(helmet());
app.use(cors({ origin: env.corsOrigins }));
app.use(express.json({ limit: "1mb" }));
if (env.nodeEnv !== "test") app.use(morgan(env.nodeEnv === "production" ? "combined" : "dev"));

// Uploaded images. v2 proxies /images/* here, so the browser only ever talks to v2.
app.use("/images", express.static(IMAGES_DIR, { index: false, maxAge: "7d", immutable: true }));

app.use("/api/v1", routes);

app.use(notFound);
app.use(errorHandler);
