export default function DashboardHelpPage({ isDark = false }: { isDark?: boolean }) {
  return (
    <section className="space-y-6">
      <div className={`rounded-[2rem] border p-6 shadow-xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
        <p className={`text-sm uppercase tracking-[0.25em] ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Support center</p>
        <h2 className={`mt-3 text-xl font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>Help & FAQs</h2>
      </div>
      <div className="grid gap-4">
        {[
          { question: "How do I reset my password?", answer: "Go to settings and choose Change Password, then follow the steps." },
          { question: "How do I invite team members?", answer: "Use the Team Collaboration page to invite new users with roles." },
          { question: "Where can I download reports?", answer: "Reports are available on the Data page, under latest reports." },
        ].map((faq) => (
          <div key={faq.question} className={`rounded-[2rem] border p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h3 className={`text-lg font-semibold ${isDark ? 'text-slate-100' : 'text-slate-950'}`}>{faq.question}</h3>
            <p className={`mt-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{faq.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
