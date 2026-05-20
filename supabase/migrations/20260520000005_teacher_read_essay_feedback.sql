-- Allow teachers to read essay_feedback rows that have been shared with them
CREATE POLICY "Teachers can view essays shared with them"
ON public.essay_feedback FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.essay_teacher_shares
    WHERE essay_feedback_id = essay_feedback.id
      AND teacher_id = auth.uid()
  )
);
