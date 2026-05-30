'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import axios from 'axios';

interface Announcement {
  id: string;
  title: string;
  content: string;
  priority: string;
  status: string;
  author_id: string | null;
  target_audience: string[];
  attachment: string | null;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
}

const PRIORITY_COLORS: Record<string, { light: string; dark: string }> = {
  low:    { light: 'bg-slate-100 text-slate-600',   dark: 'bg-slate-800 text-slate-300' },
  medium: { light: 'bg-blue-100 text-blue-700',     dark: 'bg-blue-900/30 text-blue-300' },
  high:   { light: 'bg-amber-100 text-amber-700',   dark: 'bg-amber-900/30 text-amber-300' },
  urgent: { light: 'bg-rose-100 text-rose-700',     dark: 'bg-rose-900/30 text-rose-300' },
};

const STATUS_COLORS: Record<string, { light: string; dark: string }> = {
  draft:     { light: 'bg-slate-100 text-slate-600',   dark: 'bg-slate-800 text-slate-300' },
  published: { light: 'bg-green-100 text-green-700',   dark: 'bg-green-900/30 text-green-300' },
  expired:   { light: 'bg-rose-100 text-rose-600',     dark: 'bg-rose-900/30 text-rose-300' },
};

const EMPTY_FORM = {
  title: '',
  content: '',
  priority: 'medium',
  status: 'draft',
  target_audience: [] as string[],
  attachment: '',
  starts_at: '',
  expires_at: '',
};

export default function DashboardAnnouncementsPage({ isDark = false }: { isDark?: boolean }) {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Announcement | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // ── Fetch ──
  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/announcements');
      setAnnouncements(res.data);
    } catch {
      setError('Gagal memuat pengumuman.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnnouncements(); }, []);

  // ── Open modal ──
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (a: Announcement) => {
    setEditTarget(a);
    setForm({
      title: a.title,
      content: a.content,
      priority: a.priority,
      status: a.status,
      target_audience: a.target_audience,
      attachment: a.attachment ?? '',
      starts_at: a.starts_at ?? '',
      expires_at: a.expires_at ?? '',
    });
    setShowModal(true);
  };

  // ── Save (create or update) ──
  const handleSave = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        attachment: form.attachment || null,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
      };
      if (editTarget) {
        await api.put(`/announcements/${editTarget.id}`, payload);
      } else {
        await api.post('/announcements', payload);
      }
      setShowModal(false);
      fetchAnnouncements();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? 'Gagal menyimpan.');
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/announcements/${id}`);
      setDeleteId(null);
      fetchAnnouncements();
    } catch {
      setError('Gagal menghapus pengumuman.');
    }
  };

  const card = `rounded-[2rem] border p-6 shadow-xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`;
  const text = isDark ? 'text-slate-100' : 'text-slate-950';
  const subtext = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = `w-full px-4 py-2 rounded-xl border outline-none transition focus:ring-2 focus:ring-blue-500 ${
    isDark ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500' : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
  }`;

  return (
    <section className="space-y-6">

      {/* Header */}
      <div className={`${card} flex items-center justify-between`}>
        <div>
          <p className={`text-sm uppercase tracking-[0.25em] ${subtext}`}>Latest announcements</p>
          <h2 className={`mt-3 text-xl font-semibold ${text}`}>Announcements</h2>
        </div>
        <button
          onClick={openCreate}
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold transition"
        >
          + New
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-rose-100 border border-rose-300 text-rose-700 px-5 py-3 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className={`rounded-[2rem] border p-10 text-center ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
          Memuat pengumuman...
        </div>
      )}

      {/* Empty */}
      {!loading && announcements.length === 0 && (
        <div className={`rounded-[2rem] border p-10 text-center ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
          Belum ada pengumuman.
        </div>
      )}

      {/* List */}
      <div className="grid gap-4">
        {announcements.map((a) => (
          <article key={a.id} className={`rounded-[2rem] border p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold ${text}`}>{a.title}</h3>
                <p className={`text-sm mt-1 ${subtext}`}>
                  {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Priority badge */}
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isDark ? PRIORITY_COLORS[a.priority]?.dark : PRIORITY_COLORS[a.priority]?.light
                }`}>
                  {a.priority}
                </span>
                {/* Status badge */}
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isDark ? STATUS_COLORS[a.status]?.dark : STATUS_COLORS[a.status]?.light
                }`}>
                  {a.status}
                </span>
                {/* Edit */}
                <button
                  onClick={() => openEdit(a)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Edit
                </button>
                {/* Delete */}
                <button
                  onClick={() => setDeleteId(a.id)}
                  className="rounded-full px-3 py-1 text-xs font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                >
                  Hapus
                </button>
              </div>
            </div>
            <p className={`mt-4 text-sm leading-relaxed ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              {a.content}
            </p>
          </article>
        ))}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className={`w-full max-w-lg rounded-[2rem] border p-8 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-xl font-semibold mb-6 ${text}`}>
              {editTarget ? 'Edit Pengumuman' : 'Buat Pengumuman'}
            </h2>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${subtext}`}>Judul</label>
                <input
                  className={inputCls}
                  placeholder="Judul pengumuman"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${subtext}`}>Konten</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={4}
                  placeholder="Isi pengumuman..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subtext}`}>Priority</label>
                  <select
                    className={inputCls}
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subtext}`}>Status</label>
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="expired">Expired</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subtext}`}>Mulai</label>
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={form.starts_at}
                    onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subtext}`}>Berakhir</label>
                  <input
                    type="datetime-local"
                    className={inputCls}
                    value={form.expires_at}
                    onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${subtext}`}>Attachment URL</label>
                <input
                  className={inputCls}
                  placeholder="https://..."
                  value={form.attachment}
                  onChange={(e) => setForm({ ...form, attachment: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.content}
                className="rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 text-sm font-semibold transition"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className={`w-full max-w-sm rounded-[2rem] border p-8 shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <h2 className={`text-lg font-semibold mb-3 ${text}`}>Hapus Pengumuman?</h2>
            <p className={`text-sm mb-6 ${subtext}`}>Tindakan ini tidak bisa dibatalkan.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Batal
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="rounded-full bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-sm font-semibold transition"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}