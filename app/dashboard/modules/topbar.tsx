"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/auth";

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length);
  }
  return null;
};

interface HeaderProps {
  isDark: boolean;
  title: string;
}

export default function Header({ isDark, title }: HeaderProps) {
  const user = useAuthStore((s) => s.user);   // ← ambil dari Zustand store
  const [initial, setInitial] = useState('?');

  useEffect(() => {
    if (user?.username) {
      setInitial(user.username.charAt(0).toUpperCase());
    }
  }, [user]);

  return (
    <header className={`flex flex-col max-h-[6rem] gap-4 rounded-[2rem] border p-6 shadow-xl sm:flex-row sm:items-center sm:justify-between ${
      isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'
    }`}>
      <div>
        <h1 className={`text-3xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>
          {title}
        </h1>
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className={`inline-flex items-center gap-3 rounded-full border px-4 py-3 ${
          isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'
        }`}>
          {/* Avatar — initial dari username */}
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold">
            {initial}
          </div>
          <div>
            <p className={`text-sm font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>
              {user?.username ?? getCookie('user') ?? 'Guest'}
            </p>
            <p className={`text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              {user?.email ?? ''}
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}