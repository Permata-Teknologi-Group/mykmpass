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
      {/* Stats */}
      <section className="grid gap-6 xl:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`rounded-[2rem] p-6 shadow-sm ${
              stat.highlighted
                ? "bg-blue-600 text-white"
                : isDark ? "border border-slate-800 bg-slate-900 text-slate-100" : "bg-white text-slate-950"
            }`}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold uppercase tracking-[0.25em]">{stat.title}</p>
              <span className="text-2xl">↗</span>
            </div>
            <p className={`mt-8 text-4xl font-semibold ${stat.highlighted ? "text-white" : isDark ? "text-slate-100" : "text-slate-950"}`}>
              {stat.value}
            </p>
            <p className={`mt-4 text-sm ${stat.highlighted ? "text-blue-100" : isDark ? "text-slate-400" : "text-slate-500"}`}>
              {stat.note}
            </p>
          </div>
        ))}
      </section>

      {/* Analytics + Reminders + Projects */}
      <section className="grid gap-6 xl:grid-cols-[2fr_1fr]">
        <div className={`rounded-[2rem] border p-6 shadow-xl ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.25em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Project Analytics</p>
              <h2 className={`mt-3 text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>Project Analytics</h2>
            </div>
            <span className={`rounded-full px-3 py-2 text-sm font-semibold ${isDark ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-700'}`}>74%</span>
          </div>
          <div className={`mt-8 grid grid-cols-7 gap-3 text-center text-xs ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="space-y-2">
                <div className={`mx-auto h-20 w-12 rounded-3xl ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`} />
                <span>{day}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-[2rem] border p-6 shadow-xl ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm uppercase tracking-[0.25em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Reminders</p>
                <h2 className={`mt-3 text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{reminders.title}</h2>
              </div>
              <button className={`rounded-full px-4 py-2 text-sm transition ${isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                Start Meeting
              </button>
            </div>
            <p className={`mt-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Time: {reminders.time}</p>
          </div>

          <div className={`rounded-[2rem] border p-6 shadow-xl ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm uppercase tracking-[0.25em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Project</p>
                <h2 className={`mt-3 text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>Project List</h2>
              </div>
              <button className={`rounded-full border px-4 py-2 text-sm transition ${isDark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
                + New
              </button>
            </div>
            <div className="mt-6 space-y-3">
              {projects.map((project) => (
                <div key={project.title} className={`rounded-3xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200'}`}>
                  <p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{project.title}</p>
                  <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Due date: {project.due}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team + Progress + Time Tracker */}
      <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className={`rounded-[2rem] border p-6 shadow-xl ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm uppercase tracking-[0.25em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Team Collaboration</p>
              <h2 className={`mt-3 text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>Team Collaboration</h2>
            </div>
            <button className={`rounded-full border px-4 py-2 text-sm transition ${isDark ? 'border-slate-700 text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'}`}>
              + Add Member
            </button>
          </div>
          <div className="mt-6 space-y-4">
            {teamMembers.map((member) => (
              <div key={member.name} className={`flex items-center justify-between gap-4 rounded-3xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200'}`}>
                <div>
                  <p className={`font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{member.name}</p>
                  <p className={`mt-1 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{member.role}</p>
                </div>
                <span className={`${member.badge} rounded-full px-3 py-1 text-sm font-semibold whitespace-nowrap`}>
                  {member.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className={`rounded-[2rem] border p-6 shadow-xl ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <p className={`text-sm uppercase tracking-[0.25em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Project Progress</p>
            <div className="mt-6 flex items-center justify-between gap-4">
              <div>
                <p className={`text-5xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>41%</p>
                <p className={`mt-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Project Ended</p>
              </div>
              <div className={`h-32 w-32 rounded-full p-6 ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                <div className="relative h-full w-full rounded-full bg-blue-600/20">
                  <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-full bg-blue-600" />
                </div>
              </div>
            </div>
            <div className={`mt-6 grid gap-2 text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
              <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-blue-600" /> Completed</div>
              <div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${isDark ? 'bg-slate-400' : 'bg-slate-400'}`} /> In Progress</div>
              <div className="flex items-center gap-2"><span className={`h-2 w-2 rounded-full ${isDark ? 'bg-slate-600' : 'bg-slate-200'}`} /> Pending</div>
            </div>
          </div>

          <div className={`rounded-[2rem] border p-6 shadow-xl ${isDark ? 'border-slate-800 bg-slate-900' : 'border-slate-200 bg-white'}`}>
            <p className={`text-sm uppercase tracking-[0.25em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Time Tracker</p>
            <div className={`mt-6 rounded-[2rem] p-6 text-center ${isDark ? 'bg-blue-900/20' : 'bg-blue-950/10'}`}>
              <p className={`text-4xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>01:24:08</p>
              <div className="mt-4 flex items-center justify-center gap-3">
                <button className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isDark ? 'bg-slate-700 text-white hover:bg-slate-600' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>Pause</button>
                <button className={`rounded-full px-4 py-2 text-sm font-semibold shadow transition ${isDark ? 'bg-slate-800 text-slate-100 hover:bg-slate-700' : 'bg-white text-slate-900 hover:bg-slate-100'}`}>Stop</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}