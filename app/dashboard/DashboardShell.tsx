"use client";

import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import Sidebar from "./modules/sidebar";
import Header from "./modules/topbar";

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i += 1) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length);
  }
  return null;
};

const setCookie = (name: string, value: string, days: number = 365) => {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = "expires=" + date.toUTCString();
  document.cookie = name + "=" + value + ";" + expires + ";path=/";
};

const translations = {
  en: {
    title: "Dashboard",
    menu: { dashboard: "Home", announcement: "Announcements", article: "Articles", data: "Data", form: "Form" },
    general: { settings: "Settings", help: "Help", logout: "Logout" },
  },
} as const;

export default function DashboardShell({ children }: { children: ReactNode }) {
  const [isDark, setIsDark] = useState(false);
  const pathname = usePathname();
  const t = translations.en;

  useEffect(() => {
    const savedTheme = getCookie("theme");
    const isSavedDark = savedTheme === "dark";
    setIsDark(isSavedDark);
    document.documentElement.classList.toggle("dark", isSavedDark);
    document.documentElement.setAttribute("lang", "en");
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    setCookie("theme", newIsDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", newIsDark);
  };

  const navItems = useMemo(
    () => [
      { label: t.menu.dashboard, icon: <img src="/home.png" alt="" className="max-w-[18px] max-h-[18px]" />, active: pathname === "/dashboard", link: "/dashboard" },
      { label: t.menu.announcement, icon: <img src="/announcement.png" alt="" className="max-w-[18px] max-h-[18px]" />, badge: "12+", active: pathname === "/dashboard/announcement", link: "/dashboard/announcement" },
      { label: t.menu.article, icon: <img src="/article.png" alt="" className="max-w-[18px] max-h-[18px]" />, active: pathname === "/dashboard/articles", link: "/dashboard/articles" },
      { label: t.menu.data, icon: <img src="/data.png" alt="" className="max-w-[18px] max-h-[18px]" />, active: pathname === "/dashboard/data", link: "/dashboard/data" },
      { label: t.menu.form, icon: <img src="/form.png" alt="" className="max-w-[18px] max-h-[18px]" />, active: pathname === "/dashboard/forms", link: "/dashboard/forms" },
    ],
    [pathname]
  );

  const generalItems = useMemo(
    () => [
      { label: t.general.settings, icon: <img src="/settings.png" alt="" className="max-w-[18px] max-h-[18px]" />, active: pathname === "/dashboard/settings", link: "/dashboard/settings" },
      { label: t.general.help, icon: <img src="/help.png" alt="" className="max-w-[18px] max-h-[18px]" />, active: pathname === "/dashboard/help", link: "/dashboard/help" },
      { label: t.general.logout, icon: <img src="/logout.png" alt="" className="max-w-[18px] max-h-[18px]" />, link: "/dashboard/logout" },
    ],
    [pathname]
  );

  const pageTitle = useMemo(() => {
    switch (pathname) {
      case "/dashboard/announcement":
        return "Announcements";
      case "/dashboard/articles":
        return "Articles";
      case "/dashboard/data":
        return "Data";
      case "/dashboard/forms":
        return "Forms";
      case "/dashboard/help":
        return "Help";
      case "/dashboard/settings":
        return "Settings";
      default:
        return t.title;
    }
  }, [pathname, t.title]);

  return (
    <div className={`min-h-screen ${isDark ? "bg-slate-950 text-slate-100" : "bg-slate-100 text-slate-900"}`}>
      <div className="mx-auto min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid min-h-[calc(100vh-48px)] grid-cols-12 gap-6">
          <Sidebar isDark={isDark} toggleTheme={toggleTheme} navItems={navItems} generalItems={generalItems} />
          <main className="col-span-12 lg:col-span-9 flex flex-col gap-6">
            <Header isDark={isDark} title={pageTitle} />
            {React.isValidElement(children) ? React.cloneElement(children as any, { isDark }) : children}
          </main>
        </div>
      </div>
    </div>
  );
}
