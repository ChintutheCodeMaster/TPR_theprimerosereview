CREATE TABLE IF NOT EXISTS counselor_tasks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  counselor_id UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title        TEXT        NOT NULL,
  done         BOOLEAN     NOT NULL DEFAULT FALSE,
  color        TEXT        NOT NULL DEFAULT 'blue',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE counselor_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "counselor_tasks_own" ON counselor_tasks
  FOR ALL USING (auth.uid() = counselor_id)
  WITH CHECK (auth.uid() = counselor_id);
