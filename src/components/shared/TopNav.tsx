"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: "🏠" },
  { href: "/medications", label: "Medications", icon: "💊" },
  { href: "/appointments", label: "Appointments", icon: "📅" },
  { href: "/documents", label: "Documents", icon: "📄" },
  { href: "/bills", label: "Bills", icon: "💵" },
  { href: "/history", label: "History", icon: "📊" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

export default function TopNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo + Title */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md">
              <span className="text-lg text-white">💊</span>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-lg font-bold text-transparent">
                Caretaker
              </h1>
              <p className="text-[11px] text-slate-500">
                Medical Care Assistant
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="flex gap-0.5 overflow-x-auto">
            {NAV_ITEMS.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
