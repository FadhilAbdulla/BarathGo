import { driverEarning, haversine, rideTypeById } from "../lib/fares";
import { type User, requireUser } from "./auth";
import { type Env, HttpError, isDev, json, num, readJson, str } from "./http";
import type { RideRow } from "./rides";

const OFFER_RADIUS_M = 12000;
const OFFER_MAX_AGE_MS = 10 * 60 * 1000;
const IST_OFFSET_MS = 5.5 * 3600000;

async function requireDriver(request: Request, env: Env) {
  const user = await requireUser(request, env);
  if (!user.driver) throw new HttpError(403, "Register as a driver first.");
  return user as User & { driver: NonNullable<User["driver"]> };
}

export async function registerDriver(request: Request, env: Env) {
  const user = await requireUser(request, env);
  const data = await readJson(request);
  const type = rideTypeById(str(data.vehicleType, 10));
  const model = str(data.vehicleModel, 60);
  const number = str(data.vehicleNumber, 20).toUpperCase().replace(/\s+/g, " ");
  const licence = str(data.licenceNumber, 30).toUpperCase();
  const city = str(data.city, 60);
  const name = str(data.name, 80);
  if (!type || !model || !number || !licence || !city) throw new HttpError(400, "Fill in all vehicle and licence details.");
  const compact = number.replace(/[\s-]/g, "");
  if (!/^[A-Z]{2}\d{1,2}[A-Z]{0,4}\d{1,4}$/.test(compact) && !/^\d{2}BH\d{4}[A-Z]{1,2}$/.test(compact)) throw new HttpError(400, "Enter the vehicle number as on the RC, e.g. DL 3C AB 4821.");
  if (name) await env.DB.prepare("UPDATE users SET name = ? WHERE id = ?").bind(name, user.id).run();
  if (user.driver?.approved && !isDev(env)) throw new HttpError(409, "Your profile is already approved. Contact support to change vehicle details.");

  await env.DB.prepare(
    `INSERT INTO drivers (user_id, vehicle_type, vehicle_model, vehicle_number, licence_number, city, approved, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET vehicle_type = excluded.vehicle_type, vehicle_model = excluded.vehicle_model, vehicle_number = excluded.vehicle_number, licence_number = excluded.licence_number, city = excluded.city`,
  )
    .bind(user.id, type.id, model, number, licence, city, isDev(env) ? 1 : 0, Date.now())
    .run();
  return driverState(request, env);
}

async function activeTrip(env: Env, driverId: string) {
  return env.DB.prepare("SELECT * FROM rides WHERE driver_id = ? AND status IN ('accepted','arrived','started') ORDER BY accepted_at DESC LIMIT 1").bind(driverId).first<RideRow>();
}

export async function setStatus(request: Request, env: Env) {
  const user = await requireDriver(request, env);
  const data = await readJson(request);
  const online = data.online === true;
  const hasLocation = data.lat !== undefined && data.lng !== undefined;
  const lat = hasLocation ? num(data.lat, "latitude", 6, 37.5) : null;
  const lng = hasLocation ? num(data.lng, "longitude", 68, 98) : null;
  if (online && !user.driver.approved) throw new HttpError(403, "Your profile is waiting for approval.");
  if (!online && (await activeTrip(env, user.id))) throw new HttpError(409, "Finish your current trip before going offline.");
  if (online && !hasLocation && user.driver.lat === null) throw new HttpError(400, "Allow location access, or set your location on the map, to go online.");

  if (hasLocation) {
    await env.DB.prepare("UPDATE drivers SET online = ?, lat = ?, lng = ?, location_at = ? WHERE user_id = ?").bind(online ? 1 : 0, lat, lng, Date.now(), user.id).run();
  } else {
    await env.DB.prepare("UPDATE drivers SET online = ?, location_at = CASE WHEN ? = 1 THEN ? ELSE location_at END WHERE user_id = ?").bind(online ? 1 : 0, online ? 1 : 0, Date.now(), user.id).run();
  }
  return driverState(request, env);
}

