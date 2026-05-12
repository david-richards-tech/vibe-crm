import React from "react";

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  icon: React.ReactNode;
  color?: string;
}

export default function StatCard({ label, value, change, changeType = "neutral", icon, color = "bg-slate-100 text-slate-600" }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {change && (
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              changeType === "positive"
                ? "bg-green-50 text-green-700"
                : changeType === "negative"
                ? "bg-red-50 text-red-700"
                : "bg-slate-50 text-slate-600"
            }`}
          >
            {change}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm text-slate-500 mt-0.5">{label}</p>
    </div>
  );
}
