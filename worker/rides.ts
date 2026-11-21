import { fareFor, haversine, rideTypeById, rideTypes } from "../lib/fares";
import { requireUser } from "./auth";
import { checkTripLength, point, route } from "./geo";
import { type Env, HttpError, clientIp, json, limit, newId, randomDigits, readJson, str } from "./http";

export const DRIVER_FRESH_MS = 2 * 60 * 1000;
const ACTIVE = "('requested','accepted','arrived','started')";

export type RideRow = {
  id: string;
  rider_id: string;
  driver_id: string | null;
  status: string;
  ride_type: string;
  pickup_label: string;
  pickup_lat: number;
  pickup_lng: number;
  drop_label: string;
  drop_lat: number;
  drop_lng: number;
  distance_m: number;
  duration_s: number;
  fare: number;
  payment_method: string;
  pin: string;
  rating: number | null;
  cancelled_by: string | null;
  created_at: number;
  accepted_at: number | null;
  arrived_at: number | null;
  started_at: number | null;
  completed_at: number | null;
  cancelled_at: number | null;
};

/** Approved, online drivers with a recent location inside a ~20 km box. */
export async function nearbyDrivers(env: Env, lat: number, lng: number) {
  const box = 0.18;
  const { results } = await env.DB.prepare(
    "SELECT user_id, vehicle_type, lat, lng FROM drivers WHERE online = 1 AND approved = 1 AND location_at > ? AND lat BETWEEN ? AND ? AND lng BETWEEN ? AND ?",
  )
    .bind(Date.now() - DRIVER_FRESH_MS, lat - box, lat + box, lng - box, lng + box)
    .all<{ user_id: string; vehicle_type: string; lat: number; lng: number }>();
  return results;
}

export async function quote(request: Request, env: Env) {
  await limit(env.REQUEST_LIMITER, `quote:${clientIp(request)}`);
  const data = await readJson(request);
  const pickup = point(data.pickup, "pickup");
  const drop = point(data.drop, "drop");
  const trip = await route(env, pickup, drop);
  checkTripLength(trip);

  const drivers = await nearbyDrivers(env, pickup.lat, pickup.lng);
  const options = rideTypes.map((type) => {
    const nearest = drivers
      .filter((driver) => driver.vehicle_type === type.id)
      .reduce<number | null>((best, driver) => {
        const metres = haversine(pickup.lat, pickup.lng, driver.lat, driver.lng);
        return best === null || metres < best ? metres : best;
      }, null);
    return {
      id: type.id,
      name: type.name,
      blurb: type.blurb,
      seats: type.seats,
      fare: fareFor(type, trip.distanceM, trip.durationS),
      etaMin: nearest === null ? null : Math.max(2, Math.round((nearest * 1.3) / (22000 / 60))),
    };
  });
  return json({ ...trip, options });
}

async function driverCard(env: Env, driverId: string | null) {
  if (!driverId) return null;
  const row = await env.DB.prepare(
    `SELECT u.name, u.phone, d.vehicle_type, d.vehicle_model, d.vehicle_number, d.lat, d.lng,
      (SELECT AVG(rating) FROM rides WHERE driver_id = d.user_id AND rating IS NOT NULL) AS rating,
      (SELECT COUNT(*) FROM rides WHERE driver_id = d.user_id AND status = 'completed') AS trips
     FROM drivers d JOIN users u ON u.id = d.user_id WHERE d.user_id = ?`,
  )
    .bind(driverId)
    .first<{ name: string | null; phone: string; vehicle_type: string; vehicle_model: string; vehicle_number: string; lat: number | null; lng: number | null; rating: number | null; trips: number }>();
  if (!row) return null;
  return { ...row, rating: row.rating ? Math.round(row.rating * 10) / 10 : null };
}

/** Ride as the rider sees it: includes the start PIN and the driver's live position. */
export async function riderView(env: Env, ride: RideRow) {
  return { ...ride, driver: await driverCard(env, ride.driver_id) };
}

