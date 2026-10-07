import { Suspense } from 'react'
import Link from 'next/link'
import { connection } from 'next/server'
import { requireAdmin } from '@/lib/auth'
import { todayInTz } from '@/lib/dates'
import { getStudentStats, getSummary, parsePeriod, rankStudents } from '@/lib/stats'
import { periodText } from '@/lib/period-text'
import DashboardView from '@/components/dashboard-view'

type Params = { period?: string; teacher?: string }

async function Content({ searchParams }: { searchParams: Promise<Params> }) {
  await connection() // هذا الكود يعمل وقت الطلب وليس وقت البناء المسبق
  const params = await searchParams
  const period = parsePeriod(params.period)
  const today = todayInTz()
  const { supabase } = await requireAdmin()

  const { data } = await supabase.from('teachers').select('id,name,is_active').order('name')
  const teachers = (data ?? []) as { id: string; name: string; is_active: boolean }[]
  const teacherId = teachers.find((t) => t.id === params.teacher)?.id

  const [stats, summary] = await Promise.all([
    getStudentStats(supabase, period, today, teacherId),
    getSummary(supabase, period, today, teacherId),
  ])

  const chip = (active: boolean) =>
    `shrink-0 rounded-full px-4 py-2 text-sm font-semibold ring-1 ${
      active ? 'bg-teal-700 text-white ring-teal-700' : 'bg-white text-stone-600 ring-stone-200'
    }`

  return (
    <>
      <div className="-mx-5 mb-5 flex gap-2 overflow-x-auto px-5 pb-1">
        <Link href={`/admin/dashboard?period=${period}`} className={chip(!teacherId)}>
          كل المجموعات
        </Link>
        {teachers.map((t) => (
          <Link
            key={t.id}
            href={`/admin/dashboard?period=${period}&teacher=${t.id}`}
            className={chip(t.id === teacherId)}
          >
            {t.name}
          </Link>
        ))}
      </div>
      <DashboardView
        basePath="/admin/dashboard"
        extraParams={teacherId ? { teacher: teacherId } : {}}
        period={period}
        rangeText={periodText(period, today)}
        summary={summary}
        ranked={rankStudents(stats)}
        groupNames={teacherId ? undefined : Object.fromEntries(teachers.map((t) => [t.id, t.name]))}
      />
    </>
  )
}

export default function AdminDashboardPage({ searchParams }: { searchParams: Promise<Params> }) {
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <Link href="/admin" className="text-sm text-stone-400 underline">
        ← الإدارة
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-teal-800">📊 الإحصائيات</h1>
      <Suspense fallback={<p className="text-stone-400">جارٍ التحميل…</p>}>
        <Content searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
