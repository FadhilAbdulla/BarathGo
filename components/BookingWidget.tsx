"use client";

import Link from "next/link";
import { useEffect, useId, useState, type FormEvent } from "react";
import { estimateFare, rideTypes, tripKinds } from "@/lib/site";
import { submitRequest } from "@/lib/submit";
import { Icon } from "./Icon";

const tabs = [
  { label: "City", trip: tripKinds[0] },
  { label: "Airport", trip: tripKinds[1] },
  { label: "Outstation", trip: tripKinds[2] },
  { label: "Rental", trip: tripKinds[4] },
] as const;

type Status = { kind: "idle" | "sending" | "sent" | "mailto" | "error"; message?: string };

const pad = (value: number) => String(value).padStart(2, "0");
const toDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
const toTime = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;
const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;

/**
 * Two-step ride request: trip details → ride type and contact.
 * Until the passenger app is live, requests go to the dispatch desk, who confirm by call or SMS.
 */
export function BookingWidget({ heading = "Where to?" }: { heading?: string }) {
  const uid = useId();
  const [step, setStep] = useState<1 | 2>(1);
  const [trip, setTrip] = useState<string>(tabs[0].trip);
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [minDate, setMinDate] = useState<string>();
  const [km, setKm] = useState("");
  const [ride, setRide] = useState(rideTypes[1].id);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  // Default to "in 30 minutes", set after mount so the static HTML doesn't bake in the build time.
  useEffect(() => {
    const soon = new Date(Date.now() + 30 * 60 * 1000);
    soon.setMinutes(Math.ceil(soon.getMinutes() / 5) * 5, 0, 0);
    setDate(toDate(soon));
    setTime(toTime(soon));
    setMinDate(toDate(new Date()));
  }, []);

  const distance = Number(km) > 0 ? Math.min(Number(km), 2000) : 0;

  function toStep2(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!event.currentTarget.reportValidity()) return;
    setStep(2);
    setStatus({ kind: "idle" });
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const extra = Object.fromEntries(new FormData(form).entries()) as Record<string, string>;
    const chosen = rideTypes.find((item) => item.id === ride)!;
    const estimate = distance ? estimateFare(chosen, distance) : null;
    const values: Record<string, string> = {
      ...extra,
      trip,
      pickup,
      drop,
      date,
      time,
      ride: chosen.name,
      message: [distance ? `Approx. distance: ${distance} km` : "", estimate ? `Indicative fare shown: ${rupees(estimate.low)}–${rupees(estimate.high)}` : "", extra.message ?? ""].filter(Boolean).join("\n"),
    };
    setStatus({ kind: "sending" });
    const result = await submitRequest("ride", `Ride request: ${date} ${time}`, values);
    setStatus(result.kind === "error" ? { kind: "error", message: result.message } : { kind: result.kind });
  }

  if (status.kind === "sent") {
    return (
      <div className="booking booking--done" role="status">
        <span className="booking__done-icon">
          <Icon name="check" size={30} />
        </span>
        <h2>Ride requested</h2>
        <p>
          Our dispatch desk will call or SMS you shortly to confirm your driver and final fare for <strong>{date}</strong> at <strong>{time}</strong>.
        </p>
        <button
          className="btn btn-ghost"
          type="button"
          onClick={() => {
            setStatus({ kind: "idle" });
            setStep(1);
            setPickup("");
            setDrop("");
          }}
        >
          Book another ride
        </button>
      </div>
    );
  }

  return (
    <div className="booking">
      <div className="booking__head">
        <h2 className="booking__title">{step === 1 ? heading : "Choose your ride"}</h2>
        <span className="booking__step">Step {step} of 2</span>
      </div>

      {step === 1 ? (
        <form onSubmit={toStep2}>
          <div className="seg" role="radiogroup" aria-label="Trip type">
            {tabs.map((tab) => (
              <button key={tab.label} type="button" role="radio" aria-checked={trip === tab.trip} className={`seg__btn${trip === tab.trip ? " is-active" : ""}`} onClick={() => setTrip(tab.trip)}>
                {tab.label}
              </button>
            ))}
          </div>

          <div className="route-fields">
            <span className="route-fields__line" aria-hidden="true" />
            <div className="route-field">
              <span className="route-dot route-dot--from" aria-hidden="true" />
              <label className="sr-only" htmlFor={`${uid}-pickup`}>
                Pickup location
              </label>
              <input id={`${uid}-pickup`} className="field field--bare" value={pickup} onChange={(event) => setPickup(event.target.value)} placeholder="Pickup location" required maxLength={200} autoComplete="street-address" />
            </div>
            <div className="route-field">
              <span className="route-dot route-dot--to" aria-hidden="true" />
              <label className="sr-only" htmlFor={`${uid}-drop`}>
                {trip === tripKinds[4] ? "Area or package (e.g. 8 hrs / 80 km)" : "Drop location"}
              </label>
              <input id={`${uid}-drop`} className="field field--bare" value={drop} onChange={(event) => setDrop(event.target.value)} placeholder={trip === tripKinds[4] ? "Package, e.g. 8 hrs / 80 km" : "Drop location"} required maxLength={200} />
            </div>
            <button
              className="swap"
              type="button"
              onClick={() => {
                setPickup(drop);
                setDrop(pickup);
              }}
            >
              <Icon name="route" size={18} />
              <span className="sr-only">Swap pickup and drop</span>
            </button>
          </div>

          <div className="booking__row">
            <div className="field-group">
              <label htmlFor={`${uid}-date`}>Date</label>
              <input id={`${uid}-date`} className="field" type="date" value={date} min={minDate} onChange={(event) => setDate(event.target.value)} required />
            </div>
            <div className="field-group">
              <label htmlFor={`${uid}-time`}>Time</label>
              <input id={`${uid}-time`} className="field" type="time" value={time} onChange={(event) => setTime(event.target.value)} required />
            </div>
            <div className="field-group">
              <label htmlFor={`${uid}-km`}>
                Distance <span className="optional">(km, optional)</span>
              </label>
              <input id={`${uid}-km`} className="field" type="number" inputMode="decimal" min={1} max={2000} step="any" value={km} onChange={(event) => setKm(event.target.value)} placeholder="e.g. 12" />
            </div>
          </div>

          <button className="btn btn-primary btn-lg btn-block" type="submit">
            See ride options <Icon name="arrow" size={18} />
          </button>
        </form>
      ) : (
        <form onSubmit={onSubmit} aria-describedby={`${uid}-status`}>
          <button className="booking__summary" type="button" onClick={() => setStep(1)}>
            <span>
              <strong>{pickup}</strong> → <strong>{drop}</strong>
              <small>
                {trip} · {date} · {time}
                {distance ? ` · ${distance} km` : ""}
              </small>
            </span>
            <span className="booking__edit">Edit</span>
          </button>

          <fieldset className="rides">
            <legend className="sr-only">Ride type</legend>
            {rideTypes.map((item) => {
              const estimate = distance ? estimateFare(item, distance) : null;
              return (
                <label key={item.id} className={`ride-option${ride === item.id ? " is-selected" : ""}`}>
                  <input type="radio" name="ride-choice" value={item.id} checked={ride === item.id} onChange={() => setRide(item.id)} className="sr-only" />
                  <span className={`ride-option__icon${item.green ? " is-green" : ""}`}>
                    <Icon name={item.id === "auto" ? "auto" : item.green ? "leaf" : "car"} />
                  </span>
                  <span className="ride-option__copy">
                    <strong>
                      {item.name} <small>· {item.seats} seats</small>
                    </strong>
                    <span>{item.blurb}</span>
                  </span>
                  <span className="ride-option__price">{estimate ? `${rupees(estimate.low)}–${rupees(estimate.high)}` : <>from {rupees(item.minimum)}</>}</span>
                </label>
              );
            })}
          </fieldset>

          <div className="booking__row booking__row--2">
            <div className="field-group">
              <label htmlFor={`${uid}-name`}>Your name</label>
              <input id={`${uid}-name`} className="field" name="name" required maxLength={200} autoComplete="name" />
            </div>
            <div className="field-group">
              <label htmlFor={`${uid}-phone`}>Mobile number</label>
              <input id={`${uid}-phone`} className="field" name="phone" type="tel" inputMode="tel" required maxLength={20} pattern="[+0-9][0-9 \-]{7,16}" autoComplete="tel" placeholder="+91" />
            </div>
          </div>
          <div className="hp" aria-hidden="true">
            <label htmlFor={`${uid}-website`}>Website</label>
            <input id={`${uid}-website`} name="website" tabIndex={-1} autoComplete="off" />
          </div>

          <p className="form-note">
            Fares are indicative; your final fare is confirmed before the trip. By requesting you agree to our <Link href="/terms">terms</Link> and <Link href="/privacy">privacy notice</Link>.
          </p>
          <div className="booking__actions">
            <button className="btn btn-ghost" type="button" onClick={() => setStep(1)}>
              Back
            </button>
            <button className="btn btn-primary btn-lg" type="submit" disabled={status.kind === "sending"}>
              {status.kind === "sending" ? "Requesting…" : `Request ${rideTypes.find((item) => item.id === ride)?.name}`}
            </button>
          </div>
          <div id={`${uid}-status`} className={`form-status form-status--${status.kind}`} role="status" aria-live="polite">
            {status.kind === "mailto" && "We’ve opened your email app with the ride details filled in. Press send and our dispatch desk will confirm."}
            {status.kind === "error" && status.message}
          </div>
        </form>
      )}
    </div>
  );
}
