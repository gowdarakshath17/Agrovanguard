import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';
import { TrendingUp } from 'lucide-react';

const mockData = [
  { month: 'Jan', nitrogen: 35, phosphorus: 20, potassium: 22 },
  { month: 'Feb', nitrogen: 38, phosphorus: 22, potassium: 25 },
  { month: 'Mar', nitrogen: 42, phosphorus: 25, potassium: 28 },
  { month: 'Apr', nitrogen: 48, phosphorus: 30, potassium: 32 },
  { month: 'May', nitrogen: 55, phosphorus: 35, potassium: 38 },
  { month: 'Jun', nitrogen: 62, phosphorus: 38, potassium: 42 },
];

export default function SoilFertilityChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm mt-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center text-gray-900 font-bold text-lg">
          <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
          Historical Soil Fertility (NPK)
        </div>
        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-lg font-medium">6 Month Trend</span>
      </div>
      
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={mockData}
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis 
              dataKey="month" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 12 }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#6b7280', fontSize: 12 }} 
            />
            <Tooltip 
              contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend 
              verticalAlign="top" 
              height={36} 
              iconType="circle" 
              wrapperStyle={{ fontSize: '14px', fontWeight: 500 }}
            />
            <Line 
              type="monotone" 
              name="Nitrogen (N) kg/ha"
              dataKey="nitrogen" 
              stroke="#16a34a" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              name="Phosphorus (P) kg/ha"
              dataKey="phosphorus" 
              stroke="#f59e0b" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }} 
            />
            <Line 
              type="monotone" 
              name="Potassium (K) kg/ha"
              dataKey="potassium" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6 }} 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 p-4 bg-green-50 rounded-xl border border-green-100">
        <p className="text-sm text-green-800 font-medium">
          <strong>Insight:</strong> Nitrogen levels have improved by 77% since January following your active treatment plan. Optimal range for the upcoming season is 60-70 kg/ha.
        </p>
      </div>
    </div>
  );
}
