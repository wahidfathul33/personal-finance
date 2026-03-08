'use client'

import { useState, useEffect, useTransition } from 'react'
import { getPersons, addPerson, updatePerson, deletePerson } from '@/actions/persons'
import type { Person } from '@/lib/types'
import { PERSON_COLORS, COLOR_OPTIONS } from '@/lib/constants'
import PageHeader from '@/components/PageHeader'
import { Pencil, Trash2, Check, X, Plus, GripVertical } from 'lucide-react'

const COLOR_LABELS: Record<string, string> = {
  indigo: 'Indigo',
  pink: 'Merah Muda',
  emerald: 'Hijau',
  blue: 'Biru',
  violet: 'Ungu',
  amber: 'Kuning',
  rose: 'Merah',
  teal: 'Teal',
}

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
          className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
          className="flex-1 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50"
        >
          {isPending ? 'Menyimpan...' : 'Simpan'}
        </button>
        <button
          onClick={onDone}
          className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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

  async function reload() {
    const data = await getPersons()
    setPersons(data)
    setLoading(false)
  }

  useEffect(() => {
    reload()
  }, [])

  function handleDoneEdit() {
    setEditingId(null)
    reload()
  }

  function handleDelete(id: string, name: string) {
    if (!confirm(`Hapus "${name}"? Semua transaksi terkait akan terhapus.`)) return
    startTransition(async () => {
      await deletePerson(id)
      await reload()
    })
  }

  function handleAdd() {
    if (!addName.trim()) return
    startTransition(async () => {
      await addPerson(addName.trim(), addColor)
      setAddName('')
      setAddColor('indigo')
      setShowAdd(false)
      await reload()
    })
  }

  return (
    <div>
      <PageHeader title="Pengaturan" />

      <div className="px-4 pb-8 space-y-6">
        {/* Persons Section */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Orang</h2>
            <button
              onClick={() => setShowAdd((v) => !v)}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500 text-white text-xs font-medium rounded-xl hover:bg-indigo-600 active:scale-95 transition-all"
            >
              <Plus size={13} />
              Tambah
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
                  className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
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
                  className="flex-1 py-2 bg-indigo-500 text-white text-sm font-medium rounded-xl hover:bg-indigo-600 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isPending ? 'Menambahkan...' : 'Tambah'}
                </button>
                <button
                  onClick={() => { setShowAdd(false); setAddName('') }}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-sm rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
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
                            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-indigo-500 transition-colors"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
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
  )
}
