// src/components/Map.tsx
// src/components/Map.tsx
"use client";
import { GoogleMap, useLoadScript, Marker, InfoWindow } from "@react-google-maps/api";
import { RequestData } from "@/types";
import { useState, useMemo } from "react";
import { motion } from "framer-motion";

const libraries: ("places")[] = ["places"];

interface MapProps {
  requests: RequestData[];
  userLocation?: { lat: number; lng: number } | null;
  showUserMarker?: boolean;
}

export default function Map({ requests, userLocation, showUserMarker = true }: MapProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "",
    libraries: libraries,
  });

  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [showUserPopup, setShowUserPopup] = useState(false);

  const mapCenter = useMemo(() => {
    return userLocation || { lat: 37.7749, lng: -122.4194 };
  }, [userLocation]);

  const getMarkerIcon = (priority: string, isUser = false) => {
    if (isUser) {
      return "http://maps.google.com/mapfiles/ms/icons/blue-dot.png";
    }
    return priority === 'High'
      ? "http://maps.google.com/mapfiles/ms/icons/red-dot.png"
      : priority === 'Medium'
      ? "http://maps.google.com/mapfiles/ms/icons/yellow-dot.png"
      : "http://maps.google.com/mapfiles/ms/icons/green-dot.png";
  };

  if (loadError) {
    return (
      <div className="flex items-center justify-center h-full bg-linear-to-br from-red-50 to-red-100">
        <div className="text-center p-8">
          <div className="w-16 h-16 bg-red-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-red-700 font-bold text-lg">Map Loading Error</p>
          <p className="text-red-600 text-sm mt-2">Please check your API key</p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-full bg-linear-to-br from-gray-100 to-gray-200">
        <div className="text-center">
          <div className="spinner w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading Interactive Map...</p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      center={mapCenter}
      zoom={13}
      options={{
        disableDefaultUI: false,
        clickableIcons: true,
        styles: [
          { featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }
        ]
      }}
    >
      {showUserMarker && userLocation && (
        <Marker
          position={userLocation}
          icon={getMarkerIcon('', true)}
          onClick={() => setShowUserPopup(!showUserPopup)}
        >
          {showUserPopup && (
            <InfoWindow
              position={userLocation}
              onCloseClick={() => setShowUserPopup(false)}
            >
              <div className="font-bold text-blue-600 whitespace-nowrap">📍 Your Location</div>
            </InfoWindow>
          )}
        </Marker>
      )}

      {requests.map((req) => (
        <Marker
          key={req.id}
          position={req.location}
          icon={getMarkerIcon(req.priority)}
          onClick={() => setSelectedRequest(selectedRequest === req.id ? null : req.id)}
          animation={req.priority === 'High' ? google.maps.Animation.BOUNCE : undefined}
        >
          {selectedRequest === req.id && (
            <InfoWindow
              position={req.location}
              onCloseClick={() => setSelectedRequest(null)}
            >
              <div className="text-sm min-w-60 max-w-xs">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
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
                </motion.div>
              </div>
            </InfoWindow>
          )}
        </Marker>
      ))}
    </GoogleMap>
  );
}