'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { register } from '@/lib/api';
import axios from 'axios';

export default function RegisterPage() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [regCode, setRegCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const VALID_REG_CODE = process.env.NEXT_PUBLIC_REG_CODE;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !username || !phoneNumber || !password || !confirmPassword || !regCode) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    // ← Cek regCode di frontend, tidak dikirim ke API
    if (regCode !== VALID_REG_CODE) {
      setError('Invalid registration code');
      setLoading(false);
      return;
    }

    try {
      await register({
        username,
        email,
        password,
        phone_number: phoneNumber,
      });

      router.push('/auth/login?registered=true');

    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') {
          setError(detail);
        } else if (Array.isArray(detail)) {
          const formatted = detail
            .map((d) => {
              if (typeof d === 'string') return d;
              if (d && typeof d === 'object') {
                const field = Array.isArray(d.loc) ? d.loc.slice(-1)[0] : d.loc;
                if (d.msg) return field ? `${field}: ${d.msg}` : d.msg;
                return JSON.stringify(d);
              }
              return JSON.stringify(d);
            })
            .join(' ');
          setError(formatted);
        } else if (detail && typeof detail === 'object') {
          const msg = (detail as any).msg ?? (detail as any).detail ?? JSON.stringify(detail);
          setError(msg);
        } else {
          setError('Registrasi gagal.');
        }
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-gray-600">Please fill in the details below to create your account</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2 border text-blue-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full px-4 py-2 border text-blue-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+6281234567890"
              className="w-full px-4 py-2 border text-blue-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter a strong password"
              className="w-full px-4 py-2 border text-blue-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Password confirmation"
              className="w-full px-4 py-2 border text-blue-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="regCode" className="block text-sm font-medium text-gray-700 mb-1">
              Registration Code
            </label>
            <input
              id="regCode"
              type="text"
              value={regCode}
              onChange={(e) => setRegCode(e.target.value)}
              placeholder="Enter your registration code"
              className="w-full px-4 py-2 border text-blue-500 border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
          >
            {loading ? 'Sending your application...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-indigo-600 hover:text-indigo-700 font-semibold">
              Sign In
            </Link>
          </p>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-center text-xs text-gray-500">
            By signing up, you agree to our{' '}
            <Link href="#" className="text-indigo-600 hover:text-indigo-700">
              Terms of Service
            </Link>
          </p>
          <p className="text-center text-xs text-gray-500">&copy; {new Date().getFullYear()} KMPortal</p>
          <p className="text-center text-xs text-gray-500">&copy; {new Date().getFullYear()} Katedral Medan. All rights reserved.</p>
          <p className="text-center text-xs text-gray-500">&copy; {new Date().getFullYear()} Permata Teknologi Group. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}