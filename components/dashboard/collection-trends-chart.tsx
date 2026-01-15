"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface CollectionTrendsChartProps {
  data: {
    month: string;
    invoiced: number;
    collected: number;
    outstanding: number;
  }[];
}

export default function CollectionTrendsChart({ data }: CollectionTrendsChartProps) {
  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1a2332" />
          <XAxis
            dataKey="month"
            stroke="#6B7280"
            style={{ fontSize: '10px' }}
          />
          <YAxis
            stroke="#6B7280"
            style={{ fontSize: '10px' }}
            tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f1419',
              border: '1px solid #00FF94',
              borderRadius: '8px',
              color: '#fff',
            }}
            formatter={(value: number) => [`$${value.toLocaleString()}`, '']}
          />
          <Legend
            wrapperStyle={{ color: '#fff', fontSize: '10px' }}
            iconType="line"
          />
          <Line
            type="monotone"
            dataKey="invoiced"
            stroke="#00FF94"
            strokeWidth={1.5}
            name="Invoiced"
            dot={{ fill: '#00FF94', r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="collected"
            stroke="#10B981"
            strokeWidth={1.5}
            name="Collected"
            dot={{ fill: '#10B981', r: 3 }}
          />
          <Line
            type="monotone"
            dataKey="outstanding"
            stroke="#F59E0B"
            strokeWidth={1.5}
            name="Outstanding"
            dot={{ fill: '#F59E0B', r: 3 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
