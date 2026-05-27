'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import axios from 'axios';
import Image from 'next/image';

// Cookie utility functions
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
    id: { text: '"Semua yang ada di dunia ini adalah karunia dari Tuhan, diciptakan untuk kita menjadi sarana untuk mengenal-Nya lebih baik, lebih mencintai Dia dan melayani Dia dengan lebih setia!"', author: 'St. Ignatius dari Loyola' },
    en: { text: '"All the things of this world are gifts and graces of God, created to be the means by which we can know Him better, love Him more surely, and serve Him more faithfully!"', author: 'St. Ignatius of Loyola' },
    zh: { text: '"世界上的一切都是上帝的礼物和恩宠，被创造成我们用来更好地了解他、更真诚地爱他、更忠实地服侍他的手段！"', author: 'St. Ignatius of Loyola' },
  },
  {
    id: { text: '"Buah keheningan adalah doa. Buah doa adalah iman. Buah iman adalah kasih, dan buah dari kasih adalah pelayanan, dan buah dari pelayanan adalah kedamaian. Allah tidak memanggilku untuk menjadi sukses, melainkan Ia memanggilku untuk menjadi taat."', author: 'Ibu Teresa dari Kalkuta' },
    en: { text: '"The fruit of silence is prayer. The fruit of prayer is faith. The fruit of faith is love. The fruit of love is service. God does not call me to be successful; He calls me to be obedient."', author: 'Mother Teresa of Calcutta' },
    zh: { text: '"沉默的果实是祷告。祷告的果实是信仰。信仰的果实是爱。爱的果实是服侍。上帝不要求我成功，而是要求我顺从。"', author: '加尔各答的特蕾莎修女' },
  },
  {
    id: { text: '"Mengabdikan diri seikhlas-ikhlasnya hingga titik darah yang terakhir, karena Tuhan hadir secara paling nyata di dalam diri orang-orang sakit yang kita layani. Kita ditugaskan Tuhan untuk melayani Dia di dalam diri orang-orang sakit ini."', author: 'St. Kamilius de Lellis' },
    en: { text: '"To devote oneself wholeheartedly until the last drop of blood, because the Lord is present most truly in the sick we serve. We are assigned by the Lord to serve Him in the sick."', author: 'St. Camillus de Lellis' },
    zh: { text: '"全身心地奉献自己，直到最后一滴血，因为主最真实地临在于我们所服侍的病人身上。我们被主分派在病人身上事奉祂。"', author: '圣卡米洛斯·德·莱利斯' },
  },
  {
    id: { text: '"Tidak menyakiti saudara-saudara kita yang rendah hati adalah tugas utama kita bagi mereka; tetapi berhenti di sana tidaklah cukup. Kita memiliki misi yang lebih tinggi untuk melayani mereka, kapan pun mereka membutuhkannya."', author: 'Santo Fransiskus dari Asisi' },
    en: { text: '"Not to hurt our humblest brothers and sisters is our primary duty to them; but to stop at that is not enough. We have the higher duty to serve them, whenever they need us."', author: 'St. Francis of Assisi' },
    zh: { text: '"不伤害我们最谦卑的兄弟姐妹是我们对他们的主要责任；但仅限于此是不够的。我们有更高的责任去服侍他们，无论何时他们需要我们。"', author: '亚西西的圣弗朗西斯' },
  },
  {
    id: { text: '"Berdoalah seolah-olah semuanya bergantung pada Allah. Bekerjalah seolah-olah segalanya bergantung kepadamu."', author: 'Santo Agustinus' },
    en: { text: '"Pray as if everything depends on God. Work as if everything depends on you."', author: 'St. Augustine' },
    zh: { text: '"祈祷时，就像一切都取决于上帝。工作时，就像一切都取决于你。"', author: '圣奥古斯丁' },
  },
];

