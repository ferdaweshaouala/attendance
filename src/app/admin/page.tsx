import { Suspense } from 'react'
import Link from 'next/link'
import { requireAdmin } from '@/lib/auth'
import { logout } from '../login/actions'
import { card } from './styles'

async function Content() {
  await requireAdmin()
  return (
    <>
      <div className="flex flex-col gap-3">
        <Link href="/admin/dashboard" className={`${card} text-lg font-semibold active:bg-teal-50`}>
          📊 الإحصائيات
        </Link>
        <Link href="/admin/teachers" className={`${card} text-lg font-semibold active:bg-teal-50`}>
          👩‍🏫 المعلمات
        </Link>
        <Link href="/admin/students" className={`${card} text-lg font-semibold active:bg-teal-50`}>
          🧒 الأطفال
        </Link>
      </div>
      <form action={logout} className="mt-10">
        <button className="text-sm text-stone-400 underline">تسجيل الخروج</button>
      </form>
    </>
  )
}

export default function AdminPage() {
  return (
    <main className="mx-auto max-w-md px-5 py-10">
      <h1 className="mb-8 text-2xl font-bold text-teal-800">لوحة الإدارة</h1>
      <Suspense fallback={<p className="text-stone-400">جارٍ التحميل…</p>}>
        <Content />
      </Suspense>
    </main>
  )
}
