// src/components/RequestForm.tsx
"use client";
import { useState } from "react";
import { collection, addDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Category, Priority } from "@/types";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function RequestForm({ onSuccess }: { onSuccess: () => void }) {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { latitude, longitude, error: geoError } = useGeolocation();
  
  const [formData, setFormData] = useState({
    category: 'Medical' as Category,
    priority: 'Medium' as Priority,
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Use real location if available, otherwise use default
      let location = { lat: 37.7749, lng: -122.4194 }; // Default SF
      
      if (latitude && longitude) {
        location = { lat: latitude, lng: longitude };
      } else if (geoError) {
        alert("Location access denied. Request will use default location.");
      }
      
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
      alert("Request submitted successfully!");
    } catch (error) {
      console.error("Error submitting request:", error);
      alert("Failed to submit request. Please try again.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md space-y-4">
      <h2 className="text-xl font-bold">Submit Emergency Request</h2>
      
      {latitude && longitude && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
          📍 Using your real location: {latitude.toFixed(4)}, {longitude.toFixed(4)}
        </div>
      )}
      
      {geoError && (
        <div className="text-xs text-yellow-600 bg-yellow-50 p-2 rounded">
          ⚠️ Location unavailable. Using default location.
        </div>
      )}
      
      <select 
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
        value={formData.category}
        onChange={(e) => setFormData({...formData, category: e.target.value as Category})}
      >
        <option value="Medical">🏥 Medical</option>
        <option value="Food">🍔 Food</option>
        <option value="Shelter">🏠 Shelter</option>
      </select>
      
      <select 
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
        value={formData.priority}
        onChange={(e) => setFormData({...formData, priority: e.target.value as Priority})}
      >
        <option value="High">🔴 High Priority</option>
        <option value="Medium">🟡 Medium Priority</option>
        <option value="Low">🟢 Low Priority</option>
      </select>
      
      <textarea 
        className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500" 
        placeholder="Describe the emergency situation..."
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        required
        rows={3}
      />
      
      <button 
        type="submit" 
        disabled={loading}
        className="w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
      >
        {loading ? 'Submitting...' : '🚨 Send Emergency Request'}
      </button>
    </form>
  );
}