/**
 * Script: map-categories-from-note.ts
 * 
 * Membaca transactions dari Supabase, lalu menebak category_id
 * berdasarkan kata kunci yang ada di field `note`.
 * 
 * Jalankan dengan:
 *   npx tsx scripts/map-categories-from-note.ts
 * 
 * Gunakan flag --dry-run untuk preview tanpa update ke database:
 *   npx tsx scripts/map-categories-from-note.ts --dry-run
 * 
 * Gunakan flag --all untuk memproses semua transaksi (dengan/tanpa kategori):
 *   npx tsx scripts/map-categories-from-note.ts --all
 */

import 'dotenv/config'
import { createClient } from '@supabase/supabase-js'

// ─── Config ───────────────────────────────────────────────────────────────────

const isDryRun = process.argv.includes('--dry-run')
const processAll = process.argv.includes('--all')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// ─── Keyword Mapping ──────────────────────────────────────────────────────────
// Setiap entry: [category_id, kata-kunci[], exact_word_match?]
// exact=true  → keyword harus berdiri sendiri sebagai kata (word boundary)
// exact=false → substring matching biasa (default untuk frasa panjang)
// Urutan penting — yang lebih spesifik ditulis lebih dulu.

interface KeywordRule {
  categoryId: string
  keywords: string[]
  exact: boolean  // true = whole-word match only
}

