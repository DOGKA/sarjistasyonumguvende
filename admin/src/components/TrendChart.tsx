"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export interface TrendPoint {
  label: string;
  iletisim: number;
  risk: number;
}

export default function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="gContact" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gRisk" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22c55e" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#22c55e" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#233149" />
          <XAxis dataKey="label" stroke="#93a4bf" fontSize={11} tickLine={false} />
          <YAxis stroke="#93a4bf" fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#16233d",
              border: "1px solid #233149",
              borderRadius: 8,
              color: "#e6edf6",
              fontSize: 12,
            }}
          />
          <Area
            type="monotone"
            dataKey="iletisim"
            name="İletişim"
            stroke="#38bdf8"
            fill="url(#gContact)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="risk"
            name="Risk Testi"
            stroke="#22c55e"
            fill="url(#gRisk)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
