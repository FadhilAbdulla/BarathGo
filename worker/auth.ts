import { type Env, HttpError, clientIp, isDev, json, limit, newId, randomDigits, readJson, sha256, str } from "./http";

const SESSION_COOKIE = "bg_session";
const SESSION_DAYS = 30;
const OTP_TTL_MS = 5 * 60 * 1000;
const OTP_RESEND_MS = 30 * 1000;

export type User = { id: string; phone: string; name: string | null; isAdmin: boolean; driver: DriverRow | null };
export type DriverRow = {
  user_id: string;
  vehicle_type: string;
  vehicle_model: string;
  vehicle_number: string;
  licence_number: string;
  city: string;
  approved: number;
  online: number;
  lat: number | null;
  lng: number | null;
  location_at: number | null;
};

/** Accepts 10-digit Indian mobiles with or without +91 / 0 prefix. Returns +91XXXXXXXXXX. */
export function normalisePhone(input: unknown) {
  const digits = String(input ?? "").replace(/\D/g, "");
  const local = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits.length === 11 && digits.startsWith("0") ? digits.slice(1) : digits;
  if (!/^[6-9]\d{9}$/.test(local)) throw new HttpError(400, "Enter a valid 10-digit Indian mobile number.");
  return `+91${local}`;
}

const adminPhones = (env: Env) =>
  (env.ADMIN_PHONES ?? "")
    .split(",")
    .map((phone) => phone.trim())
    .filter(Boolean)
    .flatMap((phone) => {
      try {
        return [normalisePhone(phone)];
      } catch {
        return [];
      }
    });

async function sendSms(env: Env, to: string, body: string) {
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_FROM) return false;
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${env.TWILIO_ACCOUNT_SID}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`)}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: to, From: env.TWILIO_FROM, Body: body }),
  });
  if (!response.ok) console.error("Twilio error", response.status, await response.text());
  return response.ok;
}

export async function requestOtp(request: Request, env: Env) {
  const data = await readJson(request);
  const phone = normalisePhone(data.phone);
  await limit(env.OTP_LIMITER, `ip:${clientIp(request)}`);

  const now = Date.now();
  const existing = await env.DB.prepare("SELECT created_at FROM otps WHERE phone = ?").bind(phone).first<{ created_at: number }>();
  if (existing && now - existing.created_at < OTP_RESEND_MS) throw new HttpError(429, "Please wait 30 seconds before requesting another code.");

  const code = randomDigits(6);
  await env.DB.prepare("INSERT OR REPLACE INTO otps (phone, code_hash, expires_at, attempts, created_at) VALUES (?, ?, ?, 0, ?)")
    .bind(phone, await sha256(`${phone}:${code}`), now + OTP_TTL_MS, now)
    .run();

  if (isDev(env)) return json({ ok: true, phone, devCode: code });
  const sent = await sendSms(env, phone, `${code} is your BarathGo login code. It expires in 5 minutes. Do not share it with anyone.`);
  if (!sent) throw new HttpError(503, "We couldn't send the code right now. Please try again shortly.");
  return json({ ok: true, phone });
}

export async function verifyOtp(request: Request, env: Env) {
  const data = await readJson(request);
  const phone = normalisePhone(data.phone);
  const code = str(data.code, 6);
  const name = str(data.name, 80);
  const now = Date.now();

  const otp = await env.DB.prepare("SELECT code_hash, expires_at, attempts FROM otps WHERE phone = ?").bind(phone).first<{ code_hash: string; expires_at: number; attempts: number }>();
  if (!otp || otp.expires_at < now) throw new HttpError(400, "This code has expired. Request a new one.");
  if (otp.attempts >= 5) throw new HttpError(429, "Too many wrong attempts. Request a new code.");
  if (otp.code_hash !== (await sha256(`${phone}:${code}`))) {
    await env.DB.prepare("UPDATE otps SET attempts = attempts + 1 WHERE phone = ?").bind(phone).run();
    throw new HttpError(400, "That code isn't right. Check the SMS and try again.");
  }
  await env.DB.prepare("DELETE FROM otps WHERE phone = ?").bind(phone).run();

  let user = await env.DB.prepare("SELECT id, name FROM users WHERE phone = ?").bind(phone).first<{ id: string; name: string | null }>();
  if (!user) {
    user = { id: newId(), name: name || null };
    await env.DB.prepare("INSERT INTO users (id, phone, name, created_at) VALUES (?, ?, ?, ?)").bind(user.id, phone, user.name, now).run();
  } else if (name && !user.name) {
    await env.DB.prepare("UPDATE users SET name = ? WHERE id = ?").bind(name, user.id).run();
  }

  const token = crypto.randomUUID() + crypto.randomUUID();
  const expires = now + SESSION_DAYS * 86400000;
  await env.DB.prepare("INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)").bind(await sha256(token), user.id, expires).run();
  const cookie = `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DAYS * 86400}`;
  return json({ ok: true, user: await loadUser(env, user.id) }, 200, { "Set-Cookie": cookie });
}

function readToken(request: Request) {
  const cookie = request.headers.get("Cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return match?.[1] ?? null;
}

async function loadUser(env: Env, id: string): Promise<User | null> {
  const row = await env.DB.prepare("SELECT id, phone, name FROM users WHERE id = ?").bind(id).first<{ id: string; phone: string; name: string | null }>();
  if (!row) return null;
  const driver = await env.DB.prepare("SELECT * FROM drivers WHERE user_id = ?").bind(id).first<DriverRow>();
  return { ...row, isAdmin: adminPhones(env).includes(row.phone), driver: driver ?? null };
}

export async function currentUser(request: Request, env: Env): Promise<User | null> {
  const token = readToken(request);
  if (!token) return null;
  const session = await env.DB.prepare("SELECT user_id, expires_at FROM sessions WHERE token_hash = ?").bind(await sha256(token)).first<{ user_id: string; expires_at: number }>();
  if (!session || session.expires_at < Date.now()) return null;
  return loadUser(env, session.user_id);
}

export async function requireUser(request: Request, env: Env) {
  const user = await currentUser(request, env);
  if (!user) throw new HttpError(401, "Please log in to continue.");
  return user;
}

export async function me(request: Request, env: Env) {
  return json({ user: await currentUser(request, env) });
}

export async function updateProfile(request: Request, env: Env) {
  const user = await requireUser(request, env);
  const name = str((await readJson(request)).name, 80);
  if (!name) throw new HttpError(400, "Enter your name.");
  await env.DB.prepare("UPDATE users SET name = ? WHERE id = ?").bind(name, user.id).run();
  return json({ user: await loadUser(env, user.id) });
}

export async function logout(request: Request, env: Env) {
  const token = readToken(request);
  if (token) await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256(token)).run();
  return json({ ok: true }, 200, { "Set-Cookie": `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` });
}
