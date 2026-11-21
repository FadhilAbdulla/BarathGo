"use client";

import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { type Driver, ApiError, api, formatDate, formatKm, formatMin, formatPhone, formatTime, mapPadding, useIsDesktop, usePoll, useSession } from "@/lib/api";
import { formatRupees, PLATFORM_FEE, rideTypeById, rideTypes, type RideTypeId } from "@/lib/fares";
import { Icon } from "../Icon";
import { VehicleArt } from "../Vehicles";
import { AppBar } from "./AppBar";
import { AuthPanel } from "./AuthPanel";
import { MapView, type MapMarker } from "./MapView";

type Offer = {
  id: string;
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
  earning: number;
  payment_method: string;
  rider_name: string | null;
  pickup_distance_m: number;
};
type Trip = Omit<Offer, "pickup_distance_m" | "rider_name"> & { status: "accepted" | "arrived" | "started"; rider: { name: string | null; phone: string } | null };
type State = {
  user: { id: string; name: string | null; phone: string };
  driver: Driver;
  trip: Trip | null;
  offers: Offer[];
  today: { trips: number; earnings: number };
  recent: { id: string; pickup_label: string; drop_label: string; fare: number; earning: number; payment_method: string; rating: number | null; completed_at: number; distance_m: number }[];
};

const navUrl = (lat: number, lng: number) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;

