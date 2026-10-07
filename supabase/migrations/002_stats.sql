-- 002_stats.sql — تحديث دالة الإحصائيات + ملخص الفترة
-- كلتا الدالتين security invoker: تعملان عبر RLS، فترى المعلمة مجموعتها فقط والأدمن الجميع.

-- 1) student_stats: نفس الدالة السابقة مع فلتر اختياري للمعلمة (المجموعة)
drop function if exists public.student_stats(date, date);

create or replace function public.student_stats(
  p_from date default null,
  p_to date default null,
  p_teacher uuid default null
)
returns table (
  student_id uuid,
  student_name text,
  teacher_id uuid,
  is_active boolean,
  total_sessions int,
  present_count int,
  absent_count int,
  attendance_rate numeric,
  current_streak int
)
language sql stable security invoker set search_path = public as $$
  with all_rows as (
    select a.student_id, s.session_date, a.status
    from public.attendance a
    join public.sessions s on s.id = a.session_id
  ),
  period_rows as (
    select * from all_rows
    where (p_from is null or session_date >= p_from)
      and (p_to is null or session_date <= p_to)
  ),
  agg as (
    select student_id,
           count(*)::int as total,
           count(*) filter (where status = 'present')::int as present,
           count(*) filter (where status = 'absent')::int as absent
    from period_rows group by student_id
  ),
  streak as (
    -- عدد الحصص المتتالية الأخيرة التي حضرها الطفل (على كامل السجل، لا تتأثر بالفترة)
    select r.student_id, count(*)::int as n
    from (
      select student_id, status,
             sum((status = 'absent')::int) over (
               partition by student_id order by session_date desc
               rows between unbounded preceding and current row
             ) as absents_so_far
      from all_rows
    ) r
    where r.status = 'present' and r.absents_so_far = 0
    group by r.student_id
  )
  select st.id, st.name, st.teacher_id, st.is_active,
         coalesce(g.total, 0), coalesce(g.present, 0), coalesce(g.absent, 0),
         round(100.0 * coalesce(g.present, 0) / nullif(g.total, 0), 1),
         coalesce(sk.n, 0)
  from public.students st
  left join agg g on g.student_id = st.id
  left join streak sk on sk.student_id = st.id
  where (p_teacher is null or st.teacher_id = p_teacher);
$$;

-- 2) period_summary: ملخص الفترة (للأطفال النشطين)
create or replace function public.period_summary(
  p_from date default null,
  p_to date default null,
  p_teacher uuid default null
)
returns table (
  children_count int,
  sessions_count int,
  present_count int,
  absent_count int,
  attendance_rate numeric
)
language sql stable security invoker set search_path = public as $$
  with s as (
    select id from public.sessions
    where (p_from is null or session_date >= p_from)
      and (p_to is null or session_date <= p_to)
      and (p_teacher is null or teacher_id = p_teacher)
  ),
  a as (
    select at.status
    from public.attendance at
    join s on s.id = at.session_id
    join public.students st on st.id = at.student_id
    where st.is_active
  )
  select
    (select count(*) from public.students st
       where st.is_active and (p_teacher is null or st.teacher_id = p_teacher))::int,
    (select count(*) from s)::int,
    (count(*) filter (where a.status = 'present'))::int,
    (count(*) filter (where a.status = 'absent'))::int,
    round(100.0 * count(*) filter (where a.status = 'present') / nullif(count(*), 0), 1)
  from a;
$$;
