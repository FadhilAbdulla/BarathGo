/**
 * Cloudflare Worker for barathgo.com.
 *   - http:// and www. → 301 to https://barathgo.com
 *   - /api/* → BarathGo API (auth, rides, driver, admin, enquiry forms), backed by D1
 *   - everything else → static Next.js export in out/ via the ASSETS binding
 */
import { overview, setApproval } from "./admin";
import { logout, me, requestOtp, updateProfile, verifyOtp } from "./auth";
import { driverState, registerDriver, setStatus, tripAction } from "./driver";
import { handleEnquiry } from "./forms";
import { type Env, HttpError, isDev, json } from "./http";
import { activeRide, cancelRide, createRide, getRide, quote, rateRide, rideHistory } from "./rides";

const CANONICAL_HOST = "barathgo.com";
const ALLOWED_ORIGINS = ["https://barathgo.com", "https://www.barathgo.com"];

type Handler = (request: Request, env: Env, ...params: string[]) => Promise<Response>;
const routes: [method: string, pattern: RegExp, handler: Handler][] = [
  ["POST", /^\/api\/auth\/otp$/, requestOtp],
  ["POST", /^\/api\/auth\/verify$/, verifyOtp],
  ["POST", /^\/api\/auth\/logout$/, logout],
  ["GET", /^\/api\/me$/, me],
  ["POST", /^\/api\/me$/, updateProfile],
  ["POST", /^\/api\/quote$/, quote],
  ["POST", /^\/api\/rides$/, createRide],
  ["GET", /^\/api\/rides$/, rideHistory],
  ["GET", /^\/api\/rides\/active$/, activeRide],
  ["GET", /^\/api\/rides\/([\w-]{36})$/, getRide],
  ["POST", /^\/api\/rides\/([\w-]{36})\/cancel$/, cancelRide],
  ["POST", /^\/api\/rides\/([\w-]{36})\/rate$/, rateRide],
  ["POST", /^\/api\/driver\/register$/, registerDriver],
  ["GET", /^\/api\/driver\/state$/, driverState],
  ["POST", /^\/api\/driver\/status$/, setStatus],
  ["POST", /^\/api\/driver\/trips\/([\w-]{36})\/(accept|decline|arrived|start|complete|cancel)$/, tripAction],
  ["GET", /^\/api\/admin\/overview$/, overview],
  ["POST", /^\/api\/admin\/drivers\/([\w-]{36})\/approve$/, (request, env, id) => setApproval(request, env, id, true)],
  ["POST", /^\/api\/admin\/drivers\/([\w-]{36})\/suspend$/, (request, env, id) => setApproval(request, env, id, false)],
  ["POST", /^\/api\/request$/, handleEnquiry],
];

function originAllowed(request: Request, env: Env) {
  if (request.method === "GET") return true;
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin) || origin === new URL(request.url).origin) return true;
  return isDev(env) && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
}

async function handleApi(request: Request, env: Env, pathname: string) {
  if (!originAllowed(request, env)) return json({ error: "Forbidden" }, 403);
  for (const [method, pattern, handler] of routes) {
    const match = pathname.match(pattern);
    if (!match) continue;
    if (request.method !== method) continue;
    try {
      return await handler(request, env, ...match.slice(1));
    } catch (error) {
      if (error instanceof HttpError) return json({ error: error.message }, error.status);
      console.error(error);
      return json({ error: "Something went wrong. Please try again." }, 500);
    }
  }
  return json({ error: "Not found" }, 404);
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
    if (url.pathname.startsWith("/api/")) return handleApi(request, env, url.pathname);
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
