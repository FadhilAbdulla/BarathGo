"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import type { GeoJSONSource, Map as MlMap, Marker } from "maplibre-gl";
import { useEffect, useRef } from "react";
import { DEFAULT_CENTER } from "@/lib/places";

export type MapMarker = { id: string; lat: number; lng: number; kind: "pickup" | "drop" | "car" | "me"; label?: string };
type LatLng = { lat: number; lng: number };
type Padding = { top: number; right: number; bottom: number; left: number };

// OpenFreeMap: free OpenStreetMap vector tiles, no API key, commercial use allowed (https://openfreemap.org).
const STYLE_URL = "https://tiles.openfreemap.org/styles/positron";

const CAR_SVG = `<svg viewBox="0 0 24 40" width="22" height="36"><rect x="2" y="1" width="20" height="38" rx="7" fill="#111"/><rect x="5" y="8" width="14" height="8" rx="2" fill="#9fc3ef"/><rect x="5" y="27" width="14" height="6" rx="2" fill="#9fc3ef"/><rect x="2" y="1" width="20" height="38" rx="7" fill="none" stroke="#fff" stroke-width="1.5"/></svg>`;

function markerHtml(marker: MapMarker) {
  const label = marker.label ? `<span class="pin-label">${marker.label.replace(/[<>&"]/g, "")}</span>` : "";
  if (marker.kind === "car") return `<span class="pin-car">${CAR_SVG}</span>`;
  if (marker.kind === "me") return `<span class="pin-me"></span>`;
  return `<span class="pin pin--${marker.kind}"></span>${label}`;
}

/**
 * Vector map (MapLibre GL + OpenFreeMap). `fitKey` changes trigger a re-fit to `fit`;
 * polling updates move markers without re-fitting.
 */
export function MapView({
  markers = [],
  route,
  fit,
  fitKey,
  padding = { top: 40, right: 40, bottom: 40, left: 40 },
  center,
  zoom = 13,
  onMove,
  interactive = true,
  className,
}: {
  markers?: MapMarker[];
  route?: [number, number][] | null;
  fit?: LatLng[];
  fitKey?: string;
  padding?: Padding;
  center?: LatLng | null;
  zoom?: number;
  onMove?: (center: LatLng) => void;
  interactive?: boolean;
  className?: string;
}) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const lib = useRef<typeof import("maplibre-gl") | null>(null);
  const ready = useRef(false);
  const placed = useRef(new Map<string, { marker: Marker; html: string }>());
  const lastFit = useRef<string | undefined>(undefined);
  const onMoveRef = useRef(onMove);
  onMoveRef.current = onMove;
  const props = useRef({ markers, route, fit, fitKey, padding });
  props.current = { markers, route, fit, fitKey, padding };

  function sync() {
    const ml = lib.current;
    const instance = map.current;
    if (!ml || !instance || !ready.current) return;
    const { markers: list, route: line, fit: points, fitKey: key, padding: pad } = props.current;

    const seen = new Set<string>();
    for (const item of list) {
      seen.add(item.id);
      const html = markerHtml(item);
      const existing = placed.current.get(item.id);
      if (existing && existing.html === html) {
        existing.marker.setLngLat([item.lng, item.lat]);
        continue;
      }
      existing?.marker.remove();
      const node = document.createElement("div");
      node.className = "map-icon";
      node.innerHTML = html;
      const marker = new ml.Marker({ element: node, anchor: "center" }).setLngLat([item.lng, item.lat]).addTo(instance);
      placed.current.set(item.id, { marker, html });
    }
    for (const [id, entry] of placed.current) {
      if (!seen.has(id)) {
        entry.marker.remove();
        placed.current.delete(id);
      }
    }

    const source = instance.getSource("route") as GeoJSONSource | undefined;
    source?.setData({
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: line && line.length > 1 ? line.map(([lat, lng]) => [lng, lat]) : [] },
    });

    if (key !== lastFit.current) {
      lastFit.current = key;
      if (points && points.length > 1) {
        const bounds = new ml.LngLatBounds();
        points.forEach((point) => bounds.extend([point.lng, point.lat]));
        instance.fitBounds(bounds, { padding: pad, maxZoom: 16, duration: 700 });
      } else if (points?.length === 1) {
        instance.easeTo({ center: [points[0].lng, points[0].lat], zoom: Math.max(instance.getZoom(), 15), padding: pad, duration: 700 });
      }
    }
  }

  // Create the map once (MapLibre needs `window`, so it's imported in the effect).
  useEffect(() => {
    let cancelled = false;
    void import("maplibre-gl").then((ml) => {
      if (cancelled || !el.current || map.current) return;
      lib.current = ml;
      const start = DEFAULT_CENTER;
      let instance: MlMap;
      try {
        instance = new ml.Map({
        container: el.current,
        style: STYLE_URL,
        center: [start.lng, start.lat],
        zoom,
        interactive,
        attributionControl: { compact: true },
        dragRotate: false,
        pitchWithRotate: false,
        fadeDuration: 0,
        });
      } catch {
        // No WebGL (very old devices): the apps still work, just without the map.
        el.current.classList.add("map--off");
        el.current.textContent = "Map isn’t available on this device.";
        return;
      }
      instance.touchZoomRotate?.disableRotation();
      if (interactive) instance.addControl(new ml.NavigationControl({ showCompass: false }), "bottom-right");
      instance.on("load", () => {
        // English-only labels for a cleaner look.
        for (const layer of instance.getStyle().layers) {
          if (layer.type === "symbol" && instance.getLayoutProperty(layer.id, "text-field")) {
            instance.setLayoutProperty(layer.id, "text-field", ["coalesce", ["get", "name:latin"], ["get", "name_en"], ["get", "name"]]);
          }
        }
        instance.addSource("route", { type: "geojson", data: { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: [] } } });
        instance.addLayer({ id: "route-casing", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#ffffff", "line-width": 9 } });
        instance.addLayer({ id: "route-line", type: "line", source: "route", layout: { "line-cap": "round", "line-join": "round" }, paint: { "line-color": "#000000", "line-width": 5 } });
        ready.current = true;
        sync();
      });
      instance.on("moveend", () => {
        const c = instance.getCenter();
        onMoveRef.current?.({ lat: c.lat, lng: c.lng });
      });
      map.current = instance;
    });
    return () => {
      cancelled = true;
      ready.current = false;
      placed.current.forEach((entry) => entry.marker.remove());
      placed.current.clear();
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Markers / route update on every render; re-fit only when fitKey changes.
  useEffect(() => {
    sync();
  });

  // Re-centre only when the coordinates change (callers often pass a fresh object each render).
  useEffect(() => {
    if (center && map.current && ready.current) map.current.easeTo({ center: [center.lng, center.lat], zoom: Math.max(map.current.getZoom(), 15), duration: 600 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [center?.lat, center?.lng]);

  return <div ref={el} className={`map ${className ?? ""}`} />;
}