const translations = {
  id: {
    welcomeBack: 'Selamat Datang Kembali',
    signIn: 'Masuk ke akun Anda',
    username: 'Username',
    usernamePlaceholder: 'Masukkan username',
    password: 'Password',
    passwordPlaceholder: 'Masukkan password',
    forgotPassword: 'Lupa password?',
    signInButton: 'Masuk',
    processing: 'Memproses...',
    noAccount: 'Belum punya akun?',
    register: 'Daftar di sini',
    copyright: 'Katedral Medan',
    poweredBy: 'Dikembangkan oleh Permata Teknologi Group',
  },
  en: {
    welcomeBack: 'Welcome Back',
    signIn: 'Sign in to your account',
    username: 'Username',
    usernamePlaceholder: 'Enter your username',
    password: 'Password',
    passwordPlaceholder: 'Enter your password',
    forgotPassword: 'Forgot your password?',
    signInButton: 'Sign In',
    processing: 'Processing...',
    noAccount: "Don't have an account?",
    register: 'Register here',
    copyright: 'Katedral Medan',
    poweredBy: 'Powered by Permata Teknologi Group',
  },
  zh: {
    welcomeBack: '欢迎回来',
    signIn: '登录您的账户',
    username: '用户名',
    usernamePlaceholder: '输入您的用户名',
    password: '密码',
    passwordPlaceholder: '输入您的密码',
    forgotPassword: '忘记密码?',
    signInButton: '登录',
    processing: '处理中...',
    noAccount: '还没有账户?',
    register: '在此注册',
    copyright: 'Katedral Medan',
    poweredBy: '由 Permata Teknologi Group 开发',
  },
};

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((s) => s.setAuth);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [language, setLanguage] = useState<'id' | 'en' | 'zh'>('id');
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedTheme = getCookie('theme');
    const savedLang = getCookie('language') as 'id' | 'en' | 'zh' | null;
    
    if (savedTheme === 'dark') setIsDark(true);
    if (savedLang) setLanguage(savedLang);

    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Reset animation when language changes
  useEffect(() => {
    setDisplayedText('');
  }, [language]);

  // Typing animation effect
  useEffect(() => {
    const currentQuote = quotes[currentQuoteIndex];
    const quoteText = currentQuote[language as keyof typeof currentQuote].text;

    if (displayedText.length < quoteText.length) {
      // Still typing
      const timer = setTimeout(() => {
        setDisplayedText(quoteText.slice(0, displayedText.length + 1));
      }, 100); // Typing speed

      return () => clearTimeout(timer);
    } else if (displayedText.length > 0) {
      // Finished typing, immediately move to next quote
      setTimeout(() => {
        setCurrentQuoteIndex((prev) => (prev + 1) % quotes.length);
        setDisplayedText('');
      }, 10000); // 5 second pause before next quote
    }
  }, [displayedText, currentQuoteIndex, language]);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    setCookie('theme', newIsDark ? 'dark' : 'light');
    
    if (newIsDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const selectLanguage = (lang: 'id' | 'en' | 'zh') => {
    setLanguage(lang);
    setCookie('language', lang);
    setShowLanguageMenu(false);
  };

  const t = translations[language];

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
      setAuth(data.user, data.access_token, data.refresh_token);
      router.push('/dashboard');
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.detail ?? 'Login gagal.');
      } else {
        setError('Terjadi kesalahan. Silakan coba lagi.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex h-screen ${isDark ? 'dark' : ''}`}>
      {/* Left Side - Background Image with Quote */}
      <div
        className="hidden lg:flex lg:w-3/4 bg-cover bg-center relative"
        style={{
          backgroundImage: 'url(/km_bg.jpg)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/40 to-blue-900/40"></div>
        <div className="relative flex items-center justify-center w-full px-8">
          <div className="text-center text-white max-w-2xl">
            <div className="text-3xl font-semibold mb-6 leading-relaxed italic min-h-48 flex items-center justify-center">
              <span>{displayedText}</span>
              {displayedText.length < quotes[currentQuoteIndex][language as keyof typeof quotes[0]].text.length && (
                <span className="typing-cursor text-white">|</span>
              )}
            </div>
            <p className="text-lg text-indigo-100 font-medium">
              — {quotes[currentQuoteIndex][language as keyof typeof quotes[0]].author}
            </p>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className={`flex flex-1 lg:w-1/4 items-center justify-center p-6 sm:p-8 relative ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'} mb-2`}>
              {t.welcomeBack}
            </h1>
            <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{t.signIn}</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className={`mb-6 p-4 rounded-lg text-sm ${
              isDark
                ? 'bg-red-900/20 border border-red-800 text-red-400'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}>
              {error}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Username Field */}
            <div>
              <label htmlFor="username" className={`block text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'} mb-2`}>
                {t.username}
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t.usernamePlaceholder}
                className={`w-full px-4 py-2.5 border rounded-lg transition duration-200 outline-none focus:ring-2 focus:ring-indigo-500 ${
                  isDark
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500'
                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                }`}
                disabled={loading}
              />
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className={`block text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'} mb-2`}>
                {t.password}
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t.passwordPlaceholder}
                  className={`w-full px-4 py-2.5 pr-10 border rounded-lg transition duration-200 outline-none focus:ring-2 focus:ring-indigo-500 ${
                    isDark
                      ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500'
                      : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500'
                  }`}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className={`absolute right-3 top-1/2 -translate-y-1/2 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    isDark
                      ? 'text-gray-400 hover:text-gray-200'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  <Image
                    src={showPassword
                      ? isDark ? '/hide_dark.png' : '/hide_light.png'
                      : isDark ? '/show_dark.png' : '/show_light.png'}
                    alt={showPassword ? 'Hide password' : 'Show password'}
                    width={24}
                    height={24}
                  />
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link href="#" className={`text-sm font-medium ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
                {t.forgotPassword}
              </Link>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-2.5 px-4 rounded-lg transition duration-200"
            >
              <img src="/login.png" alt="" className='max-w-[22px] mr-2'/>
              {loading ? t.processing : t.signInButton}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-6 text-center">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {t.noAccount}{' '}
              <Link href="/auth/register" className={`font-semibold ${isDark ? 'text-indigo-400 hover:text-indigo-300' : 'text-indigo-600 hover:text-indigo-700'}`}>
                {t.register}
              </Link>
            </p>
          </div>

          {/* Footer */}
          <div className={`mt-8 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} text-center`}>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              &copy; {new Date().getFullYear()} {t.copyright}
            </p>
            <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'} mt-1`}>
              {t.poweredBy}
            </p>
          </div>
        </div>

        {/* Theme & Language Toggle - Bottom Left */}
        <div className="absolute bottom-6 left-6 flex gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition duration-200 ${
              isDark
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className={`px-3 py-2 rounded-lg font-semibold transition duration-200 text-sm ${
                isDark
                  ? 'bg-gray-800 text-indigo-300 hover:bg-gray-700'
                  : 'bg-gray-100 text-indigo-600 hover:bg-gray-200'
              }`}
              title="Switch language"
            >
              {language === 'id' ? 'ID' : language === 'en' ? 'EN' : '中文'}
            </button>
            
            {/* Language Dropdown Menu */}
            {showLanguageMenu && (
              <div className={`absolute bottom-full left-0 mb-2 rounded-lg shadow-lg z-50 ${
                isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <button
                  type="button"
                  onClick={() => selectLanguage('id')}
                  className={`block w-full text-left px-4 py-2 hover:bg-indigo-500 hover:text-white transition duration-200 rounded-t-lg ${
                    language === 'id'
                      ? isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-900'
                      : isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  🇮🇩 Indonesian
                </button>
                <button
                  type="button"
                  onClick={() => selectLanguage('en')}
                  className={`block w-full text-left px-4 py-2 hover:bg-indigo-500 hover:text-white transition duration-200 ${
                    language === 'en'
                      ? isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-900'
                      : isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  🇬🇧 English
                </button>
                <button
                  type="button"
                  onClick={() => selectLanguage('zh')}
                  className={`block w-full text-left px-4 py-2 hover:bg-indigo-500 hover:text-white transition duration-200 rounded-b-lg ${
                    language === 'zh'
                      ? isDark ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-900'
                      : isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  🇨🇳 中文 (Mandarin)
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}