/** Everything the driver app needs in one poll: profile, current trip, open offers and today's earnings. */
export async function driverState(request: Request, env: Env) {
  const user = await requireDriver(request, env);
  const driver = (await env.DB.prepare("SELECT * FROM drivers WHERE user_id = ?").bind(user.id).first<NonNullable<User["driver"]>>())!;
  const trip = await activeTrip(env, user.id);

  let tripView = null;
  if (trip) {
    const rider = await env.DB.prepare("SELECT name, phone FROM users WHERE id = ?").bind(trip.rider_id).first<{ name: string | null; phone: string }>();
    const { pin: _pin, ...rest } = trip;
    tripView = { ...rest, rider, earning: driverEarning(trip.fare) };
  }

  let offers: unknown[] = [];
  if (driver.online && driver.approved && !trip && driver.lat !== null && driver.lng !== null) {
    const { results } = await env.DB.prepare(
      `SELECT r.id, r.ride_type, r.pickup_label, r.pickup_lat, r.pickup_lng, r.drop_label, r.drop_lat, r.drop_lng, r.distance_m, r.duration_s, r.fare, r.payment_method, r.created_at, u.name AS rider_name
       FROM rides r JOIN users u ON u.id = r.rider_id
       WHERE r.status = 'requested' AND r.ride_type = ? AND r.created_at > ? AND r.rider_id != ?
         AND NOT EXISTS (SELECT 1 FROM ride_declines d WHERE d.ride_id = r.id AND d.driver_id = ?)
       ORDER BY r.created_at ASC LIMIT 20`,
    )
      .bind(driver.vehicle_type, Date.now() - OFFER_MAX_AGE_MS, user.id, user.id)
      .all<Pick<RideRow, "id" | "pickup_lat" | "pickup_lng" | "fare"> & Record<string, unknown>>();
    offers = results
      .map((offer) => ({ ...offer, pickup_distance_m: Math.round(haversine(driver.lat!, driver.lng!, offer.pickup_lat, offer.pickup_lng)), earning: driverEarning(offer.fare) }))
      .filter((offer) => offer.pickup_distance_m <= OFFER_RADIUS_M)
      .sort((a, b) => a.pickup_distance_m - b.pickup_distance_m)
      .slice(0, 3);
  }

  const now = Date.now();
  const dayStart = Math.floor((now + IST_OFFSET_MS) / 86400000) * 86400000 - IST_OFFSET_MS;
  const { results: completed } = await env.DB.prepare(
    "SELECT id, pickup_label, drop_label, fare, payment_method, rating, completed_at, distance_m FROM rides WHERE driver_id = ? AND status = 'completed' ORDER BY completed_at DESC LIMIT 30",
  )
    .bind(user.id)
    .all<{ fare: number; completed_at: number } & Record<string, unknown>>();
  const today = completed.filter((ride) => ride.completed_at >= dayStart);
  const ratingRow = await env.DB.prepare("SELECT AVG(rating) AS avg FROM rides WHERE driver_id = ? AND rating IS NOT NULL").bind(user.id).first<{ avg: number | null }>();

  return json({
    user: { id: user.id, name: user.name, phone: user.phone },
    driver: { ...driver, rating: ratingRow?.avg ? Math.round(ratingRow.avg * 10) / 10 : null },
    trip: tripView,
    offers,
    today: { trips: today.length, earnings: today.reduce((sum, ride) => sum + driverEarning(ride.fare), 0) },
    recent: completed.slice(0, 10).map((ride) => ({ ...ride, earning: driverEarning(ride.fare) })),
  });
}

export async function tripAction(request: Request, env: Env, id: string, action: string) {
  const user = await requireDriver(request, env);
  const now = Date.now();
  let changes = 0;

  if (action === "accept") {
    if (!user.driver.online || !user.driver.approved) throw new HttpError(403, "Go online to accept trips.");
    if (await activeTrip(env, user.id)) throw new HttpError(409, "Finish your current trip first.");
    // Conditional update: only one driver can win a request.
    changes = (await env.DB.prepare("UPDATE rides SET driver_id = ?, status = 'accepted', accepted_at = ? WHERE id = ? AND status = 'requested' AND ride_type = ?").bind(user.id, now, id, user.driver.vehicle_type).run()).meta.changes;
    if (!changes) throw new HttpError(409, "This request is no longer available.");
  } else if (action === "decline") {
    await env.DB.prepare("INSERT OR IGNORE INTO ride_declines (ride_id, driver_id) VALUES (?, ?)").bind(id, user.id).run();
    return driverState(request, env);
  } else if (action === "arrived") {
    changes = (await env.DB.prepare("UPDATE rides SET status = 'arrived', arrived_at = ? WHERE id = ? AND driver_id = ? AND status = 'accepted'").bind(now, id, user.id).run()).meta.changes;
  } else if (action === "start") {
    const pin = str((await readJson(request)).pin, 4);
    const ride = await env.DB.prepare("SELECT pin FROM rides WHERE id = ? AND driver_id = ? AND status IN ('accepted','arrived')").bind(id, user.id).first<{ pin: string }>();
    if (!ride) throw new HttpError(409, "This trip can't be started.");
    if (ride.pin !== pin) throw new HttpError(400, "Wrong PIN. Ask the rider for the 4-digit PIN shown in their app.");
    changes = (await env.DB.prepare("UPDATE rides SET status = 'started', started_at = ?, arrived_at = COALESCE(arrived_at, ?) WHERE id = ? AND driver_id = ?").bind(now, now, id, user.id).run()).meta.changes;
  } else if (action === "complete") {
    changes = (await env.DB.prepare("UPDATE rides SET status = 'completed', completed_at = ? WHERE id = ? AND driver_id = ? AND status = 'started'").bind(now, id, user.id).run()).meta.changes;
  } else if (action === "cancel") {
    // Driver drops the trip before pickup: the request goes back to other drivers.
    changes = (await env.DB.prepare("UPDATE rides SET status = 'requested', driver_id = NULL, accepted_at = NULL, arrived_at = NULL WHERE id = ? AND driver_id = ? AND status IN ('accepted','arrived')").bind(id, user.id).run()).meta.changes;
    if (changes) await env.DB.prepare("INSERT OR IGNORE INTO ride_declines (ride_id, driver_id) VALUES (?, ?)").bind(id, user.id).run();
  } else {
    throw new HttpError(404, "Unknown action.");
  }
  if (!changes) throw new HttpError(409, "The trip has changed. Refreshing…");
  return driverState(request, env);
}
