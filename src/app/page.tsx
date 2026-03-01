// src/app/page.tsx
"use client";
import { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RequestData } from "@/types";
import dynamic from "next/dynamic";

type SharedProps = {
  requests: RequestData[];
  userLocation: { lat: number; lng: number } | null;
};
import { useGeolocation } from "@/hooks/useGeolocation";
import { Toaster, toast } from "react-hot-toast";
import { 
  AlertTriangle, 
  MapPin, 
  Users, 
  Activity, 
  LogOut,
  Menu,
  X,
  Phone,
  Clock
} from "lucide-react";

const Map = dynamic<SharedProps>(() => import("@/components/Map"), { ssr: false });
const RequestForm = dynamic(() => import("@/components/RequestForm"), { ssr: false });
const VolunteerFeed = dynamic<SharedProps>(() => import("@/components/VolunteerFeed"), { ssr: false });
const StatsPanel = dynamic(() => import("@/components/StatsPanel"), { ssr: false });

function DashboardContent() {
  const { user, loading, login, logout } = useAuth();
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [activeTab, setActiveTab] = useState<'map' | 'feed'>('map');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { latitude, longitude, error: geoError } = useGeolocation();

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "requests"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RequestData));
      setRequests(data);
    });
    return () => unsubscribe();
  }, []);

  const userLocation = latitude && longitude ? { lat: latitude, lng: longitude } : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-red-600 to-red-800">
        <div className="text-center text-white">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-2xl font-bold">Loading...</h2>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLogin={login} />;
  }

  const activeRequests = requests.filter(r => r.status !== 'Completed').length;
  const completedRequests = requests.filter(r => r.status === 'Completed').length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-linear-to-br from-red-500 to-red-700 rounded-lg flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Emergency Response</h1>
                <p className="text-xs text-gray-500">Community System</p>
              </div>
            </div>

            {/* Center Stats - Desktop */}
            <div className="hidden md:flex items-center gap-6">
              <div className="flex items-center gap-2 bg-red-50 px-4 py-2 rounded-full">
                <Activity className="w-4 h-4 text-red-600" />
                <span className="text-sm font-semibold text-red-700">{activeRequests} Active</span>
              </div>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-full">
                <Users className="w-4 h-4 text-green-600" />
                <span className="text-sm font-semibold text-green-700">{completedRequests} Resolved</span>
              </div>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-3">
              {/* Location Status */}
              <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                <MapPin className={`w-4 h-4 ${userLocation ? 'text-green-600' : 'text-gray-400'}`} />
                <span className="text-xs font-medium">
                  {userLocation ? 'GPS Active' : 'GPS Off'}
                </span>
              </div>

              {/* Tab Switcher */}
              <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setActiveTab('map')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'map' ? 'bg-white shadow text-red-600' : 'text-gray-600'
                  }`}
                >
                  Map
                </button>
                <button
                  onClick={() => setActiveTab('feed')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition ${
                    activeTab === 'feed' ? 'bg-white shadow text-red-600' : 'text-gray-600'
                  }`}
                >
                  Feed
                </button>
              </div>

              {/* Logout */}
              <button
                onClick={logout}
                className="p-2 text-gray-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>

              {/* Mobile Menu */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="sm:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t bg-white px-4 py-4 space-y-3">
            <div className="flex gap-2">
              <button
                onClick={() => { setActiveTab('map'); setMobileMenuOpen(false); }}
                className={`flex-1 py-3 rounded-lg font-medium ${
                  activeTab === 'map' ? 'bg-red-600 text-white' : 'bg-gray-100'
                }`}
              >
                🗺️ Map
              </button>
              <button
                onClick={() => { setActiveTab('feed'); setMobileMenuOpen(false); }}
                className={`flex-1 py-3 rounded-lg font-medium ${
                  activeTab === 'feed' ? 'bg-red-600 text-white' : 'bg-gray-100'
                }`}
              >
                📋 Feed
              </button>
            </div>
            <div className="flex items-center justify-between pt-3 border-t">
              <span className="text-sm text-gray-600">
                {userLocation ? '📍 GPS Active' : '⚠️ GPS Off'}
              </span>
              <button onClick={logout} className="text-red-600 font-medium text-sm">
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Location Warning */}
      {geoError && (
        <div className="max-w-7xl mx-auto px-4 mt-4">
          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <p className="text-yellow-800 text-sm font-medium">⚠️ Location access denied</p>
            <p className="text-yellow-700 text-xs mt-1">Distance sorting disabled</p>
          </div>
        </div>
      )}

      {/* Main Content - New Grid Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Sidebar - Request Form & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <RequestForm 
              onSuccess={() => toast.success('Request submitted!')} 
              userLocation={userLocation}
            />
            <StatsPanel requests={requests} />
          </div>

          {/* Center - Map or Feed */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-150 min-h-100">
              {activeTab === 'map' ? (
                <Map requests={requests} userLocation={userLocation} />
              ) : (
                <VolunteerFeed requests={requests} userLocation={userLocation} />
              )}
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-6 border-t bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            🚑 Emergency Response System • For life-threatening emergencies, call 911
          </p>
        </div>
      </footer>
    </div>
  );
}

// Login Page
function LoginPage({ onLogin }: { onLogin: () => void }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-red-600 via-red-700 to-red-900 flex items-center justify-center px-4">
      <Toaster position="top-center" />
      
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-linear-to-br from-red-500 to-red-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Emergency Response</h1>
            <p className="text-gray-500 mt-2">Smart Community Platform</p>
          </div>

          {/* Features */}
          <div className="space-y-4 mb-8">
            {[
              { icon: '🚨', text: 'Submit emergency requests instantly' },
              { icon: '📍', text: 'Real-time GPS location tracking' },
              { icon: '⚡', text: 'Priority-based smart routing' },
              { icon: '👥', text: 'Volunteer coordination system' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl">{item.icon}</span>
                <span className="text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>

          {/* Login Button */}
          <button
            onClick={onLogin}
            className="w-full bg-linear-to-r from-red-600 to-red-700 text-white py-4 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-xs text-gray-400 mt-4">
            Secure authentication powered by Firebase
          </p>
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