// src/components/VolunteerFeed.tsx
"use client";
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { RequestData, Priority } from "@/types";
import { Clock, CheckCircle, MapPin } from "lucide-react";

interface Props {
  requests: RequestData[];
  userLocation: { lat: number; lng: number } | null;
}

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function VolunteerFeed({ requests: allRequests, userLocation }: Props) {
  const [requests, setRequests] = useState<(RequestData & { distance?: number })[]>([]);
  const [filter, setFilter] = useState<Priority | 'All'>('All');

  useEffect(() => {
    const q = query(collection(db, "requests"), where("status", "in", ["Pending", "In Progress"]));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as RequestData));

      if (userLocation) {
        data = data.map(req => ({
          ...req,
          distance: getDistance(userLocation.lat, userLocation.lng, req.location.lat, req.location.lng)
        }));
      }

      const priorityWeight = { 'High': 1, 'Medium': 2, 'Low': 3 };
      data.sort((a, b) => {
        if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
          return priorityWeight[a.priority] - priorityWeight[b.priority];
        }
        return (a.distance || 0) - (b.distance || 0);
      });

      setRequests(data);
    });
    return () => unsubscribe();
  }, [userLocation]);

  const updateStatus = async (id: string, status: string) => {
    await updateDoc(doc(db, "requests", id), { status });
  };

  const filtered = filter === 'All' ? requests : requests.filter(r => r.priority === filter);

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-6 border-b bg-linear-to-r from-blue-50 to-indigo-50">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Volunteer Feed</h2>
        <div className="flex flex-wrap gap-2">
          {(['All', 'High', 'Medium', 'Low'] as const).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setFilter(lvl)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition ${
                filter === lvl
                  ? lvl === 'High' ? 'bg-red-600 text-white'
                  : lvl === 'Medium' ? 'bg-yellow-500 text-white'
                  : lvl === 'Low' ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Request List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No requests available</p>
          </div>
        ) : (
          filtered.map((req) => (
            <div
              key={req.id}
              className={`border-l-4 p-5 rounded-xl bg-white shadow-md hover:shadow-lg transition ${
                req.priority === 'High' ? 'border-red-500' :
                req.priority === 'Medium' ? 'border-yellow-500' : 'border-green-500'
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg">{req.category}</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    req.priority === 'High' ? 'bg-red-100 text-red-700' :
                    req.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    {req.priority}
                  </span>
                </div>
                {req.distance && (
                  <div className="flex items-center gap-1 text-blue-600 font-semibold text-sm">
                    <MapPin className="w-4 h-4" />
                    {req.distance.toFixed(2)} km
                  </div>
                )}
              </div>

              <p className="text-gray-700 mb-4">{req.description}</p>

              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="w-4 h-4" />
                  {new Date(req.timestamp).toLocaleString()}
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  req.status === 'Pending' ? 'bg-gray-100 text-gray-700' :
                  req.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                }`}>
                  {req.status}
                </span>
              </div>

              <div className="flex gap-2">
                {req.status === 'Pending' && (
                  <button
                    onClick={() => updateStatus(req.id, 'In Progress')}
                    className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition"
                  >
                    Accept Request
                  </button>
                )}
                {req.status === 'In Progress' && (
                  <button
                    onClick={() => updateStatus(req.id, 'Completed')}
                    className="flex-1 bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
                  >
                    Mark Complete
                  </button>
                )}
                {req.status === 'Completed' && (
                  <div className="flex-1 text-center text-green-600 font-semibold py-3 bg-green-50 rounded-xl">
                    ✓ Resolved
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}