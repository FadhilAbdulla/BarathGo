import { PLATFORM_FEE } from "../lib/fares";
import { requireUser } from "./auth";
import { type Env, HttpError, json } from "./http";
import { DRIVER_FRESH_MS } from "./rides";

async function requireAdmin(request: Request, env: Env) {
  const user = await requireUser(request, env);
  if (!user.isAdmin) throw new HttpError(403, "Admin access only.");
  return user;
}

export async function overview(request: Request, env: Env) {
  await requireAdmin(request, env);
  const now = Date.now();
  const dayAgo = now - 86400000;
  const [stats, rides, drivers] = await Promise.all([
    env.DB.prepare(
      `SELECT
        (SELECT COUNT(*) FROM rides WHERE created_at > ?1) AS rides_24h,
        (SELECT COUNT(*) FROM rides WHERE status = 'completed' AND completed_at > ?1) AS completed_24h,
        (SELECT COALESCE(SUM(fare), 0) FROM rides WHERE status = 'completed' AND completed_at > ?1) AS gmv_24h,
        (SELECT COUNT(*) FROM rides WHERE status IN ('requested','accepted','arrived','started')) AS active,
        (SELECT COUNT(*) FROM rides WHERE status = 'requested') AS waiting,
        (SELECT COUNT(*) FROM drivers WHERE online = 1 AND location_at > ?2) AS drivers_online,
        (SELECT COUNT(*) FROM drivers WHERE approved = 0) AS drivers_pending,
        (SELECT COUNT(*) FROM users) AS users`,
    )
      .bind(dayAgo, now - DRIVER_FRESH_MS)
      .first<Record<string, number>>(),
    env.DB.prepare(
      `SELECT r.id, r.status, r.ride_type, r.pickup_label, r.drop_label, r.pickup_lat, r.pickup_lng, r.fare, r.payment_method, r.rating, r.created_at,
        ru.name AS rider_name, ru.phone AS rider_phone, du.name AS driver_name
       FROM rides r JOIN users ru ON ru.id = r.rider_id LEFT JOIN users du ON du.id = r.driver_id
       ORDER BY r.created_at DESC LIMIT 50`,
    ).all(),
    env.DB.prepare(
      `SELECT d.user_id, d.vehicle_type, d.vehicle_model, d.vehicle_number, d.licence_number, d.city, d.approved, d.online, d.lat, d.lng, d.location_at, d.created_at,
        u.name, u.phone,
        (SELECT COUNT(*) FROM rides WHERE driver_id = d.user_id AND status = 'completed') AS trips,
        (SELECT AVG(rating) FROM rides WHERE driver_id = d.user_id AND rating IS NOT NULL) AS rating
       FROM drivers d JOIN users u ON u.id = d.user_id ORDER BY d.approved ASC, d.created_at DESC LIMIT 200`,
    ).all(),
  ]);
  return json({ stats: { ...stats, platform_fee_24h: Math.round((stats?.gmv_24h ?? 0) * PLATFORM_FEE) }, rides: rides.results, drivers: drivers.results, freshMs: DRIVER_FRESH_MS, now });
}

export async function setApproval(request: Request, env: Env, driverId: string, approved: boolean) {
  await requireAdmin(request, env);
  const result = await env.DB.prepare("UPDATE drivers SET approved = ?, online = CASE WHEN ? = 0 THEN 0 ELSE online END WHERE user_id = ?").bind(approved ? 1 : 0, approved ? 1 : 0, driverId).run();
  if (!result.meta.changes) throw new HttpError(404, "Driver not found.");
  return json({ ok: true });
}
