export default function DashboardDataPage({ isDark = false }: { isDark?: boolean }) {
  return (
    <section className="space-y-6">
      <div className={`rounded-[2rem] border p-6 shadow-xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <p className={`text-sm uppercase tracking-[0.25em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Data insights</p>
        <h2 className={`mt-3 text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>Data</h2>
      </div>
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <div className={`rounded-[2rem] border p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Overview</p>
          <div className="mt-6 space-y-4">
            <div className={`rounded-3xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total records</p>
              <p className={`mt-2 text-3xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>12,482</p>
            </div>
            <div className={`rounded-3xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>New this week</p>
              <p className={`mt-2 text-3xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>1,204</p>
            </div>
          </div>
        </div>
        <div className={`rounded-[2rem] border p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
          <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Latest reports</p>
          <div className={`mt-6 space-y-3 text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            <div className={`flex items-center justify-between rounded-3xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <span>Sales Volume</span>
              <span className="font-semibold">+18%</span>
            </div>
            <div className={`flex items-center justify-between rounded-3xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <span>Customer Growth</span>
              <span className="font-semibold">+12%</span>
            </div>
            <div className={`flex items-center justify-between rounded-3xl p-4 ${isDark ? 'bg-slate-800' : 'bg-slate-50'}`}>
              <span>Response Time</span>
              <span className="font-semibold">0.8s</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
