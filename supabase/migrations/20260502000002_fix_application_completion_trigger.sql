-- Fix update_application_completion() so it never overwrites required_essays.
-- required_essays is set by the student when creating the application and must
-- stay fixed. Only completed_essays and completion_percentage are recomputed.

CREATE OR REPLACE FUNCTION update_application_completion()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  v_app_id           uuid;
  v_required_essays  int;
  v_completed_essays int;
BEGIN
  v_app_id := COALESCE(NEW.application_id, OLD.application_id);

  -- Read the user-defined required_essays — do NOT touch it
  SELECT required_essays INTO v_required_essays
  FROM applications WHERE id = v_app_id;

  -- Count slots the student has actually written (draft or beyond)
  SELECT COUNT(*) INTO v_completed_essays
  FROM application_essays
  WHERE application_id = v_app_id
    AND status IN ('draft', 'in_review', 'approved');

  UPDATE applications SET
    completed_essays      = v_completed_essays,
    completion_percentage = CASE
      WHEN v_required_essays > 0
      THEN ROUND(v_completed_essays::numeric / v_required_essays * 100)
      ELSE 0
    END
  WHERE id = v_app_id;

  RETURN COALESCE(NEW, OLD);
END;
$$;
