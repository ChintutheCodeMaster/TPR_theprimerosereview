CREATE OR REPLACE FUNCTION public.delete_platform_user(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  IF p_user_id = auth.uid() THEN
    RAISE EXCEPTION 'Cannot delete your own account';
  END IF;
  DELETE FROM messages WHERE conversation_id IN (
    SELECT id FROM conversations WHERE student_id=p_user_id OR counselor_id=p_user_id OR parent_id=p_user_id
  );
  DELETE FROM conversations WHERE student_id=p_user_id OR counselor_id=p_user_id OR parent_id=p_user_id;
  DELETE FROM rec_letter_messages WHERE request_id IN (
    SELECT id FROM recommendation_requests WHERE student_id=p_user_id
  );
  DELETE FROM recommendation_requests WHERE student_id=p_user_id;
  DELETE FROM application_essays WHERE student_id=p_user_id
    OR application_id IN (SELECT id FROM applications WHERE student_id=p_user_id);
  DELETE FROM submitted_applications WHERE student_id=p_user_id
    OR application_id IN (SELECT id FROM applications WHERE student_id=p_user_id);
  DELETE FROM applications WHERE student_id=p_user_id;
  DELETE FROM essay_feedback_history WHERE student_id=p_user_id OR counselor_id=p_user_id;
  DELETE FROM essay_feedback WHERE student_id=p_user_id OR counselor_id=p_user_id;
  DELETE FROM extracurriculars WHERE student_id=p_user_id;
  DELETE FROM milestones WHERE student_id=p_user_id;
  DELETE FROM target_schools WHERE student_id=p_user_id;
  DELETE FROM tasks WHERE student_id=p_user_id OR counselor_id=p_user_id;
  DELETE FROM meeting_notes WHERE student_id=p_user_id OR counselor_id=p_user_id;
  DELETE FROM parent_student_assignments WHERE parent_id=p_user_id OR student_id=p_user_id;
  DELETE FROM student_counselor_assignments WHERE student_id=p_user_id OR counselor_id=p_user_id;
  DELETE FROM counselor_invites WHERE counselor_id=p_user_id;
  DELETE FROM school_activities WHERE created_by=p_user_id;
  DELETE FROM onboarding_answers WHERE user_id=p_user_id;
  DELETE FROM personal_statements WHERE user_id=p_user_id;
  DELETE FROM api_usage_log WHERE user_id=p_user_id;
  DELETE FROM counselor_profiles WHERE user_id=p_user_id;
  DELETE FROM student_profiles WHERE user_id=p_user_id;
  DELETE FROM profiles WHERE user_id=p_user_id;
  DELETE FROM user_roles WHERE user_id=p_user_id;
  DELETE FROM auth.users WHERE id=p_user_id;
END;
$function$
