// src/components/Analytics.tsx
"use client";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { RequestData } from "@/types";

const COLORS = ['#EF4444', '#F59E0B', '#10B981'];

export default function Analytics({ requests }: { requests: RequestData[] }) {
  // Calculate Stats
  const activeCount = requests.filter(r => r.status !== 'Completed').length;
  const resolvedCount = requests.filter(r => r.status === 'Completed').length;
  
  const categoryData = [
    { name: 'Medical', value: requests.filter(r => r.category === 'Medical').length },
    { name: 'Food', value: requests.filter(r => r.category === 'Food').length },
    { name: 'Shelter', value: requests.filter(r => r.category === 'Shelter').length },
  ];

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Live Analytics</h2>
      
      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Active Cases</p>
          <p className="text-2xl font-bold text-blue-600">{activeCount}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg text-center">
          <p className="text-sm text-gray-500">Resolved Cases</p>
          <p className="text-2xl font-bold text-green-600">{resolvedCount}</p>
        </div>
      </div>

      {/* Category Chart */}
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={categoryData} cx="50%" cy="50%" outerRadius={60} dataKey="value" label />
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}