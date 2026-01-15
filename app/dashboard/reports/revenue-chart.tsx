"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RevenueChartProps {
  data: Array<{
    month: string;
    invoiced: number;
    collected: number;
    outstanding: number;
  }>;
}

export default function RevenueChart({ data }: RevenueChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorInvoiced" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#34D399" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorOutstanding" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
        <XAxis
          dataKey="month"
          stroke="#718096"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="#718096"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => `$${value.toLocaleString()}`}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1A202C",
            border: "1px solid #10B981",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#E2E8F0" }}
          formatter={(value: number | undefined) => [`$${(value ?? 0).toLocaleString()}`, ""]}
        />
        <Legend
          wrapperStyle={{ fontSize: "12px", color: "#E2E8F0" }}
        />
        <Area
          type="monotone"
          dataKey="invoiced"
          stroke="#10B981"
          fillOpacity={1}
          fill="url(#colorInvoiced)"
          name="Invoiced"
        />
        <Area
          type="monotone"
          dataKey="collected"
          stroke="#34D399"
          fillOpacity={1}
          fill="url(#colorCollected)"
          name="Collected"
        />
        <Area
          type="monotone"
          dataKey="outstanding"
          stroke="#F59E0B"
          fillOpacity={1}
          fill="url(#colorOutstanding)"
          name="Outstanding"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