const KEYWORD_RULES: KeywordRule[] = [
  // ── Charity — didahulukan dari bonus/salary ────────────────────────────────
  { categoryId: 'charity',     exact: false, keywords: ['bagi thr', 'uang thr', 'bagi-bagi', 'kasih mbah', 'kasih bocil', 'angpao', 'uang lebaran', 'uang baru', 'kasih mamak', 'kasih bakwan', 'kasih adik', 'lebaran'] },
  { categoryId: 'charity',     exact: true,  keywords: ['donasi', 'sedekah', 'infak', 'zakat', 'sumbangan', 'amal', 'kurban', 'wakaf'] },

  // ── Income ────────────────────────────────────────────────────────────────
  // bonus sebelum salary agar "THR gaji" → bonus
  { categoryId: 'bonus',       exact: true,  keywords: ['bonus', 'thr', 'insentif', 'incentive', 'reward', 'remun', 'spmb'] },
  { categoryId: 'salary',      exact: true,  keywords: ['gaji', 'gapok', 'payroll', 'payslip', 'upah'] },
  { categoryId: 'salary',      exact: false, keywords: ['slip gaji', 'uang makan'] },
  { categoryId: 'other_income',exact: true,  keywords: ['kpri', 'koperasi', 'shu'] },
  { categoryId: 'freelance',   exact: true,  keywords: ['freelance', 'freelancing'] },
  { categoryId: 'freelance',   exact: false, keywords: ['project', 'projek'] },
  { categoryId: 'investment',  exact: true,  keywords: ['investasi', 'dividen', 'return', 'profit'] },
  { categoryId: 'investment',  exact: false, keywords: ['bunga deposito', 'untung saham'] },

  // ── Bills — admin/biaya top up ────────────────────────────────────────────
  { categoryId: 'bills',       exact: false, keywords: ['top up', 'topup', 'admin mandiri', 'admin bca', 'admin bni', 'admin bri'] },

  // ── Transfer ──────────────────────────────────────────────────────────────
  { categoryId: 'transfer',    exact: false, keywords: ['dari dana', 'dari ovo', 'dari gopay', 'shopee pay'] },
  { categoryId: 'transfer',    exact: true,  keywords: ['transfer', 'kirim', 'ovo', 'gopay', 'dana', 'bni', 'bca', 'mandiri', 'bri', 'jago', 'jenius', 'flip', 'emoney', 'e-money'] },

  // ── Subscription — sebelum transport agar "Gojek Plus" / "Youtube" tidak salah ──
  { categoryId: 'subscription', exact: false, keywords: ['gojek plus', 'youtube premium', 'youtube', 'google one', 'berlangganan', 'netflix'] },
  { categoryId: 'subscription', exact: true,  keywords: ['langganan', 'subscription', 'spotify', 'icloud', 'canva', 'figma', 'notion'] },

  // ── Health — sebelum food agar "plester mata ikan" tidak salah ────────────
  { categoryId: 'health',      exact: false, keywords: ['mata ikan', 'rumah sakit', 'cek darah', 'imunisasi'] },
  { categoryId: 'health',      exact: true,  keywords: [
    'obat', 'dokter', 'klinik', 'poli', 'apotek', 'apotik', 'farmasi',
    'vitamin', 'suplemen', 'bpjs', 'vaksin', 'plester', 'masker',
  ]},

  // ── Transport — sebelum food agar "parkir X" tidak salah ─────────────────
  { categoryId: 'transport',   exact: false, keywords: [
    'grab', 'gojek', 'gocar', 'maxim', 'ojek', 'taksi', 'taxi',
    'transjakarta', 'tiket pesawat', 'tiket bus', 'tiket bis', 'cuci motor',
    'toilet rest', 'pengembalian uang bis',
  ]},
  { categoryId: 'transport',   exact: true,  keywords: [
    'parkir', 'bensin', 'bbm', 'pertamax', 'pertalite', 'solar',
    'bus', 'bis', 'kereta', 'kai', 'mrt', 'lrt', 'commuter',
    'ongkir', 'ongkos', 'toll', 'emoney', 'e-money',
  ]},
  { categoryId: 'transport',   exact: false, keywords: [' tol '] },  // hanya dengan spasi kiri-kanan agar tidak cocok dengan "pentol"

  // ── Food ──────────────────────────────────────────────────────────────────
  { categoryId: 'food',        exact: true,  keywords: [
    // Waktu makan
    'makan', 'makanan', 'sarapan', 'sahur', 'makan malam', 'makan siang',
    // Bahan pokok & bumbu
    'nasi', 'beras', 'telur', 'telor', 'ayam', 'ikan', 'lele', 'minyak', 'gula', 'garam',
    'bawang', 'pokcoy', 'brokoli', 'sayur', 'buah', 'nanas', 'alpukat', 'durian',
    'galon', 'sembako', 'lauk',
    // Mie & pasta
    'mie', 'mi', 'indomie', 'nasgor',
    // Makanan tradisional & jajanan
    'bakso', 'soto', 'pecel', 'sate', 'penyetan', 'dimsum', 'pentol',
    'bakwan', 'tahu', 'tempe', 'cireng', 'cimol', 'cilok', 'cuanki', 'sempol',
    'basreng', 'odading', 'peyek', 'kerupuk', 'permen', 'stik',
    'ronde', 'pangsit', 'pempek', 'mpek', 'takoyaki', 'mochi', 'dadar',
    'kopken', 'twiti',
    // Fast food & restoran
    'pizza', 'burger', 'kfc', 'jollibee', 'hokben',
    // Minuman
    'kopi', 'teh', 'susu', 'minuman', 'minum', 'jus', 'boba', 'cincau',
    // Snack & dessert
    'snack', 'gorengan', 'roti', 'camilan', 'jajan', 'chikuro', 'gelato',
    // Warung
    'warung', 'warteg',
    // Lain-lain
    'bukber', 'katering', 'catering', 'paket makan',
  ]},
  { categoryId: 'food',        exact: false, keywords: [
    'restoran', 'restaurant', 'cafe', 'kafe', 'coffee', 'gofood', 'grab food',
    'shopeefood', 'mcdonalds', 'mekdi', 'bubble tea', 'es krim', 'es teler',
    'es pisang', 'es kuwut', 'es susu', 'essusu', 'bahan roti', 'natadecoco',
    'ikan goreng', 'ikan bakar', 'lele bakar', 'bakwan kawi', 'tahu cihuni',
    'tahu pepes', 'tahu dan', 'dan tahu', 'ronde +', 'roket chicken',
    'tempo gelato', 'le mineral', 'ngopi', 'kue kering', 'minyak dan',
    'kharismaku', 'karismaku', 'payakumbuah', 'maskot', 'seringga',
  ]},

  // ── Shopping ──────────────────────────────────────────────────────────────
  { categoryId: 'shopping',    exact: true,  keywords: [
    'belanja', 'beli', 'shopping', 'shopee', 'tokopedia', 'lazada', 'blibli',
    'amazon', 'bukalapak', 'alfamart', 'indomaret', 'supermarket', 'hypermart',
    'carrefour', 'pasar', 'toko', 'baju', 'sepatu', 'tas', 'rok', 'hat',
    'softcase', 'dompet', 'pouch', 'lakban', 'swalayan',
  ]},
  { categoryId: 'shopping',    exact: false, keywords: ['kharisma', 'sri ratu', 'giant', 'yogya', 'mikki'] },
  { categoryId: 'shopping',    exact: false, keywords: ['tiktok shop', 'emas', 'perhiasan'] },

  // ── Entertainment ─────────────────────────────────────────────────────────
  { categoryId: 'entertainment',exact: true,  keywords: [
    'nonton', 'bioskop', 'bisokop', 'cgv', 'xxi', 'cinepolis', 'cinema',
    'movie', 'film', 'disney', 'game', 'steam', 'hiburan', 'rekreasi',
    'wisata', 'liburan', 'hotel', 'penginapan', 'foto',
  ]},
  { categoryId: 'entertainment',exact: false, keywords: ['playstore', 'appstore', 'jalan-jalan', 'disneyplus', 'hbo max'] },

  // ── Bills ─────────────────────────────────────────────────────────────────
  { categoryId: 'bills',       exact: true,  keywords: [
    'listrik', 'pln', 'pdam', 'tagihan', 'iuran', 'arisan', 'internet',
    'wifi', 'indihome', 'biznet', 'telkom', 'telkomsel', 'simpati', 'smartfren',
    'cicilan', 'angsuran', 'kpr', 'kredit', 'kuota',
  ]},
  { categoryId: 'bills',       exact: false, keywords: ['air bersih', 'bayar tagihan', 'myrepublic', 'admin bank'] },

  // ── Education ─────────────────────────────────────────────────────────────
  { categoryId: 'education',   exact: true,  keywords: [
    'buku', 'kursus', 'sekolah', 'spp', 'kuliah', 'pendidikan',
    'seminar', 'workshop', 'training', 'pelatihan', 'udemy', 'coursera',
    'ruangguru', 'quipper', 'zenius', 'spmb', 'snbt', 'sbmptn',
  ]},
  { categoryId: 'education',   exact: false, keywords: ['les privat', 'privat', 'microsoft 365'] },

  // ── Personal Care — sebelum household agar "sabun [brand]" → personal_care ─
  { categoryId: 'personal_care',exact: false, keywords: ['sabun mandi', 'sabun nalpa', 'potong rambut', 'cukur rambut', 'skincare', 'kosmetik', 'perawatan'] },
  { categoryId: 'personal_care',exact: true,  keywords: [
    'salon', 'barber', 'spa', 'makeup', 'parfum', 'waxing', 'facial',
    'creambath', 'serum', 'pedi', 'manikur', 'manicure', 'pedicure',
  ]},
  { categoryId: 'personal_care',exact: false, keywords: ['pensil alis', 'lipstik', 'lipbalm', 'body lotion', 'hand body'] },

  // ── Household ─────────────────────────────────────────────────────────────
  { categoryId: 'household',   exact: true,  keywords: [
    'sewa', 'kontrakan', 'kos', 'dapur', 'detergen', 'sapu', 'ember',
    'perabot', 'furnitur', 'furniture', 'lemari', 'kasur', 'bantal',
    'perlengkapan', 'peralatan', 'renovasi', 'dempul',
  ]},
  { categoryId: 'household',   exact: false, keywords: [
    'rumah tangga', 'cat rumah', 'kontrak rumah', 'indekos', 'pel lantai',
    'sabun cuci', 'sabun bubuk',
  ]},
]

