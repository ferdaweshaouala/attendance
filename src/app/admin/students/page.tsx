import { Suspense } from 'react'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { addStudent, updateStudent, toggleStudent } from '../actions'
import { input, btnPrimary, btnLight, card } from '../styles'

type Teacher = { id: string; name: string; is_active: boolean }
type Student = { id: string; name: string; teacher_id: string; is_active: boolean }

async function Content({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams
  const { supabase } = await requireAdmin()
  const [t, s] = await Promise.all([
    supabase.from('teachers').select('id,name,is_active').order('name'),
    supabase.from('students').select('id,name,teacher_id,is_active').order('name'),
  ])
  const teachers = (t.data ?? []) as Teacher[]
  const students = (s.data ?? []) as Student[]
  const activeTeachers = teachers.filter((x) => x.is_active)

  return (
    <>
      {error && (
        <p role="alert" className="mb-4 rounded-2xl bg-red-50 px-4 py-3 text-red-700">
          {error}
        </p>
      )}

      {activeTeachers.length === 0 ? (
        <p className={`${card} mb-6 text-stone-500`}>أضيفي معلمة أولًا من صفحة المعلمات.</p>
      ) : (
        <form action={addStudent} className={`${card} mb-6 space-y-3`}>
          <h2 className="font-semibold">إضافة طفل</h2>
          <input name="name" required placeholder="اسم الطفل" className={`${input} w-full`} />
          <select name="teacher_id" required className={`${input} w-full`}>
            {activeTeachers.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
          <button className={`${btnPrimary} w-full`}>إضافة</button>
        </form>
      )}

      <div className="space-y-6">
        {teachers.map((teacher) => {
          const group = students.filter((x) => x.teacher_id === teacher.id)
          return (
            <section key={teacher.id}>
              <h2 className="mb-2 font-semibold text-teal-800">
                {teacher.name}
                {!teacher.is_active && ' (معطّلة)'} — {group.length}
              </h2>
              <div className="space-y-3">
                {group.map((st) => (
                  <div key={st.id} className={`${card} ${st.is_active ? '' : 'opacity-60'}`}>
                    <form action={updateStudent} className="space-y-2">
                      <input type="hidden" name="id" value={st.id} />
                      <input name="name" defaultValue={st.name} required className={`${input} w-full`} />
                      <div className="flex gap-2">
                        <select
                          name="teacher_id"
                          defaultValue={st.teacher_id}
                          className={`${input} min-w-0 flex-1`}
                        >
                          {teachers.map((x) => (
                            <option key={x.id} value={x.id}>
                              {x.name}
                              {!x.is_active ? ' (معطّلة)' : ''}
                            </option>
                          ))}
                        </select>
                        <button className={btnLight}>حفظ</button>
                      </div>
                    </form>
                    <form action={toggleStudent} className="mt-3">
                      <input type="hidden" name="id" value={st.id} />
                      <input type="hidden" name="active" value={String(!st.is_active)} />
                      <button className="text-sm text-stone-500 underline">
                        {st.is_active ? 'تعطيل' : 'إعادة التفعيل'}
                      </button>
                    </form>
                  </div>
                ))}
                {group.length === 0 && <p className="text-sm text-stone-400">لا يوجد أطفال.</p>}
              </div>
            </section>
          )
        })}
      </div>
    </>
  )
}

export default function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <Link href="/admin" className="text-sm text-stone-400 underline">
        ← الإدارة
      </Link>
      <h1 className="mb-6 mt-2 text-2xl font-bold text-teal-800">الأطفال</h1>
      <Suspense fallback={<p className="text-stone-400">جارٍ التحميل…</p>}>
        <Content searchParams={searchParams} />
      </Suspense>
    </main>
  )
}
