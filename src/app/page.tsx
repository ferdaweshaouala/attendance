import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

async function TeacherList() {
  const supabase = await createClient()
  const { data: teachers } = await supabase.rpc('list_active_teachers')

  return (
    <div className="flex flex-col gap-3">
      {(teachers ?? []).map((t: { id: string; name: string }) => (
        <Link
          key={t.id}
          href={`/login?t=${t.id}`}
          className="rounded-2xl bg-white px-5 py-4 text-center text-lg font-semibold text-stone-800 shadow-sm ring-1 ring-stone-200 active:scale-[0.98] active:bg-teal-50"
        >
          {t.name}
        </Link>
      ))}
      {teachers && teachers.length === 0 && (
        <p className="text-center text-stone-400">لا توجد معلمات بعد.</p>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-5 py-10">
      <h1 className="mb-2 text-center text-2xl font-bold text-teal-800">حضور الأطفال</h1>
      <p className="mb-8 text-center text-stone-500">اختاري اسم المعلمة</p>

      <Suspense fallback={<p className="text-center text-stone-400">جارٍ التحميل…</p>}>
        <TeacherList />
      </Suspense>

      <Link href="/admin/login" className="mt-auto pt-10 text-center text-sm text-stone-400 underline">
        دخول الإدارة
      </Link>
    </main>
  )
}
