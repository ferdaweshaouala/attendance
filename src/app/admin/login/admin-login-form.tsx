'use client'

import { useActionState } from 'react'
import { adminLogin } from '../../login/actions'

type FormState = { error?: string }

const field =
  'w-full rounded-2xl bg-white px-5 py-4 shadow-sm ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-600'

export default function AdminLoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(adminLogin, {})

  return (
    <form action={action} className="space-y-4">
      <input name="email" type="email" required autoComplete="username" placeholder="البريد الإلكتروني" dir="ltr" className={field} />
      <input name="password" type="password" required autoComplete="current-password" placeholder="كلمة المرور" dir="ltr" className={field} />
      {state.error && (
        <p role="alert" className="text-center text-red-600">
          {state.error}
        </p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-2xl bg-teal-700 px-5 py-4 text-lg font-semibold text-white active:bg-teal-800 disabled:opacity-60"
      >
        {pending ? 'جارٍ الدخول…' : 'دخول الإدارة'}
      </button>
    </form>
  )
}