export function DriverApp() {
  const { user, setUser, logout } = useSession();
  const desktop = useIsDesktop();
  const [state, setState] = useState<State | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [tab, setTab] = useState<"drive" | "earnings">("drive");
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const mapCenter = useRef<{ lat: number; lng: number } | null>(null);
  const lastSent = useRef(0);

  const load = useCallback(async () => {
    try {
      setState(await api<State>("/driver/state"));
    } catch (err) {
      if (err instanceof ApiError && err.status === 403) setState(null);
      else throw err;
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (user) void load();
    else if (user === null) setLoaded(true);
  }, [user, load]);

  const online = !!state?.driver.online;
  const approved = !!state?.driver.approved;
  usePoll(load, online ? 4000 : 20000, !!state && (online || !approved));

  // Live GPS while online.
  useEffect(() => {
    if (!online || !("geolocation" in navigator)) return;
    const watch = navigator.geolocation.watchPosition(
      (pos) => {
        setGeoError(null);
        setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => setGeoError("Location is off. Drag the map to your position and tap “Set my location”."),
      { enableHighAccuracy: true, maximumAge: 5000 },
    );
    return () => navigator.geolocation.clearWatch(watch);
  }, [online]);

  // Send position updates (at most every 8 s).
  useEffect(() => {
    if (!online || !position || Date.now() - lastSent.current < 8000) return;
    lastSent.current = Date.now();
    void api<State>("/driver/status", { online: true, ...position }).then(setState).catch(() => undefined);
  }, [online, position]);

  async function run(action: () => Promise<State>, message?: string) {
    setBusy(true);
    setError(null);
    try {
      setState(await action());
      if (message) setToast(message);
    } catch (err) {
      setError((err as Error).message);
      void load();
    } finally {
      setBusy(false);
    }
  }

  async function goOnline() {
    let at = position;
    if (!at) {
      try {
        at = await new Promise<{ lat: number; lng: number }>((resolve, reject) =>
          navigator.geolocation.getCurrentPosition((pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }), reject, { enableHighAccuracy: true, timeout: 8000 }),
        );
        setPosition(at);
      } catch {
        at = state?.driver.lat != null && state.driver.lng != null ? { lat: state.driver.lat, lng: state.driver.lng } : mapCenter.current;
        setGeoError("Location is off. Drag the map to your position and tap “Set my location”.");
      }
    }
    await run(() => api<State>("/driver/status", { online: true, ...(at ?? {}) }), "You’re online. New requests will appear here.");
  }

  const trip = state?.trip ?? null;
  const offer = !trip ? state?.offers[0] ?? null : null;
  const me = position ?? (state?.driver.lat != null && state.driver.lng != null ? { lat: state.driver.lat, lng: state.driver.lng } : null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(timer);
  }, [toast]);

  if (user === undefined || (user && !loaded)) return <Loading />;

  if (!user) {
    return (
      <div className="app">
        <AppBar label="Driver" user={user} onLogout={logout} />
        <div className="app__centered">
          <div className="card-narrow">
            <AuthPanel title="Drive with BarathGo" subtitle="Log in or sign up with your mobile number to start earning." onDone={(signedIn) => setUser(signedIn)} />
          </div>
        </div>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="app">
        <AppBar label="Driver" user={user} onLogout={logout} />
        <div className="app__centered">
          <Onboarding name={user.name ?? ""} onDone={(next) => { setState(next); setLoaded(true); }} />
        </div>
      </div>
    );
  }

  if (!approved) {
    return (
      <div className="app">
        <AppBar label="Driver" user={user} onLogout={logout} />
        <div className="app__centered">
          <div className="card-narrow review">
            <span className="review__icon">
              <Icon name="id" size={28} />
            </span>
            <h1>Application under review</h1>
            <p className="muted">Thanks, {user.name?.split(" ")[0]}. Our onboarding team will verify your licence and vehicle, then call you to schedule a quick inspection. This page updates automatically once you’re approved.</p>
            <dl className="facts">
              <div><dt>Vehicle</dt><dd>{rideTypeById(state.driver.vehicle_type)?.name} · {state.driver.vehicle_model}</dd></div>
              <div><dt>Number</dt><dd>{state.driver.vehicle_number}</dd></div>
              <div><dt>Licence</dt><dd>{state.driver.licence_number}</dd></div>
              <div><dt>City</dt><dd>{state.driver.city}</dd></div>
            </dl>
          </div>
        </div>
      </div>
    );
  }

  const markers: MapMarker[] = [];
  if (me) markers.push({ id: "me", kind: "car", ...me });
  const focus = trip ?? offer;
  if (focus && (!trip || trip.status !== "started")) markers.push({ id: "pickup", kind: "pickup", lat: focus.pickup_lat, lng: focus.pickup_lng, label: "Pickup" });
  if (focus) markers.push({ id: "drop", kind: "drop", lat: focus.drop_lat, lng: focus.drop_lng, label: "Drop" });
  const fit = [me, focus && (!trip || trip.status !== "started") ? { lat: focus.pickup_lat, lng: focus.pickup_lng } : null, focus ? { lat: focus.drop_lat, lng: focus.drop_lng } : null].filter(Boolean) as { lat: number; lng: number }[];

  return (
    <div className="app">
      <AppBar label="Driver" user={user} onLogout={async () => { if (online) await api("/driver/status", { online: false }).catch(() => undefined); void logout(); setState(null); }}>
        <span className={`status-pill${online ? " is-online" : ""}`}>{online ? "Online" : "Offline"}</span>
      </AppBar>
      <div className="app__body">
        <MapView className="app__map" markers={markers} fit={fit} fitKey={`${trip?.id ?? offer?.id ?? "idle"}|${trip?.status ?? ""}|${!!me}`} padding={mapPadding(desktop)} center={!focus ? me : null} onMove={(center) => (mapCenter.current = center)} />
        {online && geoError && !trip && (
          <div className="crosshair" aria-hidden="true">
            <span />
          </div>
        )}

        <section className="sheet" aria-label="Driver panel">
          <div className="tabs" role="tablist">
            <button role="tab" aria-selected={tab === "drive"} className={tab === "drive" ? "is-active" : ""} onClick={() => setTab("drive")}>
              Drive
            </button>
            <button role="tab" aria-selected={tab === "earnings"} className={tab === "earnings" ? "is-active" : ""} onClick={() => setTab("earnings")}>
              Earnings
            </button>
          </div>

          {tab === "earnings" ? (
            <Earnings state={state} />
          ) : trip ? (
            <TripPanel trip={trip} busy={busy} run={run} />
          ) : (
            <>
              <div className="today">
                <div>
                  <span>Today</span>
                  <strong>{formatRupees(state.today.earnings)}</strong>
                </div>
                <div>
                  <span>Trips</span>
                  <strong>{state.today.trips}</strong>
                </div>
                <div>
                  <span>Rating</span>
                  <strong>{state.driver.rating ? `★ ${state.driver.rating}` : "New"}</strong>
                </div>
              </div>

              {!online ? (
                <div className="go">
                  <button className="go__btn" onClick={goOnline} disabled={busy}>
                    <Icon name="power" size={26} />
                    <span>{busy ? "…" : "GO"}</span>
                  </button>
                  <p>
                    You’re offline. Go online to receive {rideTypeById(state.driver.vehicle_type)?.name} requests near you.
                  </p>
                </div>
              ) : offer ? (
                <OfferCard offer={offer} busy={busy} onAccept={() => run(() => api<State>(`/driver/trips/${offer.id}/accept`, {}), "Trip accepted. Head to the pickup.")} onDecline={() => run(() => api<State>(`/driver/trips/${offer.id}/decline`, {}))} />
              ) : (
                <div className="waiting">
                  <div className="radar" aria-hidden="true">
                    <span />
                  </div>
                  <h2>Finding trips</h2>
                  <p className="muted">You’ll see requests near you here. Keep this screen open.</p>
                  {geoError && (
                    <>
                      <p className="hint">{geoError}</p>
                      <button className="btn btn-gray btn-block" onClick={() => mapCenter.current && run(() => api<State>("/driver/status", { online: true, ...mapCenter.current! }), "Location updated.")}>
                        <Icon name="locate" size={18} /> Set my location here
                      </button>
                    </>
                  )}
                  <button className="btn btn-gray btn-block" onClick={() => run(() => api<State>("/driver/status", { online: false }), "You’re offline.")} disabled={busy}>
                    Go offline
                  </button>
                </div>
              )}
            </>
          )}
          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}
        </section>
        {toast && (
          <div className="toast" role="status">
            {toast}
          </div>
        )}
      </div>
    </div>
  );
}

