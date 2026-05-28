import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white selection:bg-indigo-200 selection:text-indigo-950">
      <header className="border-b border-white/10 bg-zinc-950/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 sm:px-10 lg:px-16">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-200 ring-1 ring-indigo-500/20">
              KM
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-indigo-300">Katedral Medan</p>
              <p className="text-sm text-zinc-400">Portal Informasi Umat</p>
            </div>
          </div>

          <div className="hidden gap-8 text-sm font-medium text-zinc-300 md:flex">
            <a href="#tujuan" className="transition hover:text-white">Tujuan</a>
            <a href="#keunggulan" className="transition hover:text-white">Keunggulan</a>
            <a href="#penjelasan" className="transition hover:text-white">Penjelasan</a>
            <a href="#fitur" className="transition hover:text-white">Fitur</a>
          </div>

          <div>
            <a
              href="/auth/login"
              className="inline-flex rounded-full bg-indigo-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-400"
            >
              Kunjungi Portal
            </a>
          </div>
        </nav>
      </header>

      <main className="relative overflow-hidden">
        <div className="relative h-[720px] sm:h-[760px] lg:h-[820px]">
          <Image
            src="/km_bg.jpg"
            alt="Latar belakang Katedral Medan"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/80" />

          <section className="relative mx-auto flex h-full max-w-7xl flex-col justify-center px-6 py-24 text-center text-white sm:px-10 lg:px-16 lg:text-left">
            <div className="max-w-3xl space-y-6">
              <p className="inline-flex rounded-full bg-indigo-500/20 px-4 py-2 text-sm font-semibold uppercase tracking-[0.25em] text-indigo-100">
                Portal Gereja
              </p>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                Portal Katedral Medan
              </h1>
              <p className="text-lg leading-8 text-zinc-200 sm:text-xl">
                Solusi modern untuk akses informasi misa, berita paroki, kegiatan rohani, dan dukungan pelayanan — dirancang sebagai landing page produk yang profesional dan mudah dipakai.
              </p>

              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:justify-start">
                <a
                  href="#tujuan"
                  className="inline-flex rounded-full bg-indigo-500 px-7 py-3 text-sm font-semibold text-white transition hover:bg-indigo-400"
                >
                  Pelajari Lebih Lanjut
                </a>
                <a
                  href="#fitur"
                  className="inline-flex rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-semibold text-white transition hover:border-indigo-300 hover:bg-white/10"
                >
                  Lihat Fitur
                </a>
              </div>
            </div>
          </section>
        </div>

        <section className="mx-auto max-w-7xl space-y-12 px-6 pb-16 pt-20 sm:px-10 lg:px-16">
          <div id="tujuan" className="rounded-[2rem] bg-white/95 p-10 shadow-xl shadow-black/10 text-zinc-950 dark:bg-zinc-900 dark:text-zinc-100">
            <h2 className="text-3xl font-semibold">Tujuan Portal</h2>
            <p className="mt-4 max-w-3xl leading-8 text-zinc-600 dark:text-zinc-300">
              Portal ini dibuat untuk menjadi pusat informasi resmi Katedral Medan, memudahkan umat menemukan jadwal misa, kegiatan komunitas, pengumuman, serta sumber daya rohani dalam satu platform yang terorganisir.
            </p>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <div className="rounded-3xl bg-zinc-50 p-6 shadow-sm shadow-black/5 dark:bg-zinc-950 dark:border dark:border-zinc-800">
                <h3 className="font-semibold">Keterhubungan</h3>
                <p className="mt-3 text-zinc-600 dark:text-zinc-300">Membangun komunikasi yang kuat antara gereja, komunitas, dan umat.</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-6 shadow-sm shadow-black/5 dark:bg-zinc-950 dark:border dark:border-zinc-800">
                <h3 className="font-semibold">Informasi Terpusat</h3>
                <p className="mt-3 text-zinc-600 dark:text-zinc-300">Semua berita, jadwal, dan pengumuman tersedia di satu tempat.</p>
              </div>
              <div className="rounded-3xl bg-zinc-50 p-6 shadow-sm shadow-black/5 dark:bg-zinc-950 dark:border dark:border-zinc-800">
                <h3 className="font-semibold">Dukungan Umat</h3>
                <p className="mt-3 text-zinc-600 dark:text-zinc-300">Mendukung partisipasi aktif dalam pelayanan, doa, dan kegiatan paroki.</p>
              </div>
            </div>
          </div>

          <div id="keunggulan" className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-[2rem] bg-white/95 p-10 shadow-xl shadow-black/10 dark:bg-zinc-900">
              <h2 className="text-3xl font-semibold">Keunggulan Portal</h2>
              <p className="mt-4 leading-8 text-zinc-600 dark:text-zinc-300">
                Desain modern, akses cepat, dan pengalaman pengguna yang nyaman membantu umat menemukan informasi penting tanpa hambatan.
              </p>
              <ul className="mt-8 space-y-4 text-zinc-600 dark:text-zinc-300">
                <li className="rounded-3xl border border-zinc-200/80 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">Navigasi mudah untuk jadwal misa dan kegiatan gereja.</li>
                <li className="rounded-3xl border border-zinc-200/80 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">Konten selalu terbarui untuk semua pelayanan paroki.</li>
                <li className="rounded-3xl border border-zinc-200/80 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-950">Akses penuh dari desktop dan perangkat seluler.</li>
              </ul>
            </div>
            <div className="rounded-[2rem] bg-white/95 p-10 shadow-xl shadow-black/10 dark:bg-zinc-900">
              <div className="rounded-3xl bg-indigo-600/10 p-8 text-indigo-950 dark:bg-indigo-500/10 dark:text-indigo-100">
                <p className="text-sm uppercase tracking-[0.25em] text-indigo-500 dark:text-indigo-300">Produk unggulan</p>
                <h3 className="mt-4 text-2xl font-semibold">Platform Digital yang Berfokus pada Umat</h3>
                <p className="mt-4 leading-8 text-zinc-600 dark:text-zinc-300">
                  Portal ini bukan hanya halaman informasi, melainkan produk digital yang dirancang untuk mendukung pertumbuhan iman dan aktivitas komunitas secara berkelanjutan.
                </p>
              </div>
            </div>
          </div>

          <div id="penjelasan" className="rounded-[2rem] bg-white/95 p-10 shadow-xl shadow-black/10 dark:bg-zinc-900">
            <h2 className="text-3xl font-semibold">Penjelasan Portal</h2>
            <p className="mt-4 max-w-3xl leading-8 text-zinc-600 dark:text-zinc-300">
              Portal Katedral Medan adalah gerbang digital resmi yang menyatukan informasi liturgi, pengumuman, berita komunitas, dan layanan pastoral. Tujuannya adalah memudahkan umat untuk tetap terhubung dengan kehidupan gereja tanpa harus mencari di banyak sumber.
            </p>
            <p className="mt-6 max-w-3xl leading-8 text-zinc-600 dark:text-zinc-300">
              Dengan tata letak yang bersih dan konten yang mudah diakses, portal ini membantu meningkatkan partisipasi umat, mempercepat penyebaran informasi, dan memperkuat ikatan komunitas rohani di Medan.
            </p>
          </div>

          <div id="fitur" className="grid gap-8 lg:grid-cols-3">
            <div className="rounded-[2rem] bg-indigo-600/10 p-8 text-indigo-950 shadow-sm shadow-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-100">
              <h3 className="text-xl font-semibold">Jadwal Misa</h3>
              <p className="mt-3 leading-7 text-zinc-700 dark:text-zinc-200">Informasi lengkap jadwal misa harian, mingguan, dan khusus.</p>
            </div>
            <div className="rounded-[2rem] bg-indigo-600/10 p-8 text-indigo-950 shadow-sm shadow-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-100">
              <h3 className="text-xl font-semibold">Berita & Pengumuman</h3>
              <p className="mt-3 leading-7 text-zinc-700 dark:text-zinc-200">Update kegiatan paroki, komunitas doa, dan program pelayanan.</p>
            </div>
            <div className="rounded-[2rem] bg-indigo-600/10 p-8 text-indigo-950 shadow-sm shadow-indigo-500/10 dark:bg-indigo-500/10 dark:text-indigo-100">
              <h3 className="text-xl font-semibold">Dukungan Umat</h3>
              <p className="mt-3 leading-7 text-zinc-700 dark:text-zinc-200">Akses informasi kontak pastoral, donasi, dan layanan rohani.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
