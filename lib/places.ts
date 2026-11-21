"use client";

import type { Place } from "./api";

// Place search via Photon (OpenStreetMap data, free, no key). For production volume, swap in a
// keyed provider (e.g. Ola Maps, MapmyIndia or Google Places) behind these two functions.
const PHOTON = "https://photon.komoot.io";
const INDIA_BBOX = "68.1,6.5,97.4,35.7";

type Feature = { geometry: { coordinates: [number, number] }; properties: Record<string, string | undefined> };

function toPlace(feature: Feature): Place {
  const p = feature.properties;
  const [lng, lat] = feature.geometry.coordinates;
  const label = p.name ?? ([p.housenumber, p.street].filter(Boolean).join(" ") || p.city || "Pinned location");
  const detail = [p.name ? p.street : undefined, p.district ?? p.locality, p.city ?? p.county, p.state].filter((part, index, all) => part && part !== label && all.indexOf(part) === index).join(", ");
  return { label, detail, lat, lng };
}

export async function searchPlaces(query: string, near?: { lat: number; lng: number }, signal?: AbortSignal): Promise<Place[]> {
  const params = new URLSearchParams({ q: query, limit: "6", bbox: INDIA_BBOX, lang: "en" });
  if (near) {
    params.set("lat", String(near.lat));
    params.set("lon", String(near.lng));
  }
  const response = await fetch(`${PHOTON}/api/?${params}`, { signal });
  if (!response.ok) return [];
  const data = (await response.json()) as { features: Feature[] };
  return data.features.map(toPlace);
}

export async function reversePlace(lat: number, lng: number): Promise<Place> {
  try {
    const response = await fetch(`${PHOTON}/reverse?lat=${lat}&lon=${lng}&lang=en`);
    const data = (await response.json()) as { features: Feature[] };
    if (data.features[0]) return { ...toPlace(data.features[0]), lat, lng };
  } catch {
    /* fall through */
  }
  return { label: "Pinned location", detail: `${lat.toFixed(5)}, ${lng.toFixed(5)}`, lat, lng };
}

export function currentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) return reject(new Error("Location isn't available on this device."));
    navigator.geolocation.getCurrentPosition(
      (position) => resolve({ lat: position.coords.latitude, lng: position.coords.longitude }),
      () => reject(new Error("Location permission was denied. Search for your pickup instead.")),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  });
}

/** Default map centre: New Delhi. */
export const DEFAULT_CENTER = { lat: 28.6139, lng: 77.209 };
