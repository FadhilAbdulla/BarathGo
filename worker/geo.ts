import { haversine } from "../lib/fares";
import { type Env, HttpError, num } from "./http";

export type Point = { lat: number; lng: number };
export type Route = { distanceM: number; durationS: number; geometry: [number, number][] };

/** Validates a {lat, lng} inside India's bounding box. */
export function point(value: unknown, name: string): Point {
  const data = (value ?? {}) as Record<string, unknown>;
  return { lat: num(data.lat, `${name} location`, 6, 37.5), lng: num(data.lng, `${name} location`, 68, 98) };
}

/** Driving route from OSRM; falls back to a straight-line estimate if routing is unavailable. */
export async function route(env: Env, from: Point, to: Point): Promise<Route> {
  const base = env.OSRM_URL ?? "https://router.project-osrm.org";
  try {
    const url = `${base}/route/v1/driving/${from.lng},${from.lat};${to.lng},${to.lat}?overview=full&geometries=geojson`;
    const response = await fetch(url, { headers: { "User-Agent": "BarathGo/1.0" }, signal: AbortSignal.timeout(6000) });
    if (response.ok) {
      const data = (await response.json()) as { routes?: { distance: number; duration: number; geometry: { coordinates: [number, number][] } }[] };
      const best = data.routes?.[0];
      if (best) {
        return {
          distanceM: Math.round(best.distance),
          durationS: Math.round(best.duration),
          geometry: best.geometry.coordinates.map(([lng, lat]) => [lat, lng]),
        };
      }
    }
  } catch (error) {
    console.error("Routing failed, using estimate", error);
  }
  const distanceM = Math.round(haversine(from.lat, from.lng, to.lat, to.lng) * 1.35);
  return { distanceM, durationS: Math.round(distanceM / (22000 / 3600)), geometry: [[from.lat, from.lng], [to.lat, to.lng]] };
}

export function checkTripLength(route: Route) {
  if (route.distanceM < 300) throw new HttpError(400, "Pickup and drop are too close together.");
  if (route.distanceM > 150000) throw new HttpError(400, "For trips over 150 km, book an outstation ride through our team on the Contact page.");
}
