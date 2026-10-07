// المنطقة الزمنية التي يُحسب بها "اليوم" — غيّريها إذا كانت مجموعتك في بلد آخر
export const APP_TIMEZONE = 'Africa/Tunis'

const LOCALE = 'ar-u-nu-latn' // عربي بأرقام لاتينية

// تاريخ اليوم بصيغة YYYY-MM-DD (يُستدعى بعد await connection() فقط)
export function todayInTz(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: APP_TIMEZONE }).format(new Date())
}

export function isValidDate(d: string | undefined): d is string {
  return !!d && /^\d{4}-\d{2}-\d{2}$/.test(d) && !Number.isNaN(Date.parse(d + 'T00:00:00Z'))
}

const utc = (d: string) => new Date(d + 'T00:00:00Z')
const iso = (d: Date) => d.toISOString().slice(0, 10)

// الأسبوع يبدأ يوم السبت وينتهي يوم الجمعة
export function weekBounds(d: string): { start: string; end: string } {
  const date = utc(d)
  const sinceSaturday = (date.getUTCDay() + 1) % 7
  const start = new Date(date)
  start.setUTCDate(date.getUTCDate() - sinceSaturday)
  const end = new Date(start)
  end.setUTCDate(start.getUTCDate() + 6)
  return { start: iso(start), end: iso(end) }
}

export function monthBounds(d: string): { start: string; end: string } {
  const date = utc(d)
  const y = date.getUTCFullYear()
  const m = date.getUTCMonth()
  return { start: iso(new Date(Date.UTC(y, m, 1))), end: iso(new Date(Date.UTC(y, m + 1, 0))) }
}

export function dateLabel(d: string): string {
  return utc(d).toLocaleDateString(LOCALE, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

export function weekLabel(d: string): string {
  const { start, end } = weekBounds(d)
  const f = (x: string) =>
    utc(x).toLocaleDateString(LOCALE, { day: 'numeric', month: 'long', timeZone: 'UTC' })
  return `${f(start)} – ${f(end)}`
}
