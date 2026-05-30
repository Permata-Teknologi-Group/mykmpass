"use client";

import Link from "next/link";
import type { ReactNode } from "react";

interface SidebarProps {
  isDark: boolean;
  toggleTheme: () => void;
  navItems: { label: string; icon: ReactNode; active?: boolean; badge?: string; link: string }[];
  generalItems: { label: string; icon: ReactNode; active?: boolean; link: string; badge?: string }[];
}

export default function Sidebar({ isDark, toggleTheme, navItems, generalItems }: SidebarProps) {
  return (
    <aside className={`col-span-12 lg:col-span-3 flex flex-col gap-6 rounded-[2rem] border p-6 shadow-xl ${
      isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
    }`}>
      <div className="flex items-center gap-3">
        <div className="flex h-18 w-18 items-center justify-center rounded-[50px] text-white shadow-sm">
          <img src="/logosanmar.png" alt=""/>
        </div>
        <div>
          <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Portal Katedral Medan</p>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Gereja Katedral Medan</p>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Keuskupan Agung Medan</p>
        </div>
      </div>

      <div className="space-y-1">
        <p className={`mt-6 text-xs uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Menu</p>
        {navItems.map((item) => (
          <Link
            key={item.label}
            href={item.link}
            className={`flex w-full items-center justify-between rounded-3xl px-4 py-3 text-left transition ${
              item.active
                ? isDark ? "bg-blue-900/30 text-blue-400 shadow-sm" : "bg-blue-50 text-blue-700 shadow-sm"
                : isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-3 text-base">
              <span>{item.icon}</span>
              {item.label}
            </span>
            {item.badge && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
              }`}>
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      <div className="space-y-1">
        <p className={`mt-6 text-xs uppercase tracking-[0.3em] ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>General</p>
        {generalItems.map((item) => (
          <Link
            key={item.label}
            href={item.link}
            className={`flex w-full items-center justify-between rounded-3xl px-4 py-3 text-left transition ${
              item.active
                ? isDark ? "bg-blue-900/30 text-blue-400 shadow-sm" : "bg-blue-50 text-blue-700 shadow-sm"
                : isDark ? "text-slate-300 hover:bg-slate-800" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="flex items-center gap-3 text-base">
              <span>{item.icon}</span>
              {item.label}
            </span>
            {item.badge && (
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-200 text-slate-700'
              }`}>
                {item.badge}
              </span>
            )}
          </Link>
        ))}
      </div>

      <hr className={`my-4 mt-0 mb-0 ${isDark ? 'border-slate-800' : 'border-slate-200'}`} />

      <div className="mt-4 flex items-center gap-3">
        <button
          type="button"
          onClick={toggleTheme}
          aria-pressed={isDark}
          className="relative inline-flex items-center h-9 w-16 rounded-full p-1 transition-shadow shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          style={{ backgroundColor: isDark ? '#0f172a' : '#e6eef8' }}
          title="Toggle theme"
        >
          <span
            className={`absolute left-1 top-1 h-7 w-7 rounded-full transform transition-transform ${isDark ? 'translate-x-7' : 'translate-x-0'}`}
            style={{ backgroundColor: isDark ? '#fbbf24' : '#ffffff' }}
          />
          <span className="sr-only">Toggle theme</span>
          <span className="absolute left-2 text-sm" style={{ opacity: isDark ? 1 : 0.0 }}>{'☀️'}</span>
          <span className="absolute right-2 text-sm" style={{ opacity: isDark ? 0.0 : 1 }}>{'🌙'}</span>
        </button>
      </div>
    </aside>
  );
}