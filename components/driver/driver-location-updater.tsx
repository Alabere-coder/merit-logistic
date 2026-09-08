"use client";

import { useEffect, useRef, useState } from "react";

import { MapPin, Navigation, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateDriverLocation } from "@/lib/actions/tracking";

export function DriverLocationUpdater() {
  const [enabled, setEnabled] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const watchIdRef = useRef<number | null>(null);

  const lastSentRef = useRef<{
    lat: number;
    lng: number;
    timestamp: number;
  } | null>(null);

  /*
   * Prevent multiple server actions from running at
   * the same time when watchPosition fires rapidly.
   */
  const isSendingRef = useRef(false);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, []);

  function stopTracking() {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    isSendingRef.current = false;
    setUpdating(false);
    setEnabled(false);
  }

  async function sendLocation(position: GeolocationPosition) {
    /*
     * Ignore GPS callbacks while another location
     * update is already being sent.
     */
    if (isSendingRef.current) {
      return;
    }

    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    const previous = lastSentRef.current;
    const now = Date.now();

    if (previous) {
      const elapsed = now - previous.timestamp;

      const distance = getDistanceInMeters(
        previous.lat,
        previous.lng,
        lat,
        lng,
      );

      /*
       * Send only when:
       *
       * - at least 30 seconds have passed
       *   OR
       *
       * - the driver moved at least 20 meters.
       */
      if (elapsed < 30_000 && distance < 20) {
        return;
      }
    }

    /*
     * Lock immediately BEFORE calling the server action.
     *
     * This is important because watchPosition can fire
     * again while updateDriverLocation() is still waiting.
     */
    isSendingRef.current = true;
    setUpdating(true);

    /*
     * Reserve this location immediately so another
     * callback cannot treat the previous location as
     * still being the latest sent location.
     */
    lastSentRef.current = {
      lat,
      lng,
      timestamp: now,
    };

    try {
      const result = await updateDriverLocation({
        lat,
        lng,
      });

      if (result.error) {
        console.error("DRIVER LOCATION UPDATE ERROR:", result.error);

        /*
         * If the server update failed, allow the next
         * GPS callback to retry.
         */
        lastSentRef.current = previous;

        toast.error(result.error);
        return;
      }

      setLastUpdated(new Date());
    } catch (error) {
      console.error("DRIVER LOCATION UPDATE ERROR:", error);

      /*
       * Restore the previous successful location so
       * the failed update does not become the baseline.
       */
      lastSentRef.current = previous;
    } finally {
      isSendingRef.current = false;
      setUpdating(false);
    }
  }

  function startTracking() {
    if (!navigator.geolocation) {
      toast.error("Location services are not supported by this browser.");
      return;
    }

    if (watchIdRef.current !== null) {
      return;
    }

    setEnabled(true);

    watchIdRef.current = navigator.geolocation.watchPosition(
      sendLocation,
      (error) => {
        console.error("DRIVER GEOLOCATION ERROR:", error);

        if (error.code === 1) {
          toast.error("Location permission was denied.");
        } else if (error.code === 2) {
          toast.error("Your current location could not be determined.");
        } else if (error.code === 3) {
          toast.error("Location request timed out.");
        }

        stopTracking();
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15_000,
        timeout: 20_000,
      },
    );

    toast.success("Live location sharing enabled.");
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
              enabled ? "bg-emerald-50" : "bg-slate-100"
            }`}
          >
            <MapPin
              className={`h-5 w-5 ${
                enabled ? "text-emerald-600" : "text-slate-500"
              }`}
            />
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Driver Location
            </h2>

            <p className="mt-1 text-xs leading-5 text-slate-500">
              {enabled
                ? "Your current location is being shared for active delivery tracking."
                : "Share your current location so administrators can monitor active deliveries."}
            </p>

            {lastUpdated && (
              <p className="mt-1 text-xs text-slate-400">
                Last sent:{" "}
                {lastUpdated.toLocaleTimeString("en-NG", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>

        {enabled ? (
          <button
            type="button"
            onClick={stopTracking}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-rose-200 bg-white px-4 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          >
            <Navigation className="h-4 w-4" />
            Stop Sharing
          </button>
        ) : (
          <button
            type="button"
            onClick={startTracking}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Navigation className="h-4 w-4" />
            Share Location
          </button>
        )}
      </div>

      {updating && (
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Updating location...
        </div>
      )}
    </div>
  );
}

/* =========================================================
   DISTANCE
========================================================= */

function getDistanceInMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
) {
  const earthRadius = 6_371_000;

  const toRadians = (value: number) => (value * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return earthRadius * c;
}
