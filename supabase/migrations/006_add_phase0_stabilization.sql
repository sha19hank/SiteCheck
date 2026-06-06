-- 006_add_phase0_stabilization.sql

ALTER TABLE audits 
ADD COLUMN IF NOT EXISTS ai_available BOOLEAN,
ADD COLUMN IF NOT EXISTS fallback_used BOOLEAN,
ADD COLUMN IF NOT EXISTS ai_failure_reason_code TEXT,
ADD COLUMN IF NOT EXISTS ai_failure_reason_message TEXT,
ADD COLUMN IF NOT EXISTS audit_confidence TEXT,
ADD COLUMN IF NOT EXISTS scrape_diagnostics JSONB;

-- Note: Ensure to run `NOTIFY pgrst, 'reload schema'` if running directly via SQL editor
-- to update the API cache.
