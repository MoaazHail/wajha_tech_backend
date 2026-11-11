const B = "http://localhost:4000/api/v1";
const N = 15;
const stat = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return { min: s[0], avg: a.reduce((x, y) => x + y, 0) / a.length, p95: s[Math.ceil(s.length * 0.95) - 1], max: s.at(-1) };
};
async function time(method, path, { token, body } = {}) {
  const t = performance.now();
  const r = await fetch(B + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await r.text();
  return { ms: performance.now() - t, status: r.status, bytes: Buffer.byteLength(text), json: (() => { try { return JSON.parse(text); } catch { return null; } })() };
}
const login = await time("POST", "/auth/login", { body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } });
const token = login.json?.data?.token;
const targets = [
  ["GET", "/health"], ["GET", "/public/landing"], ["POST", "/auth/login", { body: { email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD } }],
  ["GET", "/auth/me", { token }], ["GET", "/stats", { token }], ["GET", "/settings", { token }],
  ["GET", "/plans", { token }], ["GET", "/projects?limit=200", { token }], ["GET", "/users?limit=200", { token }],
  ["POST", "/auth/login", { body: { email: "x@x.com", password: "wrong" } }, "login (wrong password)"],
  ["GET", "/stats", {}, "stats (no token → 401)"], ["GET", "/nope", {}, "unknown route → 404"],
];
const out = [];
await time("GET", "/health"); // warm-up
for (const [m, p, o, label] of targets) {
  const ms = []; let status, bytes;
  for (let i = 0; i < N; i++) { const r = await time(m, p, o); ms.push(r.ms); status = r.status; bytes = r.bytes; }
  out.push({ endpoint: label ?? `${m} ${p}`, status, bytes, ...Object.fromEntries(Object.entries(stat(ms)).map(([k, v]) => [k, +v.toFixed(1)])) });
}
console.table(out);
console.log(JSON.stringify(out));
