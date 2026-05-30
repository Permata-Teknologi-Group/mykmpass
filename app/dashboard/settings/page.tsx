'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/axios';
import axios from 'axios';
import { useAuthStore } from '@/store/auth';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  phone_number: string;
  profile_picture: string | null;
  created_at: string;
  updated_at: string;
}

export default function DashboardSettingsPage({ isDark = false }: { isDark?: boolean }) {
  const { user, setAuth, access_token, refresh_token } = useAuthStore();

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // ── Profile form ──
  const [profileForm, setProfileForm] = useState({
    email: '',
    phone_number: '',
    profile_picture: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Password form ──
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  // ── ID Card modal ──
  const [showCard, setShowCard] = useState(false);

  // ── Fetch profile ──
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await api.get('/me');
      setProfile(res.data);
      setProfileForm({
        email: res.data.email,
        phone_number: res.data.phone_number,
        profile_picture: res.data.profile_picture ?? '',
      });
    } catch {
      setError('Gagal memuat profil.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const showFeedback = (msg: string, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => { setError(''); setSuccess(''); }, 4000);
  };

  // ── Save profile ──
  const handleSaveProfile = async () => {
    setSavingProfile(true);
    try {
      const res = await api.patch('/me', {
        email: profileForm.email,
        phone_number: profileForm.phone_number,
        profile_picture: profileForm.profile_picture || null,
      });
      setProfile(res.data);
      // Update Zustand store
      if (user) setAuth({ ...user, ...res.data }, access_token!, refresh_token!);
      showFeedback('Profil berhasil diperbarui.');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        showFeedback(err.response?.data?.detail ?? 'Gagal menyimpan profil.', true);
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Change password ──
  const handleChangePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      showFeedback('Password baru tidak cocok.', true);
      return;
    }
    if (passwordForm.new_password.length < 8) {
      showFeedback('Password minimal 8 karakter.', true);
      return;
    }
    setSavingPassword(true);
    try {
      await api.post('/me/change-password', {
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      setPasswordForm({ current_password: '', new_password: '', confirm_password: '' });
      showFeedback('Password berhasil diubah.');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        showFeedback(err.response?.data?.detail ?? 'Gagal mengubah password.', true);
      }
    } finally {
      setSavingPassword(false);
    }
  };

  // ── Styles ──
  const card = `rounded-[2rem] border p-6 shadow-xl ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`;
  const text = isDark ? 'text-slate-100' : 'text-slate-950';
  const subtext = isDark ? 'text-slate-400' : 'text-slate-500';
  const inputCls = `w-full px-4 py-2.5 rounded-xl border outline-none transition focus:ring-2 focus:ring-blue-500 ${
    isDark
      ? 'bg-slate-800 border-slate-700 text-slate-100 placeholder-slate-500'
      : 'bg-white border-slate-300 text-slate-900 placeholder-slate-400'
  }`;
  const labelCls = `block text-sm font-medium mb-1 ${subtext}`;
  const sectionCard = `rounded-[2rem] border p-6 shadow-sm ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`;

  if (loading) {
    return (
      <div className={`rounded-[2rem] border p-10 text-center ${isDark ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
        Memuat settings...
      </div>
    );
  }

  return (
    <section className="space-y-6">

      {/* Header */}
      <div className={`${card} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
        <div>
          <p className={`text-sm uppercase tracking-[0.25em] ${subtext}`}>Account settings</p>
          <h2 className={`mt-3 text-xl font-semibold ${text}`}>Settings</h2>
        </div>
        {/* View ID Card button */}
        <button
          onClick={() => setShowCard(true)}
          className="inline-flex items-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 text-sm font-semibold transition"
        >
          🪪 View ID Card
        </button>
      </div>

      {/* Feedback */}
      {error && (
        <div className="rounded-2xl bg-rose-100 border border-rose-300 text-rose-700 px-5 py-3 text-sm">{error}</div>
      )}
      {success && (
        <div className="rounded-2xl bg-green-100 border border-green-300 text-green-700 px-5 py-3 text-sm">{success}</div>
      )}

      {/* ── Profile Section ── */}
      <div className={sectionCard}>
        <h3 className={`text-lg font-semibold mb-1 ${text}`}>Profile</h3>
        <p className={`text-sm mb-6 ${subtext}`}>Update your account information and contact details.</p>

        {/* Avatar preview */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative">
            {profileForm.profile_picture ? (
              <img
                src={profileForm.profile_picture}
                alt="Avatar"
                className="h-20 w-20 rounded-full object-cover border-2 border-blue-500"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="h-20 w-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold">
                {profile?.username?.charAt(0).toUpperCase() ?? '?'}
              </div>
            )}
          </div>
          <div>
            <p className={`font-semibold ${text}`}>{profile?.username}</p>
            <p className={`text-sm ${subtext}`}>Member since {profile ? new Date(profile.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className={labelCls}>Profile Picture URL</label>
            <input
              className={inputCls}
              placeholder="https://example.com/photo.jpg"
              value={profileForm.profile_picture}
              onChange={(e) => setProfileForm({ ...profileForm, profile_picture: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Email</label>
            <input
              type="email"
              className={inputCls}
              value={profileForm.email}
              onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
            />
          </div>
          <div>
            <label className={labelCls}>Phone Number</label>
            <input
              type="tel"
              className={inputCls}
              value={profileForm.phone_number}
              onChange={(e) => setProfileForm({ ...profileForm, phone_number: e.target.value })}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={savingProfile}
              className="rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 text-sm font-semibold transition"
            >
              {savingProfile ? 'Menyimpan...' : 'Simpan Profil'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Password Section ── */}
      <div className={sectionCard}>
        <h3 className={`text-lg font-semibold mb-1 ${text}`}>Security</h3>
        <p className={`text-sm mb-6 ${subtext}`}>Change your password. Minimum 8 characters.</p>

        <div className="space-y-4">
          {/* Current password */}
          <div>
            <label className={labelCls}>Current Password</label>
            <div className="relative">
              <input
                type={showPasswords.current ? 'text' : 'password'}
                className={`${inputCls} pr-12`}
                placeholder="••••••••"
                value={passwordForm.current_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${subtext}`}
              >
                {showPasswords.current ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* New password */}
          <div>
            <label className={labelCls}>New Password</label>
            <div className="relative">
              <input
                type={showPasswords.new ? 'text' : 'password'}
                className={`${inputCls} pr-12`}
                placeholder="••••••••"
                value={passwordForm.new_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${subtext}`}
              >
                {showPasswords.new ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Confirm password */}
          <div>
            <label className={labelCls}>Confirm New Password</label>
            <div className="relative">
              <input
                type={showPasswords.confirm ? 'text' : 'password'}
                className={`${inputCls} pr-12`}
                placeholder="••••••••"
                value={passwordForm.confirm_password}
                onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
              />
              <button
                type="button"
                onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                className={`absolute right-3 top-1/2 -translate-y-1/2 text-sm ${subtext}`}
              >
                {showPasswords.confirm ? '🙈' : '👁️'}
              </button>
            </div>
            {/* Match indicator */}
            {passwordForm.confirm_password && (
              <p className={`text-xs mt-1 ${
                passwordForm.new_password === passwordForm.confirm_password
                  ? 'text-green-500'
                  : 'text-rose-500'
              }`}>
                {passwordForm.new_password === passwordForm.confirm_password
                  ? '✓ Password cocok'
                  : '✗ Password tidak cocok'}
              </p>
            )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleChangePassword}
              disabled={
                savingPassword ||
                !passwordForm.current_password ||
                !passwordForm.new_password ||
                !passwordForm.confirm_password
              }
              className="rounded-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2.5 text-sm font-semibold transition"
            >
              {savingPassword ? 'Mengubah...' : 'Ubah Password'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Notifications Section ── */}
      <div className={sectionCard}>
        <h3 className={`text-lg font-semibold mb-1 ${text}`}>Notifications</h3>
        <p className={`text-sm ${subtext}`}>Manage alerts, email updates, and system notifications.</p>
        <p className={`text-sm mt-4 ${subtext} italic`}>Coming soon.</p>
      </div>

      {/* ══════════════════════════════════════
          ID Card Modal
      ══════════════════════════════════════ */}
      {showCard && profile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="w-full max-w-sm">

            {/* Card */}
            <div className="relative rounded-[2rem] overflow-hidden shadow-2xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white p-8">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-4 right-4 h-40 w-40 rounded-full bg-white" />
                <div className="absolute -bottom-8 -left-8 h-56 w-56 rounded-full bg-white" />
              </div>

              {/* Header */}
              <div className="flex flex-row items-center gap-2 mb-12">
                <div className="h-14 w-14 rounded-full object-cover border-white/30">
                  <img src="/logosanmar.png" alt="" className=''/>
                </div>
                <div className=''>
                  <p className="text-xs font-bold uppercase tracking-[0.3em] text-blue-200">KMPortal</p>
                  <p className="text-sm font-bold text-blue-200">Katedral Medan</p>
                </div>
              </div>

              {/* Avatar + name */}
              <div className="relative flex items-center gap-4 mb-6">
                {profile.profile_picture ? (
                  <img
                    src={profile.profile_picture}
                    alt="Avatar"
                    className="h-20 w-20 rounded-full object-cover border-4 border-white/30"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-white/20 border-4 border-white/30 flex items-center justify-center text-3xl font-bold">
                    {profile.username.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="text-xl font-bold">{profile.username}</p>
                  <span className="inline-block mt-1 rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold">
                    {user?.is_staff ? 'Admin' : user?.is_superuser ? 'Super Admin' : 'Member'}
                  </span>
                </div>
              </div>

              {/* Details */}
              <div className="relative space-y-3 border-t border-white/20 pt-5">
                <div className="flex items-start gap-3">
                  <span className="text-blue-200 text-sm w-5">📧</span>
                  <div>
                    <p className="text-xs text-blue-200">Email</p>
                    <p className="text-sm font-medium">{profile.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-200 text-sm w-5">📱</span>
                  <div>
                    <p className="text-xs text-blue-200">Phone</p>
                    <p className="text-sm font-medium">{profile.phone_number}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-200 text-sm w-5">📅</span>
                  <div>
                    <p className="text-xs text-blue-200">Member Since</p>
                    <p className="text-sm font-medium">
                      {new Date(profile.created_at).toLocaleDateString('id-ID', {
                        day: 'numeric', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-200 text-sm w-5">🪪</span>
                  <div>
                    <p className="text-xs text-blue-200">ID</p>
                    <p className="text-xs font-mono opacity-70">{profile.id}</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="relative mt-6 pt-4 border-t border-white/20">
                <p className="text-xs text-blue-200 text-center">Katedral Medan · {new Date().getFullYear()}</p>
                <p className="text-xs text-blue-200 text-center">Permata Teknologi Group · {new Date().getFullYear()}</p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowCard(false)}
              className="mt-4 w-full rounded-full bg-white/10 hover:bg-white/20 text-white px-5 py-2.5 text-sm font-semibold transition backdrop-blur-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

    </section>
  );
}