import { redirect } from 'next/navigation'
import { connection } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// يتأكد أن المستخدم أدمن، وإلا يحوله لصفحة دخول الإدارة
export async function requireAdmin() {
  await connection() // هذا الكود يعمل وقت الطلب وليس وقت البناء المسبق
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')
  const { data: isAdmin } = await supabase.rpc('is_admin')
  if (!isAdmin) redirect('/admin/login')
  return { supabase, user }
}