function Loading() {
  return (
    <div className="app">
      <div className="app__centered">
        <span className="spinner" aria-label="Loading" />
      </div>
    </div>
  );
}

function OfferCard({ offer, busy, onAccept, onDecline }: { offer: Offer; busy: boolean; onAccept: () => void; onDecline: () => void }) {
  return (
    <div className="offer" aria-live="assertive">
      <div className="offer__head">
        <span className="offer__tag">New request · {rideTypeById(offer.ride_type)?.name}</span>
        <span className="offer__pay">{offer.payment_method === "upi" ? "UPI" : "Cash"}</span>
      </div>
      <div className="offer__money">
        <strong>{formatRupees(offer.earning)}</strong>
        <span>you earn · fare {formatRupees(offer.fare)}</span>
      </div>
      <p className="offer__away">
        {formatKm(offer.pickup_distance_m)} to pickup · trip {formatKm(offer.distance_m)}, {formatMin(offer.duration_s)}
      </p>
      <div className="tripcard__route">
        <span className="tripcard__line" aria-hidden="true" />
        <p>
          <span className="place__mark place__mark--pickup" aria-hidden="true" />
          {offer.pickup_label}
        </p>
        <p>
          <span className="place__mark place__mark--drop" aria-hidden="true" />
          {offer.drop_label}
        </p>
      </div>
      <p className="muted small">Rider: {offer.rider_name ?? "BarathGo rider"}</p>
      <div className="offer__actions">
        <button className="btn btn-gray btn-lg" onClick={onDecline} disabled={busy}>
          Decline
        </button>
        <button className="btn btn-brand btn-lg" onClick={onAccept} disabled={busy}>
          Accept
        </button>
      </div>
    </div>
  );
}

function TripPanel({ trip, busy, run }: { trip: Trip; busy: boolean; run: (action: () => Promise<State>, message?: string) => Promise<void> }) {
  const [pin, setPin] = useState("");
  const riderName = trip.rider?.name ?? "Rider";
  const toPickup = trip.status !== "started";

  function start(event: FormEvent) {
    event.preventDefault();
    void run(() => api<State>(`/driver/trips/${trip.id}/start`, { pin }), "Trip started. Drive safe!");
  }

  return (
    <div className="status">
      <p className="eyebrow-sm">{trip.status === "accepted" ? "Picking up" : trip.status === "arrived" ? "Waiting at pickup" : "On trip"}</p>
      <h1 className="sheet__title">{toPickup ? riderName : `Drop ${riderName}`}</h1>
      <p className="muted">{toPickup ? trip.pickup_label : trip.drop_label}</p>

      <div className="actions">
        <a className="action" href={navUrl(toPickup ? trip.pickup_lat : trip.drop_lat, toPickup ? trip.pickup_lng : trip.drop_lng)} target="_blank" rel="noopener">
          <Icon name="navigate" size={20} />
          Navigate
        </a>
        {trip.rider && (
          <a className="action" href={`tel:${trip.rider.phone}`}>
            <Icon name="phone" size={20} />
            Call
          </a>
        )}
        <a className="action action--sos" href="tel:112">
          <Icon name="alert" size={20} />
          SOS 112
        </a>
      </div>

      {trip.status === "accepted" && (
        <button className="btn btn-black btn-lg btn-block" disabled={busy} onClick={() => run(() => api<State>(`/driver/trips/${trip.id}/arrived`, {}), "Rider notified that you’ve arrived.")}>
          I’ve arrived
        </button>
      )}

      {trip.status === "arrived" && (
        <form className="pin-entry" onSubmit={start}>
          <label htmlFor="trip-pin">Enter the rider’s 4-digit PIN</label>
          <input id="trip-pin" className="input input--code" inputMode="numeric" maxLength={4} value={pin} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} autoFocus required />
          <button className="btn btn-black btn-lg btn-block" disabled={busy || pin.length !== 4}>
            Start trip
          </button>
        </form>
      )}

      {trip.status === "started" && (
        <>
          <div className="collect">
            <span>Collect from rider</span>
            <strong>{formatRupees(trip.fare)}</strong>
            <small>{trip.payment_method === "upi" ? "UPI payment to your account" : "Cash payment"} · you earn {formatRupees(trip.earning)}</small>
          </div>
          <button className="btn btn-brand btn-lg btn-block" disabled={busy} onClick={() => confirm(`Complete trip and collect ${formatRupees(trip.fare)}?`) && run(() => api<State>(`/driver/trips/${trip.id}/complete`, {}), `Trip complete. You earned ${formatRupees(trip.earning)}.`)}>
            Complete trip
          </button>
        </>
      )}

      {toPickup && (
        <button className="btn btn-gray btn-block" disabled={busy} onClick={() => confirm("Cancel this trip? The request will go to another driver.") && run(() => api<State>(`/driver/trips/${trip.id}/cancel`, {}), "Trip cancelled.")}>
          Cancel trip
        </button>
      )}
      {trip.rider && <p className="fineprint">Rider: {formatPhone(trip.rider.phone)}</p>}
    </div>
  );
}

