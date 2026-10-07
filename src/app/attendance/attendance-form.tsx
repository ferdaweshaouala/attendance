'use client'

import { useActionState, useState } from 'react'
import { saveAttendance } from './actions'

type State = { error?: string; saved?: boolean }
type Status = 'present' | 'absent'
type Student = { id: string; name: string }
type Existing = Record<string, { status: Status; note: string | null }>

const base =
  'block rounded-2xl py-4 text-center text-lg font-semibold ring-1 ring-stone-200 bg-stone-50 text-stone-500 transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-teal-600'

export default function AttendanceForm({
  date,
  dateText,
  students,
  existing,
}: {
  date: string
  dateText: string
  students: Student[]
  existing: Existing
}) {
  const [status, setStatus] = useState<Record<string, Status | undefined>>(() =>
    Object.fromEntries(students.map((s) => [s.id, existing[s.id]?.status]))
  )
  const [notes, setNotes] = useState<Record<string, string>>(() =>
    Object.fromEntries(students.map((s) => [s.id, existing[s.id]?.note ?? '']))
  )
  const [edited, setEdited] = useState(false)

  const [state, action, pending] = useActionState<State, FormData>(async (prev, fd) => {
    const result = await saveAttendance(prev, fd)
    setEdited(false)
    return result
  }, {})

  const marked = students.filter((s) => status[s.id]).length
  const present = students.filter((s) => status[s.id] === 'present').length
  const absent = marked - present

  const choose = (id: string, value: Status) => {
    setStatus((p) => ({ ...p, [id]: value }))
    setEdited(true)
  }

  return (
    <form action={action} className="space-y-3 pb-32">
      <input type="hidden" name="date" value={date} />

      {students.map((s) => (
        <div key={s.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
          <p className="mb-3 text-lg font-semibold">{s.name}</p>
          <div className="grid grid-cols-2 gap-3">
            <label>
              <input
                type="radio"
                name={`status_${s.id}`}
                value="present"
                checked={status[s.id] === 'present'}
                onChange={() => choose(s.id, 'present')}
                className="peer sr-only"
              />
              <span className={`${base} peer-checked:bg-emerald-600 peer-checked:text-white peer-checked:ring-emerald-600`}>
                ✅ حاضر
              </span>
            </label>
            <label>
              <input
                type="radio"
                name={`status_${s.id}`}
                value="absent"
                checked={status[s.id] === 'absent'}
                onChange={() => choose(s.id, 'absent')}
                className="peer sr-only"
              />
              <span className={`${base} peer-checked:bg-rose-600 peer-checked:text-white peer-checked:ring-rose-600`}>
                ❌ غائب
              </span>
            </label>
          </div>
          <details className="mt-3" open={!!existing[s.id]?.note}>
            <summary className="cursor-pointer text-sm text-stone-500">ملاحظة (اختياري)</summary>
            <input
              name={`note_${s.id}`}
              value={notes[s.id] ?? ''}
              onChange={(e) => {
                setNotes((p) => ({ ...p, [s.id]: e.target.value }))
                setEdited(true)
              }}
              maxLength={300}
              className="mt-2 w-full rounded-xl bg-stone-50 px-3 py-2 ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </details>
        </div>
      ))}

      <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-white/95 px-5 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur">
        <div className="mx-auto max-w-md">
          <p className="mb-1 text-center text-xs text-stone-400">حصة {dateText}</p>
          <p className="mb-2 text-center text-sm" role="status">
            {state.error ? (
              <span className="text-red-600">{state.error}</span>
            ) : state.saved && !edited ? (
              <span className="font-semibold text-emerald-700">تم حفظ الحضور ✅</span>
            ) : (
              <span className="text-stone-500">
                تم تحديد {marked} من {students.length} — حاضر {present} · غائب {absent}
              </span>
            )}
          </p>
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-2xl bg-teal-700 py-4 text-lg font-semibold text-white active:bg-teal-800 disabled:opacity-60"
          >
            {pending ? 'جارٍ الحفظ…' : 'حفظ الحضور'}
          </button>
        </div>
      </div>
    </form>
  )
}