// ─── Matching Logic ───────────────────────────────────────────────────────────

/** Buat regex word-boundary yang aman untuk kata bahasa Indonesia */
function makeWordBoundaryRegex(keyword: string): RegExp {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Gunakan word boundary-style: spasi, awal/akhir string, atau tanda baca
  return new RegExp(`(?<![a-zA-Z])${escaped}(?![a-zA-Z])`, 'i')
}

/** Kategori yang valid per tipe transaksi */
const INCOME_CATEGORY_IDS = new Set(['salary', 'freelance', 'investment', 'bonus', 'other_income'])
const EXPENSE_CATEGORY_IDS = new Set(['food', 'transport', 'shopping', 'health', 'entertainment', 'bills', 'education', 'household', 'personal_care', 'subscription', 'charity', 'other'])
const TRANSFER_CATEGORY_IDS = new Set(['transfer'])

function categoryAllowedForType(categoryId: string, type: string): boolean {
  if (type === 'income')   return INCOME_CATEGORY_IDS.has(categoryId)
  if (type === 'transfer') return TRANSFER_CATEGORY_IDS.has(categoryId)
  if (type === 'expense')  return EXPENSE_CATEGORY_IDS.has(categoryId)
  return true
}

function inferCategory(note: string | null, type: string): string | null {
  if (!note) return null
  const lower = note.toLowerCase()

  for (const rule of KEYWORD_RULES) {
    if (!categoryAllowedForType(rule.categoryId, type)) continue
    for (const kw of rule.keywords) {
      const matched = rule.exact
        ? makeWordBoundaryRegex(kw).test(lower)
        : lower.includes(kw)
      if (matched) return rule.categoryId
    }
  }
  return null
}

