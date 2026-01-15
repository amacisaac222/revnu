"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CustomerGrowthChartProps {
  data: Array<{
    month: string;
    customers: number;
  }>;
}

export default function CustomerGrowthChart({ data }: CustomerGrowthChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <defs>
          <linearGradient id="colorCustomers" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.3} />
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
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1A202C",
            border: "1px solid #10B981",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#E2E8F0" }}
          formatter={(value: number | undefined) => [value ?? 0, "Customers"]}
        />
        <Bar
          dataKey="customers"
          fill="url(#colorCustomers)"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
