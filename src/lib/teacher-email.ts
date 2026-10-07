// بريد داخلي مولّد لكل معلمة (لا تُرسل إليه رسائل). المعلمة لا ترى هذا البريد أبدًا.
export function teacherEmail(teacherId: string) {
  return `t-${teacherId}@teachers.example.com`
}
