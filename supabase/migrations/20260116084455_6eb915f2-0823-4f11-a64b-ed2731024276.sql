-- Create essay_feedback table to store feedback history
CREATE TABLE public.essay_feedback (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL,
  counselor_id UUID NOT NULL,
  essay_title TEXT NOT NULL,
  essay_content TEXT NOT NULL,
  essay_prompt TEXT,
  ai_analysis JSONB,
  feedback_items JSONB DEFAULT '[]'::jsonb,
  manual_notes TEXT,
  personal_message TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  sent_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE public.essay_feedback ENABLE ROW LEVEL SECURITY;

-- Counselors can create feedback for their students
CREATE POLICY "Counselors can create feedback for their students"
ON public.essay_feedback
FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'counselor') AND 
  is_student_counselor(auth.uid(), student_id) AND
  counselor_id = auth.uid()
);

-- Counselors can view feedback they created
CREATE POLICY "Counselors can view their feedback"
ON public.essay_feedback
FOR SELECT
USING (counselor_id = auth.uid());

-- Counselors can update their own feedback
CREATE POLICY "Counselors can update their feedback"
ON public.essay_feedback
FOR UPDATE
USING (counselor_id = auth.uid());

-- Students can view feedback sent to them
CREATE POLICY "Students can view their feedback"
ON public.essay_feedback
FOR SELECT
USING (student_id = auth.uid() AND status IN ('sent', 'read'));

-- Students can mark feedback as read
CREATE POLICY "Students can mark feedback as read"
ON public.essay_feedback
FOR UPDATE
USING (student_id = auth.uid() AND status = 'sent');

-- Add trigger for updated_at
CREATE TRIGGER update_essay_feedback_updated_at
BEFORE UPDATE ON public.essay_feedback
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable realtime for the table
ALTER PUBLICATION supabase_realtime ADD TABLE public.essay_feedback;