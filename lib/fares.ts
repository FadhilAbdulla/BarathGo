// Shared by the Worker (authoritative pricing) and the web apps (display).
// TODO before launch: confirm rates and the platform fee with the operations team.

export type RideTypeId = "auto" | "mini" | "sedan" | "suv" | "ev";

export type RideType = {
  id: RideTypeId;
  name: string;
  blurb: string;
  seats: number;
  base: number; // ₹ flag-down fare, includes the first 2 km
  perKm: number; // ₹ per km after the first 2 km
  perMin: number; // ₹ per minute of ride time
  minimum: number; // ₹ minimum fare
};

export const rideTypes: RideType[] = [
  { id: "auto", name: "Auto", blurb: "Affordable auto-rickshaw rides", seats: 3, base: 30, perKm: 13, perMin: 0.5, minimum: 30 },
  { id: "mini", name: "Mini", blurb: "Compact AC hatchbacks", seats: 4, base: 50, perKm: 14, perMin: 1, minimum: 80 },
  { id: "sedan", name: "Sedan", blurb: "Comfortable sedans, more legroom", seats: 4, base: 70, perKm: 17, perMin: 1.25, minimum: 110 },
  { id: "suv", name: "SUV", blurb: "Spacious rides for up to 6", seats: 6, base: 100, perKm: 22, perMin: 1.5, minimum: 160 },
  { id: "ev", name: "EV", blurb: "Zero-emission electric cars", seats: 4, base: 60, perKm: 15, perMin: 1, minimum: 90 },
];

export const rideTypeById = (id: string) => rideTypes.find((type) => type.id === id);

/** Share of each fare kept by the platform. The driver keeps the rest. */
export const PLATFORM_FEE = 0.1;

/** Upfront fare in whole rupees (rounded to ₹5) from route distance and duration. */
export function fareFor(type: RideType, distanceM: number, durationS: number) {
  const km = distanceM / 1000;
  const minutes = durationS / 60;
  const raw = type.base + Math.max(0, km - 2) * type.perKm + minutes * type.perMin;
  return Math.max(type.minimum, Math.round(raw / 5) * 5);
}

export const driverEarning = (fare: number) => Math.round(fare * (1 - PLATFORM_FEE));

export const formatRupees = (value: number) => `₹${Math.round(value).toLocaleString("en-IN")}`;

/** Great-circle distance in metres. */
export function haversine(aLat: number, aLng: number, bLat: number, bLng: number) {
  const rad = Math.PI / 180;
  const dLat = (bLat - aLat) * rad;
  const dLng = (bLng - aLng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(aLat * rad) * Math.cos(bLat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371000 * Math.asin(Math.sqrt(h));
}

export type RideStatus = "requested" | "accepted" | "arrived" | "started" | "completed" | "cancelled";
