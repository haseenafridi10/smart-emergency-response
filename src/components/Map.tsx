// src/components/Map.tsx
"use client";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { RequestData } from "@/types";
import { useState, useMemo } from "react";

// ✅ Fixed: Use mutable array type
const libraries: ("places")[] = ["places"];

interface MapProps {
  requests: RequestData[];
  userLocation?: { lat: number; lng: number } | null;
  showUserMarker?: boolean;
}

export default function Map({ requests, userLocation, showUserMarker = true }: MapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries,
  });

  // State to control which InfoWindow is open
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showUserPopup, setShowUserPopup] = useState(false);

  const mapCenter = useMemo(() => {
    return userLocation || { lat: 37.7749, lng: -122.4194 };
  }, [userLocation]);

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-red-50">
        <div className="text-center">
          <p className="text-red-600 font-bold">Error loading maps</p>
          <p className="text-sm text-gray-600">Please check your API key</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-100">
        <p className="text-gray-600">Loading maps...</p>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={mapCenter}
      zoom={13}
    >
      {/* User location marker with controlled InfoWindow */}
      {showUserMarker && userLocation && (
        <Marker
          position={userLocation}
          icon="http://maps.google.com/mapfiles/ms/icons/blue-dot.png"
          onClick={() => setShowUserPopup(!showUserPopup)}
        >
          {showUserPopup && (
            <InfoWindow
              position={userLocation}
              onCloseClick={() => setShowUserPopup(false)}
            >
              <div className="font-bold text-blue-600 whitespace-nowrap">📍 You are here</div>
            </InfoWindow>
          )}
        </Marker>
      )}

      {/* Request markers with controlled InfoWindows */}
      {requests.map((req) => (
        <Marker
          key={req.id}
          position={req.location}
          icon={
            req.priority === 'High'
              ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
              : req.priority === 'Medium'
              ? "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
              : "http://maps.google.com/mapfiles/ms/icons/green-dot.png"
          }
          onClick={() => setSelectedRequest(selectedRequest === req.id ? null : req.id)}
        >
          {selectedRequest === req.id && (
            <InfoWindow
              position={req.location}
              onCloseClick={() => setSelectedRequest(null)}
            >
              <div className="text-sm min-w-55 max-w-xs">
                <p className="font-bold text-lg mb-1">{req.category}</p>
                <p className={`font-semibold mb-2 ${
                  req.priority === 'High' ? 'text-red-600' : 
                  req.priority === 'Medium' ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  Priority: {req.priority}
                </p>
                <p className="text-gray-700 mb-2">{req.description}</p>
                <p className="text-xs text-gray-500 mb-1">
                  Status: <span className="font-medium">{req.status}</span>
                </p>
                {req.distance && (
                  <p className="text-xs text-blue-600 font-medium">
                    🚶 {req.distance.toFixed(2)} km away
                  </p>
                )}
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  );
}