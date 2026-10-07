'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { isValidDate, todayInTz } from '@/lib/dates'

type State = { error?: string; saved?: boolean }

export async function saveAttendance(_prev: State, fd: FormData): Promise<State> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'انتهت الجلسة، سجّلي الدخول من جديد' }

  const date = String(fd.get('date') ?? '')
  if (!isValidDate(date) || date > todayInTz()) return { error: 'تاريخ غير صحيح' }

  const { data: teacherId } = await supabase.rpc('my_teacher_id')
  if (!teacherId) return { error: 'لا توجد صلاحية لهذا الحساب' }

  const { data: students } = await supabase
    .from('students')
    .select('id')
    .eq('teacher_id', teacherId)
    .eq('is_active', true)
  if (!students || students.length === 0) return { error: 'لا يوجد أطفال في مجموعتك' }

  const rows: { student_id: string; status: string; note: string | null }[] = []
  let missing = 0
  for (const s of students) {
    const status = String(fd.get(`status_${s.id}`) ?? '')
    if (status !== 'present' && status !== 'absent') {
      missing++
      continue
    }
    const note = String(fd.get(`note_${s.id}`) ?? '').trim().slice(0, 300)
    rows.push({ student_id: s.id, status, note: note || null })
  }
  if (missing > 0) return { error: `بقي ${missing} من الأطفال دون تحديد` }

  // الحصة: نبحث عنها أو ننشئها (فريدة لكل معلمة + تاريخ)
  const findSession = () =>
    supabase
      .from('sessions')
      .select('id')
      .eq('teacher_id', teacherId)
      .eq('session_date', date)
      .maybeSingle()

  let { data: session } = await findSession()
  if (!session) {
    await supabase.from('sessions').insert({ teacher_id: teacherId, session_date: date })
    session = (await findSession()).data
  }
  if (!session) return { error: 'تعذّر إنشاء الحصة' }

  const { error } = await supabase.from('attendance').upsert(
    rows.map((r) => ({ ...r, session_id: session!.id, recorded_by: user.id })),
    { onConflict: 'session_id,student_id' }
  )
  if (error) return { error: 'تعذّر حفظ الحضور، حاولي مرة أخرى' }

  revalidatePath('/attendance')
  return { saved: true }
}
