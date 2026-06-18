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

export interface TrafficPoint {
  label: string;
  users: number;
  sessions: number;
}

export default function TrafficChart({ data }: { data: TrafficPoint[] }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="gUsers" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gSessions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0ea5e9" stopOpacity={0.45} />
              <stop offset="100%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e3e3e8" />
          <XAxis dataKey="label" stroke="#6e6e73" fontSize={11} tickLine={false} />
          <YAxis stroke="#6e6e73" fontSize={11} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{
              background: "#ffffff",
              border: "1px solid #e3e3e8",
              borderRadius: 12,
              color: "#1d1d1f",
              fontSize: 12,
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
            }}
          />
          <Area
            type="monotone"
            dataKey="users"
            name="Kullanıcı"
            stroke="#6366f1"
            fill="url(#gUsers)"
            strokeWidth={2}
          />
          <Area
            type="monotone"
            dataKey="sessions"
            name="Oturum"
            stroke="#0ea5e9"
            fill="url(#gSessions)"
            strokeWidth={2}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
