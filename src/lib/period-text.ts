import { weekLabel } from './dates'
import type { Period } from './stats'

export function periodText(period: Period, today: string): string {
  if (period === 'week') return `الأسبوع: ${weekLabel(today)}`
  if (period === 'month')
    return new Date(today + 'T00:00:00Z').toLocaleDateString('ar-u-nu-latn', {
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    })
  return 'منذ البداية'
}
