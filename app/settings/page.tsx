'use client'

import { useState, useEffect, useTransition } from 'react'
import { getPersons, addPerson, updatePerson, deletePerson } from '@/actions/persons'
import { invalidatePersonsCache } from '@/lib/usePersons'
import ConfirmModal from '@/components/ui/ConfirmModal'
import type { Person } from '@/lib/types'
import { PERSON_COLORS, COLOR_OPTIONS, COLOR_LABELS } from '@/lib/constants'
import { useBaseColor, BASE_COLOR_OPTIONS } from '@/components/providers/BaseColorProvider'
import PageHeader from '@/components/layout/PageHeader'
import { Pencil, Trash2, Check, X, Plus, GripVertical } from 'lucide-react'

function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (c: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {COLOR_OPTIONS.map((c) => {
        const colors = PERSON_COLORS[c]
        const isSelected = value === c
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            title={COLOR_LABELS[c] ?? c}
            className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center ${
              colors.button
            } ${isSelected ? 'border-gray-800 dark:border-white scale-110' : 'border-transparent'}`}
          >
            {isSelected && <Check size={12} />}
          </button>
        )
      })}
    </div>
  )
}

interface EditRowProps {
  person: Person
  onDone: () => void
}

function EditRow({ person, onDone }: EditRowProps) {
  const [name, setName] = useState(person.name)
  const [color, setColor] = useState(person.color)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    startTransition(async () => {
      await updatePerson(person.id, { name: name.trim(), color })
      onDone()
    })
  }

  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Nama</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 h-[40px] text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--base-400)]"
        />
      </div>
      <div>
        <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Warna</label>
        <ColorPicker value={color} onChange={setColor} />
      </div>
      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={isPending || !name.trim()}
          className="flex-1 h-[40px] btn-base text-sm font-medium rounded-xl"
        >
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button
          onClick={onDone}
          className="px-4 h-[40px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          Batal
        </button>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const [persons, setPersons] = useState<Person[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showAdd, setShowAdd] = useState(false)
  const [addName, setAddName] = useState('')
  const [addColor, setAddColor] = useState('indigo')
  const [isPending, startTransition] = useTransition()
  const [loading, setLoading] = useState(true)
  const [confirmPerson, setConfirmPerson] = useState<{ id: string; name: string } | null>(null)
  const { color: baseColor, setColor: setBaseColor } = useBaseColor()

  async function reload() {
    const data = await getPersons()
    setPersons(data)
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  function handleDoneEdit() {
    invalidatePersonsCache()
    setEditingId(null)
    reload()
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePerson(id)
      invalidatePersonsCache()
      await reload()
    })
  }

  function handleAdd() {
    if (!addName.trim()) return
    startTransition(async () => {
      await addPerson(addName.trim(), addColor)
      invalidatePersonsCache()
      setAddName('')
      setAddColor('indigo')
      setShowAdd(false)
      await reload()
    })
  }

  return (
    <>
    <div>
      <PageHeader title="Pengaturan" />

      <div className="px-4 pb-8 space-y-6">
        {/* Base Color Section */}
        <div>
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Warna Dasar</h2>
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">Warna aksen utama untuk navigasi dan tombol aksi.</p>
            <div className="flex flex-wrap gap-2">
              {BASE_COLOR_OPTIONS.map((c) => {
                const palette = PERSON_COLORS[c]
                const isSelected = baseColor === c
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setBaseColor(c)}
                    title={COLOR_LABELS[c] ?? c}
                    className={`flex flex-col items-center gap-1.5 px-2 py-2 rounded-2xl border-2 transition-all ${
                      isSelected
                        ? 'border-gray-700 dark:border-white bg-gray-50 dark:bg-gray-700'
                        : 'border-transparent hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full ${palette.button} flex items-center justify-center flex-shrink-0`}>
                      {isSelected && <Check size={14} />}
                    </div>
                    <span className="text-[10px] font-medium text-gray-600 dark:text-gray-400 w-12 text-center leading-tight">
                      {COLOR_LABELS[c] ?? c}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Persons Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Orang</h2>
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="w-9 h-9 flex items-center justify-center rounded-full btn-base"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Add Form */}
          {showAdd && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-indigo-200 dark:border-indigo-700 p-4 mb-3 space-y-3">
              <p className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">Orang Baru</p>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-1 block">Nama</label>
                <input
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Nama orang..."
                  className="w-full px-3 h-[40px] text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-[var(--base-400)]"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 dark:text-gray-400 mb-2 block">Warna</label>
                <ColorPicker value={addColor} onChange={setAddColor} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleAdd}
                  disabled={isPending || !addName.trim()}
                  className="flex-1 h-[40px] btn-base text-sm font-medium rounded-xl"
                >
                  {isPending ? 'Menambahkan...' : 'Tambah'}
                </button>
                <button
                  onClick={() => { setShowAdd(false); setAddName('') }}
                  className="px-4 h-[40px] bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}

          {/* Person List */}
          {loading ? (
            <div className="text-center py-6 text-gray-400 text-sm">Memuat...</div>
          ) : persons.length === 0 ? (
            <div className="text-center py-6 text-gray-400 text-sm">Belum ada orang</div>
          ) : (
            <div className="space-y-3">
              {persons.map((p) => {
                const colors = PERSON_COLORS[p.color] ?? PERSON_COLORS.indigo
                const isEditing = editingId === p.id

                return (
                  <div
                    key={p.id}
                    className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-3"
                  >
                    {isEditing ? (
                      <EditRow person={p} onDone={handleDoneEdit} />
                    ) : (
                      <div className="flex items-center gap-3">
                        <GripVertical size={16} className="text-gray-300 dark:text-gray-600 flex-shrink-0" />
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${colors.badge}`}
                        >
                          {p.name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                          {COLOR_LABELS[p.color] ?? p.color}
                        </span>
                        <div className="flex items-center gap-1 ml-auto">
                          <button
                            onClick={() => setEditingId(p.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-full icon-btn-base transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmPerson({ id: p.id, name: p.name })}
                            disabled={isPending}
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-rose-50 dark:hover:bg-rose-900/20 text-gray-400 hover:text-rose-500 transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-700/50 p-4">
          <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Info</p>
          <p className="text-xs text-amber-600 dark:text-amber-500">
            Menghapus orang akan menghapus semua transaksi, tabungan, dan data terkait orang tersebut.
          </p>
        </div>
      </div>
    </div>
    {confirmPerson && (
      <ConfirmModal
        message={`Hapus "${confirmPerson.name}"? Semua transaksi terkait akan terhapus.`}
        onConfirm={() => { handleDelete(confirmPerson.id); setConfirmPerson(null) }}
        onCancel={() => setConfirmPerson(null)}
      />
    )}
    </>
  )
}
