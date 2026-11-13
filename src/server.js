import { app } from "./app.js";
import { connectDb } from "./config/db.js";
import { env } from "./config/env.js";

// A failed first connection must not kill the process: requests retry it (see requireDb),
// and /api/v1/health reports why. On Vercel a crash here meant every route returned 500.
await connectDb().catch(() => {});

app.listen(env.port, () => {
  console.log(`WAJHA API listening on http://localhost:${env.port}/api/v1`);
});
