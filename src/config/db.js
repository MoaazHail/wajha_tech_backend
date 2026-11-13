import dns from "node:dns";

import mongoose from "mongoose";

import { env } from "./env.js";

/**
 * `mongodb+srv://` URIs need a DNS SRV lookup, done by Node's own resolver. On
 * some Windows setups (VPN or virtual adapters) Node can't read the system DNS
 * servers and is left with only 127.0.0.1, which refuses the query:
 * "querySrv ECONNREFUSED". In that case fall back to public resolvers, or use
 * the ones listed in DNS_SERVERS (comma-separated) when set.
 */
function ensureDnsServers() {
  const configured = (process.env.DNS_SERVERS ?? "")
    .split(",")
    .map((server) => server.trim())
    .filter(Boolean);

  if (configured.length) return dns.setServers(configured);

  const onlyLoopback = dns.getServers().every((server) => server === "127.0.0.1" || server === "::1");
  if (onlyLoopback) dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

let connecting;

/** Safe to call on every request: serverless functions reuse one connection while warm. */
export function connectDb() {
  connecting ??= (async () => {
    ensureDnsServers();
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongoUri);
    console.log(`MongoDB connected: ${mongoose.connection.name}`);
  })().catch((error) => {
    connecting = undefined;
    throw error;
  });
  return connecting;
}
