"use client";

import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
} from "react-leaflet";

import type { LatLngExpression } from "leaflet";

import { formatLocalizedDateTime } from "@/lib/localization/format-localized";
import type { LocalizationSettings } from "@/lib/localization/get-localization-settings";

type TrackingMapEvent = {
  status: string;
  created_at: string;
  note?: string | null;
  lat?: number | null;
  lng?: number | null;
};

type TrackingMapLocation = {
  lat: number;
  lng: number;
};

type TrackingMapProps = {
  currentLocation?: TrackingMapLocation | null;
  events?: TrackingMapEvent[];
  settings: LocalizationSettings;
  height?: string;
};

export function TrackingMapInner({
  currentLocation,
  events = [],
  settings,
  height = "420px",
}: TrackingMapProps) {
  /* -------------------------------------------------------
     Historical event locations
  ------------------------------------------------------- */

  const eventLocations = events.filter(
    (event) => typeof event.lat === "number" && typeof event.lng === "number",
  );

  /* -------------------------------------------------------
     Build route points from event history
  ------------------------------------------------------- */

  const routePoints: LatLngExpression[] = eventLocations.map((event) => [
    event.lat as number,
    event.lng as number,
  ]);

  /* -------------------------------------------------------
     Include current driver location
  ------------------------------------------------------- */

  if (currentLocation) {
    routePoints.push([currentLocation.lat, currentLocation.lng]);
  }

  /* -------------------------------------------------------
     Nothing to display
  ------------------------------------------------------- */

  if (routePoints.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500"
        style={{ height }}
      >
        <div className="text-center">
          <p className="font-medium text-slate-700">Location unavailable</p>

          <p className="mt-1 text-xs text-slate-500">
            No GPS location has been recorded for this shipment yet.
          </p>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------
     Map center

     Prefer current driver location, otherwise the most
     recent shipment event.
  ------------------------------------------------------- */

  const center: LatLngExpression = currentLocation
    ? [currentLocation.lat, currentLocation.lng]
    : routePoints[routePoints.length - 1];

  return (
    <div
      className="overflow-hidden rounded-xl border border-slate-200"
      style={{ height }}
    >
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={true}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Historical route */}
        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            pathOptions={{
              weight: 4,
              opacity: 0.7,
            }}
          />
        )}

        {/* Historical event markers */}
        {eventLocations.map((event, index) => (
          <CircleMarker
            key={`${event.created_at}-${index}`}
            center={[event.lat as number, event.lng as number]}
            radius={6}
            pathOptions={{
              weight: 2,
              opacity: 1,
              fillOpacity: 0.85,
            }}
          >
            <Popup>
              <div className="min-w-45 space-y-1">
                <p className="font-semibold capitalize">
                  {event.status.replaceAll("_", " ")}
                </p>

                <p className="text-xs text-slate-500">
                  {formatLocalizedDateTime(event.created_at, settings)}
                </p>

                {event.note && (
                  <p className="text-xs text-slate-700">{event.note}</p>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {/* Current driver location */}
        {currentLocation && (
          <CircleMarker
            center={[currentLocation.lat, currentLocation.lng]}
            radius={10}
            pathOptions={{
              weight: 3,
              opacity: 1,
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold">Current driver location</p>

                <p className="text-xs text-slate-500">Live GPS position</p>
              </div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>
    </div>
  );
}
