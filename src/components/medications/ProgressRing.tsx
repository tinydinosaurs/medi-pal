import React from "react";
import { formatDisplayDate } from "@/utils/date";

interface ProgressRingProps {
  taken: number;
  total: number;
  date?: Date;
}

export default function ProgressRing({
  taken,
  total,
  date = new Date(),
}: ProgressRingProps) {
  const progressAngle = total > 0 ? (taken / total) * 360 : 0;

  return (
    <div className="sticky top-[64px] z-10">
      <div className="flex flex-col items-center justify-center rounded-[10px] bg-[#d1ede5] px-5 py-4 text-center text-slate-900">
        <div className="relative flex h-56 w-56 items-center justify-center">
          {/* Background circle */}
          <div className="absolute inset-0 rounded-full bg-white" />

          {/* Progress arc */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: `conic-gradient(#4dbd91 ${progressAngle}deg, #e4f5ed 0deg)`,
              maskImage: "radial-gradient(transparent 58%, black 60%)",
              WebkitMaskImage: "radial-gradient(transparent 58%, black 60%)",
            }}
          />

          {/* Center content */}
          <div className="relative flex h-48 w-48 flex-col items-center justify-center rounded-full bg-white text-center text-slate-800 shadow-[0_14px_35px_rgba(15,23,42,0.18)]">
            <div className="text-lg font-semibold">Today</div>
            <div className="text-4xl font-bold">
              {taken}/{total}
            </div>
            <div className="text-sm">{formatDisplayDate(date)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
