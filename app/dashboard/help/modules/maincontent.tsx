"use client";

interface Stat {
  title: string;
  value: string;
  note: string;
  highlighted?: boolean;
}

interface Project {
  title: string;
  due: string;
}

interface TeamMember {
  name: string;
  role: string;
  status: string;
  badge: string;
}

interface MainContentProps {
  isDark: boolean;
  stats: Stat[];
  projects: Project[];
  teamMembers: TeamMember[];
  reminders: { title: string; time: string };
}

export default function MainContent({ isDark, stats, projects, teamMembers, reminders }: MainContentProps) {
  return (
    <>
      <div className={`rounded-[2rem] min-w-full border p-6 shadow-xl ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
        <h2 className={`mb-4 text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-900'}`}>Help & Support</h2>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Welcome to the help center! Here you can find FAQs, contact support, and access resources to assist you with any issues or questions you may have.
        </p>
        <br />
        <hr className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}/>
        <br />
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>&copy; 2026 Katedral Medan. All rights reserved.</p>
        <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>&copy; 2026 Permata Teknologi Group. All rights reserved.</p>
      </div>
    </>
  );
}