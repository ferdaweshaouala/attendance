import Link from 'next/link'
import { PERIOD_LABELS, type Period, type RankedStudent, type Summary } from '@/lib/stats'
import { badgesFor } from '@/lib/badges'

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }
const pct = (v: number | null) => (v === null ? '—' : `${v}%`)

export default function DashboardView({
  basePath,
  extraParams = {},
  period,
  rangeText,
  summary,
  ranked,
  groupNames,
}: {
  basePath: string
  extraParams?: Record<string, string>
  period: Period
  rangeText: string
  summary: Summary
  ranked: RankedStudent[]
  groupNames?: Record<string, string>
}) {
  const href = (p: Period) => `${basePath}?${new URLSearchParams({ ...extraParams, period: p })}`

  const cards = [
    { icon: '🧒', label: 'عدد الأطفال', value: summary.children_count },
    { icon: '✅', label: 'الحاضرون', value: summary.present_count },
    { icon: '❌', label: 'الغائبون', value: summary.absent_count },
    { icon: '📊', label: 'نسبة الحضور', value: pct(summary.attendance_rate) },
  ]

  return (
    <>
      <nav className="mb-2 grid grid-cols-3 gap-2" aria-label="الفترة">
        {(['week', 'month', 'all'] as Period[]).map((p) => (
          <Link
            key={p}
            href={href(p)}
            className={`rounded-xl py-2 text-center text-sm font-semibold ring-1 ${
              p === period
                ? 'bg-teal-700 text-white ring-teal-700'
                : 'bg-white text-stone-600 ring-stone-200 active:bg-stone-100'
            }`}
          >
            {PERIOD_LABELS[p]}
          </Link>
        ))}
      </nav>
      <p className="mb-5 text-center text-sm text-stone-400">{rangeText}</p>

      <section className="mb-6 grid grid-cols-2 gap-3">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl bg-white p-4 text-center shadow-sm ring-1 ring-stone-200">
            <p className="text-2xl">{c.icon}</p>
            <p className="mt-1 text-2xl font-bold text-teal-800">{c.value}</p>
            <p className="text-sm text-stone-500">{c.label}</p>
          </div>
        ))}
      </section>

      <h2 className="mb-3 text-lg font-bold text-teal-800">🏆 ترتيب الأطفال</h2>

      {ranked.length === 0 ? (
        <p className="rounded-2xl bg-white p-5 text-center text-stone-500 ring-1 ring-stone-200">
          لا توجد حصص مسجلة في هذه الفترة بعد.
        </p>
      ) : (
        <ol className="space-y-3">
          {ranked.map((s) => {
            const badges = badgesFor(s, period)
            const group = groupNames?.[s.teacher_id]
            return (
              <li key={s.student_id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-stone-200">
                <div className="flex items-center gap-3">
                  <span className="w-9 text-center text-2xl">
                    {MEDALS[s.rank] ?? <span className="text-base text-stone-400">{s.rank}</span>}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold">{s.student_name}</p>
                    {group && <p className="text-xs text-stone-400">{group}</p>}
                  </div>
                  <span className="text-lg font-bold text-teal-700">{pct(s.attendance_rate)}</span>
                </div>
                <div className="mt-3 h-2 rounded-full bg-stone-100">
                  <div
                    className="h-2 rounded-full bg-teal-600"
                    style={{ width: `${s.attendance_rate ?? 0}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-stone-500">
                  حضور {s.present_count} · غياب {s.absent_count} · من {s.total_sessions} حصة
                </p>
                {badges.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {badges.map((b) => (
                      <span
                        key={b.label}
                        className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800 ring-1 ring-amber-200"
                      >
                        {b.emoji} {b.label}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      )}
    </>
  )
}