function Earnings({ state }: { state: State }) {
  return (
    <div className="earnings">
      <div className="today">
        <div>
          <span>Today</span>
          <strong>{formatRupees(state.today.earnings)}</strong>
        </div>
        <div>
          <span>Trips today</span>
          <strong>{state.today.trips}</strong>
        </div>
      </div>
      <p className="hint">You keep {Math.round((1 - PLATFORM_FEE) * 100)}% of every fare. UPI and cash fares are paid to you directly by the rider.</p>
      <h2 className="list-title">Recent trips</h2>
      {state.recent.length === 0 ? (
        <p className="muted">No completed trips yet.</p>
      ) : (
        <ul className="history">
          {state.recent.map((ride) => (
            <li key={ride.id}>
              <div>
                <strong>{ride.drop_label}</strong>
                <small>
                  {formatDate(ride.completed_at)}, {formatTime(ride.completed_at)} · {formatKm(ride.distance_m)} · {ride.payment_method.toUpperCase()}
                  {ride.rating ? ` · ★ ${ride.rating}` : ""}
                </small>
              </div>
              <strong>{formatRupees(ride.earning)}</strong>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Onboarding({ name, onDone }: { name: string; onDone: (state: State) => void }) {
  const [form, setForm] = useState({ name, vehicleType: "mini" as RideTypeId, vehicleModel: "", vehicleNumber: "", licenceNumber: "", city: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) => setForm({ ...form, [key]: event.target.value });

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      onDone(await api<State>("/driver/register", form));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="card-wide onboard" onSubmit={submit}>
      <h1>Become a driver partner</h1>
      <p className="muted">Tell us about you and your vehicle. Keep your driving licence, RC, permit and insurance ready for verification.</p>

      <fieldset className="vehicle-pick">
        <legend>Vehicle type</legend>
        {rideTypes.map((type) => (
          <label key={type.id} className={form.vehicleType === type.id ? "is-selected" : ""}>
            <input type="radio" name="vehicleType" value={type.id} checked={form.vehicleType === type.id} onChange={() => setForm({ ...form, vehicleType: type.id })} className="sr-only" />
            <VehicleArt type={type.id} />
            <span>{type.name}</span>
          </label>
        ))}
      </fieldset>

      <div className="grid-2">
        <label className="field-label">
          Full name (as on licence)
          <input className="input" value={form.name} onChange={set("name")} required autoComplete="name" />
        </label>
        <label className="field-label">
          City
          <input className="input" value={form.city} onChange={set("city")} required placeholder="e.g. New Delhi" autoComplete="address-level2" />
        </label>
        <label className="field-label">
          Vehicle make &amp; model
          <input className="input" value={form.vehicleModel} onChange={set("vehicleModel")} required placeholder="e.g. Maruti Dzire" />
        </label>
        <label className="field-label">
          Vehicle number
          <input className="input" value={form.vehicleNumber} onChange={set("vehicleNumber")} required placeholder="e.g. DL 3C AB 4821" autoCapitalize="characters" />
        </label>
        <label className="field-label full">
          Driving licence number
          <input className="input" value={form.licenceNumber} onChange={set("licenceNumber")} required placeholder="e.g. DL0420110012345" autoCapitalize="characters" />
        </label>
      </div>
      {error && (
        <p className="alert" role="alert">
          {error}
        </p>
      )}
      <button className="btn btn-black btn-lg btn-block" disabled={busy}>
        {busy ? "Submitting…" : "Submit for verification"}
      </button>
    </form>
  );
}
