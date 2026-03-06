-- Enable RLS on conversations and messages (safe to run even if already enabled)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- ── Conversations policies ────────────────────────────────────────

-- Counselors can create conversations with their assigned students
CREATE POLICY "Counselors can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  counselor_id = auth.uid()
  AND public.has_role(auth.uid(), 'counselor')
  AND public.is_student_counselor(auth.uid(), student_id)
);

-- Counselors can view their own conversations
CREATE POLICY "Counselors can view their conversations"
ON public.conversations
FOR SELECT
USING (counselor_id = auth.uid());

-- Students can view their own conversations
CREATE POLICY "Students can view their conversations"
ON public.conversations
FOR SELECT
USING (student_id = auth.uid());

-- Parents can view conversations they are part of
CREATE POLICY "Parents can view their conversations"
ON public.conversations
FOR SELECT
USING (parent_id = auth.uid());

-- Counselors can update conversation status/tags
CREATE POLICY "Counselors can update their conversations"
ON public.conversations
FOR UPDATE
USING (counselor_id = auth.uid());

-- ── Messages policies ─────────────────────────────────────────────

-- Anyone involved in a conversation can send messages
CREATE POLICY "Participants can send messages"
ON public.messages
FOR INSERT
WITH CHECK (
  sender_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
      AND (c.counselor_id = auth.uid() OR c.student_id = auth.uid() OR c.parent_id = auth.uid())
  )
);

-- Anyone involved in a conversation can read its messages
CREATE POLICY "Participants can read messages"
ON public.messages
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
      AND (c.counselor_id = auth.uid() OR c.student_id = auth.uid() OR c.parent_id = auth.uid())
  )
);

-- Anyone involved can mark messages as read
CREATE POLICY "Participants can mark messages as read"
ON public.messages
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
      AND (c.counselor_id = auth.uid() OR c.student_id = auth.uid() OR c.parent_id = auth.uid())
  )
);

-- Enable realtime for conversations and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Allow students to view their assigned counselor's profile
CREATE POLICY "Students can view their counselor profile"
ON public.profiles
FOR SELECT
USING (
  public.is_student_counselor(user_id, auth.uid())
);
