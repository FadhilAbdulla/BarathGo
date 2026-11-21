import { type Env, HttpError, clientIp, json, limit, readJson } from "./http";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE = /^[+\d][\d\s-]{7,16}$/;

const LABELS: Record<string, string> = {
  name: "Name",
  phone: "Phone",
  email: "Email",
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

type Kind = "driver" | "business" | "contact";
const SUBJECT: Record<Kind, string> = { driver: "Fleet / cooperative enquiry", business: "Business enquiry", contact: "Website enquiry" };
const REQUIRED: Record<Kind, string[]> = {
  driver: ["name", "phone", "city", "role"],
  business: ["name", "email", "phone", "organisation", "need"],
  contact: ["name", "email", "topic", "message"],
};

/** POST /api/request: emails website enquiries to MAIL_TO via Resend. 503 when not configured (the browser falls back to mailto). */
export async function handleEnquiry(request: Request, env: Env) {
  await limit(env.REQUEST_LIMITER, `form:${clientIp(request)}`);
  const data = await readJson(request);
  if (typeof data.website === "string" && data.website.trim() !== "") return json({ ok: true }); // honeypot

  const kind = (["driver", "business", "contact"] as const).find((value) => value === data.kind);
  if (!kind) throw new HttpError(400, "Please check the form and try again.");

  const fields: Record<string, string> = {};
  for (const key of Object.keys(LABELS)) {
    const value = data[key];
    if (typeof value === "string" && value.trim()) fields[key] = value.trim().slice(0, key === "message" ? 4000 : 200);
  }
  const missing = REQUIRED[kind].filter((key) => !fields[key]);
  if (missing.length) throw new HttpError(400, `Please fill in: ${missing.map((key) => LABELS[key]).join(", ")}.`);
  if (fields.email && !EMAIL.test(fields.email)) throw new HttpError(400, "Please enter a valid email address.");
  if (fields.phone && !PHONE.test(fields.phone)) throw new HttpError(400, "Please enter a valid phone number.");

  const recipients = (env.MAIL_TO ?? "").split(",").map((address) => address.trim()).filter(Boolean);
  if (!env.RESEND_API_KEY || recipients.length === 0) return json({ error: "Email delivery is not configured" }, 503);

  const subject = `${SUBJECT[kind]}: ${fields.organisation ?? fields.name}`.replace(/[\r\n]+/g, " ");
  const text = [
    `New ${SUBJECT[kind].toLowerCase()} from barathgo.com`,
    "",
    ...Object.entries(fields).map(([key, value]) => (key === "message" ? `\n${LABELS[key]}:\n${value}` : `${LABELS[key]}: ${value}`)),
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
