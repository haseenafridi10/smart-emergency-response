// src/hooks/useGeolocation.ts
"use client";
import { useState, useEffect } from "react";

export interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(enableHighAccuracy = true, timeout = 10000) {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    accuracy: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({ 
        ...prev, 
        error: "Geolocation is not supported by your browser", 
        loading: false 
      }));
      return;
    }

    const onSuccess = (position: GeolocationPosition) => {
      setState({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        error: null,
        loading: false,
      });
    };

    const onError = (error: GeolocationPositionError) => {
      const messages: Record<number, string> = {
        1: "Location permission denied. Please enable location access in your browser settings.",
        2: "Location position unavailable. Check your GPS/connection.",
        3: "Location request timed out. Please try again.",
      };
      setState((prev) => ({
        ...prev,
        error: messages[error.code] || "Unknown location error occurred",
        loading: false,
      }));
    };

    const watcher = navigator.geolocation.watchPosition(
      onSuccess,
      onError,
      { enableHighAccuracy, timeout, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, [enableHighAccuracy, timeout]);

  const setLocation = (lat: number, lng: number) => {
    setState({
      latitude: lat,
      longitude: lng,
      accuracy: null,
      error: null,
      loading: false,
    });
  };

  return { ...state, setLocation };
}