// src/components/VolunteerDashboard.tsx
"use client";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RequestData, Priority } from "@/types";
import { useGeolocation } from "@/hooks/useGeolocation";

// Haversine Formula for distance calculation
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Earth's radius in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}
function deg2rad(deg: number) { return deg * (Math.PI/180); }

export default function VolunteerDashboard() {
  const [requests, setRequests] = useState<(RequestData & { distance?: number })[]>([]);
  const [filter, setFilter] = useState<Priority | 'All'>('All');
  const [manualLoc, setManualLoc] = useState<{ lat: string; lng: string }>({ lat: '', lng: '' });
  
  // Get real-time geolocation
  const { latitude, longitude, error: geoError, loading: geoLoading, setLocation } = useGeolocation();

  // Calculate distance for each request
  const requestsWithDistance = (latitude && longitude) 
    ? requests.map(req => ({
        ...req,
        distance: getDistanceFromLatLonInKm(
          latitude, longitude,
          req.location.lat, req.location.lng
        )
      }))
    : requests;

  // Sort by: Priority (High first) then Distance (nearest first)
  const sortedRequests = [...requestsWithDistance].sort((a, b) => {
    const priorityWeight = { 'High': 1, 'Medium': 2, 'Low': 3 };
    if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
      return priorityWeight[a.priority] - priorityWeight[b.priority];
    }
    return (a.distance || 0) - (b.distance || 0);
  });

  // Filter by urgency level
  const filteredRequests = filter === 'All' 
    ? sortedRequests 
    : sortedRequests.filter(r => r.priority === filter);

  // Listen to Firestore for real-time updates
  useEffect(() => {
    const q = query(collection(db, "requests"), where("status", "in", ["Pending", "In Progress"]));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RequestData));
      setRequests(data);
    }, (err) => {
      console.error("Firestore error:", err);
    });
    return () => unsubscribe();
  }, []);

  // Update request status
  const updateStatus = async (id: string, newStatus: 'In Progress' | 'Completed') => {
    try {
      await updateDoc(doc(db, "requests", id), { status: newStatus });
    } catch (error) {
      console.error("Failed to update status:", error);
      alert("Could not update request. Please try again.");
    }
  };

  // Handle manual location input (fallback)
  const handleManualLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const lat = parseFloat(manualLoc.lat);
    const lng = parseFloat(manualLoc.lng);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      setLocation(lat, lng);
    } else {
      alert("Please enter valid coordinates (-90 to 90 for lat, -180 to 180 for lng)");
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md h-full overflow-y-auto flex flex-col">
      {/* Header with filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
        <h2 className="text-xl font-bold">Volunteer Feed</h2>
        <div className="flex flex-wrap gap-2">
          {(['All', 'High', 'Medium', 'Low'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`text-xs px-3 py-1 rounded-full transition ${
                filter === lvl 
                  ? 'bg-blue-600 text-white font-medium' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Geolocation status messages */}
      {(geoLoading || geoError) && (
        <div className={`mb-4 p-3 rounded-lg text-sm ${
          geoError ? 'bg-red-50 text-red-700' : 'bg-blue-50 text-blue-700'
        }`}>
          {geoLoading ? '📍 Getting your location...' : `⚠️ ${geoError}`}
        </div>
      )}

      {/* Manual location fallback form */}
      {geoError && (
        <form onSubmit={handleManualLocation} className="mb-4 p-4 bg-gray-50 rounded-lg space-y-3">
          <p className="text-sm text-gray-600">Or enter your location manually:</p>
          <div className="flex gap-2">
            <input
              type="number"
              step="any"
              placeholder="Latitude"
              className="flex-1 p-2 border rounded text-sm"
              value={manualLoc.lat}
              onChange={(e) => setManualLoc({...manualLoc, lat: e.target.value})}
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude"
              className="flex-1 p-2 border rounded text-sm"
              value={manualLoc.lng}
              onChange={(e) => setManualLoc({...manualLoc, lng: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded text-sm hover:bg-blue-700">
            Set Location
          </button>
        </form>
      )}

      {/* Current location display */}
      {latitude && longitude && !geoError && (
        <div className="mb-4 p-3 bg-green-50 rounded-lg text-sm text-green-800">
          📍 Your location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
          {requests.length > 0 && (
            <span className="ml-2 text-gray-600">
              | Showing {filteredRequests.length} nearby request{filteredRequests.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Requests list */}
      <div className="space-y-3 flex-1 overflow-y-auto">
        {filteredRequests.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            {geoLoading ? '🔄 Loading requests...' : '✅ No requests match your filter'}
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div 
              key={req.id} 
              className="border-l-4 border-blue-500 p-4 rounded-r-lg bg-white shadow-sm hover:shadow-md transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="font-bold text-lg">{req.category}</span>
                  <span className={`ml-2 text-xs px-2 py-0.5 rounded-full font-medium ${
                    req.priority === 'High' ? 'bg-red-100 text-red-800' : 
                    req.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {req.priority}
                  </span>
                </div>
                {req.distance && (
                  <span className="text-sm font-medium text-blue-600">
                    {req.distance.toFixed(2)} km
                  </span>
                )}
              </div>
              
              <p className="text-gray-700 mb-3">{req.description}</p>
              
              <div className="flex justify-between items-center text-xs text-gray-500 mb-3">
                <span>🕐 {new Date(req.timestamp).toLocaleTimeString()}</span>
                <span className={`px-2 py-1 rounded ${
                  req.status === 'Pending' ? 'bg-gray-100' :
                  req.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {req.status}
                </span>
              </div>
              
              <div className="flex gap-2">
                {req.status === 'Pending' && (
                  <button 
                    onClick={() => updateStatus(req.id, 'In Progress')} 
                    className="flex-1 bg-blue-600 text-white py-2 rounded text-sm font-medium hover:bg-blue-700 transition"
                  >
                    ✓ Accept Request
                  </button>
                )}
                {req.status === 'In Progress' && (
                  <button 
                    onClick={() => updateStatus(req.id, 'Completed')} 
                    className="flex-1 bg-green-600 text-white py-2 rounded text-sm font-medium hover:bg-green-700 transition"
                  >
                    ✓ Mark Complete
                  </button>
                )}
                {req.status === 'Completed' && (
                  <span className="flex-1 text-center text-green-600 font-medium py-2">
                    ✓ Resolved
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}