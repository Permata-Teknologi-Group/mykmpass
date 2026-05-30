'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import axios from 'axios';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  thumbnail: string | null;
  status: string;
  category_id: string | null;
  author_id: string | null;
  views: number;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_COLORS: Record<string, { light: string; dark: string }> = {
  draft:     { light: 'bg-slate-100 text-slate-600',   dark: 'bg-slate-800 text-slate-300' },
  published: { light: 'bg-green-100 text-green-700',   dark: 'bg-green-900/30 text-green-300' },
  archived:  { light: 'bg-amber-100 text-amber-700',   dark: 'bg-amber-900/30 text-amber-300' },
};

const EMPTY_FORM = {
  title: '',
  content: '',
  excerpt: '',
  thumbnail: '',
  status: 'draft',
  category_id: '',
};

type View = 'list' | 'read';

export default function DashboardArticlesPage({ isDark = false }: { isDark?: boolean }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [view, setView] = useState<View>('list');
  const [readArticle, setReadArticle] = useState<Article | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Article | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // ── Fetch ──
  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [artRes, catRes] = await Promise.all([
        api.get('/articles'),
        api.get('/articles/categories'),
      ]);
      setArticles(artRes.data);
      setCategories(catRes.data);
    } catch {
      setError('Gagal memuat artikel.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Filtered list ──
  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      (a.excerpt ?? '').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus ? a.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  // ── Read article ──
  const handleRead = async (a: Article) => {
    try {
      const res = await api.get(`/articles/${a.id}`);
      setReadArticle(res.data);
      setView('read');
    } catch {
      setReadArticle(a);
      setView('read');
    }
  };

  // ── Modal ──
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (a: Article) => {
    setEditTarget(a);
    setForm({
      title: a.title,
      content: a.content,
      excerpt: a.excerpt ?? '',
      thumbnail: a.thumbnail ?? '',
      status: a.status,
      category_id: a.category_id ?? '',
    });
    setShowModal(true);
  };

  // ── Save ──
  const handleSave = async () => {
    if (!form.title || !form.content) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        excerpt: form.excerpt || null,
        thumbnail: form.thumbnail || null,
        category_id: form.category_id || null,
      };
      if (editTarget) {
        await api.put(`/articles/${editTarget.id}`, payload);
      } else {
        await api.post('/articles', payload);
      }
      setShowModal(false);
      fetchAll();
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
      await api.delete(`/articles/${id}`);
      setDeleteId(null);
      if (readArticle?.id === id) setView('list');
      fetchAll();
    } catch {
      setError('Gagal menghapus artikel.');
    }
  };

  // ── Save category ──
  const handleSaveCategory = async () => {
    if (!newCategory) return;
    setSavingCategory(true);
    try {
      await api.post('/articles/categories', { name: newCategory });
      setNewCategory('');
      setShowCategoryModal(false);
      fetchAll();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? 'Gagal membuat kategori.');
      }
    } finally {
      setSavingCategory(false);
    }
  };

  // ── Styles ──
  const card = `rounded-[2rem] border p-6 shadow-xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`;
  const text = isDark ? 'text-slate-100' : 'text-slate-950';
  const subtext = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = `w-full px-4 py-2 rounded-xl border outline-none transition focus:ring-2 focus:ring-blue-500 ${
    isDark
      ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
  }`;
  const modalBg = `rounded-[2rem] border shadow-2xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`;

  // ════════════════════════════════════════
  // Read view
  // ════════════════════════════════════════
  if (view === 'read' && readArticle) {
    const cat = categories.find((c) => c.id === readArticle.category_id);
    return (
      <section className="space-y-6">
        <div className={`${card} flex items-center justify-between`}>
          <button
            onClick={() => setView('list')}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            ← Kembali
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={() => openEdit(readArticle)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Edit
            </button>
            <button
              onClick={() => setDeleteId(readArticle.id)}
              className="rounded-full px-4 py-2 text-sm font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
            >
              Hapus
            </button>
          </div>
        </div>

        <article className={card}>
          {readArticle.thumbnail && (
            <img
              src={readArticle.thumbnail}
              alt={readArticle.title}
              className="w-full h-64 object-cover rounded-2xl mb-6"
            />
          )}
          <div className="flex items-center gap-2 mb-4">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
              isDark ? STATUS_COLORS[readArticle.status]?.dark : STATUS_COLORS[readArticle.status]?.light
            }`}>
              {readArticle.status}
            </span>
            {cat && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'
              }`}>
                {cat.name}
              </span>
            )}
            <span className={`text-xs ${subtext}`}>{readArticle.views} views</span>
          </div>
          <h1 className={`text-3xl font-bold mb-3 ${text}`}>{readArticle.title}</h1>
          {readArticle.excerpt && (
            <p className={`text-lg mb-6 ${subtext}`}>{readArticle.excerpt}</p>
          )}
          <p className={`text-sm mb-6 ${subtext}`}>
            {readArticle.published_at
              ? `Dipublish ${new Date(readArticle.published_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
              : `Dibuat ${new Date(readArticle.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`
            }
          </p>
          <div className={`prose max-w-none whitespace-pre-wrap ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            {readArticle.content}
          </div>
        </article>

        {/* Delete confirm */}
        {deleteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className={`w-full max-w-sm ${modalBg} p-8`}>
              <h2 className={`text-lg font-semibold mb-3 ${text}`}>Hapus Artikel?</h2>
              <p className={`text-sm mb-6 ${subtext}`}>Tindakan ini tidak bisa dibatalkan.</p>
              <div className="flex justify-end gap-3">
                <button onClick={() => setDeleteId(null)} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Batal</button>
                <button onClick={() => handleDelete(deleteId)} className="rounded-full bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-sm font-semibold transition">Hapus</button>
              </div>
            </div>
          </div>
        )}

        {/* Edit modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-8 overflow-y-auto">
            <div className={`w-full max-w-2xl ${modalBg} p-8`}>
              <h2 className={`text-xl font-semibold mb-6 ${text}`}>Edit Artikel</h2>
              {renderModalForm()}
            </div>
          </div>
        )}
      </section>
    );
  }

  // ════════════════════════════════════════
  // Modal form content (reused)
  // ════════════════════════════════════════
  function renderModalForm() {
    return (
      <>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${subtext}`}>Judul</label>
            <input className={inputCls} placeholder="Judul artikel" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${subtext}`}>Excerpt</label>
            <input className={inputCls} placeholder="Ringkasan singkat (opsional)" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${subtext}`}>Konten</label>
            <textarea className={`${inputCls} resize-none`} rows={8} placeholder="Isi artikel..." value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${subtext}`}>Thumbnail URL</label>
            <input className={inputCls} placeholder="https://..." value={form.thumbnail} onChange={(e) => setForm({ ...form, thumbnail: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1 ${subtext}`}>Status</label>
              <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1 ${subtext}`}>Kategori</label>
              <div className="flex gap-2">
                <select className={inputCls} value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })}>
                  <option value="">— Pilih kategori —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <button type="button" onClick={() => setShowCategoryModal(true)} className={`flex-shrink-0 rounded-xl px-3 text-sm font-semibold transition ${isDark ? 'bg-slate-700 text-slate-200 hover:bg-slate-600' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>+</button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={() => setShowModal(false)} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Batal</button>
          <button onClick={handleSave} disabled={saving || !form.title || !form.content} className="rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 text-sm font-semibold transition">
            {saving ? 'Menyimpan...' : 'Simpan'}
          </button>
        </div>
      </>
    );
  }

  // ════════════════════════════════════════
  // List view
  // ════════════════════════════════════════
  return (
    <section className="space-y-6">

      {/* Header */}
      <div className={`${card} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <p className={`text-sm uppercase tracking-[0.25em] ${subtext}`}>Knowledge base</p>
          <h2 className={`mt-3 text-xl font-semibold ${text}`}>Articles</h2>
        </div>
        <button
          onClick={openCreate}
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold transition"
        >
          + New Article
        </button>
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          className={`flex-1 ${inputCls}`}
          placeholder="Cari artikel..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className={`sm:w-40 ${inputCls}`}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Semua status</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-2xl bg-rose-100 border border-rose-300 text-rose-700 px-5 py-3 text-sm">{error}</div>
      )}

      {/* Loading */}
      {loading && (
        <div className={`rounded-[2rem] border p-10 text-center ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
          Memuat artikel...
        </div>
      )}

      {/* Empty */}
      {!loading && filtered.length === 0 && (
        <div className={`rounded-[2rem] border p-10 text-center ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
          {search || filterStatus ? 'Tidak ada artikel yang cocok.' : 'Belum ada artikel.'}
        </div>
      )}

      {/* Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.map((a) => {
          const cat = categories.find((c) => c.id === a.category_id);
          return (
            <article
              key={a.id}
              className={`rounded-[2rem] border p-6 shadow-sm flex flex-col gap-4 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}
            >
              {a.thumbnail && (
                <img src={a.thumbnail} alt={a.title} className="w-full h-40 object-cover rounded-2xl" />
              )}
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isDark ? STATUS_COLORS[a.status]?.dark : STATUS_COLORS[a.status]?.light}`}>
                  {a.status}
                </span>
                {cat && (
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-100 text-blue-700'}`}>
                    {cat.name}
                  </span>
                )}
                <span className={`text-xs ${subtext}`}>{a.views} views</span>
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${text}`}>{a.title}</h3>
                {a.excerpt && (
                  <p className={`mt-2 text-sm line-clamp-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>{a.excerpt}</p>
                )}
                <p className={`mt-1 text-xs ${subtext}`}>
                  {new Date(a.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleRead(a)}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 text-sm font-semibold transition"
                >
                  Read more
                </button>
                <button
                  onClick={() => openEdit(a)}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(a.id)}
                  className="rounded-full px-4 py-2 text-sm font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                >
                  Hapus
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className={`w-full max-w-2xl ${modalBg} p-8`}>
            <h2 className={`text-xl font-semibold mb-6 ${text}`}>
              {editTarget ? 'Edit Artikel' : 'Buat Artikel Baru'}
            </h2>
            {renderModalForm()}
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className={`w-full max-w-sm ${modalBg} p-8`}>
            <h2 className={`text-lg font-semibold mb-3 ${text}`}>Hapus Artikel?</h2>
            <p className={`text-sm mb-6 ${subtext}`}>Tindakan ini tidak bisa dibatalkan.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setDeleteId(null)} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Batal</button>
              <button onClick={() => handleDelete(deleteId)} className="rounded-full bg-rose-600 hover:bg-rose-700 text-white px-5 py-2 text-sm font-semibold transition">Hapus</button>
            </div>
          </div>
        </div>
      )}

      {/* ── New Category Modal ── */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 px-4">
          <div className={`w-full max-w-sm ${modalBg} p-8`}>
            <h2 className={`text-lg font-semibold mb-4 ${text}`}>Kategori Baru</h2>
            <input
              className={inputCls}
              placeholder="Nama kategori"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={() => setShowCategoryModal(false)} className={`rounded-full px-5 py-2 text-sm font-semibold transition ${isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>Batal</button>
              <button onClick={handleSaveCategory} disabled={savingCategory || !newCategory} className="rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 text-sm font-semibold transition">
                {savingCategory ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

    </section>
  );
}