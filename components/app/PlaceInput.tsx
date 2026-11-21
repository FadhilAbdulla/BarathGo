"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Place } from "@/lib/api";
import { searchPlaces } from "@/lib/places";
import { Icon } from "../Icon";

/** Uber-style location field with debounced place search, keyboard navigation and optional "current location". */
export function PlaceInput({
  kind,
  value,
  onChange,
  placeholder,
  near,
  onCurrentLocation,
  autoFocus,
}: {
  kind: "pickup" | "drop";
  value: Place | null;
  onChange: (place: Place | null) => void;
  placeholder: string;
  near?: { lat: number; lng: number } | null;
  onCurrentLocation?: () => void;
  autoFocus?: boolean;
}) {
  const id = useId();
  const [text, setText] = useState(value?.label ?? "");
  const [results, setResults] = useState<Place[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(false);
  const typed = useRef(false);

  useEffect(() => {
    if (!typed.current) setText(value?.label ?? "");
  }, [value]);

  useEffect(() => {
    if (!typed.current) return;
    const query = text.trim();
    if (query.length < 2) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        setResults(await searchPlaces(query, near ?? undefined, controller.signal));
        setActive(0);
      } catch {
        /* aborted */
      } finally {
        setLoading(false);
      }
    }, 280);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [text, near]);

  function choose(place: Place) {
    typed.current = false;
    setText(place.label);
    setOpen(false);
    setResults([]);
    onChange(place);
  }

  const showCurrent = kind === "pickup" && onCurrentLocation;
  const listOpen = open && (results.length > 0 || (showCurrent && text.trim().length < 2));

  return (
    <div className={`place place--${kind}`}>
      <span className={`place__mark place__mark--${kind}`} aria-hidden="true" />
      <input
        id={id}
        className="place__input"
        value={text}
        placeholder={placeholder}
        autoComplete="off"
        autoFocus={autoFocus}
        role="combobox"
        aria-expanded={!!listOpen}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-label={placeholder}
        onFocus={(event) => {
          setOpen(true);
          event.target.select();
        }}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onChange={(event) => {
          typed.current = true;
          setText(event.target.value);
          setOpen(true);
          if (!event.target.value) onChange(null);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown") {
            event.preventDefault();
            setActive((index) => Math.min(index + 1, results.length - 1));
          } else if (event.key === "ArrowUp") {
            event.preventDefault();
            setActive((index) => Math.max(index - 1, 0));
          } else if (event.key === "Enter" && results[active]) {
            event.preventDefault();
            choose(results[active]);
          } else if (event.key === "Escape") {
            setOpen(false);
          }
        }}
      />
      {text && (
        <button
          type="button"
          className="place__clear"
          aria-label={`Clear ${kind}`}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => {
            typed.current = true;
            setText("");
            setResults([]);
            onChange(null);
          }}
        >
          <Icon name="close" size={16} />
        </button>
      )}
      {loading && <span className="place__spinner" aria-hidden="true" />}
      {listOpen && (
        <ul id={`${id}-list`} className="place__list" role="listbox">
          {showCurrent && text.trim().length < 2 && (
            <li role="option" aria-selected={false}>
              <button type="button" onMouseDown={(event) => event.preventDefault()} onClick={() => { setOpen(false); onCurrentLocation?.(); }}>
                <span className="place__icon place__icon--accent">
                  <Icon name="locate" size={18} />
                </span>
                <span>
                  <strong>Use current location</strong>
                </span>
              </button>
            </li>
          )}
          {results.map((place, index) => (
            <li key={`${place.lat},${place.lng},${index}`} role="option" aria-selected={index === active}>
              <button type="button" className={index === active ? "is-active" : ""} onMouseDown={(event) => event.preventDefault()} onClick={() => choose(place)}>
                <span className="place__icon">
                  <Icon name="pin" size={18} />
                </span>
                <span>
                  <strong>{place.label}</strong>
                  {place.detail && <small>{place.detail}</small>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
