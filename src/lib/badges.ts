import type { Period, StudentStat } from './stats'

// حدود الشارات — عدّليها هنا وحدها
export const BADGE_RULES = {
  excellentRate: 90, // 🏅 حضور ممتاز: 90% فأكثر (و100% يعطي 🌟)
  streakMin: 3, // 🔥 سلسلة: 3 حصص متتالية فأكثر
  monthlyRate: 80, // 🎯 ملتزم هذا الشهر: 80% فأكثر
  monthlyMinSessions: 3, // ...مع 3 حصص مسجلة على الأقل في الشهر
}

export type Badge = { emoji: string; label: string }

export function badgesFor(s: StudentStat, period: Period): Badge[] {
  const rate = s.attendance_rate ?? 0
  const out: Badge[] = []
  if (rate === 100) out.push({ emoji: '🌟', label: 'نجم الحضور' })
  else if (rate >= BADGE_RULES.excellentRate) out.push({ emoji: '🏅', label: 'حضور ممتاز' })
  if (s.current_streak >= BADGE_RULES.streakMin)
    out.push({ emoji: '🔥', label: `سلسلة حضور ${s.current_streak}` })
  if (
    period === 'month' &&
    rate >= BADGE_RULES.monthlyRate &&
    s.total_sessions >= BADGE_RULES.monthlyMinSessions
  )
    out.push({ emoji: '🎯', label: 'ملتزم هذا الشهر' })
  return out
}
