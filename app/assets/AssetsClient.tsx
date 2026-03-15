'use client'

import { useState, useTransition } from 'react'
import { addAsset, updateAsset, deleteAsset, updateGoldPrice } from '@/actions/assets'
import type { Asset, Piutang } from '@/lib/types'
import { formatCurrency, todayISO } from '@/lib/constants'
import { Plus, Trash2, Edit2, Check, X, ChevronDown, Settings } from 'lucide-react'
import ConfirmModal from '@/components/ui/ConfirmModal'
import PiutangSection from './PiutangSection'
import { useHideAmounts } from '@/lib/HideAmountsContext'

interface GoldPriceInfo {
  price_per_gram: number
  date: string
  created_at: string
}

interface AssetsSummary {
  assets: Asset[]
  totalGrams: number
  totalLmGrams: number
  totalJewelryGrams: number
  pricePerGram: number
  jewelryPricePerGram: number
  totalGoldValue: number
  totalDepositValue: number
  goldPrice: GoldPriceInfo | null
}

interface Props {
  summary: AssetsSummary
  piutangList: Piutang[]
}

export default function AssetsClient({ summary, piutangList }: Props) {
  const [assets, setAssets] = useState(summary.assets)
  const [pricePerGram, setPricePerGram] = useState(summary.pricePerGram)
  const [jewelryPricePerGram, setJewelryPricePerGram] = useState(summary.jewelryPricePerGram)
  const [goldPrice, setGoldPrice] = useState<GoldPriceInfo | null>(summary.goldPrice)
  const [isPending, startTransition] = useTransition()
  const { hidden } = useHideAmounts()
  const fmt = (v: number) => hidden ? '••••••' : formatCurrency(v)

  // Add asset form
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newUnit, setNewUnit] = useState('gram')
  const [goldSubType, setGoldSubType] = useState<'logam_mulia' | 'perhiasan'>('logam_mulia')

  // Add deposit form
  const [showAddDepositForm, setShowAddDepositForm] = useState(false)
  const [newDepositName, setNewDepositName] = useState('')
  const [newDepositAmount, setNewDepositAmount] = useState('')
  const [newDepositNote, setNewDepositNote] = useState('')

  // Edit inline
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Gold price modal
  const [showPriceModal, setShowPriceModal] = useState(false)
  const [newPrice, setNewPrice] = useState(String(pricePerGram || ''))
  const [newJewelryPrice, setNewJewelryPrice] = useState(String(jewelryPricePerGram || ''))
  const [priceDate, setPriceDate] = useState(todayISO())
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'emas' | 'deposito' | 'piutang'>('emas')

  function handleAddDeposit(e: React.FormEvent) {
    e.preventDefault()
    if (!newDepositName || !newDepositAmount) return

    startTransition(async () => {
      await addAsset({
        name: newDepositName,
        type: 'deposit',
        amount: parseFloat(newDepositAmount),
        unit: 'IDR',
        note: newDepositNote || null,
      })
      setAssets((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: newDepositName,
          type: 'deposit',
          amount: parseFloat(newDepositAmount),
          unit: 'IDR',
          note: newDepositNote || null,
          created_at: new Date().toISOString(),
        },
      ])
      setNewDepositName('')
      setNewDepositAmount('')
      setNewDepositNote('')
      setShowAddDepositForm(false)
    })
  }

  function handleAddAsset(e: React.FormEvent) {
    e.preventDefault()
    if (!newName || !newAmount) return

    startTransition(async () => {
      await addAsset({
        name: newName,
        type: 'gold',
        sub_type: goldSubType,
        amount: parseFloat(newAmount),
        unit: newUnit,
      })
      setAssets((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: newName,
          type: 'gold',
          sub_type: goldSubType,
          amount: parseFloat(newAmount),
          unit: newUnit,
          created_at: new Date().toISOString(),
        },
      ])
      setNewName('')
      setNewAmount('')
      setShowAddForm(false)
    })
  }

  function handleUpdateAmount(id: string) {
    startTransition(async () => {
      await updateAsset(id, { amount: parseFloat(editAmount) })
      setAssets((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, amount: parseFloat(editAmount) } : a
        )
      )
      setEditingId(null)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteAsset(id)
      setAssets((prev) => prev.filter((a) => a.id !== id))
    })
  }

  function handleUpdatePrice(e: React.FormEvent) {
    e.preventDefault()
    if (!newPrice) return
    const price = parseFloat(newPrice)
    const jewelryPrice = newJewelryPrice ? parseFloat(newJewelryPrice) : null
    const now = new Date().toISOString()
    startTransition(async () => {
      await updateGoldPrice({
        price_per_gram: price,
        jewelry_price_per_gram: jewelryPrice,
        date: priceDate,
      })
      setPricePerGram(price)
      if (jewelryPrice !== null) setJewelryPricePerGram(jewelryPrice)
      setGoldPrice({ price_per_gram: price, date: priceDate, created_at: now })
      setShowPriceModal(false)
    })
  }

  const lmAssets = assets.filter(a => a.type === 'gold' && a.sub_type !== 'perhiasan')
  const jewelryAssets = assets.filter(a => a.type === 'gold' && a.sub_type === 'perhiasan')
  const totalGrams = assets.filter(a => a.type === 'gold').reduce((acc, a) => acc + a.amount, 0)
  const totalLmGrams = lmAssets.reduce((acc, a) => acc + a.amount, 0)
  const totalJewelryGrams = jewelryAssets.reduce((acc, a) => acc + a.amount, 0)
  const totalValue = totalLmGrams * pricePerGram + totalJewelryGrams * jewelryPricePerGram
  const totalDepositValue = assets.filter(a => a.type === 'deposit').reduce((acc, a) => acc + a.amount, 0)
  const totalPiutangOutstanding = piutangList
    .filter(p => p.status === 'outstanding')
    .reduce((sum, p) => {
      const paid = (p.payments ?? []).reduce((s, pay) => s + pay.amount, 0)
      return sum + Math.max(0, p.amount - paid)
    }, 0)
  const piutangOutstandingCount = piutangList.filter(p => p.status === 'outstanding').length
  const netWorth = totalValue + totalDepositValue + totalPiutangOutstanding

  return (
    <>
    <div className="px-4 space-y-4 pb-8">

      {/* Portfolio Overview Card */}
      <div className="bg-base-gradient rounded-2xl p-4 text-white shadow-md">
        <p className="text-white/70 text-xs font-medium mb-1">Total Kekayaan</p>
        <p className="text-3xl font-bold tracking-tight drop-shadow-sm">{fmt(netWorth)}</p>
        <div className="grid grid-cols-3 gap-2 mt-3 text-xs">
          <div className="bg-white/10 rounded-xl p-2">
            <p className="text-white/70 mb-0.5">Emas</p>
            <p className="font-semibold text-sm">{fmt(totalValue)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <p className="text-white/70 mb-0.5">Deposito</p>
            <p className="font-semibold text-sm">{fmt(totalDepositValue)}</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2">
            <p className="text-white/70 mb-0.5">Piutang</p>
            <p className="font-semibold text-sm">{fmt(totalPiutangOutstanding)}</p>
          </div>
        </div>
      </div>

      {/* Tab Nav */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-2xl">
        {([['emas', '🥇', 'Emas'], ['deposito', '🏦', 'Deposito'], ['piutang', '🤝', 'Piutang']] as const).map(([key, icon, label]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === key
                ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            <span>{icon}</span>
            <span>{label}</span>
            {key === 'piutang' && piutangOutstandingCount > 0 && (
              <span className="bg-emerald-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {piutangOutstandingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── TAB: EMAS ─── */}
      {activeTab === 'emas' && (
        <>
          {/* Gold Summary Card */}
          <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-4 text-white relative shadow-md">
            <button
              onClick={() => { setNewPrice(String(pricePerGram || '')); setNewJewelryPrice(String(jewelryPricePerGram || '')); setShowPriceModal(true) }}
              className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            >
              <Settings size={15} className="text-white" />
            </button>
            <p className="text-white/70 text-xs font-medium mb-1">Total Nilai Emas</p>
            <p className="text-2xl font-bold drop-shadow-sm">{fmt(totalValue)}</p>
            <div className="grid grid-cols-2 gap-2 mt-3">
              <div className="bg-white/15 rounded-xl p-2">
                <p className="text-white/70 text-[11px] mb-0.5">🥇 LM · {totalLmGrams}g</p>
                <p className="font-semibold text-sm">{pricePerGram > 0 ? formatCurrency(pricePerGram) + '/g' : '—'}</p>
              </div>
              <div className="bg-white/15 rounded-xl p-2">
                <p className="text-white/70 text-[11px] mb-0.5">💍 Perhiasan · {totalJewelryGrams}g</p>
                <p className="font-semibold text-sm">{jewelryPricePerGram > 0 ? formatCurrency(jewelryPricePerGram) + '/g' : '—'}</p>
              </div>
            </div>
            {goldPrice && (
              <p className="text-white/60 text-[10px] mt-2">
                Update:{' '}
                {new Date(goldPrice.created_at).toLocaleString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            )}
          </div>

          {/* Kepemilikan Emas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kepemilikan Emas</p>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="w-7 h-7 btn-base rounded-full flex items-center justify-center"
              >
                <Plus size={14} className="text-white" />
              </button>
            </div>

            {/* Add form */}
            {showAddForm && (
              <form onSubmit={handleAddAsset} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 mb-3 space-y-2">
                <div className="flex gap-2">
                  {(['logam_mulia', 'perhiasan'] as const).map((st) => (
                    <button key={st} type="button" onClick={() => setGoldSubType(st)}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors ${
                        goldSubType === st
                          ? 'bg-amber-500 text-white border-amber-500'
                          : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border-gray-200 dark:border-gray-600'
                      }`}>
                      {st === 'logam_mulia' ? '🥇 Logam Mulia' : '💍 Perhiasan'}
                    </button>
                  ))}
                </div>
                <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Nama (cth: Galeri24, UBS...)" className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none" />
                <div className="flex gap-2">
                  <input type="number" inputMode="decimal" value={newAmount} onChange={(e) => setNewAmount(e.target.value)} placeholder="Jumlah" className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none" />
                  <input type="text" value={newUnit} onChange={(e) => setNewUnit(e.target.value)} placeholder="gram" className="w-20 border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none" />
                </div>
                <div className="flex gap-2">
                  <button type="submit" disabled={isPending} className="flex-1 btn-base py-2 rounded-xl text-sm font-medium">Tambah</button>
                  <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-xl text-sm font-medium">Batal</button>
                </div>
              </form>
            )}

            {/* Logam Mulia */}
            {lmAssets.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mb-1.5 px-1">🥇 Logam Mulia</p>
                <div className="flex flex-col gap-2">
                  {lmAssets.map((asset) => {
                    const isExpanded = expandedId === asset.id
                    return (
                      <div key={asset.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="w-full flex items-center gap-3 p-3 text-left cursor-pointer" onClick={() => { if (editingId === asset.id) return; setExpandedId(isExpanded ? null : asset.id) }}>
                          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0"><span className="text-lg">🥇</span></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-left">{asset.name}</p>
                            {editingId === asset.id ? (
                              <div className="flex items-center gap-1 mt-1" onClick={e => e.stopPropagation()}>
                                <input type="number" inputMode="decimal" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="border border-gray-200 dark:border-gray-700 rounded-lg py-1 px-2 text-sm w-24 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none" autoFocus />
                                <span className="text-xs text-gray-500 dark:text-gray-400">{asset.unit}</span>
                                <button onClick={() => handleUpdateAmount(asset.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600"><Check size={16} /></button>
                                <button onClick={() => setEditingId(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500"><X size={16} /></button>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {asset.amount} {asset.unit}
                                {pricePerGram > 0 && <span className="ml-1.5 text-amber-600 dark:text-amber-400 font-medium">≈ {fmt(asset.amount * pricePerGram)}</span>}
                              </p>
                            )}
                          </div>
                          {editingId !== asset.id && <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />}
                        </div>
                        {isExpanded && (
                          <div className="flex border-t border-gray-100 dark:border-gray-700">
                            <button onClick={() => { setEditingId(asset.id); setEditAmount(String(asset.amount)); setExpandedId(null) }} disabled={isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs icon-btn-base transition-colors"><Edit2 size={13} />Edit</button>
                            <div className="w-px bg-gray-100 dark:bg-gray-700" />
                            <button onClick={() => setConfirmId(asset.id)} disabled={isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"><Trash2 size={13} />Hapus</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Total LM</p>
                    <div className="text-right">
                      <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{totalLmGrams}g</p>
                      {pricePerGram > 0 && <p className="text-xs text-amber-600 dark:text-amber-400">{fmt(totalLmGrams * pricePerGram)}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Perhiasan */}
            {jewelryAssets.length > 0 && (
              <div className="mb-3">
                <p className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 mb-1.5 px-1">💍 Perhiasan</p>
                <div className="flex flex-col gap-2">
                  {jewelryAssets.map((asset) => {
                    const isExpanded = expandedId === asset.id
                    return (
                      <div key={asset.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="w-full flex items-center gap-3 p-3 text-left cursor-pointer" onClick={() => { if (editingId === asset.id) return; setExpandedId(isExpanded ? null : asset.id) }}>
                          <div className="w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0"><span className="text-lg">💍</span></div>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-left">{asset.name}</p>
                            {editingId === asset.id ? (
                              <div className="flex items-center gap-1 mt-1" onClick={e => e.stopPropagation()}>
                                <input type="number" inputMode="decimal" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} className="border border-gray-200 dark:border-gray-700 rounded-lg py-1 px-2 text-sm w-24 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none" autoFocus />
                                <span className="text-xs text-gray-500 dark:text-gray-400">{asset.unit}</span>
                                <button onClick={() => handleUpdateAmount(asset.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600"><Check size={16} /></button>
                                <button onClick={() => setEditingId(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500"><X size={16} /></button>
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {asset.amount} {asset.unit}
                                {jewelryPricePerGram > 0 && <span className="ml-1.5 text-rose-500 dark:text-rose-400 font-medium">≈ {fmt(asset.amount * jewelryPricePerGram)}</span>}
                              </p>
                            )}
                          </div>
                          {editingId !== asset.id && <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />}
                        </div>
                        {isExpanded && (
                          <div className="flex border-t border-gray-100 dark:border-gray-700">
                            <button onClick={() => { setEditingId(asset.id); setEditAmount(String(asset.amount)); setExpandedId(null) }} disabled={isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs icon-btn-base transition-colors"><Edit2 size={13} />Edit</button>
                            <div className="w-px bg-gray-100 dark:bg-gray-700" />
                            <button onClick={() => setConfirmId(asset.id)} disabled={isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"><Trash2 size={13} />Hapus</button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  <div className="bg-rose-50 dark:bg-rose-900/20 rounded-2xl p-3 flex items-center justify-between">
                    <p className="text-sm font-semibold text-rose-700 dark:text-rose-300">Total Perhiasan</p>
                    <div className="text-right">
                      <p className="text-sm font-bold text-rose-700 dark:text-rose-300">{totalJewelryGrams}g</p>
                      {jewelryPricePerGram > 0 && <p className="text-xs text-rose-500 dark:text-rose-400">{fmt(totalJewelryGrams * jewelryPricePerGram)}</p>}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {assets.filter(a => a.type === 'gold').length === 0 && (
              <p className="text-center text-gray-400 text-sm py-6">Belum ada aset emas</p>
            )}
          </div>
        </>
      )}

      {/* ─── TAB: DEPOSITO ─── */}
      {activeTab === 'deposito' && (
        <>
          {/* Deposit Summary Card */}
          <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white shadow-md">
            <p className="text-white/70 text-xs font-medium mb-1">Total Deposito</p>
            <p className="text-2xl font-bold drop-shadow-sm">{fmt(totalDepositValue)}</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Deposito</p>
              <button onClick={() => setShowAddDepositForm(!showAddDepositForm)} className="w-7 h-7 btn-base rounded-full flex items-center justify-center">
                <Plus size={14} className="text-white" />
              </button>
            </div>

            {showAddDepositForm && (
              <form onSubmit={handleAddDeposit} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 mb-3 space-y-2">
                <input type="text" value={newDepositName} onChange={(e) => setNewDepositName(e.target.value)} placeholder="Nama (cth: BCA 3 Bulan, Mandiri...)" className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none" />
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                  <input type="text" inputMode="numeric" value={newDepositAmount ? newDepositAmount.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''} onChange={(e) => setNewDepositAmount(e.target.value.replace(/\D/g, ''))} placeholder="Nominal" className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none" />
                </div>
                <input type="text" value={newDepositNote} onChange={(e) => setNewDepositNote(e.target.value)} placeholder="Catatan (cth: bunga 5%, JT Jun 2026)" className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none" />
                <div className="flex gap-2">
                  <button type="submit" disabled={isPending} className="flex-1 btn-base py-2 rounded-xl text-sm font-medium">Tambah</button>
                  <button type="button" onClick={() => setShowAddDepositForm(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-xl text-sm font-medium">Batal</button>
                </div>
              </form>
            )}

            {assets.filter(a => a.type === 'deposit').length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">Belum ada deposito</p>
            ) : (
              <div className="flex flex-col gap-2">
                {assets.filter(a => a.type === 'deposit').map((asset) => {
                  const isExpanded = expandedId === asset.id
                  return (
                    <div key={asset.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                      <button className="w-full flex items-center gap-3 p-3 text-left" onClick={() => { if (editingId === asset.id) return; setExpandedId(isExpanded ? null : asset.id) }}>
                        <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0"><span className="text-lg">🏦</span></div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-left">{asset.name}</p>
                          {editingId === asset.id ? (
                            <div className="flex items-center gap-1 mt-1" onClick={e => e.stopPropagation()}>
                              <span className="text-xs text-gray-400">Rp</span>
                              <input type="text" inputMode="numeric" value={editAmount ? editAmount.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''} onChange={(e) => setEditAmount(e.target.value.replace(/\D/g, ''))} className="border border-gray-200 dark:border-gray-700 rounded-lg py-1 px-2 text-sm w-32 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none" autoFocus />
                              <button onClick={() => handleUpdateAmount(asset.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600"><Check size={16} /></button>
                              <button onClick={() => setEditingId(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500"><X size={16} /></button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-sm font-semibold text-blue-600 dark:text-blue-400 text-left">{fmt(asset.amount)}</p>
                              {asset.note && <p className="text-xs text-gray-400 dark:text-gray-500 text-left">{asset.note}</p>}
                            </div>
                          )}
                        </div>
                        {editingId !== asset.id && <ChevronDown size={14} className={`text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} />}
                      </button>
                      {isExpanded && (
                        <div className="flex border-t border-gray-100 dark:border-gray-700">
                          <button onClick={() => { setEditingId(asset.id); setEditAmount(String(asset.amount)); setExpandedId(null) }} disabled={isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs icon-btn-base transition-colors"><Edit2 size={13} />Edit</button>
                          <div className="w-px bg-gray-100 dark:bg-gray-700" />
                          <button onClick={() => setConfirmId(asset.id)} disabled={isPending} className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"><Trash2 size={13} />Hapus</button>
                        </div>
                      )}
                    </div>
                  )
                })}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 flex items-center justify-between">
                  <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">Total Deposito</p>
                  <p className="text-sm font-bold text-blue-800 dark:text-blue-300">{fmt(totalDepositValue)}</p>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ─── TAB: PIUTANG ─── */}
      {activeTab === 'piutang' && <PiutangSection initialData={piutangList} />}

    </div>

    {/* Gold Price Modal */}
    {showPriceModal && (
      <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40" onClick={() => setShowPriceModal(false)}>
        <div className="w-full max-w-lg bg-white dark:bg-gray-900 rounded-t-3xl p-5 pb-20 space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-m font-bold text-gray-900 dark:text-gray-100">Update Harga Emas</h3>
            <button onClick={() => setShowPriceModal(false)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500"><X size={16} /></button>
          </div>
          <form onSubmit={handleUpdatePrice} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Harga Logam Mulia / gram</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                <input type="text" inputMode="numeric" value={newPrice ? newPrice.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''} onChange={(e) => setNewPrice(e.target.value.replace(/\D/g, ''))} placeholder="0" className="w-full pl-10 pr-3 h-[40px] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none" autoFocus />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Harga Perhiasan / gram</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
                <input type="text" inputMode="numeric" value={newJewelryPrice ? newJewelryPrice.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''} onChange={(e) => setNewJewelryPrice(e.target.value.replace(/\D/g, ''))} placeholder="0" className="w-full pl-10 pr-3 h-[40px] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Tanggal</label>
              <input type="date" value={priceDate} onChange={(e) => setPriceDate(e.target.value)} className="w-full h-[40px] border border-gray-200 dark:border-gray-700 rounded-xl px-3 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 focus:outline-none appearance-none" />
            </div>
            <div className="flex gap-2 pt-3">
              <button type="submit" disabled={isPending} className="flex-1 bg-amber-500 text-white h-[40px] rounded-xl text-sm font-semibold">Simpan</button>
              <button type="button" onClick={() => setShowPriceModal(false)} className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 h-[40px] rounded-xl text-sm font-medium">Batal</button>
            </div>
          </form>
        </div>
      </div>
    )}

    {confirmId && (
      <ConfirmModal
        message="Hapus aset ini?"
        onConfirm={() => { handleDelete(confirmId); setConfirmId(null) }}
        onCancel={() => setConfirmId(null)}
      />
    )}
  </>
  )
}
