'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import axios from 'axios';
import Image from 'next/image';

const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const nameEQ = name + '=';
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();
    if (cookie.indexOf(nameEQ) === 0) return cookie.substring(nameEQ.length);
  }
  return null;
};

const setCookie = (name: string, value: string, days: number = 365) => {
  if (typeof document === 'undefined') return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = 'expires=' + date.toUTCString();
  document.cookie = name + '=' + value + ';' + expires + ';path=/';
};

const quotes = [
  {
    text: '"All the things of this world are gifts and graces of God, created to be the means by which we can know Him better, love Him more surely, and serve Him more faithfully!"',
    author: 'St. Ignatius of Loyola',
  },
  {
    text: '"The fruit of silence is prayer. The fruit of prayer is faith. The fruit of faith is love. The fruit of love is service. God does not call me to be successful; He calls me to be obedient."',
    author: 'Mother Teresa of Calcutta',
  },
  {
    text: '"To devote oneself wholeheartedly until the last drop of blood, because the Lord is present most truly in the sick we serve. We are assigned by the Lord to serve Him in the sick."',
    author: 'St. Camillus de Lellis',
  },
  {
    text: '"Not to hurt our humblest brothers and sisters is our primary duty to them; but to stop at that is not enough. We have the higher duty to serve them, whenever they need us."',
    author: 'St. Francis of Assisi',
  },
  {
    text: '"Pray as if everything depends on God. Work as if everything depends on you."',
    author: 'St. Augustine',
  },
];

const t = {
  welcomeBack: 'Welcome Back',
  signIn: 'Sign in to your account',
  username: 'Username',
  usernamePlaceholder: 'Enter your username',
  password: 'Password',
  passwordPlaceholder: 'Enter your password',
  forgotPassword: 'Forgot your password?',
  signInButton: 'Sign In',
  githubLoginDev: 'Login with GitHub',
  processing: 'Processing...',
  noAccount: "Don't have an account?",
  register: 'Register here',
  copyright: 'Katedral Medan',
  poweredBy: 'Powered by Permata Teknologi Group',
  forDev: '*Only for developers',
};

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // ── Theme ──
  useEffect(() => {
    const savedTheme = getCookie('theme');
    const isSavedDark = savedTheme === 'dark';
    setIsDark(isSavedDark);
    document.documentElement.classList.toggle('dark', isSavedDark);
  }, []);

  // ── Typing animation ──
  useEffect(() => {
    const quoteText = quotes[currentQuoteIndex].text;
    if (displayedText.length < quoteText.length) {
      const timer = setTimeout(() => {
        setDisplayedText(quoteText.slice(0, displayedText.length + 1));
      }, 50);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
        setDisplayedText('');
      }, 10000);
      return () => clearTimeout(timer);
    }
  }, [displayedText, currentQuoteIndex]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    setCookie('theme', newIsDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newIsDark);
  };

  const isDev = process.env.NODE_ENV === 'development';
  const githubLoginUrl = process.env.NEXT_PUBLIC_GITHUB_AUTH_URL ?? '/api/auth/github';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    try {
      const data = await login({ username, password });

      // ── API return { token, user } ──
      setAuth(data.user, data.token, data.token);
      setCookie('token', data.token);
      setCookie('user', username);

      router.push('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const detail = err.response?.data?.detail;
        if (typeof detail === 'string') {
          setError(detail);
        } else if (Array.isArray(detail)) {
          setError(
            detail.map((d) => {
              if (typeof d === 'string') return d;
              if (d?.msg) {
                const field = Array.isArray(d.loc) ? d.loc.slice(-1)[0] : d.loc;
                return field ? `${field}: ${d.msg}` : d.msg;
              }
              return JSON.stringify(d);
            }).join(' ')
          );
        } else {
          setError('Login gagal.');
        }
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      router.push('/dashboard');
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left — Quote */}
      <div
        className="hidden lg:flex lg:w-3/4 bg-cover bg-center relative"
        style={{ backgroundImage: 'url(/km_bg.jpg)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 to-blue-900/40" />
        <div className="relative flex items-center justify-center w-full px-8">
          <div className="text-center text-white max-w-2xl">
            <div className="text-3xl font-semibold mb-6 leading-relaxed italic min-h-48 flex items-center justify-center">
              <span>{displayedText}</span>
              {displayedText.length < quotes[currentQuoteIndex].text.length && (
                <span className="text-white animate-pulse">|</span>
              )}
            </div>
            <p className="text-lg text-indigo-100 font-medium">
              — {quotes[currentQuoteIndex].author}
            </p>
          </div>
        </div>
      </div>

      {/* Right — Form */}
      <div className={`flex flex-1 lg:w-1/4 items-center justify-center p-6 sm:p-8 relative ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="w-full max-w-md">

          <div className="mb-8">
            <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {t.welcomeBack}
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t.signIn}</p>
          </div>

          {error && (
            <div className={`mb-6 p-4 rounded-lg text-sm ${
              isDark ? 'bg-red-900/20 border border-red-800 text-red-400' : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username */}
            <div>
              <label htmlFor="username" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                {t.username}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.usernamePlaceholder}
                disabled={loading}
                className={`w-full px-4 py-2.5 border rounded-lg outline-none transition focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={`block text-sm font-semibold mb-2 ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                {t.password}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  disabled={loading}
                  className={`w-full px-4 py-2.5 pr-12 border rounded-lg outline-none transition focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 disabled:opacity-50"
                >
                  <Image
                    src={showPassword
                      ? isDark ? '/hide_dark.png' : '/hide_light.png'
                      : isDark ? '/show_dark.png' : '/show_light.png'}
                    alt={showPassword ? 'Hide' : 'Show'}
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </div>

            <div className="text-right">
              <Link href="#" className={`text-sm font-medium ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
                {t.forgotPassword}
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 px-4 rounded-lg transition"
            >
              <img src="/login.png" alt="" className="max-w-[22px] mr-2" />
              {loading ? t.processing : t.signInButton}
            </button>
          </form>

          {isDev && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => window.location.assign(githubLoginUrl)}
                className={`w-full inline-flex items-center justify-center gap-2 border rounded-lg py-2.5 px-4 transition ${
                  isDark
                    ? 'border-gray-700 bg-gray-800 text-gray-100 hover:bg-gray-700'
                    : 'border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Image src="/github.png" alt="GitHub" width={20} height={20} />
                <span>{t.githubLoginDev}</span>
              </button>
              <p className={`text-sm mt-2 text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {t.forDev}
              </p>
            </div>
          )}

          <div className="mt-6 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.noAccount}{' '}
              <Link href="/auth/register" className={`font-semibold ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
                {t.register}
              </Link>
            </p>
          </div>

          <div className={`mt-8 pt-6 border-t text-center ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
            <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} {t.copyright}</p>
            <p className="text-xs text-gray-500 mt-1">{t.poweredBy}</p>
          </div>
        </div>

        {/* Theme toggle */}
        <div className="absolute bottom-6 left-6">
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition ${
              isDark ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </div>
  );
}