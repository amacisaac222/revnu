"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface StatCard {
  id: string;
  label: string;
  value: string;
  change?: number; // percentage change
  changeLabel?: string;
  color?: "green" | "emerald" | "amber" | "white";
  link?: string;
}

interface StatsWidgetProps {
  stats: StatCard[];
  columns?: number;
}

export default function StatsWidget({ stats, columns = 5 }: StatsWidgetProps) {
  const gridClass = columns === 5
    ? "grid grid-cols-2 md:grid-cols-5 gap-3"
    : columns === 4
    ? "grid grid-cols-2 md:grid-cols-4 gap-3"
    : "grid grid-cols-2 md:grid-cols-3 gap-3";

  const colorClasses = {
    green: "from-revnu-green/20 to-revnu-green/5 border-revnu-green/30 text-revnu-green",
    emerald: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/30 text-emerald-400",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/30 text-amber-400",
    white: "from-revnu-slate/40 to-revnu-slate/20 border-revnu-green/20 text-white",
  };

  return (
    <div className={gridClass}>
      {stats.map((stat) => {
        const Component = stat.link ? Link : "div";
        const colorClass = colorClasses[stat.color || "white"];
        const componentProps = stat.link ? { href: stat.link } : {};

        return (
          <Component
            key={stat.id}
            {...componentProps}
            className={`
              bg-gradient-to-br ${colorClass} p-4 rounded-lg border
              ${stat.link ? "hover:border-revnu-green transition group cursor-pointer" : ""}
            `}
          >
            <div className="text-xs font-bold uppercase tracking-wide mb-1 text-revnu-gray">
              {stat.label}
            </div>
            <div className={`
              text-2xl font-black
              ${stat.link ? `group-hover:${stat.color === "green" ? "text-revnu-greenLight" : "opacity-80"} transition` : ""}
            `}>
              {stat.value}
            </div>

            {stat.change !== undefined && (
              <div className="flex items-center gap-1 mt-2">
                {stat.change > 0 ? (
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                ) : stat.change < 0 ? (
                  <TrendingDown className="w-3 h-3 text-red-400" />
                ) : (
                  <Minus className="w-3 h-3 text-revnu-gray" />
                )}
                <span className={`text-xs font-semibold ${
                  stat.change > 0 ? "text-emerald-400" :
                  stat.change < 0 ? "text-red-400" :
                  "text-revnu-gray"
                }`}>
                  {stat.change > 0 && "+"}{stat.change}%
                </span>
                {stat.changeLabel && (
                  <span className="text-xs text-revnu-gray ml-1">{stat.changeLabel}</span>
                )}
              </div>
            )}
          </Component>
        );
      })}
    </div>
  );
}
