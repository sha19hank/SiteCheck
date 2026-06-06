-- Add Phase 3 Website Understanding & Growth Intelligence columns
ALTER TABLE audits
ADD COLUMN website_understanding JSONB,
ADD COLUMN growth_report JSONB;

-- Note: Ensure to run `NOTIFY pgrst, 'reload schema'` if running directly via SQL editor
-- to update the API cache.
