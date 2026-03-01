// src/components/StatsPanel.tsx
"use client";
import { RequestData } from "@/types";
import { Activity, CheckCircle, AlertTriangle } from "lucide-react";

export default function StatsPanel({ requests }: { requests: RequestData[] }) {
  const active = requests.filter(r => r.status !== 'Completed').length;
  const resolved = requests.filter(r => r.status === 'Completed').length;

  const byCategory = {
    Medical: requests.filter(r => r.category === 'Medical').length,
    Food: requests.filter(r => r.category === 'Food').length,
    Shelter: requests.filter(r => r.category === 'Shelter').length,
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-linear-to-br from-purple-500 to-purple-700 rounded-xl flex items-center justify-center">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Statistics</h2>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-red-50 p-4 rounded-xl text-center">
          <AlertTriangle className="w-6 h-6 text-red-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-red-700">{active}</p>
          <p className="text-xs text-red-600">Active</p>
        </div>
        <div className="bg-green-50 p-4 rounded-xl text-center">
          <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
          <p className="text-2xl font-bold text-green-700">{resolved}</p>
          <p className="text-xs text-green-600">Resolved</p>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-gray-700">By Category</p>
        {Object.entries(byCategory).map(([cat, count]) => (
          <div key={cat} className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
            <span className="text-sm text-gray-700">{cat}</span>
            <span className="font-bold text-gray-900">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}