"use client";

import { useCallback, useState } from "react";
import { ApiError, api, formatDate, formatPhone, formatTime, usePoll, useSession } from "@/lib/api";
import { formatRupees, rideTypeById } from "@/lib/fares";
import { AppBar } from "./AppBar";
import { AuthPanel } from "./AuthPanel";
import { MapView, type MapMarker } from "./MapView";

type Overview = {
  stats: Record<string, number>;
  rides: { id: string; status: string; ride_type: string; pickup_label: string; drop_label: string; pickup_lat: number; pickup_lng: number; fare: number; payment_method: string; rating: number | null; created_at: number; rider_name: string | null; rider_phone: string; driver_name: string | null }[];
  drivers: { user_id: string; name: string | null; phone: string; vehicle_type: string; vehicle_model: string; vehicle_number: string; licence_number: string; city: string; approved: number; online: number; lat: number | null; lng: number | null; location_at: number | null; created_at: number; trips: number; rating: number | null }[];
  freshMs: number;
  now: number;
};

const ACTIVE = ["requested", "accepted", "arrived", "started"];

export function AdminApp() {
  const { user, setUser, logout } = useSession();
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "active">("all");

  const load = useCallback(async () => {
    try {
      setData(await api<Overview>("/admin/overview"));
      setError(null);
    } catch (err) {
      setError(err instanceof ApiError && err.status === 403 ? "This account doesn’t have admin access." : (err as Error).message);
    }
  }, []);
  usePoll(load, 8000, !!user);

  async function approve(id: string, approved: boolean) {
    if (!approved && !confirm("Suspend this driver? They’ll be taken offline.")) return;
    await api(`/admin/drivers/${id}/${approved ? "approve" : "suspend"}`, {}).catch((err) => setError((err as Error).message));
    void load();
  }

  if (user === null) {
    return (
      <div className="app">
        <AppBar label="Admin" user={user} onLogout={logout} />
        <div className="app__centered">
          <div className="card-narrow">
            <AuthPanel title="Admin login" subtitle="Log in with an admin mobile number." onDone={setUser} />
          </div>
        </div>
      </div>
    );
  }

  const stats = data?.stats ?? {};
  const onlineDrivers = data?.drivers.filter((driver) => driver.online && driver.location_at && data.now - driver.location_at < data.freshMs && driver.lat !== null) ?? [];
  const activeRides = data?.rides.filter((ride) => ACTIVE.includes(ride.status)) ?? [];
  const markers: MapMarker[] = [
    ...onlineDrivers.map((driver) => ({ id: `d-${driver.user_id}`, kind: "car" as const, lat: driver.lat!, lng: driver.lng! })),
    ...activeRides.map((ride) => ({ id: `r-${ride.id}`, kind: "pickup" as const, lat: ride.pickup_lat, lng: ride.pickup_lng })),
  ];
  const pending = data?.drivers.filter((driver) => !driver.approved) ?? [];
  const rides = filter === "active" ? activeRides : data?.rides ?? [];

  return (
    <div className="app app--scroll">
      <AppBar label="Admin" user={user} onLogout={logout} />
      <main className="admin">
        {error && (
          <p className="alert" role="alert">
            {error}
          </p>
        )}
        <div className="kpis">
          {[
            ["Rides (24h)", stats.rides_24h],
            ["Completed (24h)", stats.completed_24h],
            ["Fares (24h)", formatRupees(stats.gmv_24h ?? 0)],
            ["Platform fee (24h)", formatRupees(stats.platform_fee_24h ?? 0)],
            ["Active rides", stats.active],
            ["Waiting for driver", stats.waiting],
            ["Drivers online", stats.drivers_online],
            ["Pending approval", stats.drivers_pending],
          ].map(([label, value]) => (
            <div key={label} className="kpi">
              <span>{label}</span>
              <strong>{value ?? "–"}</strong>
            </div>
          ))}
        </div>

        <div className="admin__grid">
          <section className="panel-card">
            <header>
              <h2>Live map</h2>
              <small>
                {onlineDrivers.length} driver{onlineDrivers.length === 1 ? "" : "s"} online · {activeRides.length} active ride{activeRides.length === 1 ? "" : "s"}
              </small>
            </header>
            <MapView className="admin__map" markers={markers} fit={markers} fitKey={String(markers.length > 0)} zoom={11} />
          </section>

          <section className="panel-card">
            <header>
              <h2>Driver approvals</h2>
              <small>{pending.length} waiting</small>
            </header>
            {pending.length === 0 ? (
              <p className="muted pad">No applications waiting.</p>
            ) : (
              <ul className="approvals">
                {pending.map((driver) => (
                  <li key={driver.user_id}>
                    <div>
                      <strong>{driver.name}</strong>
                      <small>
                        {formatPhone(driver.phone)} · {driver.city}
                      </small>
                      <small>
                        {rideTypeById(driver.vehicle_type)?.name} · {driver.vehicle_model} · {driver.vehicle_number} · DL {driver.licence_number}
                      </small>
                    </div>
                    <button className="btn btn-black btn-sm" onClick={() => approve(driver.user_id, true)}>
                      Approve
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <section className="panel-card">
          <header>
            <h2>Rides</h2>
            <div className="seg-mini">
              <button className={filter === "all" ? "is-active" : ""} onClick={() => setFilter("all")}>
                Recent
              </button>
              <button className={filter === "active" ? "is-active" : ""} onClick={() => setFilter("active")}>
                Active ({activeRides.length})
              </button>
            </div>
          </header>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Rider</th>
                  <th>Driver</th>
                  <th>Route</th>
                  <th>Type</th>
                  <th className="num">Fare</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {rides.map((ride) => (
                  <tr key={ride.id}>
                    <td>
                      {formatDate(ride.created_at)} {formatTime(ride.created_at)}
                    </td>
                    <td>
                      <span className={`badge badge--${ride.status}`}>{ride.status}</span>
                    </td>
                    <td>
                      {ride.rider_name}
                      <small>{formatPhone(ride.rider_phone)}</small>
                    </td>
                    <td>{ride.driver_name ?? "–"}</td>
                    <td className="route-cell">
                      {ride.pickup_label} → {ride.drop_label}
                    </td>
                    <td>{rideTypeById(ride.ride_type)?.name}</td>
                    <td className="num">
                      {formatRupees(ride.fare)}
                      <small>{ride.payment_method.toUpperCase()}</small>
                    </td>
                    <td>{ride.rating ? `★ ${ride.rating}` : "–"}</td>
                  </tr>
                ))}
                {rides.length === 0 && (
                  <tr>
                    <td colSpan={8} className="muted">
                      No rides yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="panel-card">
          <header>
            <h2>Drivers</h2>
            <small>{data?.drivers.length ?? 0} registered</small>
          </header>
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Vehicle</th>
                  <th>City</th>
                  <th>Status</th>
                  <th className="num">Trips</th>
                  <th>Rating</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {data?.drivers.map((driver) => (
                  <tr key={driver.user_id}>
                    <td>
                      {driver.name}
                      <small>{formatPhone(driver.phone)}</small>
                    </td>
                    <td>
                      {rideTypeById(driver.vehicle_type)?.name} · {driver.vehicle_model}
                      <small>{driver.vehicle_number}</small>
                    </td>
                    <td>{driver.city}</td>
                    <td>
                      <span className={`badge ${!driver.approved ? "badge--requested" : onlineDrivers.includes(driver) ? "badge--started" : "badge--cancelled"}`}>{!driver.approved ? "pending" : onlineDrivers.includes(driver) ? "online" : "offline"}</span>
                    </td>
                    <td className="num">{driver.trips}</td>
                    <td>{driver.rating ? `★ ${Math.round(driver.rating * 10) / 10}` : "–"}</td>
                    <td>
                      {driver.approved ? (
                        <button className="link-btn" onClick={() => approve(driver.user_id, false)}>
                          Suspend
                        </button>
                      ) : (
                        <button className="link-btn" onClick={() => approve(driver.user_id, true)}>
                          Approve
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
