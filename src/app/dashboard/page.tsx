import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { todayInTz } from '@/lib/dates'
import { getStudentStats, getSummary, parsePeriod, rankStudents } from '@/lib/stats'
import { periodText } from '@/lib/period-text'
import DashboardView from '@/components/dashboard-view'

async function Content({ searchParams }: { searchParams: Promise<{ period?: string }> }) {
  await connection() // هذا الكود يعمل وقت الطلب وليس وقت البناء المسبق
  const params = await searchParams
  const period = parsePeriod(params.period)
  const today = todayInTz()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/')

  const { data: teacher } = await supabase
    .from('teachers')
    .select('id,name')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .maybeSingle()
  if (!teacher) redirect('/')

  const [stats, summary] = await Promise.all([
    getStudentStats(supabase, period, today, teacher.id),
    getSummary(supabase, period, today, teacher.id),
  ])

  return (
    <>
      <header className="mb-5 rounded-2xl bg-teal-700 p-5 text-white shadow-sm">
        <h1 className="text-2xl font-bold">📊 إحصائيات {teacher.name}</h1>
        <Link href="/attendance" className="mt-3 inline-block rounded-xl bg-white/15 px-3 py-1 text-sm">
          ← تسجيل الحضور
        </Link>
      </header>
      <DashboardView
        basePath="/dashboard"
        period={period}
        rangeText={periodText(period, today)}
        summary={summary}
        ranked={rankStudents(stats)}
      />
    </>
  )
}

export default function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  return (
    <main className="mx-auto max-w-md px-5 py-6">
      <Suspense fallback={<p className="text-stone-400">جارٍ التحميل…</p>}>
        <Content searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
