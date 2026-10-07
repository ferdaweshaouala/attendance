'use client'

import { useRouter } from 'next/navigation'

export default function DatePicker({ date, max }: { date: string; max: string }) {
  const router = useRouter()
  return (
    <div className="mb-5 flex items-center gap-2">
      <label htmlFor="date" className="text-sm text-stone-500">
        تاريخ الحصة
      </label>
      <input
        id="date"
        type="date"
        defaultValue={date}
        max={max}
        onChange={(e) => {
          if (e.target.value) router.push(`/attendance?date=${e.target.value}`)
        }}
        className="min-w-0 flex-1 rounded-xl bg-white px-3 py-2 ring-1 ring-stone-200"
      />
    </div>
  )
}
