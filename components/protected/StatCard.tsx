import { TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

type StatCardProps = {
  iconBgColor: string;
  trend?: number;
  title: string;
  icon: React.ReactNode;
  type: "percentage" | "number";
  subtype: "percentage" | "time";
  value: number;
};

function StatCard({
  iconBgColor,
  trend,
  title,
  icon,
  type,
  subtype,
  value,
}: StatCardProps) {
  return (
    <div className="bg-neutral-900 p-6 rounded-lg shadow-xs text-black border border-white/10 shadow-neutral-100/10">
      {/* ICON & TREND */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center flex-row justify-between">
          <div className={`p-2 rounded-lg ${iconBgColor}`}>{icon}</div>
          <div className="mt-2">
            {subtype === "percentage" ? (
              trend !== undefined && trend >= 0 ? (
                <span className="text-green-600 flex flex-row items-center gap-1 text-sm bg-green-500/5 px-2 py-1 rounded-md">
                  <TrendingUp size={14} />
                  {`+${trend}%`}
                </span>
              ) : (
                <span className="text-red-500 flex flex-row items-center gap-1 text-sm bg-red-500/5 px-2 py-1 rounded-md">
                  <TrendingDown size={14} />
                  {`${trend}%`}
                </span>
              )
            ) : (
              <span className="text-gray-400/90 text-sm">
                Updated {trend}m ago
              </span>
            )}
          </div>
        </div>

        {/* SUBHEADING */}
        <p className="text-gray-400 text-sm font-semibold">{title}</p>

        {/* VALUE */}
        <div className="text-white text-4xl font-bold tracking-wide">
          {type === "percentage" ? value + "%" : value.toLocaleString("en-IN")}
        </div>
      </div>
    </div>
  );
}

export default StatCard;
