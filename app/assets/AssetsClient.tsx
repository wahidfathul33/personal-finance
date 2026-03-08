'use client'

import { useState, useTransition } from 'react'
import { addAsset, updateAsset, deleteAsset, updateGoldPrice } from '@/actions/assets'
import type { Asset } from '@/lib/types'
import { formatCurrency, todayISO } from '@/lib/constants'
import { Plus, Trash2, Edit2, Check, X, ChevronDown } from 'lucide-react'

interface GoldPriceInfo {
  price_per_gram: number
  date: string
  created_at: string
}

interface AssetsSummary {
  assets: Asset[]
  totalGrams: number
  pricePerGram: number
  totalGoldValue: number
  goldPrice: GoldPriceInfo | null
}

interface Props {
  summary: AssetsSummary
}

export default function AssetsClient({ summary }: Props) {
  const [assets, setAssets] = useState(summary.assets)
  const [pricePerGram, setPricePerGram] = useState(summary.pricePerGram)
  const [goldPrice, setGoldPrice] = useState<GoldPriceInfo | null>(summary.goldPrice)
  const [isPending, startTransition] = useTransition()

  // Add asset form
  const [showAddForm, setShowAddForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newUnit, setNewUnit] = useState('gram')

  // Edit inline
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editAmount, setEditAmount] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  // Gold price
  const [showPriceForm, setShowPriceForm] = useState(false)
  const [newPrice, setNewPrice] = useState(String(pricePerGram || ''))
  const [priceDate, setPriceDate] = useState(todayISO())

  function handleAddAsset(e: React.FormEvent) {
    e.preventDefault()
    if (!newName || !newAmount) return

    startTransition(async () => {
      await addAsset({
        name: newName,
        type: 'gold',
        amount: parseFloat(newAmount),
        unit: newUnit,
      })
      setAssets((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          name: newName,
          type: 'gold',
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
    if (!confirm('Hapus aset ini?')) return
    startTransition(async () => {
      await deleteAsset(id)
      setAssets((prev) => prev.filter((a) => a.id !== id))
    })
  }

  function handleUpdatePrice(e: React.FormEvent) {
    e.preventDefault()
    if (!newPrice) return
    const price = parseFloat(newPrice)
    const now = new Date().toISOString()
    startTransition(async () => {
      await updateGoldPrice({
        price_per_gram: price,
        date: priceDate,
      })
      setPricePerGram(price)
      setGoldPrice({ price_per_gram: price, date: priceDate, created_at: now })
      setShowPriceForm(false)
    })
  }

  const totalGrams = assets.reduce((acc, a) => acc + a.amount, 0)
  const totalValue = totalGrams * pricePerGram

  return (
    <div className="px-4 space-y-4 pb-8">
      {/* Reactive Summary Card */}
      <div className="bg-gradient-to-br from-yellow-400 to-amber-500 rounded-2xl p-4 text-white">
        <p className="text-yellow-100 text-xs font-medium mb-1">Total Nilai Emas</p>
        <p className="text-2xl font-bold mb-3">{formatCurrency(totalGrams * pricePerGram)}</p>
        <div className="flex justify-between text-sm">
          <div>
            <p className="text-yellow-100 text-xs">Total Gram</p>
            <p className="font-semibold">{totalGrams} gram</p>
          </div>
          <div className="text-right">
            <p className="text-yellow-100 text-xs">Harga / gram</p>
            <p className="font-semibold">
              {pricePerGram > 0 ? formatCurrency(pricePerGram) : 'Belum diset'}
            </p>
          </div>
        </div>
        {goldPrice && (
          <p className="text-yellow-100 text-[10px] mt-2">
            Update:{' '}
            {new Date(goldPrice.created_at).toLocaleString('id-ID', {
              day: 'numeric', month: 'short', year: 'numeric',
              hour: '2-digit', minute: '2-digit',
            })}
          </p>
        )}
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Kepemilikan Emas
          </p>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="w-7 h-7 bg-indigo-600 rounded-full flex items-center justify-center"
          >
            <Plus size={14} className="text-white" />
          </button>
        </div>

        {/* Add form */}
        {showAddForm && (
          <form
            onSubmit={handleAddAsset}
            className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 mb-3 space-y-2"
          >
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nama (cth: Galeri24, UBS...)"
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
            />
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                placeholder="Jumlah"
                className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
              />
              <input
                type="text"
                value={newUnit}
                onChange={(e) => setNewUnit(e.target.value)}
                placeholder="gram"
                className="w-20 border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-indigo-600 text-white py-2 rounded-xl text-sm font-medium"
              >
                Tambah
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-xl text-sm font-medium"
              >
                Batal
              </button>
            </div>
          </form>
        )}

        {assets.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-6">Belum ada aset</p>
        ) : (
          <div className="flex flex-col gap-2">
            {assets.map((asset) => {
              const isExpanded = expandedId === asset.id
              return (
              <div
                key={asset.id}
                className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <button
                  className="w-full flex items-center gap-3 p-3 text-left"
                  onClick={() => {
                    if (editingId === asset.id) return
                    setExpandedId(isExpanded ? null : asset.id)
                  }}
                >
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🥇</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 text-left">{asset.name}</p>
                    {editingId === asset.id ? (
                      <div className="flex items-center gap-1 mt-1" onClick={e => e.stopPropagation()}>
                        <input
                          type="number"
                          inputMode="decimal"
                          value={editAmount}
                          onChange={(e) => setEditAmount(e.target.value)}
                          className="border border-gray-200 dark:border-gray-700 rounded-lg py-1 px-2 text-sm w-24 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none"
                          autoFocus
                        />
                        <span className="text-xs text-gray-500 dark:text-gray-400">{asset.unit}</span>
                        <button onClick={() => handleUpdateAmount(asset.id)} className="w-8 h-8 flex items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors">
                          <Check size={16} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-gray-500 dark:text-gray-400 text-left">
                        {asset.amount} {asset.unit}
                        {pricePerGram > 0 && (
                          <span className="ml-1.5 text-amber-600 dark:text-amber-400 font-medium">
                            ≈ {formatCurrency(asset.amount * pricePerGram)}
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  {editingId !== asset.id && (
                    <ChevronDown
                      size={14}
                      className={`text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                    />
                  )}
                </button>

                {isExpanded && (
                  <div className="flex border-t border-gray-100 dark:border-gray-700">
                    <button
                      onClick={() => { setEditingId(asset.id); setEditAmount(String(asset.amount)); setExpandedId(null) }}
                      disabled={isPending}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 active:bg-indigo-100 transition-colors"
                    >
                      <Edit2 size={13} />
                      Edit
                    </button>
                    <div className="w-px bg-gray-100 dark:bg-gray-700" />
                    <button
                      onClick={() => handleDelete(asset.id)}
                      disabled={isPending}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                    >
                      <Trash2 size={13} />
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            )})}

            {/* Total row */}
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Total</p>
              <div className="text-right">
                <p className="text-sm font-bold text-amber-800 dark:text-amber-300">{totalGrams} gram</p>
                {pricePerGram > 0 && (
                  <p className="text-xs text-amber-600 dark:text-amber-400">{formatCurrency(totalValue)}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Gold price */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            Harga Emas
          </p>
          <button
            onClick={() => setShowPriceForm(!showPriceForm)}
            className="text-xs text-indigo-600 font-medium"
          >
            Update
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">Harga per gram</p>
            {goldPrice && (
              <p className="text-[10px] text-gray-400 dark:text-gray-500 mt-0.5">
                {new Date(goldPrice.created_at).toLocaleString('id-ID', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit',
                })}
              </p>
            )}
          </div>
          <p className="text-sm font-bold text-amber-700 dark:text-amber-400">
            {pricePerGram > 0 ? formatCurrency(pricePerGram) : 'Belum diset'}
          </p>
        </div>

        {showPriceForm && (
          <form
            onSubmit={handleUpdatePrice}
            className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 mt-2 space-y-2"
          >
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
              <input
                type="number"
                inputMode="numeric"
                value={newPrice}
                onChange={(e) => setNewPrice(e.target.value)}
                placeholder="0"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-semibold bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none"
              />
            </div>
            <input
              type="date"
              value={priceDate}
              onChange={(e) => setPriceDate(e.target.value)}
              className="w-full h-10 border border-gray-200 dark:border-gray-700 rounded-xl px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 bg-amber-500 text-white py-2 rounded-xl text-sm font-medium"
              >
                Simpan
              </button>
              <button
                type="button"
                onClick={() => setShowPriceForm(false)}
                className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-xl text-sm font-medium"
              >
                Batal
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
