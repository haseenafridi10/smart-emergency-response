// src/app/page.tsx
"use client";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RequestData } from "@/types";
import dynamic from "next/dynamic";
import RequestForm from "@/components/RequestForm";
import VolunteerDashboard from "@/components/VolunteerDashboard";
import Analytics from "@/components/Analytics";
import { useGeolocation } from "@/hooks/useGeolocation";

// Dynamically import Map to avoid SSR issues
const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false, 
  loading: () => <div className="flex items-center justify-center h-full bg-gray-100">Loading Map...</div> 
});

function DashboardContent() {
  const { user, loading, login, logout } = useAuth();
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [view, setView] = useState<'map' | 'list'>('map');
  
  // Get real-time user location
  const { latitude, longitude, error: geoError } = useGeolocation();

  // Listen to all requests in real-time
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "requests"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RequestData));
      setRequests(data);
    }, (error) => {
      console.error("Error fetching requests:", error);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading System...</div>;

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
        <h1 className="text-4xl font-bold mb-4 text-red-600">Emergency Response</h1>
        <p className="text-gray-600 mb-6">Smart Community Emergency Response System</p>
        <button 
          onClick={login} 
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 shadow-lg transition"
        >
          Sign In with Google
        </button>
      </div>
    );
  }

  const userLocation = latitude && longitude ? { lat: latitude, lng: longitude } : null;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 bg-white p-4 rounded-lg shadow">
        <div className="mb-4 sm:mb-0">
          <h1 className="text-2xl font-bold text-gray-800">Smart Response System</h1>
          <p className="text-sm text-gray-600">
            {userLocation ? '📍 Location active' : '⚠️ Location unavailable'}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setView('map')} 
            className={`px-4 py-2 rounded transition ${
              view === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Map View
          </button>
          <button 
            onClick={() => setView('list')} 
            className={`px-4 py-2 rounded transition ${
              view === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'
            }`}
          >
            Volunteer View
          </button>
          <button 
            onClick={logout} 
            className="text-red-600 hover:underline px-2"
          >
            Logout
          </button>
        </div>
      </header>

      {geoError && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4 rounded">
          <p className="text-yellow-700 text-sm">
            ⚠️ Location access denied. Distance sorting disabled. 
            <button onClick={() => window.location.reload()} className="underline ml-1 font-medium">
              Try again
            </button>
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden h-150">
          {view === 'map' ? (
            <Map 
              requests={requests} 
              userLocation={userLocation}
              showUserMarker={true}
            />
            // <p>map is disabled for now</p>
          ) : (
            <VolunteerDashboard />
          )}
        </div>
        <div className="space-y-6">
          <RequestForm onSuccess={() => {}} />
          <Analytics requests={requests} />
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <AuthProvider>
      <DashboardContent />
    </AuthProvider>
  );
}