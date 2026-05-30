'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import axios from 'axios';

interface FormField {
  id: string;
  label: string;
  field_type: string;
  placeholder: string | null;
  is_required: boolean;
  options: string[];
  order: number;
}

interface Form {
  id: string;
  title: string;
  description: string | null;
  status: string;
  author_id: string | null;
  is_anonymous: boolean;
  max_responses: number | null;
  starts_at: string | null;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  fields: FormField[];
}

const STATUS_COLORS: Record<string, { light: string; dark: string }> = {
  draft:     { light: 'bg-slate-100 text-slate-600',   dark: 'bg-slate-800 text-slate-300' },
  published: { light: 'bg-green-100 text-green-700',   dark: 'bg-green-900/30 text-green-300' },
  closed:    { light: 'bg-rose-100 text-rose-700',     dark: 'bg-rose-900/30 text-rose-300' },
};

const FIELD_TYPES = [
  { value: 'text',     label: 'Text' },
  { value: 'textarea', label: 'Textarea' },
  { value: 'number',   label: 'Number' },
  { value: 'email',    label: 'Email' },
  { value: 'phone',    label: 'Phone' },
  { value: 'date',     label: 'Date' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkbox', label: 'Checkbox' },
  { value: 'radio',    label: 'Radio' },
  { value: 'file',     label: 'File Upload' },
];

const EMPTY_FIELD = (): Omit<FormField, 'id'> => ({
  label: '',
  field_type: 'text',
  placeholder: '',
  is_required: false,
  options: [],
  order: 0,
});

const EMPTY_FORM = {
  title: '',
  description: '',
  status: 'draft',
  is_anonymous: false,
  max_responses: '' as string | number,
  starts_at: '',
  expires_at: '',
  fields: [] as Omit<FormField, 'id'>[],
};

export default function DashboardFormsPage({ isDark = false }: { isDark?: boolean }) {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Form | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [viewResponses, setViewResponses] = useState<Form | null>(null);
  const [responses, setResponses] = useState<any[]>([]);
  const [loadingResponses, setLoadingResponses] = useState(false);

  // ── Fetch forms ──
  const fetchForms = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/forms');
      setForms(res.data);
    } catch {
      setError('Gagal memuat form.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchForms(); }, []);

  // ── Open modal ──
  const openCreate = () => {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEdit = (f: Form) => {
    setEditTarget(f);
    setForm({
      title: f.title,
      description: f.description ?? '',
      status: f.status,
      is_anonymous: f.is_anonymous,
      max_responses: f.max_responses ?? '',
      starts_at: f.starts_at ?? '',
      expires_at: f.expires_at ?? '',
      fields: f.fields.map(({ id, ...rest }) => rest),
    });
    setShowModal(true);
  };

  // ── Field helpers ──
  const addField = () => {
    setForm((prev) => ({
      ...prev,
      fields: [...prev.fields, { ...EMPTY_FIELD(), order: prev.fields.length }],
    }));
  };

  const updateField = (index: number, key: string, value: any) => {
    setForm((prev) => {
      const fields = [...prev.fields];
      fields[index] = { ...fields[index], [key]: value };
      return { ...prev, fields };
    });
  };

  const removeField = (index: number) => {
    setForm((prev) => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index),
    }));
  };

  // ── Save ──
  const handleSave = async () => {
    if (!form.title) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        max_responses: form.max_responses === '' ? null : Number(form.max_responses),
        description: form.description || null,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
        fields: form.fields.map((f, i) => ({
          ...f,
          placeholder: f.placeholder || null,
          order: i,
        })),
      };
      if (editTarget) {
        await api.put(`/forms/${editTarget.id}`, payload);
      } else {
        await api.post('/forms', payload);
      }
      setShowModal(false);
      fetchForms();
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? 'Gagal menyimpan form.');
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ──
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/forms/${id}`);
      setDeleteId(null);
      fetchForms();
    } catch {
      setError('Gagal menghapus form.');
    }
  };

  // ── View responses ──
  const handleViewResponses = async (f: Form) => {
    setViewResponses(f);
    setLoadingResponses(true);
    try {
      const res = await api.get(`/forms/${f.id}/responses`);
      setResponses(res.data);
    } catch {
      setResponses([]);
    } finally {
      setLoadingResponses(false);
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

  return (
    <section className="space-y-6">

      {/* Header */}
      <div className={`${card} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <p className={`text-sm uppercase tracking-[0.25em] ${subtext}`}>Form manager</p>
          <h2 className={`mt-3 text-xl font-semibold ${text}`}>Forms</h2>
        </div>
        <button
          onClick={openCreate}
          className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold transition"
        >
          + Create new form
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
          Memuat form...
        </div>
      )}

      {/* Empty */}
      {!loading && forms.length === 0 && (
        <div className={`rounded-[2rem] border p-10 text-center ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
          Belum ada form.
        </div>
      )}

      {/* List */}
      <div className="grid gap-4">
        {forms.map((f) => (
          <div key={f.id} className={`rounded-[2rem] border p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className={`text-lg font-semibold ${text}`}>{f.title}</h3>
                {f.description && (
                  <p className={`text-sm mt-1 ${subtext}`}>{f.description}</p>
                )}
                <p className={`text-sm mt-1 ${subtext}`}>
                  {f.fields.length} field · {f.is_anonymous ? 'Anonim' : 'Login required'}
                  {f.max_responses ? ` · Maks ${f.max_responses} respons` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  isDark ? STATUS_COLORS[f.status]?.dark : STATUS_COLORS[f.status]?.light
                }`}>
                  {f.status}
                </span>
                <button
                  onClick={() => handleViewResponses(f)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    isDark ? 'bg-indigo-900/30 text-indigo-300 hover:bg-indigo-900/50' : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  }`}
                >
                  Responses
                </button>
                <button
                  onClick={() => openEdit(f)}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Edit
                </button>
                <button
                  onClick={() => setDeleteId(f.id)}
                  className="rounded-full px-3 py-1 text-xs font-semibold bg-rose-100 text-rose-700 hover:bg-rose-200 transition"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Create / Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className={`w-full max-w-2xl ${modalBg} p-8`}>
            <h2 className={`text-xl font-semibold mb-6 ${text}`}>
              {editTarget ? 'Edit Form' : 'Buat Form Baru'}
            </h2>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${subtext}`}>Judul Form</label>
                <input
                  className={inputCls}
                  placeholder="Judul form"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              {/* Description */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${subtext}`}>Deskripsi</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  placeholder="Deskripsi form (opsional)"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subtext}`}>Status</label>
                  <select
                    className={inputCls}
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                  >
                    <option value="draft">Draft</option>
                    <option value="published">Published</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>

                {/* Max responses */}
                <div>
                  <label className={`block text-sm font-medium mb-1 ${subtext}`}>Maks Respons</label>
                  <input
                    type="number"
                    className={inputCls}
                    placeholder="Unlimited"
                    value={form.max_responses}
                    onChange={(e) => setForm({ ...form, max_responses: e.target.value })}
                  />
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

              {/* Anonymous toggle */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setForm({ ...form, is_anonymous: !form.is_anonymous })}
                  className={`relative inline-flex h-6 w-11 rounded-full transition ${form.is_anonymous ? 'bg-blue-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'}`}
                >
                  <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transform transition mt-1 ${form.is_anonymous ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <label className={`text-sm ${subtext}`}>Allow anonymous responses</label>
              </div>

              {/* ── Fields Builder ── */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className={`text-sm font-semibold ${text}`}>Fields ({form.fields.length})</label>
                  <button
                    type="button"
                    onClick={addField}
                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-xs font-semibold transition"
                  >
                    + Add field
                  </button>
                </div>

                <div className="space-y-4">
                  {form.fields.map((field, i) => (
                    <div key={i} className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs font-semibold ${subtext}`}>Field {i + 1}</span>
                        <button
                          type="button"
                          onClick={() => removeField(i)}
                          className="text-rose-500 hover:text-rose-600 text-xs font-semibold"
                        >
                          Hapus
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className={`block text-xs mb-1 ${subtext}`}>Label</label>
                          <input
                            className={inputCls}
                            placeholder="Label"
                            value={field.label}
                            onChange={(e) => updateField(i, 'label', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs mb-1 ${subtext}`}>Tipe</label>
                          <select
                            className={inputCls}
                            value={field.field_type}
                            onChange={(e) => updateField(i, 'field_type', e.target.value)}
                          >
                            {FIELD_TYPES.map((t) => (
                              <option key={t.value} value={t.value}>{t.label}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className={`block text-xs mb-1 ${subtext}`}>Placeholder</label>
                        <input
                          className={inputCls}
                          placeholder="Placeholder (opsional)"
                          value={field.placeholder ?? ''}
                          onChange={(e) => updateField(i, 'placeholder', e.target.value)}
                        />
                      </div>

                      {/* Options — untuk dropdown/checkbox/radio */}
                      {['dropdown', 'checkbox', 'radio'].includes(field.field_type) && (
                        <div className="mt-3">
                          <label className={`block text-xs mb-1 ${subtext}`}>Options (satu per baris)</label>
                          <textarea
                            className={`${inputCls} resize-none`}
                            rows={3}
                            placeholder="Option 1&#10;Option 2&#10;Option 3"
                            value={field.options.join('\n')}
                            onChange={(e) => updateField(i, 'options', e.target.value.split('\n').filter(Boolean))}
                          />
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateField(i, 'is_required', !field.is_required)}
                          className={`relative inline-flex h-5 w-9 rounded-full transition ${field.is_required ? 'bg-blue-600' : isDark ? 'bg-slate-700' : 'bg-slate-300'}`}
                        >
                          <span className={`inline-block h-3 w-3 rounded-full bg-white shadow transform transition mt-1 ${field.is_required ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                        <span className={`text-xs ${subtext}`}>Required</span>
                      </div>
                    </div>
                  ))}
                </div>
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
                disabled={saving || !form.title}
                className="rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-5 py-2 text-sm font-semibold transition"
              >
                {saving ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm ── */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className={`w-full max-w-sm ${modalBg} p-8`}>
            <h2 className={`text-lg font-semibold mb-3 ${text}`}>Hapus Form?</h2>
            <p className={`text-sm mb-6 ${subtext}`}>Semua field dan respons akan ikut terhapus.</p>
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

      {/* ── View Responses Modal ── */}
      {viewResponses && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 px-4 py-8 overflow-y-auto">
          <div className={`w-full max-w-2xl ${modalBg} p-8`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className={`text-xl font-semibold ${text}`}>
                Responses — {viewResponses.title}
              </h2>
              <button
                onClick={() => setViewResponses(null)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${
                  isDark ? 'bg-slate-800 text-slate-200 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Tutup
              </button>
            </div>

            {loadingResponses && (
              <p className={`text-center ${subtext}`}>Memuat respons...</p>
            )}

            {!loadingResponses && responses.length === 0 && (
              <p className={`text-center ${subtext}`}>Belum ada respons.</p>
            )}

            <div className="space-y-4">
              {responses.map((r, i) => (
                <div key={r.id} className={`rounded-2xl border p-4 ${isDark ? 'border-slate-700 bg-slate-800' : 'border-slate-200 bg-slate-50'}`}>
                  <p className={`text-xs font-semibold mb-3 ${subtext}`}>
                    Response #{i + 1} · {new Date(r.submitted_at).toLocaleString('id-ID')}
                  </p>
                  <div className="space-y-2">
                    {r.answers.map((a: any) => (
                      <div key={a.field_id}>
                        <p className={`text-xs font-medium ${subtext}`}>{a.label}</p>
                        <p className={`text-sm ${text}`}>{a.value || '—'}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

    </section>
  );
}