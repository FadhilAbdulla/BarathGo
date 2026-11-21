"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { type Place, type Quote, type Ride, type User, api, formatKm, formatMin, formatPhone, formatTime, mapPadding, useIsDesktop, usePoll, useSession } from "@/lib/api";
import { formatRupees, haversine, rideTypeById, type RideTypeId } from "@/lib/fares";
import { currentPosition, reversePlace } from "@/lib/places";
import { Icon } from "../Icon";
import { VehicleArt } from "../Vehicles";
import { AppBar } from "./AppBar";
import { AuthPanel } from "./AuthPanel";
import { MapView, type MapMarker } from "./MapView";
import { PlaceInput } from "./PlaceInput";

const NO_DRIVER_MS = 10 * 60 * 1000;
export const TRIP_DRAFT_KEY = "bg_trip_draft";

export function RiderApp() {
  const { user, setUser, logout } = useSession();
  const desktop = useIsDesktop();
  const [pickup, setPickup] = useState<Place | null>(null);
  const [drop, setDrop] = useState<Place | null>(null);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [choice, setChoice] = useState<RideTypeId>("mini");
  const [payment, setPayment] = useState<"cash" | "upi">("upi");
  const [ride, setRide] = useState<Ride | null>(null);
  const [needAuth, setNeedAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [locating, setLocating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Restore a trip typed on the homepage, then resume any ride in progress.
  useEffect(() => {
    try {
      const draft = JSON.parse(sessionStorage.getItem(TRIP_DRAFT_KEY) ?? "null") as { pickup?: Place; drop?: Place } | null;
      if (draft?.pickup) setPickup(draft.pickup);
      if (draft?.drop) setDrop(draft.drop);
      sessionStorage.removeItem(TRIP_DRAFT_KEY);
    } catch {
      /* storage unavailable */
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    void api<{ ride: Ride | null }>("/rides/active").then(({ ride: active }) => {
      if (!active) return;
      setRide(active);
      setPickup({ label: active.pickup_label, lat: active.pickup_lat, lng: active.pickup_lng });
      setDrop({ label: active.drop_label, lat: active.drop_lat, lng: active.drop_lng });
    });
  }, [user]);

  // Fare quote whenever both ends are set.
  useEffect(() => {
    setQuote(null);
    setError(null);
    if (!pickup || !drop) return;
    let cancelled = false;
    setQuoting(true);
    api<Quote>("/quote", { pickup, drop })
      .then((result) => {
        if (cancelled) return;
        setQuote(result);
        setChoice((current) => (result.options.some((option) => option.id === current) ? current : result.options[0].id));
      })
      .catch((err) => !cancelled && setError((err as Error).message))
      .finally(() => !cancelled && setQuoting(false));
    return () => {
      cancelled = true;
    };
  }, [pickup, drop]);

  const pollRide = useCallback(async () => {
    if (!ride) return;
    const { ride: next } = await api<{ ride: Ride }>(`/rides/${ride.id}`);
    setRide(next);
  }, [ride]);
  const live = !!ride && ["requested", "accepted", "arrived", "started"].includes(ride.status);
  usePoll(pollRide, 3000, live);

  // Give up on a request nobody accepted.
  useEffect(() => {
    if (ride?.status !== "requested") return;
    const remaining = ride.created_at + NO_DRIVER_MS - Date.now();
    const timer = setTimeout(async () => {
      await api(`/rides/${ride.id}/cancel`, {}).catch(() => undefined);
      setRide(null);
      setNotice("No drivers were available for this trip. Please try again, or choose another ride type.");
    }, Math.max(0, remaining));
    return () => clearTimeout(timer);
  }, [ride?.id, ride?.status, ride?.created_at]);

  async function useMyLocation() {
    setLocating(true);
    setError(null);
    try {
      const position = await currentPosition();
      setPickup(await reversePlace(position.lat, position.lng));
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLocating(false);
    }
  }

  async function requestRide(signedIn?: User) {
    if (!pickup || !drop) return;
    if (!(signedIn ?? user)) {
      setNeedAuth(true);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const { ride: created } = await api<{ ride: Ride }>("/rides", { pickup, drop, rideType: choice, payment });
      setRide(created);
      setNotice(null);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function cancel() {
    if (!ride || !confirm("Cancel this ride?")) return;
    setBusy(true);
    try {
      await api(`/rides/${ride.id}/cancel`, {});
      setRide(null);
      setNotice("Your ride was cancelled.");
    } catch (err) {
      setError((err as Error).message);
      void pollRide();
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setRide(null);
    setDrop(null);
    setQuote(null);
    setNotice(null);
  }

  // Map content.
  const driverPos = ride?.driver?.lat != null && ride.driver.lng != null ? { lat: ride.driver.lat, lng: ride.driver.lng } : null;
  const markers: MapMarker[] = [];
  if (pickup && ride?.status !== "started") markers.push({ id: "pickup", kind: "pickup", lat: pickup.lat, lng: pickup.lng, label: ride ? "Pickup" : undefined });
  if (drop) markers.push({ id: "drop", kind: "drop", lat: drop.lat, lng: drop.lng, label: ride?.status === "started" ? "Drop" : undefined });
  if (driverPos && live) markers.push({ id: "car", kind: "car", ...driverPos });

  const fitPoints = useMemo(() => {
    if (ride && driverPos && (ride.status === "accepted" || ride.status === "arrived")) return pickup ? [driverPos, pickup] : [driverPos];
    if (ride?.status === "started" && driverPos && drop) return [driverPos, drop];
    return [pickup, drop].filter(Boolean) as Place[];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ride?.status, pickup, drop, !!driverPos]);
  const fitKey = `${ride?.status ?? "plan"}|${pickup?.lat},${pickup?.lng}|${drop?.lat},${drop?.lng}|${!!driverPos}`;
  const padding = mapPadding(desktop);

  const selected = quote?.options.find((option) => option.id === choice);

  return (
    <div className="app">
      <AppBar label="Ride" user={user} onLogout={() => { void logout(); reset(); }} />
      <div className="app__body">
        <MapView className="app__map" markers={markers} route={ride?.status === "accepted" || ride?.status === "arrived" ? null : quote?.geometry} fit={fitPoints} fitKey={fitKey} padding={padding} />

        <section className="sheet" aria-label="Ride panel">
          {needAuth && !user ? (
            <>
              <button className="sheet__back" onClick={() => setNeedAuth(false)}>
                <Icon name="back" size={20} /> Back
              </button>
              <AuthPanel
                title="Log in to request"
                subtitle="Enter your mobile number. We’ll text you a code."
                onDone={(signedIn) => {
                  setUser(signedIn);
                  setNeedAuth(false);
                  void requestRide(signedIn);
                }}
              />
            </>
          ) : ride ? (
            <RideStatus ride={ride} busy={busy} onCancel={cancel} onDone={reset} />
          ) : (
            <>
              <h1 className="sheet__title">Get a ride</h1>
              {notice && <p className="notice">{notice}</p>}
              <div className="places">
                <span className="places__line" aria-hidden="true" />
                <PlaceInput kind="pickup" value={pickup} onChange={setPickup} placeholder={locating ? "Finding your location…" : "Pickup location"} near={drop} onCurrentLocation={useMyLocation} autoFocus={!pickup && desktop} />
                <PlaceInput kind="drop" value={drop} onChange={setDrop} placeholder="Where to?" near={pickup} />
                <button
                  className="places__swap"
                  aria-label="Swap pickup and drop"
                  onClick={() => {
                    setPickup(drop);
                    setDrop(pickup);
                  }}
                  disabled={!pickup && !drop}
                >
                  <Icon name="route" size={18} />
                </button>
              </div>

              {!pickup && !drop && (
                <button className="chip-btn" onClick={useMyLocation} disabled={locating}>
                  <Icon name="locate" size={18} /> {locating ? "Locating…" : "Use my current location"}
                </button>
              )}

              {quoting && (
                <div className="skeleton-list" aria-label="Loading prices">
                  {[0, 1, 2].map((key) => (
                    <span key={key} className="skeleton" />
                  ))}
                </div>
              )}

              {quote && (
                <>
                  <div className="trip-meta">
                    <span>
                      {formatKm(quote.distanceM)} · {formatMin(quote.durationS)}
                    </span>
                    <span>Upfront prices</span>
                  </div>
                  <ul className="options" role="radiogroup" aria-label="Choose a ride">
                    {quote.options.map((option) => (
                      <li key={option.id}>
                        <button role="radio" aria-checked={choice === option.id} className={`option${choice === option.id ? " is-selected" : ""}`} onClick={() => setChoice(option.id)}>
                          <VehicleArt type={option.id} className="option__art" />
                          <span className="option__body">
                            <strong>
                              {option.name}
                              <span className="option__seats">
                                <Icon name="user" size={13} /> {option.seats}
                              </span>
                            </strong>
                            <small>{option.etaMin !== null ? `${option.etaMin} min away · ${formatTime(Date.now() + (option.etaMin * 60 + quote.durationS) * 1000)} drop-off` : option.blurb}</small>
                          </span>
                          <span className="option__fare">{formatRupees(option.fare)}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  {selected?.etaMin === null && <p className="hint">No {selected.name} drivers are online near you right now. You can still request; nearby drivers will see it as they come online.</p>}
                  <div className="checkout">
                    <div className="pay" role="radiogroup" aria-label="Payment method">
                      {(["upi", "cash"] as const).map((method) => (
                        <button key={method} role="radio" aria-checked={payment === method} className={`pay__btn${payment === method ? " is-active" : ""}`} onClick={() => setPayment(method)}>
                          <Icon name={method === "upi" ? "qr" : "cash"} size={18} /> {method === "upi" ? "UPI" : "Cash"}
                        </button>
                      ))}
                    </div>
                    <button className="btn btn-black btn-lg btn-block" onClick={() => requestRide()} disabled={busy || !selected}>
                      {busy ? "Requesting…" : `Request ${selected?.name ?? ""} · ${selected ? formatRupees(selected.fare) : ""}`}
                    </button>
                  </div>
                </>
              )}

              {!pickup || !drop ? (
                <div className="sheet__empty">
                  <p>
                    <strong>Book a ride in seconds.</strong> Pay the upfront price by UPI or cash. Every driver is verified and every trip is tracked.
                  </p>
                </div>
              ) : null}
            </>
          )}
          {error && (
            <p className="alert" role="alert">
              {error}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}

function Stars({ value, onRate }: { value: number; onRate: (value: number) => void }) {
  return (
    <div className="stars" role="radiogroup" aria-label="Rate your driver">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} role="radio" aria-checked={value === star} aria-label={`${star} star${star > 1 ? "s" : ""}`} className={star <= value ? "is-on" : ""} onClick={() => onRate(star)}>
          ★
        </button>
      ))}
    </div>
  );
}

function RideStatus({ ride, busy, onCancel, onDone }: { ride: Ride; busy: boolean; onCancel: () => void; onDone: () => void }) {
  const [rating, setRating] = useState(ride.rating ?? 0);
  const [rated, setRated] = useState(!!ride.rating);
  const [, tick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => tick((value) => value + 1), 15000);
    return () => clearInterval(timer);
  }, []);

  const type = rideTypeById(ride.ride_type);
  const driver = ride.driver;
  const driverToPickup = driver?.lat != null && driver.lng != null ? haversine(driver.lat, driver.lng, ride.pickup_lat, ride.pickup_lng) : null;
  const etaMin = driverToPickup !== null ? Math.max(1, Math.round((driverToPickup * 1.3) / (22000 / 60))) : null;

  async function rate(value: number) {
    setRating(value);
    await api(`/rides/${ride.id}/rate`, { rating: value }).catch(() => undefined);
    setRated(true);
  }

  async function share() {
    const text = `I'm riding with BarathGo: ${driver?.name ?? "driver"} · ${driver?.vehicle_model} ${driver?.vehicle_number}. From ${ride.pickup_label} to ${ride.drop_label}.`;
    if (navigator.share) await navigator.share({ title: "My BarathGo trip", text }).catch(() => undefined);
    else await navigator.clipboard?.writeText(text);
  }

  if (ride.status === "completed") {
    return (
      <div className="status status--done">
        <span className="status__check">
          <Icon name="check" size={28} />
        </span>
        <h1 className="sheet__title">You’ve arrived</h1>
        <p className="muted">{ride.drop_label}</p>
        <div className="receipt">
          <div>
            <span>Total fare</span>
            <strong>{formatRupees(ride.fare)}</strong>
          </div>
          <div>
            <span>Pay by</span>
            <strong>{ride.payment_method === "upi" ? "UPI to driver" : "Cash to driver"}</strong>
          </div>
          <div>
            <span>Trip</span>
            <strong>
              {formatKm(ride.distance_m)} · {type?.name}
            </strong>
          </div>
        </div>
        {driver && (
          <div className="rate">
            <p>{rated ? "Thanks for your feedback!" : `How was your ride with ${driver.name?.split(" ")[0] ?? "your driver"}?`}</p>
            <Stars value={rating} onRate={rate} />
          </div>
        )}
        <button className="btn btn-black btn-lg btn-block" onClick={onDone}>
          Done
        </button>
      </div>
    );
  }

  if (ride.status === "cancelled") {
    return (
      <div className="status">
        <h1 className="sheet__title">Ride cancelled</h1>
        <p className="muted">This trip was cancelled{ride.cancelled_by === "rider" ? " by you" : ""}.</p>
        <button className="btn btn-black btn-lg btn-block" onClick={onDone}>
          Book another ride
        </button>
      </div>
    );
  }

  if (ride.status === "requested") {
    const waited = Date.now() - ride.created_at;
    return (
      <div className="status">
        <h1 className="sheet__title">Finding your driver</h1>
        <div className="progress" aria-hidden="true">
          <span />
        </div>
        <p className="muted">{waited > 3 * 60000 ? "It’s taking longer than usual. Nearby drivers can still accept your request." : "Connecting you with verified drivers nearby…"}</p>
        <TripCard ride={ride} />
        <button className="btn btn-gray btn-lg btn-block" onClick={onCancel} disabled={busy}>
          Cancel request
        </button>
      </div>
    );
  }

  const heading = ride.status === "accepted" ? `Driver arriving in ${etaMin ?? "a few"} min` : ride.status === "arrived" ? "Your driver has arrived" : `Heading to ${ride.drop_label}`;
  const sub =
    ride.status === "started" && ride.started_at
      ? `Arriving around ${formatTime(ride.started_at + ride.duration_s * 1000)}`
      : ride.status === "arrived"
        ? "Meet your driver at the pickup point"
        : `${driver?.vehicle_model ?? ""} is on the way`;

  return (
    <div className="status">
      <h1 className="sheet__title">{heading}</h1>
      <p className="muted">{sub}</p>

      {driver && (
        <div className="driver">
          <span className="avatar avatar--lg">{(driver.name ?? "D").charAt(0)}</span>
          <div className="driver__info">
            <strong>{driver.name}</strong>
            <small>
              ★ {driver.rating ?? "New"} · {driver.trips} trips
            </small>
          </div>
          <div className="driver__car">
            <span className="plate">{driver.vehicle_number}</span>
            <small>{driver.vehicle_model}</small>
          </div>
        </div>
      )}

      {ride.status !== "started" && (
        <div className="pinbox">
          <span>Share this PIN with your driver to start the trip</span>
          <strong aria-label={`PIN ${ride.pin.split("").join(" ")}`}>
            {ride.pin.split("").map((digit, index) => (
              <i key={index}>{digit}</i>
            ))}
          </strong>
        </div>
      )}

      <div className="actions">
        {driver && (
          <a className="action" href={`tel:${driver.phone}`}>
            <Icon name="phone" size={20} />
            Call
          </a>
        )}
        <button className="action" onClick={share}>
          <Icon name="share" size={20} />
          Share trip
        </button>
        <a className="action action--sos" href="tel:112">
          <Icon name="alert" size={20} />
          SOS 112
        </a>
      </div>

      <TripCard ride={ride} />
      {ride.status !== "started" && (
        <button className="btn btn-gray btn-lg btn-block" onClick={onCancel} disabled={busy}>
          Cancel ride
        </button>
      )}
      {driver && <p className="fineprint">Driver: {formatPhone(driver.phone)}</p>}
    </div>
  );
}

function TripCard({ ride }: { ride: Ride }) {
  return (
    <div className="tripcard">
      <div className="tripcard__route">
        <span className="tripcard__line" aria-hidden="true" />
        <p>
          <span className="place__mark place__mark--pickup" aria-hidden="true" />
          {ride.pickup_label}
        </p>
        <p>
          <span className="place__mark place__mark--drop" aria-hidden="true" />
          {ride.drop_label}
        </p>
      </div>
      <div className="tripcard__foot">
        <span>
          {rideTypeById(ride.ride_type)?.name} · {ride.payment_method === "upi" ? "UPI" : "Cash"}
        </span>
        <strong>{formatRupees(ride.fare)}</strong>
      </div>
    </div>
  );
}
