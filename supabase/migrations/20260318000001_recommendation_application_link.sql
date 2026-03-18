-- Link recommendation_requests to a specific application
ALTER TABLE recommendation_requests
  ADD COLUMN IF NOT EXISTS application_id UUID REFERENCES applications(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_recommendation_requests_application_id
  ON recommendation_requests(application_id);
