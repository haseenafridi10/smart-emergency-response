// src/components/RequestForm.tsx
"use client";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Category, Priority } from "@/types";
import { AlertCircle, MapPin, Send } from "lucide-react";

interface Props {
  onSuccess: () => void;
  userLocation: { lat: number; lng: number } | null;
}

export default function RequestForm({ onSuccess, userLocation }: Props) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    category: 'Medical' as Category,
    priority: 'Medium' as Priority,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const location = userLocation || { lat: 37.7749, lng: -122.4194 };

      await addDoc(collection(db, "requests"), {
        category: formData.category,
        priority: formData.priority,
        description: formData.description,
        location: location,
        status: 'Pending',
        timestamp: Date.now(),
        userId: user?.uid || 'anonymous',
      });

      onSuccess();
      setFormData({ category: 'Medical', priority: 'Medium', description: '' });
    } catch (error) {
      console.error("Error:", error);
    }
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-linear-to-br from-red-500 to-red-700 rounded-xl flex items-center justify-center">
          <AlertCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">New Request</h2>
          <p className="text-sm text-gray-500">Submit emergency help</p>
        </div>
      </div>

      {userLocation && (
        <div className="mb-4 p-3 bg-green-50 rounded-xl flex items-center gap-2">
          <MapPin className="w-4 h-4 text-green-600" />
          <span className="text-xs text-green-700 font-medium">
            {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
          <select
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
          >
            <option value="Medical">🏥 Medical</option>
            <option value="Food">🍔 Food & Supplies</option>
            <option value="Shelter">🏠 Shelter</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Priority</label>
          <select
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition"
            value={formData.priority}
            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
          >
            <option value="High">🔴 High - Critical</option>
            <option value="Medium">🟡 Medium - Urgent</option>
            <option value="Low">🟢 Low - Non-Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
          <textarea
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-500 focus:ring-4 focus:ring-red-100 outline-none transition resize-none"
            placeholder="Describe the emergency..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            required
            rows={4}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-linear-to-r from-red-600 to-red-700 text-white py-3 rounded-xl font-semibold hover:from-red-700 hover:to-red-800 transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {loading ? 'Submitting...' : 'Send Request'}
        </button>
      </form>
    </div>
  );
}