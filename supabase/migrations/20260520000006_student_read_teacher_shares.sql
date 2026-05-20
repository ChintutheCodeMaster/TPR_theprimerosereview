

CREATE POLICY "Students can view their own teacher shares"
ON public.essay_teacher_shares FOR SELECT
USING (student_id = auth.uid());

