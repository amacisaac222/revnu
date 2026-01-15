"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface CollectionRateChartProps {
  data: Array<{
    month: string;
    rate: number;
  }>;
}

export default function CollectionRateChart({ data }: CollectionRateChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" />
        <XAxis
          dataKey="month"
          stroke="#718096"
          style={{ fontSize: "12px" }}
        />
        <YAxis
          stroke="#718096"
          style={{ fontSize: "12px" }}
          tickFormatter={(value) => `${value}%`}
          domain={[0, 100]}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "#1A202C",
            border: "1px solid #10B981",
            borderRadius: "8px",
          }}
          labelStyle={{ color: "#E2E8F0" }}
          formatter={(value: number | undefined) => [`${value ?? 0}%`, "Collection Rate"]}
        />
        <Line
          type="monotone"
          dataKey="rate"
          stroke="#10B981"
          strokeWidth={3}
          dot={{ fill: "#10B981", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
