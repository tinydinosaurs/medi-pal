import React from "react";
import { formatDisplayDate } from "@/utils/date";

type RingSize = "sm" | "md" | "lg";

interface ProgressRingProps {
  taken: number;
  total: number;
  date?: Date;
  /** Size variant: sm (40px), md (112px), lg (224px) */
  size?: RingSize;
  /** Whether to show the date below the ring */
  showDate?: boolean;
  /** Whether to show the background container */
  showBackground?: boolean;
}

const SIZE_CONFIG = {
  sm: {
    container: "h-10 w-10",
    strokeWidth: 3,
    radius: 15,
    viewBox: "0 0 36 36",
    circumference: 94.2,
    textClass: "text-xs font-bold",
    subTextClass: "",
    showLabel: false,
  },
  md: {
    container: "h-28 w-28",
    strokeWidth: 6,
    radius: 15,
    viewBox: "0 0 36 36",
    circumference: 94.2,
    textClass: "text-2xl font-bold",
    subTextClass: "text-[10px] text-slate-500",
    showLabel: true,
  },
  lg: {
    container: "h-56 w-56",
    strokeWidth: 8,
    radius: 15,
    viewBox: "0 0 36 36",
    circumference: 94.2,
    textClass: "text-4xl font-bold",
    subTextClass: "text-lg font-semibold",
    showLabel: true,
  },
};

export default function ProgressRing({
  taken,
  total,
  date = new Date(),
  size = "lg",
  showDate = true,
  showBackground = true,
}: ProgressRingProps) {
  const config = SIZE_CONFIG[size];
  const progress = total > 0 ? (taken / total) * config.circumference : 0;

  const ring = (
    <div
      className={`relative flex items-center justify-center ${config.container}`}
    >
      <svg
        className={`${config.container} -rotate-90`}
        viewBox={config.viewBox}
      >
        {/* Background circle */}
        <circle
          cx="18"
          cy="18"
          r={config.radius}
          fill="none"
          stroke="#e4f5ed"
          strokeWidth={config.strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx="18"
          cy="18"
          r={config.radius}
          fill="none"
          stroke="#4dbd91"
          strokeWidth={config.strokeWidth}
          strokeDasharray={`${progress} ${config.circumference}`}
          strokeLinecap="round"
        />
      </svg>
      {/* Center content */}
      <div className="absolute flex flex-col items-center justify-center text-slate-800">
        <span className={config.textClass}>
          {taken}/{total}
        </span>
        {config.showLabel && config.subTextClass && size === "md" && (
          <span className={config.subTextClass}>taken</span>
        )}
        {config.showLabel && size === "lg" && (
          <span className="text-lg font-semibold -mt-1">Today</span>
        )}
      </div>
    </div>
  );

  // Small size: just return the ring, no container
  if (size === "sm" || !showBackground) {
    return ring;
  }

  // Medium/Large: wrap in styled container
  return (
    <div className="flex flex-col items-center justify-center rounded-xl bg-[#d1ede5] px-4 py-3 text-center text-slate-900">
      {ring}
      {showDate && (
        <div className="mt-2 text-xs font-medium text-slate-600">
          {formatDisplayDate(date)}
        </div>
      )}
    </div>
  );
}
