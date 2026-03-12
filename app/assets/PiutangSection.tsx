'use client'

import { useState, useTransition } from 'react'
import { addPiutang, deletePiutang, addPiutangPayment, deletePiutangPayment } from '@/actions/piutang'
import type { Piutang } from '@/lib/types'
import { formatCurrency, todayISO } from '@/lib/constants'
import { Plus, Trash2, ChevronDown, Check, X, Clock } from 'lucide-react'
import ConfirmModal from '@/components/ConfirmModal'

interface Props {
  initialData: Piutang[]
}

export default function PiutangSection({ initialData }: Props) {
  const [piutangList, setPiutangList] = useState<Piutang[]>(initialData)
  const [isPending, startTransition] = useTransition()

  const [showAddForm, setShowAddForm] = useState(false)
  const [newDebtorName, setNewDebtorName] = useState('')
  const [newAmount, setNewAmount] = useState('')
  const [newDate, setNewDate] = useState(todayISO())
  const [newNote, setNewNote] = useState('')

  const [addingPaymentFor, setAddingPaymentFor] = useState<string | null>(null)
  const [payAmount, setPayAmount] = useState('')
  const [payDate, setPayDate] = useState(todayISO())
  const [payNote, setPayNote] = useState('')

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showPaidHistory, setShowPaidHistory] = useState(false)

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [confirmDeletePaymentId, setConfirmDeletePaymentId] = useState<{
    piutangId: string
    paymentId: string
  } | null>(null)

  const outstanding = piutangList.filter((p) => p.status === 'outstanding')
  const paid = piutangList.filter((p) => p.status === 'paid')
  const totalOutstanding = outstanding.reduce((sum, p) => {
    const paidAmt = (p.payments ?? []).reduce((s, pay) => s + pay.amount, 0)
    return sum + Math.max(0, p.amount - paidAmt)
  }, 0)

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!newDebtorName || !newAmount) return
    startTransition(async () => {
      const result = await addPiutang({
        debtor_name: newDebtorName,
        amount: parseFloat(newAmount),
        date: newDate,
        note: newNote || undefined,
      })
      setPiutangList((prev) => [{ ...result, payments: [] }, ...prev])
      setNewDebtorName('')
      setNewAmount('')
      setNewDate(todayISO())
      setNewNote('')
      setShowAddForm(false)
    })
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePiutang(id)
      setPiutangList((prev) => prev.filter((p) => p.id !== id))
    })
  }

  function handleAddPayment(e: React.FormEvent, piutangId: string) {
    e.preventDefault()
    if (!payAmount) return
    startTransition(async () => {
      const result = await addPiutangPayment({
        piutang_id: piutangId,
        amount: parseFloat(payAmount),
        date: payDate,
        note: payNote || undefined,
      })
      setPiutangList((prev) =>
        prev.map((p) => {
          if (p.id !== piutangId) return p
          const updatedPayments = [...(p.payments ?? []), result.payment]
          return { ...p, payments: updatedPayments, status: result.newStatus }
        })
      )
      setPayAmount('')
      setPayDate(todayISO())
      setPayNote('')
      setAddingPaymentFor(null)
    })
  }

  function handleDeletePayment(piutangId: string, paymentId: string) {
    startTransition(async () => {
      await deletePiutangPayment(paymentId)
      setPiutangList((prev) =>
        prev.map((p) => {
          if (p.id !== piutangId) return p
          const updatedPayments = (p.payments ?? []).filter((pay) => pay.id !== paymentId)
          const totalPaid = updatedPayments.reduce((s, pay) => s + pay.amount, 0)
          return {
            ...p,
            payments: updatedPayments,
            status: totalPaid >= p.amount ? 'paid' : 'outstanding',
          }
        })
      )
    })
  }

  return (
    <div>
      {/* Summary Card */}
      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white mb-4 shadow-md">
        <p className="text-white/80 text-xs font-medium mb-1">Total Piutang</p>
        <p className="text-2xl font-bold drop-shadow-sm">{formatCurrency(totalOutstanding)}</p>
        <p className="text-white/80 text-xs mt-1">{outstanding.length} tagihan aktif</p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Piutang</p>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-7 h-7 btn-base rounded-full flex items-center justify-center"
        >
          <Plus size={14} className="text-white" />
        </button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAdd} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 mb-3 space-y-2">
          <input
            type="text"
            value={newDebtorName}
            onChange={(e) => setNewDebtorName(e.target.value)}
            placeholder="Nama peminjam"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
            autoFocus
          />
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={newAmount ? newAmount.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
              onChange={(e) => setNewAmount(e.target.value.replace(/\D/g, ''))}
              placeholder="Nominal"
              className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
            />
          </div>
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none"
          />
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Catatan (opsional)"
            className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={isPending} className="flex-1 btn-base py-2 rounded-xl text-sm font-medium">
              Tambah
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-xl text-sm font-medium">
              Batal
            </button>
          </div>
        </form>
      )}

      {/* Outstanding list */}
      {outstanding.length === 0 ? (
        <p className="text-center text-gray-400 text-sm py-4">Tidak ada piutang aktif</p>
      ) : (
        <div className="flex flex-col gap-2 mb-4">
          {outstanding.map((p) => {
            const paidAmt = (p.payments ?? []).reduce((s, pay) => s + pay.amount, 0)
            const remaining = Math.max(0, p.amount - paidAmt)
            const isExpanded = expandedId === p.id
            const progress = p.amount > 0 ? Math.min(1, paidAmt / p.amount) : 0

            return (
              <div key={p.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
                <button
                  className="w-full flex items-center gap-3 p-3 text-left"
                  onClick={() => setExpandedId(isExpanded ? null : p.id)}
                >
                  <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-lg">🤝</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{p.debtor_name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Sisa:{' '}
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                        {formatCurrency(remaining)}
                      </span>
                      {paidAmt > 0 && (
                        <span className="ml-1 text-gray-400">/ {formatCurrency(p.amount)}</span>
                      )}
                    </p>
                    {paidAmt > 0 && (
                      <div className="mt-1.5 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-400 dark:bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${progress * 100}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <ChevronDown
                    size={14}
                    className={`text-gray-400 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                  />
                </button>

                {isExpanded && (
                  <div className="border-t border-gray-100 dark:border-gray-700">
                    {/* Meta */}
                    <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
                      <p>
                        Dipinjam:{' '}
                        {new Date(p.date).toLocaleDateString('id-ID', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </p>
                      <p>Total: {formatCurrency(p.amount)}</p>
                      {p.note && <p>Catatan: {p.note}</p>}
                    </div>

                    {/* Payment history */}
                    {(p.payments ?? []).length > 0 && (
                      <div className="px-3 pb-2">
                        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1.5">
                          Riwayat Pembayaran
                        </p>
                        <div className="space-y-1.5">
                          {(p.payments ?? []).map((pay) => (
                            <div
                              key={pay.id}
                              className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/50 rounded-xl px-3 py-2"
                            >
                              <div>
                                <p className="text-sm font-bold text-gray-900 dark:text-gray-100">
                                  {formatCurrency(pay.amount)}
                                </p>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400">
                                  {new Date(pay.date).toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'short',
                                    year: 'numeric',
                                  })}
                                  {pay.note ? ` · ${pay.note}` : ''}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  setConfirmDeletePaymentId({ piutangId: p.id, paymentId: pay.id })
                                }
                                className="w-7 h-7 flex items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-400 dark:text-rose-300"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Add payment form */}
                    {addingPaymentFor === p.id ? (
                      <form
                        onSubmit={(e) => handleAddPayment(e, p.id)}
                        className="px-3 pb-3 space-y-2"
                      >
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                            Rp
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={payAmount ? payAmount.replace(/\B(?=(\d{3})+(?!\d))/g, '.') : ''}
                            onChange={(e) => setPayAmount(e.target.value.replace(/\D/g, ''))}
                            placeholder={`Maks ${formatCurrency(remaining)}`}
                            className="w-full pl-10 pr-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
                            autoFocus
                          />
                        </div>
                        <input
                          type="date"
                          value={payDate}
                          onChange={(e) => setPayDate(e.target.value)}
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none"
                        />
                        <input
                          type="text"
                          value={payNote}
                          onChange={(e) => setPayNote(e.target.value)}
                          placeholder="Catatan (opsional)"
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2 px-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 placeholder-gray-400 focus:outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={isPending}
                            className="flex-1 bg-emerald-500 text-white py-2 rounded-xl text-xs font-semibold"
                          >
                            Catat Bayar
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingPaymentFor(null)}
                            className="flex-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-xl text-xs font-medium"
                          >
                            Batal
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex border-t border-gray-100 dark:border-gray-700">
                        <button
                          onClick={() => {
                            setAddingPaymentFor(p.id)
                            setPayAmount('')
                            setPayDate(todayISO())
                            setPayNote('')
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors font-medium"
                        >
                          <Check size={13} /> Catat Bayar
                        </button>
                        <div className="w-px bg-gray-100 dark:bg-gray-700" />
                        <button
                          onClick={() => setConfirmDeleteId(p.id)}
                          disabled={isPending}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                        >
                          <Trash2 size={13} /> Hapus
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Paid history */}
      {paid.length > 0 && (
        <div>
          <button
            onClick={() => setShowPaidHistory(!showPaidHistory)}
            className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase tracking-wider mb-2 w-full"
          >
            <Clock size={12} />
            Sudah Lunas ({paid.length})
            <ChevronDown
              size={12}
              className={`ml-auto transition-transform ${showPaidHistory ? 'rotate-180' : ''}`}
            />
          </button>

          <div
            style={{
              display: 'grid',
              gridTemplateRows: showPaidHistory ? '1fr' : '0fr',
              transition: 'grid-template-rows 0.25s ease',
            }}
          >
            <div style={{ overflow: 'hidden' }}>
              <div className="flex flex-col gap-2 pb-2">
                {paid.map((p) => (
                  <div
                    key={p.id}
                    className="bg-gray-50 dark:bg-gray-800/60 rounded-2xl p-3 flex items-center gap-3 opacity-70"
                  >
                    <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                      <Check size={14} className="text-emerald-500 dark:text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {p.debtor_name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{formatCurrency(p.amount)} · Lunas</p>
                    </div>
                    <button
                      onClick={() => setConfirmDeleteId(p.id)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-rose-50 dark:bg-rose-900/20 text-rose-400 dark:text-rose-300"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId && (
        <ConfirmModal
          message="Hapus piutang ini beserta semua riwayat pembayarannya?"
          onConfirm={() => {
            handleDelete(confirmDeleteId)
            setConfirmDeleteId(null)
          }}
          onCancel={() => setConfirmDeleteId(null)}
        />
      )}

      {confirmDeletePaymentId && (
        <ConfirmModal
          message="Hapus catatan pembayaran ini?"
          onConfirm={() => {
            handleDeletePayment(
              confirmDeletePaymentId.piutangId,
              confirmDeletePaymentId.paymentId
            )
            setConfirmDeletePaymentId(null)
          }}
          onCancel={() => setConfirmDeletePaymentId(null)}
        />
      )}
    </div>
  )
}
