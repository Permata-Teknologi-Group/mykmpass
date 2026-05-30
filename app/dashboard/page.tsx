"use client";

import { useEffect, useState } from "react";
import MainContent from "./modules/maincontent";

export default function DashboardPage() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  return (
    <div className="space-y-6">
      <MainContent
        isDark={isDark}
        stats={[
          { title: "Total Projects", value: "24", note: "Increased from last month", highlighted: true },
          { title: "Ended Projects", value: "10", note: "Increased from last month" },
          { title: "Running Projects", value: "12", note: "Increased from last month" },
          { title: "Pending Project", value: "2", note: "On Discuss" },
        ]}
        projects={[
          { title: "Develop API Endpoints", due: "Nov 26, 2024" },
          { title: "Onboarding Flow", due: "Nov 28, 2024" },
          { title: "Build Dashboard", due: "Nov 30, 2024" },
          { title: "Optimize Page Load", due: "Dec 02, 2024" },
          { title: "Cross-Browser Testing", due: "Dec 04, 2024" },
        ]}
        teamMembers={[
          { name: "Alexandra Deff", role: "Working on Github Project Repository", status: "Completed", badge: isDark ? "bg-blue-900/30 text-blue-400" : "bg-blue-100 text-blue-700" },
          { name: "Edwin Adenike", role: "Integrate User Authentication System", status: "In Progress", badge: isDark ? "bg-amber-900/30 text-amber-400" : "bg-amber-100 text-amber-700" },
          { name: "Isaac Oluwatemilorun", role: "Develop Search and Filter Functionality", status: "In Progress", badge: isDark ? "bg-indigo-900/30 text-indigo-400" : "bg-indigo-100 text-indigo-700" },
          { name: "David Oshodi", role: "Responsive Layout for Homepage", status: "Pending", badge: isDark ? "bg-rose-900/30 text-rose-400" : "bg-rose-100 text-rose-700" },
        ]}
        reminders={{ title: "Meeting with Arc Company", time: "02.00 pm - 04.00 pm" }}
      />
    </div>
  );
}
