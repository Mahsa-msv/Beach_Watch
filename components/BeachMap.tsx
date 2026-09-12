"use client";

import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup,
  useMap,
} from "react-leaflet";
import type { CircleMarker as LeafletCircleMarker } from "leaflet";
import type { Beach, BeachStatus } from "@/lib/types";
import BeachPopup from "./BeachPopup";

interface Props {
  beaches: Beach[];
  selectedId: string | null;
  onSelect: (beach: Beach) => void;
}

// Concrete hex fallbacks so the SVG dots always paint, even before CSS vars
// are computed. Kept in sync with the tokens in app/globals.css.
const STATUS_HEX: Record<BeachStatus, string> = {
  open: "#2fae66",
  closed: "#e0483d",
  risk: "#f0932b",
  offseason: "#78909c",
  unknown: "#78909c",
};

// HRM roughly centered; zoom shows the metro lakes with the Eastern Shore edge.
const HRM_CENTER: [number, number] = [44.7, -63.58];

export default function BeachMap({ beaches, selectedId, onSelect }: Props) {
  const markerRefs = useRef<Record<string, LeafletCircleMarker | null>>({});

  return (
    <MapContainer
      center={HRM_CENTER}
      zoom={10}
      scrollWheelZoom={false}
      className="h-full w-full"
      style={{ borderRadius: "var(--radius-card)" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {beaches.map((beach) => {
        const hex = STATUS_HEX[beach.status];
        return (
          <CircleMarker
            key={beach.id}
            center={[beach.lat, beach.lng]}
            radius={10}
            ref={(el) => {
              markerRefs.current[beach.id] = el;
            }}
            pathOptions={{
              color: "#ffffff",
              weight: 2,
              fillColor: hex,
              fillOpacity: 1,
            }}
            eventHandlers={{
              click: () => onSelect(beach),
              mouseover: (e) => e.target.openPopup(),
            }}
          >
            <Popup>
              <BeachPopup beach={beach} />
            </Popup>
          </CircleMarker>
        );
      })}

      <SelectionController
        beaches={beaches}
        selectedId={selectedId}
        markerRefs={markerRefs}
      />
    </MapContainer>
  );
}

/** Pans to and opens the popup of the selected beach. */
function SelectionController({
  beaches,
  selectedId,
  markerRefs,
}: {
  beaches: Beach[];
  selectedId: string | null;
  markerRefs: React.MutableRefObject<Record<string, LeafletCircleMarker | null>>;
}) {
  const map = useMap();
  const beachById = useMemo(
    () => Object.fromEntries(beaches.map((b) => [b.id, b])),
    [beaches]
  );

  useEffect(() => {
    if (!selectedId) return;
    const beach = beachById[selectedId];
    if (!beach) return;
    map.flyTo([beach.lat, beach.lng], Math.max(map.getZoom(), 12), {
      duration: 0.6,
    });
    const marker = markerRefs.current[selectedId];
    // Open once the fly animation settles.
    const t = setTimeout(() => marker?.openPopup(), 650);
    return () => clearTimeout(t);
  }, [selectedId, beachById, map, markerRefs]);

  return null;
}
