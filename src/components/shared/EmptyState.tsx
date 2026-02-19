"use client";

import React from "react";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
}

export function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="mt-10 flex flex-col items-center justify-center px-4 text-center text-gray-700">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-50 text-4xl">
        {icon}
      </div>
      <p className="mb-1 text-lg font-semibold">{title}</p>
      <p className="max-w-xs text-sm text-gray-600">{description}</p>
    </div>

    // <div className="space-y-4">
    //   <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
    //   <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg">
    //     <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-4xl">
    //       {icon}
    //     </div>
    //     <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
    //     <p className="mt-2 text-slate-600">{description}</p>
    //   </div>
    // </div>
  );
}
