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
  LineChart,
  Line,
} from "recharts";

const COLORS = [
  "#2563EB",
  "#F97316",
  "#10B981",
  "#EAB308",
  "#EF4444",
  "#8B5CF6",
  "#64748B",
];

type RevenueData = {
  month: string;
  revenue: number;
};

type ShipmentVolumeData = {
  month: string;
  shipments: number;
};

type StatusData = {
  name: string;
  value: number;
};

type PackageTypeData = {
  name: string;
  value: number;
};

function ChartLegend({ data }: { data: StatusData[] }) {
  return (
    <div className="mt-4 flex flex-wrap justify-center gap-x-5 gap-y-2">
      {data.map((entry, index) => (
        <div
          key={`${entry.name}-${index}`}
          className="flex items-center gap-2 text-xs text-slate-600"
        >
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              backgroundColor: COLORS[index % COLORS.length],
            }}
          />

          <span>{entry.name}</span>

          <span className="font-semibold text-slate-900">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

/* =========================================================
   REVENUE CHART
========================================================= */

export function RevenueChart({ data }: { data: RevenueData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#E2E8F0"
        />

        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#64748B" }}
        />

        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#64748B" }}
        />

        <Tooltip
          contentStyle={{
            borderRadius: 10,
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
          fill="#2563EB"
          radius={[6, 6, 0, 0]}
          maxBarSize={42}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* =========================================================
   SHIPMENT VOLUME CHART
========================================================= */

export function ShipmentVolumeChart({ data }: { data: ShipmentVolumeData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart
        data={data}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          vertical={false}
          stroke="#E2E8F0"
        />

        <XAxis
          dataKey="month"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#64748B" }}
        />

        <YAxis
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#64748B" }}
        />

        <Tooltip
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #E2E8F0",
            fontSize: 13,
          }}
          formatter={(value) => [
            Number(value ?? 0).toLocaleString(),
            "Shipments",
          ]}
        />

        <Line
          type="monotone"
          dataKey="shipments"
          stroke="#2563EB"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* =========================================================
   SHIPMENT STATUS CHART
========================================================= */

export function ShipmentStatusChart({ data }: { data: StatusData[] }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell
                key={`${entry.name}-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <ChartLegend data={data} />
    </div>
  );
}

/* =========================================================
   PAYMENT STATUS CHART
========================================================= */

export function PaymentStatusChart({ data }: { data: StatusData[] }) {
  return (
    <div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
          >
            {data.map((entry, index) => (
              <Cell
                key={`${entry.name}-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>

          <Tooltip
            contentStyle={{
              borderRadius: 10,
              border: "1px solid #E2E8F0",
              fontSize: 13,
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      <ChartLegend data={data} />
    </div>
  );
}

/* =========================================================
   PACKAGE TYPE CHART
========================================================= */

export function PackageTypeChart({ data }: { data: PackageTypeData[] }) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 10, right: 20, left: 20, bottom: 10 }}
      >
        <CartesianGrid
          strokeDasharray="3 3"
          horizontal={false}
          stroke="#E2E8F0"
        />

        <XAxis
          type="number"
          allowDecimals={false}
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#64748B" }}
        />

        <YAxis
          type="category"
          dataKey="name"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: "#64748B" }}
          width={90}
        />

        <Tooltip
          contentStyle={{
            borderRadius: 10,
            border: "1px solid #E2E8F0",
            fontSize: 13,
          }}
          formatter={(value) => [
            Number(value ?? 0).toLocaleString(),
            "Shipments",
          ]}
        />

        <Bar
          dataKey="value"
          fill="#F97316"
          radius={[0, 6, 6, 0]}
          maxBarSize={28}
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
