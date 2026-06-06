-- Add Phase 3.5 Developer Transparency columns
ALTER TABLE audits
ADD COLUMN execution_timing JSONB,
ADD COLUMN ai_logs JSONB;

-- Note: Ensure to run `NOTIFY pgrst, 'reload schema'` if running directly via SQL editor
-- to update the API cache.
