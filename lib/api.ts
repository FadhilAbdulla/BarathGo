"use client";

import { useCallback, useEffect, useState } from "react";
import type { RideStatus, RideTypeId } from "./fares";

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function api<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method: body === undefined ? "GET" : "POST",
      headers: body === undefined ? undefined : { "Content-Type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ApiError(0, "You appear to be offline. Check your connection.");
  }
  const data = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new ApiError(response.status, data.error ?? "Something went wrong. Please try again.");
  return data;
}

export type Driver = {
  user_id: string;
  vehicle_type: RideTypeId;
  vehicle_model: string;
  vehicle_number: string;
  licence_number: string;
  city: string;
  approved: number;
  online: number;
  lat: number | null;
  lng: number | null;
  rating?: number | null;
};

export type User = { id: string; phone: string; name: string | null; isAdmin: boolean; driver: Driver | null };

export type Place = { label: string; detail?: string; lat: number; lng: number };

export type Quote = {
  distanceM: number;
  durationS: number;
  geometry: [number, number][];
  options: { id: RideTypeId; name: string; blurb: string; seats: number; fare: number; etaMin: number | null }[];
};

export type Ride = {
  id: string;
  status: RideStatus;
  ride_type: RideTypeId;
  pickup_label: string;
  pickup_lat: number;
  pickup_lng: number;
  drop_label: string;
  drop_lat: number;
  drop_lng: number;
  distance_m: number;
  duration_s: number;
  fare: number;
  payment_method: "cash" | "upi";
  pin: string;
  rating: number | null;
  cancelled_by: string | null;
  created_at: number;
  accepted_at: number | null;
  arrived_at: number | null;
  started_at: number | null;
  completed_at: number | null;
  driver: {
    name: string | null;
    phone: string;
    vehicle_type: RideTypeId;
    vehicle_model: string;
    vehicle_number: string;
    lat: number | null;
    lng: number | null;
    rating: number | null;
    trips: number;
  } | null;
};

/** Current logged-in user (null when logged out, undefined while loading). */
export function useSession() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const refresh = useCallback(async () => {
    try {
      setUser((await api<{ user: User | null }>("/me")).user);
    } catch {
      setUser(null);
    }
  }, []);
  useEffect(() => {
    void refresh();
  }, [refresh]);
  const logout = useCallback(async () => {
    await api("/auth/logout", {}).catch(() => undefined);
    setUser(null);
  }, []);
  return { user, setUser, refresh, logout };
}

/** Calls `fn` every `ms` while `active`, and once immediately. */
export function usePoll(fn: () => void | Promise<void>, ms: number, active: boolean) {
  useEffect(() => {
    if (!active) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    const tick = async () => {
      if (stopped) return;
      if (document.visibilityState === "visible") await Promise.resolve(fn()).catch(() => undefined);
      if (!stopped) timer = setTimeout(tick, ms);
    };
    void tick();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [fn, ms, active]);
}

export const formatPhone = (phone: string) => phone.replace(/^\+91(\d{5})(\d{5})$/, "+91 $1 $2");
export const formatKm = (metres: number) => (metres < 1000 ? `${Math.round(metres)} m` : `${(metres / 1000).toFixed(1)} km`);
export const formatMin = (seconds: number) => `${Math.max(1, Math.round(seconds / 60))} min`;
export const formatTime = (ms: number) => new Date(ms).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });
export const formatDate = (ms: number) => new Date(ms).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** True at ≥900px (side panel layout); false on phones (bottom sheet). */
export function useIsDesktop() {
  const [desktop, setDesktop] = useState(true);
  useEffect(() => {
    const query = window.matchMedia("(min-width: 900px)");
    const update = () => setDesktop(query.matches);
    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);
  return desktop;
}

/** Map padding that keeps fitted points clear of the app panel. */
export const mapPadding = (desktop: boolean) =>
  desktop ? { top: 60, right: 60, bottom: 60, left: 500 } : { top: 30, right: 30, bottom: typeof window === "undefined" ? 400 : Math.round(window.innerHeight * 0.68), left: 30 };
