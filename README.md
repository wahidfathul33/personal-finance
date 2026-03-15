# Keuangan Kita

Aplikasi pengelola keuangan sederhana untuk keluarga atau kelompok kecil. Dibangun dengan Next.js, Supabase, dan Tailwind CSS. Mendukung PWA (installable di mobile).

## Fitur

- **Dashboard** — ringkasan saldo, statistik pengeluaran/pemasukan bulanan, dan transaksi terbaru
- **Transaksi** — catat pemasukan, pengeluaran, dan transfer antar anggota; mendukung split bill
- **Tabungan** — kelola tabungan per anggota terpisah dari saldo utama
- **Aset** — pantau aset (emas logam mulia, perhiasan, deposito, lainnya) beserta estimasi nilai
- **Piutang** — catat dan pantau piutang
- **Transaksi Rutin** — template transaksi yang dapat di-generate otomatis tiap bulan
- **Analisis** — grafik dan ringkasan keuangan per periode
- **Multi-anggota** — setiap transaksi dikaitkan ke anggota (person)
- **PIN Auth** — proteksi akses dengan PIN, divalidasi via middleware
- **PWA** — bisa diinstall di perangkat mobile, support offline fallback
- **Dark mode** — tema terang/gelap

## Instalasi

### Prasyarat

- Node.js 18+
- Akun [Supabase](https://supabase.com)

### Langkah

1. **Clone repo**
   ```bash
   git clone <repo-url>
   cd personal-finance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Setup environment**
   ```bash
   cp .env.example .env.local
   ```
   Isi nilai di `.env.local`:
   | Variabel | Keterangan |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | URL project Supabase |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key Supabase |
   | `AUTH_PIN` | PIN untuk login (contoh: `123456`) |
   | `AUTH_SECRET` | String acak panjang untuk HMAC token |
   | `NEXT_PUBLIC_PIN_LENGTH` | Panjang PIN di UI (default: `6`) |

4. **Jalankan migrasi database**

   Jalankan file SQL di `supabase/migrations/` secara berurutan melalui Supabase Studio atau CLI.

5. **Jalankan dev server**
   ```bash
   npm run dev
   ```
   Buka [http://localhost:3000](http://localhost:3000).

### Build Production

```bash
npm run build
npm run start
```

## Tech Stack

- [Next.js 16](https://nextjs.org) (App Router)
- [Supabase](https://supabase.com) — database & realtime
- [Tailwind CSS](https://tailwindcss.com)
- [Recharts](https://recharts.org) — grafik
- [next-pwa](https://github.com/DucanH2912/next-pwa) — PWA support
