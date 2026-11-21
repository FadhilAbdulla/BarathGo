"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Place } from "@/lib/api";
import { currentPosition, reversePlace } from "@/lib/places";
import { PlaceInput } from "./app/PlaceInput";

const TRIP_DRAFT_KEY = "bg_trip_draft";

/** Homepage pickup/drop search. Hands the trip to the rider app, which shows prices. */
export function HeroSearch() {
  const router = useRouter();
  const [pickup, setPickup] = useState<Place | null>(null);
  const [drop, setDrop] = useState<Place | null>(null);
  const [locating, setLocating] = useState(false);

  async function locate() {
    setLocating(true);
    try {
      const position = await currentPosition();
      setPickup(await reversePlace(position.lat, position.lng));
    } catch {
      /* the field stays empty; the user can type instead */
    } finally {
      setLocating(false);
    }
  }

  function seePrices() {
    try {
      sessionStorage.setItem(TRIP_DRAFT_KEY, JSON.stringify({ pickup, drop }));
    } catch {
      /* storage unavailable: the rider app starts empty */
    }
    router.push("/ride");
  }

  return (
    <div className="hero-search">
      <div className="places">
        <span className="places__line" aria-hidden="true" />
        <PlaceInput kind="pickup" value={pickup} onChange={setPickup} placeholder={locating ? "Finding your location…" : "Enter location"} near={drop} onCurrentLocation={locate} />
        <PlaceInput kind="drop" value={drop} onChange={setDrop} placeholder="Enter destination" near={pickup} />
      </div>
      <div className="hero-search__actions">
        <button className="btn btn-black btn-lg" onClick={seePrices}>
          See prices
        </button>
        <a className="hero-search__login" href="/ride">
          Log in to see your recent activity
        </a>
      </div>
    </div>
  );
}
