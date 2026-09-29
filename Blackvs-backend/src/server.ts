import Fastify from "fastify";
import cors from "@fastify/cors";
import { request } from "undici";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";

const app = Fastify({ logger: true });
await app.register(cors, {
  origin: (process.env.CORS_ORIGIN ?? "http://localhost:5173").split(",").map(x => x.trim()),
  credentials: true
});

const PORT = Number(process.env.PORT ?? 8080);
const AGENT = process.env.AGENT_URL ?? "http://127.0.0.1:9100";
const DATA_DIR = process.env.DATA_DIR ?? "./data";
fs.mkdirSync(DATA_DIR, { recursive: true });

type Item = { id: string; [key: string]: unknown };
const dbFile = path.join(DATA_DIR, "blackvs.json");
let store: {sites: Item[]; databases: Item[]; ftp: Item[]; mailDomains: Item[]} =
  fs.existsSync(dbFile)
    ? JSON.parse(fs.readFileSync(dbFile, "utf8"))
    : { sites: [], databases: [], ftp: [], mailDomains: [] };

function save() {
  fs.writeFileSync(dbFile, JSON.stringify(store, null, 2), { mode: 0o600 });
}

async function agent<T>(route: string, init?: RequestInit): Promise<T> {
  const r = await request(`${AGENT}${route}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers as any ?? {}) }
  });
  const text = await r.body.text();
  if (r.statusCode >= 400) throw new Error(text || `agent ${r.statusCode}`);
  return text ? JSON.parse(text) : ({} as T);
}

function validDomain(v: string) {
  return /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(v);
}
function safeName(v: string, max = 48) {
  return /^[A-Za-z0-9_-]+$/.test(v) && v.length > 0 && v.length <= max;
}

app.get("/api/health", async () => ({ ok:true, service:"blackvs-api", time:new Date().toISOString() }));
app.get("/api/server", async () => agent("/server"));
app.get("/api/metrics", async () => agent("/metrics"));
app.get("/api/services", async () => agent("/services"));
app.get("/api/sites", async () => store.sites);
app.get("/api/databases", async () => store.databases);
app.get("/api/ftp/users", async () => store.ftp);
app.get("/api/mail/domains", async () => store.mailDomains);
app.get("/api/mail/mailboxes", async () => (store as any).mailboxes || []);

app.post("/api/sites", async (req, reply) => {
  const domain = String((req.body as any)?.domain ?? "").toLowerCase().trim();
  if (!validDomain(domain)) return reply.code(400).send({error:"Invalid domain"});
  if (store.sites.some(x => x.domain === domain)) return reply.code(409).send({error:"Site already exists"});
  await agent("/site/create", {method:"POST", body:JSON.stringify({domain})});
  const item = {id:randomUUID(), domain, status:"active", createdAt:new Date().toISOString()};
  store.sites.push(item); save();
  return reply.code(201).send(item);
});

app.post("/api/sites/:id/reload", async (req, reply) => {
  const item = store.sites.find(x => x.id === (req.params as any).id);
  if (!item) return reply.code(404).send({error:"Site not found"});
  await agent("/site/reload", {method:"POST", body:JSON.stringify({domain:item.domain})});
  return {ok:true};
});

app.post("/api/sites/:id/ssl", async (req, reply) => {
  const item = store.sites.find(x => x.id === (req.params as any).id);
  if (!item) return reply.code(404).send({error:"Site not found"});
  try {
    await agent("/site/ssl", {method:"POST", body:JSON.stringify({domain:item.domain, email:`admin@${item.domain}`})});
    item.sslActive = true;
    item.sslExpiryDays = 90;
    save();
    return {ok:true};
  } catch (err: any) {
    return reply.code(500).send({error: err.message || "Failed to provision SSL"});
  }
});

app.post("/api/databases", async (req, reply) => {
  const body = req.body as any;
  const name = String(body?.name ?? "").trim();
  const username = String(body?.username ?? "").trim();
  const password = String(body?.password ?? "");
  if (!safeName(name) || !safeName(username, 32) || password.length < 12)
    return reply.code(400).send({error:"Use safe names and a password of at least 12 characters"});
  await agent("/database/create", {method:"POST", body:JSON.stringify({name,username,password})});
  const item = {id:randomUUID(), name, username, createdAt:new Date().toISOString()};
  store.databases.push(item); save();
  return reply.code(201).send(item);
});

app.post("/api/ftp/users", async (req, reply) => {
  const body = req.body as any;
  const username = String(body?.username ?? "").trim();
  const home = String(body?.home ?? "").trim();
  const password = String(body?.password ?? "");
  if (!safeName(username, 32) || password.length < 12)
    return reply.code(400).send({error:"Invalid FTP username or password"});
  await agent("/ftp/create", {method:"POST", body:JSON.stringify({username,home,password})});
  const item = {id:randomUUID(), username, home:home || `/var/www/${username}`, createdAt:new Date().toISOString()};
  store.ftp.push(item); save();
  return reply.code(201).send(item);
});

app.post("/api/mail/domains", async (req, reply) => {
  const domain = String((req.body as any)?.domain ?? "").toLowerCase().trim();
  if (!validDomain(domain)) return reply.code(400).send({error:"Invalid domain"});
  const res = await agent<any>("/mail/domain", {method:"POST", body:JSON.stringify({domain})});
  const item = {id:randomUUID(), domain, createdAt:new Date().toISOString(), note:res?.note};
  store.mailDomains.push(item); save();
  return reply.code(201).send(item);
});

app.post("/api/mail/mailboxes", async (req, reply) => {
  const body = req.body as any;
  const email = String(body?.email ?? "").toLowerCase().trim();
  const password = String(body?.password ?? "");
  if (!email.includes("@") || password.length < 8) return reply.code(400).send({error:"Invalid email or weak password"});
  const res = await agent<any>("/mail/mailbox", {method:"POST", body:JSON.stringify({email, password})});
  const item = {id:randomUUID(), email, createdAt:new Date().toISOString()};
  if (!(store as any).mailboxes) (store as any).mailboxes = [];
  (store as any).mailboxes.push(item); save();
  return reply.code(201).send(item);
});

app.post("/api/services/:name/:action", async (req, reply) => {
  const name = String((req.params as any).name);
  const action = String((req.params as any).action);
  const names = new Set(["nginx","mysql","mariadb","vsftpd","postfix","dovecot"]);
  const actions = new Set(["start","stop","restart","status"]);
  if (!names.has(name) || !actions.has(action)) return reply.code(400).send({error:"Unsupported service/action"});
  return agent(`/service/${name}/${action}`, {method:"POST", body:"{}"});
});

app.get("/api/events", async (req, reply) => {
  reply.hijack();
  const res = reply.raw;
  res.writeHead(200, {
    "Content-Type":"text/event-stream",
    "Cache-Control":"no-cache",
    "Connection":"keep-alive",
    "Access-Control-Allow-Origin":process.env.CORS_ORIGIN ?? "http://localhost:5173"
  });
  let closed = false;
  req.raw.on("close", () => { closed = true; });
  while (!closed) {
    try {
      const metrics = await agent("/metrics");
      res.write(`data: ${JSON.stringify(metrics)}\n\n`);
    } catch (e) {
      res.write(`event: error\ndata: ${JSON.stringify({error:String(e)})}\n\n`);
    }
    await new Promise(r => setTimeout(r, 5000));
  }
});

app.setErrorHandler((err, _req, reply) => {
  app.log.error(err);
  reply.code(500).send({error:"Internal server error"});
});

await app.listen({port:PORT, host:"127.0.0.1"});
