"use client";

import { useState } from "react";
import { estimateFare, rideTypes } from "@/lib/site";
import { Icon } from "./Icon";

const rupees = (value: number) => `₹${value.toLocaleString("en-IN")}`;

/** Slider-driven indicative fare comparison across ride types. */
export function FareEstimator() {
  const [km, setKm] = useState(10);
  return (
    <div className="estimator">
      <div className="estimator__control">
        <label htmlFor="fare-km">
          Trip distance <strong>{km} km</strong>
        </label>
        <input id="fare-km" type="range" min={2} max={60} step={1} value={km} onChange={(event) => setKm(Number(event.target.value))} style={{ ["--fill" as string]: `${((km - 2) / 58) * 100}%` }} />
        <div className="estimator__scale" aria-hidden="true">
          <span>2 km</span>
          <span>60 km</span>
        </div>
      </div>
      <ul className="estimator__list">
        {rideTypes.map((ride) => {
          const fare = estimateFare(ride, km);
          return (
            <li key={ride.id}>
              <span className={`ride-option__icon${ride.green ? " is-green" : ""}`}>
                <Icon name={ride.id === "auto" ? "auto" : ride.green ? "leaf" : "car"} />
              </span>
              <span className="estimator__name">
                <strong>{ride.name}</strong>
                <small>
                  ₹{ride.perKm}/km · ~{fare.minutes} min
                </small>
              </span>
              <span className="estimator__fare">
                {rupees(fare.low)}–{rupees(fare.high)}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="estimator__note">Indicative city fares including the base fare and ride time at average traffic. Tolls, parking, night charges and state taxes are extra where they apply. Your fare is always confirmed before the trip starts.</p>
    </div>
  );
}
