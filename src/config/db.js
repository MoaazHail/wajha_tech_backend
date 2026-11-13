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

/** The last connection failure, kept for /api/v1/health. Only its name and code are ever shown. */
export let lastDbError = null;

let connecting = null;

/**
 * Connects once and reuses the connection. Serverless functions start cold and may be
 * reused, so this is safe to call on every request: it returns at once when connected,
 * and after a failure the next call tries again instead of keeping a dead promise.
 */
export function connectDb() {
  if (mongoose.connection.readyState === 1) return Promise.resolve();
  if (connecting) return connecting;
  if (!env.mongoUri) return Promise.reject(new Error("MONGODB_URI is not set"));

  ensureDnsServers();
  mongoose.set("strictQuery", true);

  connecting = mongoose
    // Fail well inside a serverless function's time limit, so the client gets a clear 503.
    .connect(env.mongoUri, { serverSelectionTimeoutMS: 8000 })
    .then(() => {
      lastDbError = null;
      console.log(`MongoDB connected: ${mongoose.connection.name}`);
    })
    .catch((error) => {
      lastDbError = error;
      console.error("MongoDB connection failed:", error.name, error.codeName ?? error.code ?? "", error.message);
      throw error;
    })
    .finally(() => {
      connecting = null;
    });

  return connecting;
}

/** A plain-language hint for the last failure, without echoing anything secret. */
export function dbHint(error) {
  if (!error) return undefined;
  const text = `${error.name} ${error.message}`;
  if (/MONGODB_URI is not set/.test(text)) return "Set MONGODB_URI in the Vercel project settings, then redeploy.";
  if (/bad auth|authentication failed/i.test(text)) return "Wrong database user or password in MONGODB_URI.";
  if (/ServerSelection|ENOTFOUND|querySrv|timed out/i.test(text))
    return "Database not reachable: check MongoDB Atlas > Network Access allows 0.0.0.0/0, and the cluster host in MONGODB_URI.";
  return undefined;
}

export const dbState = () => ["disconnected", "connected", "connecting", "disconnecting"][mongoose.connection.readyState] ?? "unknown";
