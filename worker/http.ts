export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  MAIL_FROM: string;
  RESEND_API_KEY?: string;
  MAIL_TO?: string;
  /** "1" locally: OTP codes are returned in the API response instead of sent by SMS, and new drivers are auto-approved. Never set in production. */
  DEV_MODE?: string;
  /** Comma-separated phone numbers (+91XXXXXXXXXX or 10 digits) with admin access. */
  ADMIN_PHONES?: string;
  /** SMS for login codes (Twilio). */
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_FROM?: string;
  /** OSRM routing server. Defaults to the public demo server, which is for testing only. */
  OSRM_URL?: string;
  REQUEST_LIMITER?: RateLimit;
  OTP_LIMITER?: RateLimit;
}

type RateLimit = { limit(options: { key: string }): Promise<{ success: boolean }> };

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", "Cache-Control": "no-store", ...headers } });

export async function readJson(request: Request): Promise<Record<string, unknown>> {
  try {
    const data = await request.json();
    if (data && typeof data === "object" && !Array.isArray(data)) return data as Record<string, unknown>;
  } catch {
    /* fall through */
  }
  throw new HttpError(400, "Invalid request body.");
}

export const str = (value: unknown, max = 200) => (typeof value === "string" ? value.trim().slice(0, max) : "");

export function num(value: unknown, name: string, min: number, max: number) {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < min || n > max) throw new HttpError(400, `Invalid ${name}.`);
  return n;
}

export const isDev = (env: Env) => env.DEV_MODE === "1";

export const clientIp = (request: Request) => request.headers.get("CF-Connecting-IP") ?? "local";

export async function limit(limiter: RateLimit | undefined, key: string) {
  if (!limiter) return;
  const { success } = await limiter.limit({ key });
  if (!success) throw new HttpError(429, "Too many requests. Please wait a minute and try again.");
}

export const newId = () => crypto.randomUUID();

export async function sha256(text: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function randomDigits(length: number) {
  const values = crypto.getRandomValues(new Uint32Array(length));
  return [...values].map((value) => String(value % 10)).join("");
}
