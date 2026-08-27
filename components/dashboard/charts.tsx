"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";

const COLORS = [
  "#F97316",
  "#0F172A",
  "#334155",
  "#94A3B8",
  "#FDBA74",
  "#1E293B",
  "#FED7AA",
];

export function RevenueChart({
  data,
}: {
  data: { month: string; revenue: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="#E2E8F0"
          vertical={false}
        />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: "#64748B" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "#64748B" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #E2E8F0",
            fontSize: 13,
          }}
          formatter={(value) => [
            `₦${Number(value ?? 0).toLocaleString()}`,
            "Revenue",
          ]}
        />
        <Bar
          dataKey="revenue"
          fill="#F97316"
          radius={[6, 6, 0, 0]}
          maxBarSize={36}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function StatusPieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          innerRadius={60}
          outerRadius={95}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            borderRadius: 8,
            border: "1px solid #E2E8F0",
            fontSize: 13,
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
