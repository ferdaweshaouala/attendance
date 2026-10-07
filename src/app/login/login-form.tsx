'use client'

import { useActionState } from 'react'
import { teacherLogin } from './actions'

type FormState = { error?: string }

export default function LoginForm({ teacherId }: { teacherId: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(teacherLogin, {})

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="teacherId" value={teacherId} />
      <input
        name="pin"
        type="password"
        inputMode="numeric"
        autoComplete="current-password"
        required
        minLength={6}
        maxLength={8}
        placeholder="الرمز السري"
        className="w-full rounded-2xl bg-white px-5 py-4 text-center text-xl tracking-widest shadow-sm ring-1 ring-stone-200 focus:outline-none focus:ring-2 focus:ring-teal-600"
      />
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
        {pending ? 'جارٍ الدخول…' : 'دخول'}
      </button>
    </form>
  )
}
