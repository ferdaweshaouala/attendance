import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import LoginForm from './login-form'

async function Content({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t } = await searchParams
  const supabase = await createClient()
  const { data: teachers } = await supabase.rpc('list_active_teachers')
  const teacher = (teachers ?? []).find((x: { id: string }) => x.id === t)
  if (!teacher) redirect('/')

  return (
    <>
      <p className="text-center text-stone-500">مرحبًا</p>
      <h1 className="mb-8 text-center text-2xl font-bold text-teal-800">{teacher.name}</h1>
      <LoginForm teacherId={teacher.id} />
    </>
  )
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string }>
}) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <Suspense fallback={<p className="text-center text-stone-400">جارٍ التحميل…</p>}>
        <Content searchParams={searchParams} />
      </Suspense>
      <Link href="/" className="mt-8 text-center text-sm text-stone-400 underline">
        رجوع
      </Link>
    </main>
  )
}
