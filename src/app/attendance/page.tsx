import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { dateLabel, isValidDate, todayInTz, weekLabel } from '@/lib/dates'
import { logout } from '../login/actions'
import AttendanceForm from './attendance-form'
import DatePicker from './date-picker'

type Existing = Record<string, { status: 'present' | 'absent'; note: string | null }>

async function Content({ searchParams }: { searchParams: Promise<{ date?: string }> }) {
  await connection() // هذا الكود يعمل وقت الطلب وليس وقت البناء المسبق
  const params = await searchParams
  const today = todayInTz()
  const date = isValidDate(params.date) && params.date <= today ? params.date : today

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

  const { data: students } = await supabase
    .from('students')
    .select('id,name')
    .eq('teacher_id', teacher.id)
    .eq('is_active', true)
    .order('name')

  const { data: session } = await supabase
    .from('sessions')
    .select('id')
    .eq('teacher_id', teacher.id)
    .eq('session_date', date)
    .maybeSingle()

  const existing: Existing = {}
  if (session) {
    const { data: rows } = await supabase
      .from('attendance')
      .select('student_id,status,note')
      .eq('session_id', session.id)
    for (const r of rows ?? []) existing[r.student_id] = { status: r.status, note: r.note }
  }

  return (
    <>
      <header className="mb-5 rounded-2xl bg-teal-700 p-5 text-white shadow-sm">
        <div className="flex items-start justify-between">
          <h1 className="text-2xl font-bold">{teacher.name}</h1>
          <form action={logout}>
            <button className="text-sm text-teal-100 underline">خروج</button>
          </form>
        </div>
        <p className="mt-2 text-teal-50">{dateLabel(date)}</p>
        <p className="text-sm text-teal-100">الأسبوع: {weekLabel(date)}</p>
        <Link href="/dashboard" className="mt-3 inline-block rounded-xl bg-white/15 px-3 py-1 text-sm">
          📊 الإحصائيات
        </Link>
      </header>

      <DatePicker date={date} max={today} />

      {students && students.length > 0 ? (
        <AttendanceForm key={date} date={date} dateText={dateLabel(date)} students={students} existing={existing} />
      ) : (
        <p className="rounded-2xl bg-white p-5 text-center text-stone-500 ring-1 ring-stone-200">
          لا يوجد أطفال في مجموعتك بعد.
        </p>
      )}
    </>
  )
}

export default function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  return (
    <main className="mx-auto max-w-md px-5 py-6">
      <Suspense fallback={<p className="text-stone-400">جارٍ التحميل…</p>}>
        <Content searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
