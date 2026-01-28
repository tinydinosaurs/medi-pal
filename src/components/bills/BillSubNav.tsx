"use client";

import { useState, useEffect } from "react";
import type { BillSubNavItem } from "@/types";

interface BillSubNavProps {
  hasAnalysis: boolean;
}

const NAV_ITEMS: BillSubNavItem[] = [
  { id: "bill-input", label: "Bill", icon: "📄" },
  {
    id: "bill-analysis",
    label: "Analysis",
    icon: "📊",
    requiresAnalysis: true,
  },
  { id: "bill-actions", label: "Actions", icon: "🛠️", requiresAnalysis: true },
  { id: "bill-steps", label: "Steps", icon: "✅", requiresAnalysis: true },
  { id: "bill-history", label: "History", icon: "📂" },
];

export function BillSubNav({ hasAnalysis }: BillSubNavProps) {
  const [activeSection, setActiveSection] = useState("bill-input");

  // Observe which section is in view
  useEffect(() => {
    const visibleItems = NAV_ITEMS.filter(
      (item) => !item.requiresAnalysis || hasAnalysis,
    );

    const observers: IntersectionObserver[] = [];

    visibleItems.forEach((item) => {
      const element = document.getElementById(item.id);
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
              setActiveSection(item.id);
            }
          });
        },
        {
          rootMargin: "-100px 0px -50% 0px",
          threshold: [0.3],
        },
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [hasAnalysis]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    console.log("Element found:", element);
    console.log("Element position:", element?.getBoundingClientRect().top);
    console.log("pageYOffset:", window.pageYOffset);

    if (!element) return;

    // Try the most basic scroll first
    element.scrollIntoView({ behavior: "smooth" });
  };

  const visibleItems = NAV_ITEMS.filter(
    (item) => !item.requiresAnalysis || hasAnalysis,
  );

  return (
    <div className="sticky top-[73px] z-30 -mx-4 mb-6 border-b border-slate-200 bg-white/95 px-4 backdrop-blur-sm">
      <nav className="flex gap-1 overflow-x-auto py-2">
        {visibleItems.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleClick(item.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