export async function createRide(request: Request, env: Env) {
  const user = await requireUser(request, env);
  if (!user.name) throw new HttpError(400, "Add your name before booking.");
  const data = await readJson(request);
  const pickup = point(data.pickup, "pickup");
  const drop = point(data.drop, "drop");
  const pickupLabel = str((data.pickup as Record<string, unknown>)?.label, 200) || "Pinned location";
  const dropLabel = str((data.drop as Record<string, unknown>)?.label, 200) || "Pinned location";
  const type = rideTypeById(str(data.rideType, 10));
  if (!type) throw new HttpError(400, "Choose a ride type.");
  const payment = data.payment === "upi" ? "upi" : "cash";

  const active = await env.DB.prepare(`SELECT id FROM rides WHERE rider_id = ? AND status IN ${ACTIVE}`).bind(user.id).first();
  if (active) throw new HttpError(409, "You already have a ride in progress.");
  if (user.driver?.online) throw new HttpError(409, "Go offline in the driver app before booking a ride.");

  const trip = await route(env, pickup, drop);
  checkTripLength(trip);
  const id = newId();
  await env.DB.prepare(
    `INSERT INTO rides (id, rider_id, status, ride_type, pickup_label, pickup_lat, pickup_lng, drop_label, drop_lat, drop_lng, distance_m, duration_s, fare, payment_method, pin, created_at)
     VALUES (?, ?, 'requested', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(id, user.id, type.id, pickupLabel, pickup.lat, pickup.lng, dropLabel, drop.lat, drop.lng, trip.distanceM, trip.durationS, fareFor(type, trip.distanceM, trip.durationS), payment, randomDigits(4), Date.now())
    .run();
  const ride = await env.DB.prepare("SELECT * FROM rides WHERE id = ?").bind(id).first<RideRow>();
  return json({ ride: await riderView(env, ride!) }, 201);
}

async function ownRide(env: Env, riderId: string, id: string) {
  const ride = await env.DB.prepare("SELECT * FROM rides WHERE id = ? AND rider_id = ?").bind(id, riderId).first<RideRow>();
  if (!ride) throw new HttpError(404, "Ride not found.");
  return ride;
}

export async function getRide(request: Request, env: Env, id: string) {
  const user = await requireUser(request, env);
  return json({ ride: await riderView(env, await ownRide(env, user.id, id)) });
}

export async function activeRide(request: Request, env: Env) {
  const user = await requireUser(request, env);
  const ride = await env.DB.prepare(`SELECT * FROM rides WHERE rider_id = ? AND status IN ${ACTIVE} ORDER BY created_at DESC LIMIT 1`).bind(user.id).first<RideRow>();
  return json({ ride: ride ? await riderView(env, ride) : null });
}

export async function cancelRide(request: Request, env: Env, id: string) {
  const user = await requireUser(request, env);
  const result = await env.DB.prepare("UPDATE rides SET status = 'cancelled', cancelled_by = 'rider', cancelled_at = ? WHERE id = ? AND rider_id = ? AND status IN ('requested','accepted','arrived')")
    .bind(Date.now(), id, user.id)
    .run();
  if (!result.meta.changes) throw new HttpError(409, "This ride can no longer be cancelled.");
  return json({ ride: await riderView(env, await ownRide(env, user.id, id)) });
}

export async function rateRide(request: Request, env: Env, id: string) {
  const user = await requireUser(request, env);
  const rating = Number((await readJson(request)).rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) throw new HttpError(400, "Rating must be 1 to 5.");
  const result = await env.DB.prepare("UPDATE rides SET rating = ? WHERE id = ? AND rider_id = ? AND status = 'completed'").bind(rating, id, user.id).run();
  if (!result.meta.changes) throw new HttpError(409, "Only completed rides can be rated.");
  return json({ ok: true });
}

export async function rideHistory(request: Request, env: Env) {
  const user = await requireUser(request, env);
  const { results } = await env.DB.prepare(
    "SELECT id, status, ride_type, pickup_label, drop_label, fare, payment_method, rating, created_at, completed_at FROM rides WHERE rider_id = ? ORDER BY created_at DESC LIMIT 20",
  )
    .bind(user.id)
    .all();
  return json({ rides: results });
}
