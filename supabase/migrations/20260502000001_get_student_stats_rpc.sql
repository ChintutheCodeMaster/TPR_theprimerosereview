-- get_student_stats()
-- Counting rules (must match StudentDashboard.tsx):
--   essays   total     = SUM(applications.required_essays)
--   essays   completed = essay_feedback rows with status IN ('sent','read','approved')
--   apps     total     = COUNT(applications)
--   apps     submitted = COUNT(applications WHERE status = 'submitted')
--   recs     total     = SUM(applications.recommendations_requested)
--   recs     sent      = recommendation_requests rows with status = 'sent'

DROP FUNCTION IF EXISTS get_student_stats();

CREATE OR REPLACE FUNCTION get_student_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id              uuid;
  v_school_id            uuid;

  v_my_essays_total      int := 0;
  v_my_essays_completed  int := 0;
  v_my_apps_total        int := 0;
  v_my_apps_submitted    int := 0;
  v_my_recs_total        int := 0;
  v_my_recs_sent         int := 0;
  v_my_essay_pct         numeric := 0;

  v_school_avg_essays    numeric := 0;
  v_school_avg_apps      numeric := 0;
  v_school_avg_recs      numeric := 0;
  v_school_rank_pct      numeric := 0;
BEGIN
  v_user_id := auth.uid();

  SELECT school_id INTO v_school_id
  FROM profiles WHERE user_id = v_user_id;

  -- ── My stats ────────────────────────────────────────────────────
  -- Essays: total from applications.required_essays, completed from live status
  SELECT
    COALESCE(SUM(required_essays), 0),
    COALESCE(SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END), 0),
    COALESCE(SUM(recommendations_requested), 0)
  INTO v_my_essays_total, v_my_apps_submitted, v_my_recs_total
  FROM applications
  WHERE student_id = v_user_id;

  SELECT COUNT(*) INTO v_my_apps_total
  FROM applications WHERE student_id = v_user_id;

  SELECT COUNT(*) FILTER (WHERE status IN ('sent','read','approved'))
  INTO v_my_essays_completed
  FROM essay_feedback WHERE student_id = v_user_id;

  SELECT COUNT(*) FILTER (WHERE status = 'sent')
  INTO v_my_recs_sent
  FROM recommendation_requests WHERE student_id = v_user_id;

  v_my_essay_pct := CASE WHEN v_my_essays_total > 0
    THEN ROUND(v_my_essays_completed::numeric / v_my_essays_total * 100)
    ELSE 0 END;

  -- ── School averages (same rules, applied per-student) ───────────
  WITH school_students AS (
    SELECT p.user_id
    FROM profiles p
    JOIN user_roles ur ON ur.user_id = p.user_id AND ur.role = 'student'
    WHERE p.school_id = v_school_id
      AND p.user_id <> v_user_id
  ),
  per_student AS (
    SELECT
      ss.user_id,
      -- essay pct: completed / required_essays
      CASE
        WHEN COALESCE(SUM(a.required_essays), 0) > 0
        THEN ROUND(
          COUNT(ef.id) FILTER (WHERE ef.status IN ('sent','read','approved'))::numeric
          / SUM(a.required_essays) * 100
        )
        ELSE 0
      END AS essay_pct,
      -- app pct: submitted / total
      CASE
        WHEN COUNT(DISTINCT a.id) > 0
        THEN ROUND(
          COUNT(DISTINCT a.id) FILTER (WHERE a.status = 'submitted')::numeric
          / COUNT(DISTINCT a.id) * 100
        )
        ELSE 0
      END AS app_pct,
      -- rec pct: sent / recommendations_requested
      CASE
        WHEN COALESCE(SUM(a.recommendations_requested), 0) > 0
        THEN ROUND(
          COUNT(rr.id) FILTER (WHERE rr.status = 'sent')::numeric
          / SUM(a.recommendations_requested) * 100
        )
        ELSE 0
      END AS rec_pct
    FROM school_students ss
    LEFT JOIN applications a ON a.student_id = ss.user_id
    LEFT JOIN essay_feedback ef ON ef.student_id = ss.user_id
    LEFT JOIN recommendation_requests rr ON rr.student_id = ss.user_id
    GROUP BY ss.user_id
  )
  SELECT
    COALESCE(ROUND(AVG(essay_pct)), 0),
    COALESCE(ROUND(AVG(app_pct)),   0),
    COALESCE(ROUND(AVG(rec_pct)),   0),
    COALESCE(
      ROUND(
        COUNT(*) FILTER (WHERE essay_pct < v_my_essay_pct)::numeric
        / NULLIF(COUNT(*), 0) * 100
      ), 0
    )
  INTO v_school_avg_essays, v_school_avg_apps, v_school_avg_recs, v_school_rank_pct
  FROM per_student;

  RETURN json_build_object(
    'my_essays_completed',            v_my_essays_completed,
    'my_essays_total',                v_my_essays_total,
    'my_applications_submitted',      v_my_apps_submitted,
    'my_applications_total',          v_my_apps_total,
    'my_recommendations_sent',        v_my_recs_sent,
    'my_recommendations_total',       v_my_recs_total,
    'school_avg_essays_pct',          v_school_avg_essays,
    'school_avg_applications_pct',    v_school_avg_apps,
    'school_avg_recommendations_pct', v_school_avg_recs,
    'school_rank_pct',                v_school_rank_pct
  );
END;
$$;

GRANT EXECUTE ON FUNCTION get_student_stats() TO authenticated;
