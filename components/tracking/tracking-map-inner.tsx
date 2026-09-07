"use client";

import { useEffect, useMemo, useState } from "react";

import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import type { LatLngExpression } from "leaflet";

import { createClient } from "@/lib/supabase/client";

import { formatLocalizedDateTime } from "@/lib/localization/format-localized";
import type { LocalizationSettings } from "@/lib/localization/get-localization-settings";

/* =========================================================
   TYPES
========================================================= */

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
  driverId?: string | null;
  currentLocation?: TrackingMapLocation | null;
  events?: TrackingMapEvent[];
  settings: LocalizationSettings;
  height?: string;
};

/* =========================================================
   LIVE MAP CONTROLLER
   Updates the map position when the driver moves.
========================================================= */

// function LiveMapController({
//   location,
// }: {
//   location: TrackingMapLocation | null;
// }) {
//   const map = useMap();

//   useEffect(() => {
//     if (!location) {
//       return;
//     }

//     map.panTo([location.lat, location.lng], {
//       animate: true,
//       duration: 0.8,
//     });
//   }, [location, map]);

//   return null;
// }

/* =========================================================
   TRACKING MAP
========================================================= */

export function TrackingMapInner({
  driverId,
  currentLocation,
  events = [],
  settings,
  height = "420px",
}: TrackingMapProps) {
  const supabase = useMemo(() => createClient(), []);

  /* -------------------------------------------------------
     Live driver location

     Start with the location supplied by the server.
     Supabase Realtime will replace this whenever the
     driver's current_lat/current_lng changes.
  ------------------------------------------------------- */

  const [liveLocation, setLiveLocation] = useState<TrackingMapLocation | null>(
    currentLocation ?? null,
  );

  /* -------------------------------------------------------
     Keep local live location synchronized with a new
     server-rendered currentLocation.
  ------------------------------------------------------- */

  useEffect(() => {
    setLiveLocation(currentLocation ?? null);
  }, [currentLocation?.lat, currentLocation?.lng]);

  /* -------------------------------------------------------
     Subscribe to this driver's location updates

     We subscribe to ONLY the driver's row identified by
     driverId.

     Expected drivers columns:
       current_lat
       current_lng
       last_location_update
  ------------------------------------------------------- */

  useEffect(() => {
    if (!driverId) {
      return;
    }

    const channel = supabase
      .channel(`driver-location:${driverId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "drivers",
          filter: `id=eq.${driverId}`,
        },
        (payload) => {
          const row = payload.new as {
            current_lat?: number | null;
            current_lng?: number | null;
            last_location_update?: string | null;
          };

          if (
            typeof row.current_lat !== "number" ||
            typeof row.current_lng !== "number"
          ) {
            return;
          }

          setLiveLocation({
            lat: row.current_lat,
            lng: row.current_lng,
          });
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR") {
          console.error("DRIVER LOCATION REALTIME ERROR");
        }

        if (status === "TIMED_OUT") {
          console.error("DRIVER LOCATION REALTIME TIMED OUT");
        }
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [driverId, supabase]);

  /* =======================================================
     HISTORICAL EVENT LOCATIONS

     These are shipment events only.

     IMPORTANT:
     We intentionally DO NOT append liveLocation here.
     The historical route should represent recorded shipment
     events, not every live GPS update.
  ======================================================= */

  const eventLocations = events.filter(
    (event) => typeof event.lat === "number" && typeof event.lng === "number",
  );

  const routePoints: LatLngExpression[] = eventLocations.map((event) => [
    event.lat as number,
    event.lng as number,
  ]);

  /* =======================================================
     MAP CENTER

     Prefer the driver's live position.

     Otherwise use the most recent historical event.
  ======================================================= */

  const center: LatLngExpression | null = liveLocation
    ? [liveLocation.lat, liveLocation.lng]
    : routePoints.length > 0
      ? routePoints[routePoints.length - 1]
      : null;

  /* =======================================================
     NOTHING TO DISPLAY
  ======================================================= */

  if (!center) {
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

  /* =======================================================
     RENDER
  ======================================================= */

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

        {/* -------------------------------------------------
            Follow live driver location
        ------------------------------------------------- */}
        {/* <LiveMapController location={liveLocation} /> */}

        {/* -------------------------------------------------
            Historical shipment route

            Only shipment events are used here.
        ------------------------------------------------- */}
        {routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            pathOptions={{
              weight: 4,
              opacity: 0.7,
            }}
          />
        )}

        {/* -------------------------------------------------
            Historical event markers
        ------------------------------------------------- */}
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

        {/* -------------------------------------------------
            LIVE DRIVER LOCATION

            This marker moves whenever Supabase Realtime
            receives a new current_lat/current_lng.
        ------------------------------------------------- */}
        {liveLocation && (
          <CircleMarker
            center={[liveLocation.lat, liveLocation.lng]}
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

// "use client";

// import {
//   CircleMarker,
//   MapContainer,
//   Polyline,
//   Popup,
//   TileLayer,
// } from "react-leaflet";

// import type { LatLngExpression } from "leaflet";

// import { formatLocalizedDateTime } from "@/lib/localization/format-localized";
// import type { LocalizationSettings } from "@/lib/localization/get-localization-settings";

// type TrackingMapEvent = {
//   status: string;
//   created_at: string;
//   note?: string | null;
//   lat?: number | null;
//   lng?: number | null;
// };

// type TrackingMapLocation = {
//   lat: number;
//   lng: number;
// };

// // type TrackingMapProps = {
// //   currentLocation?: TrackingMapLocation | null;
// //   events?: TrackingMapEvent[];
// //   settings: LocalizationSettings;
// //   height?: string;
// // };
// type TrackingMapProps = {
//   driverId?: string | null;
//   currentLocation?: TrackingMapLocation | null;
//   events?: TrackingMapEvent[];
//   settings: LocalizationSettings;
//   height?: string;
// };

// export function TrackingMapInner({
//   currentLocation,
//   events = [],
//   settings,
//   height = "420px",
// }: TrackingMapProps) {
//   /* -------------------------------------------------------
//      Historical event locations
//   ------------------------------------------------------- */

//   const eventLocations = events.filter(
//     (event) => typeof event.lat === "number" && typeof event.lng === "number",
//   );

//   /* -------------------------------------------------------
//      Build route points from event history
//   ------------------------------------------------------- */

//   const routePoints: LatLngExpression[] = eventLocations.map((event) => [
//     event.lat as number,
//     event.lng as number,
//   ]);

//   /* -------------------------------------------------------
//      Include current driver location
//   ------------------------------------------------------- */

//   if (currentLocation) {
//     routePoints.push([currentLocation.lat, currentLocation.lng]);
//   }

//   /* -------------------------------------------------------
//      Nothing to display
//   ------------------------------------------------------- */

//   if (routePoints.length === 0) {
//     return (
//       <div
//         className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-500"
//         style={{ height }}
//       >
//         <div className="text-center">
//           <p className="font-medium text-slate-700">Location unavailable</p>

//           <p className="mt-1 text-xs text-slate-500">
//             No GPS location has been recorded for this shipment yet.
//           </p>
//         </div>
//       </div>
//     );
//   }

//   /* -------------------------------------------------------
//      Map center

//      Prefer current driver location, otherwise the most
//      recent shipment event.
//   ------------------------------------------------------- */

//   const center: LatLngExpression = currentLocation
//     ? [currentLocation.lat, currentLocation.lng]
//     : routePoints[routePoints.length - 1];

//   return (
//     <div
//       className="overflow-hidden rounded-xl border border-slate-200"
//       style={{ height }}
//     >
//       <MapContainer
//         center={center}
//         zoom={14}
//         scrollWheelZoom={true}
//         className="h-full w-full"
//       >
//         <TileLayer
//           attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
//           url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//         />

//         {/* Historical route */}
//         {routePoints.length > 1 && (
//           <Polyline
//             positions={routePoints}
//             pathOptions={{
//               weight: 4,
//               opacity: 0.7,
//             }}
//           />
//         )}

//         {/* Historical event markers */}
//         {eventLocations.map((event, index) => (
//           <CircleMarker
//             key={`${event.created_at}-${index}`}
//             center={[event.lat as number, event.lng as number]}
//             radius={6}
//             pathOptions={{
//               weight: 2,
//               opacity: 1,
//               fillOpacity: 0.85,
//             }}
//           >
//             <Popup>
//               <div className="min-w-45 space-y-1">
//                 <p className="font-semibold capitalize">
//                   {event.status.replaceAll("_", " ")}
//                 </p>

//                 <p className="text-xs text-slate-500">
//                   {formatLocalizedDateTime(event.created_at, settings)}
//                 </p>

//                 {event.note && (
//                   <p className="text-xs text-slate-700">{event.note}</p>
//                 )}
//               </div>
//             </Popup>
//           </CircleMarker>
//         ))}

//         {/* Current driver location */}
//         {currentLocation && (
//           <CircleMarker
//             center={[currentLocation.lat, currentLocation.lng]}
//             radius={10}
//             pathOptions={{
//               weight: 3,
//               opacity: 1,
//               fillOpacity: 0.9,
//             }}
//           >
//             <Popup>
//               <div className="space-y-1">
//                 <p className="font-semibold">Current driver location</p>

//                 <p className="text-xs text-slate-500">Live GPS position</p>
//               </div>
//             </Popup>
//           </CircleMarker>
//         )}
//       </MapContainer>
//     </div>
//   );
// }
