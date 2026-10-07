import { Suspense } from 'react'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { addTeacher, updateTeacher, resetPin, toggleTeacher } from '../actions'
import { input, btnPrimary, btnLight, card } from '../styles'

type Teacher = { id: string; name: string; is_active: boolean }

async function Content({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const { supabase } = await requireAdmin()
  const { data } = await supabase.from('teachers').select('id,name,is_active').order('name')
  const teachers = (data ?? []) as Teacher[]

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700">
          {error}
        </p>
      )}

      <form action={addTeacher} className={`${card} mb-6 space-y-3`}>
        <h2 className="font-semibold">إضافة معلمة</h2>
        <input name="name" required placeholder="الاسم" className={`${input} w-full`} />
        <input
          name="pin"
          required
          inputMode="numeric"
          pattern="\d{6,8}"
          placeholder="الرمز السري (6 إلى 8 أرقام)"
          className={`${input} w-full`}
        />
        <button className={`${btnPrimary} w-full`}>إضافة</button>
      </form>

      <div className="space-y-3">
        {teachers.map((t) => (
          <div key={t.id} className={`${card} ${t.is_active ? '' : 'opacity-60'}`}>
            <form action={updateTeacher} className="flex gap-2">
              <input type="hidden" name="id" value={t.id} />
              <input name="name" defaultValue={t.name} required className={`${input} min-w-0 flex-1`} />
              <button className={btnLight}>حفظ</button>
            </form>

            <details className="mt-3">
              <summary className="cursor-pointer text-sm text-teal-700">تغيير الرمز السري</summary>
              <form action={resetPin} className="mt-2 flex gap-2">
                <input type="hidden" name="id" value={t.id} />
                <input
                  name="pin"
                  required
                  inputMode="numeric"
                  pattern="\d{6,8}"
                  placeholder="رمز جديد"
                  className={`${input} min-w-0 flex-1`}
                />
                <button className={btnLight}>تغيير</button>
              </form>
            </details>

            <form action={toggleTeacher} className="mt-3">
              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="active" value={String(!t.is_active)} />
              <button className="text-sm text-stone-500 underline">
                {t.is_active ? 'تعطيل المعلمة' : 'إعادة التفعيل'}
              </button>
            </form>
          </div>
        ))}
        {teachers.length === 0 && <p className="text-center text-stone-400">لا توجد معلمات بعد.</p>}
      </div>
    </>
  )
}

export default function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <Link href="/admin" className="text-sm text-stone-400 underline">
        ← الإدارة
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-teal-800">المعلمات</h1>
      <Suspense fallback={<p className="text-stone-400">جارٍ التحميل…</p>}>
        <Content searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
