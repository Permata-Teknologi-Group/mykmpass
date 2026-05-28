"use client";

import { useEffect, useState } from "react";
import Sidebar from "../modules/sidebar";
import Header from "../modules/topbar";
import MainContent from "../modules/maincontent";
import { link } from "fs";

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

const setCookie = (name: string, value: string, days: number = 365) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + date.toUTCString();
  document.cookie = name + '=' + value + ';' + expires + ';path=/';
};

const translations = {
  en: {
    title: 'Dashboard',
    menu: { dashboard: 'Home', announcement: 'Announcements', article: 'Articles', data: 'Data', form: 'Form' },
    general: { settings: 'Settings', help: 'Help', logout: 'Logout' },
    stats: { total: 'Total Projects', ended: 'Ended Projects', running: 'Running Projects', pending: 'Pending Project' },
  },
} as const;

export default function UserDashboard() {
  const [isDark, setIsDark] = useState(false);
  const t = translations.en;

  useEffect(() => {
    const savedTheme = getCookie('theme');
    const isSavedDark = savedTheme === 'dark';
    setIsDark(isSavedDark);
    document.documentElement.classList.toggle('dark', isSavedDark);
    document.documentElement.setAttribute('lang', 'en');
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    setCookie('theme', newIsDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newIsDark);
  };

  const navItems = [
    { label: t.menu.dashboard, icon: <img src="/home.png" alt="" className="max-w-[18px] max-h-[18px]" />, link: "/dashboard" },
    { label: t.menu.announcement, icon: <img src="/announcement.png" alt="" className="max-w-[18px] max-h-[18px]" />, badge: "12+", link: "/dashboard/announcement" },
    { label: t.menu.article, icon: <img src="/article.png" alt="" className="max-w-[18px] max-h-[18px]" />, active: true, link: "/dashboard/articles" },
    { label: t.menu.data, icon: <img src="/data.png" alt="" className="max-w-[18px] max-h-[18px]" />, link: "/dashboard/data" },
    { label: t.menu.form, icon: <img src="/form.png" alt="" className="max-w-[18px] max-h-[18px]" />, link: "/dashboard/forms" },
  ];

  const generalItems = [
    { label: t.general.settings, icon: <img src="/settings.png" alt="" className="max-w-[18px] max-h-[18px]" />, link: "/dashboard/settings" },
    { label: t.general.help, icon: <img src="/help.png" alt="" className="max-w-[18px] max-h-[18px]" />, link: "/dashboard/help" },
    { label: t.general.logout, icon: <img src="/logout.png" alt="" className="max-w-[18px] max-h-[18px]" />, link: "/dashboard/logout" },
  ];

  const stats = [
    { title: t.stats.total, value: "24", note: "Increased from last month", highlighted: true },
    { title: t.stats.ended, value: "10", note: "Increased from last month" },
    { title: t.stats.running, value: "12", note: "Increased from last month" },
    { title: t.stats.pending, value: "2", note: "On Discuss" },
  ];

  const teamMembers = [
    { name: "Alexandra Deff", role: "Working on Github Project Repository", status: "Completed", badge: isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700" },
    { name: "Edwin Adenike", role: "Working on Integrate User Authentication System", status: "In Progress", badge: isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700" },
    { name: "Isaac Oluwatemilorun", role: "Working on Develop Search and Filter Functionality", status: "In Progress", badge: isDark ? "bg-indigo-900/30 text-indigo-400" : "bg-indigo-100 text-indigo-700" },
    { name: "David Oshodi", role: "Working on Responsive Layout for Homepage", status: "Pending", badge: isDark ? "bg-rose-900/30 text-rose-400" : "bg-rose-100 text-rose-700" },
  ];

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'}`}>
      <div className="mx-auto min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid min-h-[calc(100vh-48px)] grid-cols-12 gap-6">
          <Sidebar isDark={isDark} toggleTheme={toggleTheme} navItems={navItems} generalItems={generalItems} />
          <main className="col-span-12 lg:col-span-9 flex flex-col gap-6">
            <Header isDark={isDark} title={t.title} />
            <MainContent
              isDark={isDark}
              stats={stats}
              projects={[
                { title: "Develop API Endpoints", due: "Nov 26, 2024" },
                { title: "Onboarding Flow", due: "Nov 28, 2024" },
                { title: "Build Dashboard", due: "Nov 30, 2024" },
                { title: "Optimize Page Load", due: "Dec 02, 2024" },
                { title: "Cross-Browser Testing", due: "Dec 04, 2024" },
              ]}
              teamMembers={teamMembers}
              reminders={{ title: "Meeting with Arc Company", time: "02.00 pm - 04.00 pm" }}
            />
          </main>
        </div>
      </div>
    </div>
  );
}