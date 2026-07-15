# Keuangan Kita

Aplikasi pengelola keuangan bersama untuk keluarga atau kelompok kecil.

## 🚀 Fitur Utama

- **Transaksi Harian**: Catat pemasukan, pengeluaran, transfer, dan split bill
- **Saldo Per Orang**: Tracking saldo bulanan per anggota
- **Tabungan**: Ledger tabungan terpisah dengan setor/tarik
- **Aset & Investasi**: Emas (logam mulia & perhiasan), deposito, piutang
- **Transaksi Berulang**: Template otomatis untuk transaksi rutin bulanan
- **Analisis**: Trend 6 bulan, breakdown kategori, perbandingan per orang
- **Mode Gelap**: Dark mode dengan pilihan 8 warna aksen
- **PWA**: Install sebagai aplikasi native, berjalan offline

## 🛠️ Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Supabase** (PostgreSQL)
- **Recharts** (visualisasi data)
- **Framer Motion** (animasi)
- **Radix UI** (komponen aksesibel)

## 📦 Instalasi

```bash
# Clone repository
git clone <repo-url> keuangan-kita
cd keuangan-kita

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local dan isi dengan konfigurasi Supabase Anda

# Jalankan development server
npm run dev
```

## 🔧 Environment Variables

File `.env.local` memerlukan variabel berikut:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Authentication PIN
AUTH_PIN=123456
AUTH_SECRET=your-auth-secret
```

## 🗄️ Database Setup

Jalankan migrasi di Supabase SQL Editor:

1. `001_initial_schema.sql` - Schema dasar
2. `002_add_source_to_recurring.sql` - Tambah source ke recurring
3. `003_gold_sub_type.sql` - Tambah sub_type untuk emas
4. `004_add_source_to_transactions.sql` - Tambah source ke transactions
5. `005_piutang.sql` - Tambah tabel piutang

## 📱 PWA Install

Aplikasi dapat diinstall sebagai Progressive Web App:

1. Buka di browser (Chrome/Safari)
2. Klik "Install" atau "Add to Home Screen"
3. Aplikasi akan muncul di home screen seperti app native

## 🌐 Deployment

### Vercel (Recommended)

```bash
vercel deploy --prod
```

### Self-hosted

```bash
npm run build
npm start
```

## 📂 Struktur Folder

```
keuangan-kita/
├── actions/          # Server actions (CRUD operations)
├── app/              # Pages (Next.js App Router)
├── components/       # React components
│   ├── home/         # Home page components
│   ├── layout/       # Layout components (BottomNav, etc.)
│   ├── providers/    # Context providers
│   ├── transaction/  # Transaction form & items
│   └── ui/           # UI primitives
├── lib/              # Utilities, types, constants
├── public/           # Static assets
├── scripts/          # Utility scripts
└── supabase/         # Database migrations
```

## 🎨 Customization

### Warna Aksen

Aplikasi mendukung 8 warna aksen:
- Indigo (default)
- Pink
- Emerald
- Blue
- Violet
- Amber
- Rose
- Teal

### Kategori Transaksi

Kategori dapat disesuaikan di `lib/constants.ts`:

```typescript
export const CATEGORIES: Category[] = [
  // Expense
  { id: 'food', name: 'Makanan', type: 'expense', icon: '🍽️' },
  // ...
]
```

## 🔐 Authentication

Aplikasi menggunakan PIN-based authentication sederhana. PIN disimpan di environment variable `AUTH_PIN`. Setelah login, cookie HMAC-signed akan disimpan selama 30 hari.

## 🤝 Kontribusi

1. Fork repository
2. Buat branch fitur (`git checkout -b fitur-baru`)
3. Commit perubahan (`git commit -am 'Tambah fitur baru'`)
4. Push ke branch (`git push origin fitur-baru`)
5. Buat Pull Request

## 📄 Lisensi

MIT License

## 📞 Kontak

Untuk pertanyaan atau dukungan, silakan buka Issues di repository.

---

Dibuat dengan ❤️ untuk mengelola keuangan keluarga dengan lebih baik.