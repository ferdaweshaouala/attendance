import Link from 'next/link'
import AdminLoginForm from './admin-login-form'

export default function AdminLoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-5 py-10">
      <h1 className="mb-8 text-center text-2xl font-bold text-teal-800">دخول الإدارة</h1>
      <AdminLoginForm />
      <Link href="/" className="mt-8 text-center text-sm text-stone-400 underline">
        رجوع
      </Link>
    </main>
  )
}
