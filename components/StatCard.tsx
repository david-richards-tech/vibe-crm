import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  color?: string;
  gradient?: string;
}

export default function StatCard({ label, value, change, changeType = "neutral", icon, color = "bg-indigo-50 text-indigo-600", gradient }: StatCardProps) {
  return (
    <div
      className={`rounded-xl border p-5 ${gradient ? "text-white border-transparent" : "bg-white border-indigo-100"}`}
      style={gradient ? { background: gradient, border: "none" } : undefined}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${gradient ? "bg-white/20 backdrop-blur-sm" : color}`}>
          {icon}
        </div>
        {change && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              gradient
                ? "bg-white/20 text-white"
                : changeType === "positive"
                ? "bg-emerald-50 text-emerald-700"
                : changeType === "negative"
                ? "bg-red-50 text-red-700"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <p className={`text-2xl font-bold ${gradient ? "text-white" : "text-indigo-900"}`}>{value}</p>
      <p className={`text-sm mt-0.5 ${gradient ? "text-white/70" : "text-indigo-400"}`}>{label}</p>
    </div>
  );
}
