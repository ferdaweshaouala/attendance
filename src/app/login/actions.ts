'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { teacherEmail } from '@/lib/teacher-email'

type FormState = { error?: string }

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function teacherLogin(_prev: FormState, formData: FormData): Promise<FormState> {
  const teacherId = String(formData.get('teacherId') ?? '')
  const pin = String(formData.get('pin') ?? '')

  if (!UUID.test(teacherId) || pin.length < 6) {
    return { error: 'الرمز غير صحيح' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: teacherEmail(teacherId),
    password: pin,
  })
  if (error) return { error: 'الرمز غير صحيح' }

  redirect('/attendance')
}

export async function adminLogin(_prev: FormState, formData: FormData): Promise<FormState> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '')

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) return { error: 'البريد أو كلمة المرور غير صحيحة' }

  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) {
    await supabase.auth.signOut()
    return { error: 'هذا الحساب ليس حساب إدارة' }
  }

  redirect('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
