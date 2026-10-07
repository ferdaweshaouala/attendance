'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { teacherEmail } from '@/lib/teacher-email'

const PIN = /^\d{6,8}$/
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function fail(path: string, msg: string): never {
  redirect(`${path}?error=${encodeURIComponent(msg)}`)
}
const str = (fd: FormData, k: string) => String(fd.get(k) ?? '').trim()

/* ---------- المعلمات ---------- */

export async function addTeacher(fd: FormData) {
  const { supabase } = await requireAdmin()
  const name = str(fd, 'name')
  const pin = str(fd, 'pin')
  if (!name) fail('/admin/teachers', 'اكتبي اسم المعلمة')
  if (!PIN.test(pin)) fail('/admin/teachers', 'الرمز يجب أن يكون من 6 إلى 8 أرقام')

  const { data: t, error } = await supabase.from('teachers').insert({ name }).select('id').single()
  if (error || !t) fail('/admin/teachers', 'تعذّرت إضافة المعلمة')

  const admin = createAdminClient()
  const { data: u, error: e2 } = await admin.auth.admin.createUser({
    email: teacherEmail(t.id),
    password: pin,
    email_confirm: true,
  })
  if (e2 || !u.user) {
    await supabase.from('teachers').delete().eq('id', t.id)
    fail('/admin/teachers', 'تعذّر إنشاء حساب المعلمة')
  }

  await supabase.from('teachers').update({ user_id: u.user.id }).eq('id', t.id)
  revalidatePath('/admin/teachers')
  redirect('/admin/teachers')
}

export async function updateTeacher(fd: FormData) {
  const { supabase } = await requireAdmin()
  const id = str(fd, 'id')
  const name = str(fd, 'name')
  if (!UUID.test(id) || !name) fail('/admin/teachers', 'بيانات غير صحيحة')
  const { error } = await supabase.from('teachers').update({ name }).eq('id', id)
  if (error) fail('/admin/teachers', 'تعذّر الحفظ')
  revalidatePath('/admin/teachers')
  redirect('/admin/teachers')
}

export async function resetPin(fd: FormData) {
  const { supabase } = await requireAdmin()
  const id = str(fd, 'id')
  const pin = str(fd, 'pin')
  if (!UUID.test(id)) fail('/admin/teachers', 'بيانات غير صحيحة')
  if (!PIN.test(pin)) fail('/admin/teachers', 'الرمز يجب أن يكون من 6 إلى 8 أرقام')

  const { data: t } = await supabase.from('teachers').select('user_id').eq('id', id).single()
  if (!t?.user_id) fail('/admin/teachers', 'لا يوجد حساب لهذه المعلمة')

  const admin = createAdminClient()
  const { error } = await admin.auth.admin.updateUserById(t.user_id, { password: pin })
  if (error) fail('/admin/teachers', 'تعذّر تغيير الرمز')
  redirect('/admin/teachers')
}

export async function toggleTeacher(fd: FormData) {
  const { supabase } = await requireAdmin()
  const id = str(fd, 'id')
  const active = str(fd, 'active') === 'true'
  if (!UUID.test(id)) fail('/admin/teachers', 'بيانات غير صحيحة')
  const { error } = await supabase.from('teachers').update({ is_active: active }).eq('id', id)
  if (error) fail('/admin/teachers', 'تعذّر التحديث')
  revalidatePath('/admin/teachers')
  redirect('/admin/teachers')
}

/* ---------- الأطفال ---------- */

export async function addStudent(fd: FormData) {
  const { supabase } = await requireAdmin()
  const name = str(fd, 'name')
  const teacherId = str(fd, 'teacher_id')
  if (!name || !UUID.test(teacherId)) fail('/admin/students', 'اكتبي الاسم واختاري المعلمة')
  const { error } = await supabase.from('students').insert({ name, teacher_id: teacherId })
  if (error) fail('/admin/students', 'تعذّرت إضافة الطفل')
  revalidatePath('/admin/students')
  redirect('/admin/students')
}

export async function updateStudent(fd: FormData) {
  const { supabase } = await requireAdmin()
  const id = str(fd, 'id')
  const name = str(fd, 'name')
  const teacherId = str(fd, 'teacher_id')
  if (!UUID.test(id) || !UUID.test(teacherId) || !name) fail('/admin/students', 'بيانات غير صحيحة')
  const { error } = await supabase
    .from('students')
    .update({ name, teacher_id: teacherId })
    .eq('id', id)
  if (error) fail('/admin/students', 'تعذّر الحفظ')
  revalidatePath('/admin/students')
  redirect('/admin/students')
}

export async function toggleStudent(fd: FormData) {
  const { supabase } = await requireAdmin()
  const id = str(fd, 'id')
  const active = str(fd, 'active') === 'true'
  if (!UUID.test(id)) fail('/admin/students', 'بيانات غير صحيحة')
  const { error } = await supabase.from('students').update({ is_active: active }).eq('id', id)
  if (error) fail('/admin/students', 'تعذّر التحديث')
  revalidatePath('/admin/students')
  redirect('/admin/students')
}
