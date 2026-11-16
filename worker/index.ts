/**
 * Cloudflare Worker for barathgo.com.
 *   - http:// and www.barathgo.com → 301 to https://barathgo.com
 *   - POST /api/request → validates a ride request / driver sign-up / business or contact enquiry
 *     and emails it to MAIL_TO via Resend (https://resend.com)
 *   - everything else → static files from out/ via the ASSETS binding
 *
 * Returns 503 when RESEND_API_KEY or MAIL_TO is missing, so the browser falls back to the visitor's email app.
 */

interface Env {
  ASSETS: Fetcher;
  RESEND_API_KEY?: string;
  MAIL_TO?: string;
  MAIL_FROM: string;
  REQUEST_LIMITER?: { limit(options: { key: string }): Promise<{ success: boolean }> };
}

const CANONICAL_HOST = "barathgo.com";
const ALLOWED_ORIGINS = ["https://barathgo.com", "https://www.barathgo.com"];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+\d][\d\s-]{7,16}$/;

const LABELS: Record<string, string> = {
  name: "Name",
  phone: "Phone",
  email: "Email",
  pickup: "Pickup",
  drop: "Drop",
  date: "Date",
  time: "Time",
  ride: "Ride type",
  trip: "Trip type",
  passengers: "Passengers",
  city: "City",
  state: "State / UT",
  role: "Joining as",
  vehicle: "Vehicle",
  fleet: "Fleet size",
  organisation: "Organisation",
  need: "Travel need",
  volume: "Monthly trips",
  topic: "Topic",
  message: "Message",
};

type Kind = "ride" | "driver" | "business" | "contact";
const SUBJECT: Record<Kind, string> = { ride: "Ride request", driver: "Driver / partner sign-up", business: "Business enquiry", contact: "Website enquiry" };
const REQUIRED: Record<Kind, string[]> = {
  ride: ["name", "phone", "pickup", "drop", "date", "time", "ride"],
  driver: ["name", "phone", "city", "role", "vehicle"],
  business: ["name", "email", "phone", "organisation", "need"],
  contact: ["name", "email", "topic", "message"],
};

const json = (body: object, status = 200) => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" } });

function isAllowedOrigin(origin: string | null, requestUrl: string) {
  if (!origin) return false;
  return ALLOWED_ORIGINS.includes(origin) || origin === new URL(requestUrl).origin;
}

async function handleRequest(request: Request, env: Env): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  if (!isAllowedOrigin(request.headers.get("Origin"), request.url)) return json({ error: "Forbidden" }, 403);

  if (env.REQUEST_LIMITER) {
    const { success } = await env.REQUEST_LIMITER.limit({ key: request.headers.get("CF-Connecting-IP") ?? "unknown" });
    if (!success) return json({ error: "Too many submissions. Please wait a minute and try again." }, 429);
  }

  let data: Record<string, unknown>;
  try {
    data = (await request.json()) as Record<string, unknown>;
  } catch {
    return json({ error: "Please check the form and try again." }, 400);
  }

  // Honeypot: bots fill the hidden "website" field. Pretend success so they don't retry.
  if (typeof data.website === "string" && data.website.trim() !== "") return json({ ok: true });

  const kind = (["ride", "driver", "business", "contact"] as const).find((value) => value === data.kind);
  if (!kind) return json({ error: "Please check the form and try again." }, 400);

  const fields: Record<string, string> = {};
  for (const key of Object.keys(LABELS)) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) fields[key] = value.trim().slice(0, key === "message" ? 4000 : 200);
  }
  const missing = REQUIRED[kind].filter((key) => !fields[key]);
  if (missing.length) return json({ error: `Please fill in: ${missing.map((key) => LABELS[key]).join(", ")}.` }, 400);
  if (fields.email && !EMAIL.test(fields.email)) return json({ error: "Please enter a valid email address." }, 400);
  if (fields.phone && !PHONE.test(fields.phone)) return json({ error: "Please enter a valid phone number." }, 400);

  const recipients = (env.MAIL_TO ?? "").split(",").map((address) => address.trim()).filter(Boolean);
  if (!env.RESEND_API_KEY || recipients.length === 0) return json({ error: "Email delivery is not configured" }, 503);

  const who = fields.organisation ?? fields.name;
  const subject = `${SUBJECT[kind]}: ${who}${kind === "ride" ? ` · ${fields.date} ${fields.time}` : ""}`.replace(/[\r\n]+/g, " ");
  const text = [
    `New ${SUBJECT[kind].toLowerCase()} from barathgo.com`,
    "",
    ...Object.entries(fields).map(([key, value]) => (key === "message" ? `\n${LABELS[key]}:\n${value}` : `${LABELS[key]}: ${value}`)),
    "",
    fields.email ? "Reply to this email to respond directly to the sender." : "No email given: contact the sender by phone.",
  ].join("\n");

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env.MAIL_FROM, to: recipients, ...(fields.email ? { reply_to: fields.email } : {}), subject, text }),
  });
  if (!response.ok) {
    console.error("Resend error", response.status, await response.text());
    return json({ error: "Email delivery failed" }, 502);
  }
  return json({ ok: true });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const isProductionHost = url.hostname === CANONICAL_HOST || url.hostname === `www.${CANONICAL_HOST}`;
    if (isProductionHost && (url.hostname !== CANONICAL_HOST || url.protocol !== "https:")) {
      url.hostname = CANONICAL_HOST;
      url.protocol = "https:";
      url.port = "";
      return Response.redirect(url.toString(), 301);
    }
    if (url.pathname === "/api/request") return handleRequest(request, env);
    if (url.pathname.startsWith("/api/")) return json({ error: "Not found" }, 404);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