/** Cek apakah note mengandung keyword dari kategori lain juga (multi-match) */
function hasMultipleCategories(note: string, type: string, inferred: string): boolean {
  let matchCount = 0
  const lower = note.toLowerCase()
  for (const rule of KEYWORD_RULES) {
    if (!categoryAllowedForType(rule.categoryId, type)) continue
    if (rule.categoryId === inferred) continue
    for (const kw of rule.keywords) {
      const matched = rule.exact
        ? makeWordBoundaryRegex(kw).test(lower)
        : lower.includes(kw)
      if (matched) { matchCount++; break }
    }
  }
  return matchCount > 0
}

// ─── Main ─────────────────────────────────────────────────────────────────────

interface TransactionRow {
  id: string
  note: string | null
  category_id: string | null
  type: string
}

async function main() {
  console.log(`\n=== Category Mapper from Note ===`)
  console.log(`Mode  : ${isDryRun ? '🔍 DRY RUN (tidak ada update ke DB)' : '✏️  LIVE (akan update ke DB)'}`)
  console.log(`Scope : ${processAll ? 'Semua transaksi' : 'Hanya yang category_id = null'}\n`)

  // Fetch transactions
  let query = supabase
    .from('transactions')
    .select('id, note, category_id, type')
    .not('note', 'is', null)

  if (!processAll) {
    query = query.is('category_id', null)
  }

  const { data, error } = await query
  if (error) {
    console.error('❌ Gagal fetch:', error.message)
    process.exit(1)
  }

  const rows = (data ?? []) as TransactionRow[]
  console.log(`Ditemukan ${rows.length} transaksi dengan note.\n`)

  // Map category for each row
  const updates: { id: string; note: string; old: string | null; new: string }[] = []
  const skipped: { id: string; note: string; reason: string }[] = []

  for (const row of rows) {
    // Skip notes yang hanya berisi recurring ID — tidak ada info kategori
    if (row.note && row.note.includes('[recurring:')) {
      skipped.push({ id: row.id, note: row.note ?? '', reason: 'skip (recurring)' })
      continue
    }

    const inferred = inferCategory(row.note, row.type)

    if (!inferred) {
      skipped.push({ id: row.id, note: row.note ?? '', reason: 'tidak ada keyword cocok' })
      continue
    }

    // Jika note mengandung keyword dari beberapa kategori (ambiguous) dan sudah ada kategori → skip
    if (row.category_id && hasMultipleCategories(row.note ?? '', row.type, inferred)) {
      skipped.push({ id: row.id, note: row.note ?? '', reason: `multi-kategori, pertahankan: ${row.category_id}` })
      continue
    }

    if (!processAll && row.category_id) {
      skipped.push({ id: row.id, note: row.note ?? '', reason: `sudah punya kategori: ${row.category_id}` })
      continue
    }

    if (processAll && row.category_id === inferred) {
      skipped.push({ id: row.id, note: row.note ?? '', reason: 'kategori sudah sama' })
      continue
    }

    updates.push({
      id: row.id,
      note: row.note ?? '',
      old: row.category_id,
      new: inferred,
    })
  }

  // Show preview
  console.log(`📋 AKAN DIUPDATE (${updates.length}):`)
  console.log('─'.repeat(90))
  for (const u of updates) {
    const arrow = u.old ? `${u.old} → ${u.new}` : `null → ${u.new}`
    console.log(`  [${arrow.padEnd(30)}] "${u.note.substring(0, 50)}"`)
  }

  if (skipped.length > 0) {
    console.log(`\n⏭️  DILEWATI (${skipped.length}):`)
    console.log('─'.repeat(90))
    for (const s of skipped) {
      console.log(`  [${s.reason.padEnd(30)}] "${s.note.substring(0, 50)}"`)
    }
  }

  if (isDryRun) {
    console.log('\n✅ DRY RUN selesai. Jalankan tanpa --dry-run untuk apply perubahan.')
    return
  }

  if (updates.length === 0) {
    console.log('\n✅ Tidak ada yang perlu diupdate.')
    return
  }

  // Perform updates in batches of 50
  console.log(`\n⏳ Mengupdate ${updates.length} transaksi...`)
  let successCount = 0
  let failCount = 0

  // Update one by one to handle errors per row
  for (const u of updates) {
    const { error: updateErr } = await supabase
      .from('transactions')
      .update({ category_id: u.new })
      .eq('id', u.id)

    if (updateErr) {
      console.error(`  ❌ GAGAL id=${u.id}: ${updateErr.message}`)
      failCount++
    } else {
      successCount++
    }
  }

  console.log(`\n✅ Selesai! Berhasil: ${successCount}, Gagal: ${failCount}`)
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
