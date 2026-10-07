import type { SupabaseClient } from '@supabase/supabase-js'
import { monthBounds, weekBounds } from './dates'

export type Period = 'week' | 'month' | 'all'

export const PERIOD_LABELS: Record<Period, string> = {
  week: 'هذا الأسبوع',
  month: 'هذا الشهر',
  all: 'كل الفترة',
}

export function parsePeriod(v: string | undefined): Period {
  return v === 'week' || v === 'month' || v === 'all' ? v : 'week'
}

// يحوّل الفترة إلى تاريخي بداية ونهاية (null = بلا حد)
export function periodRange(period: Period, today: string): { from: string | null; to: string | null } {
  if (period === 'week') {
    const { start, end } = weekBounds(today)
    return { from: start, to: end }
  }
  if (period === 'month') {
    const { start, end } = monthBounds(today)
    return { from: start, to: end }
  }
  return { from: null, to: null }
}

export type StudentStat = {
  student_id: string
  student_name: string
  teacher_id: string
  is_active: boolean
  total_sessions: number
  present_count: number
  absent_count: number
  attendance_rate: number | null
  current_streak: number
}

export type Summary = {
  children_count: number
  sessions_count: number
  present_count: number
  absent_count: number
  attendance_rate: number | null
}

export async function getStudentStats(
  supabase: SupabaseClient,
  period: Period,
  today: string,
  teacherId?: string
): Promise<StudentStat[]> {
  const { from, to } = periodRange(period, today)
  const { data, error } = await supabase.rpc('student_stats', {
    p_from: from,
    p_to: to,
    p_teacher: teacherId ?? null,
  })
  if (error) throw new Error(error.message)
  return (data ?? []).map((r: StudentStat) => ({
    ...r,
    attendance_rate: r.attendance_rate === null ? null : Number(r.attendance_rate),
  }))
}

export async function getSummary(
  supabase: SupabaseClient,
  period: Period,
  today: string,
  teacherId?: string
): Promise<Summary> {
  const { from, to } = periodRange(period, today)
  const { data, error } = await supabase.rpc('period_summary', {
    p_from: from,
    p_to: to,
    p_teacher: teacherId ?? null,
  })
  if (error) throw new Error(error.message)
  const r = (data?.[0] ?? {}) as Partial<Summary>
  return {
    children_count: r.children_count ?? 0,
    sessions_count: r.sessions_count ?? 0,
    present_count: r.present_count ?? 0,
    absent_count: r.absent_count ?? 0,
    attendance_rate: r.attendance_rate == null ? null : Number(r.attendance_rate),
  }
}

export type RankedStudent = StudentStat & { rank: number }

// الترتيب: النسبة ← عدد مرات الحضور ← السلسلة المتتالية ← الاسم.
// يشمل الأطفال النشطين الذين لديهم حصص مسجلة في الفترة فقط. التعادل في النسبة = المرتبة نفسها (1،1،3).
export function rankStudents(stats: StudentStat[]): RankedStudent[] {
  const list = stats
    .filter((s) => s.is_active && s.total_sessions > 0 && s.attendance_rate !== null)
    .sort(
      (a, b) =>
        (b.attendance_rate ?? 0) - (a.attendance_rate ?? 0) ||
        b.present_count - a.present_count ||
        b.current_streak - a.current_streak ||
        a.student_name.localeCompare(b.student_name, 'ar')
    )
  return list.map((s) => ({
    ...s,
    rank: list.findIndex((x) => x.attendance_rate === s.attendance_rate) + 1,
  }))
}
