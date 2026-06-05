-- 002_add_classification.sql

ALTER TABLE public.audits
ADD COLUMN IF NOT EXISTS website_type text,
ADD COLUMN IF NOT EXISTS classification_confidence numeric,
ADD COLUMN IF NOT EXISTS classification_scores jsonb,
ADD COLUMN IF NOT EXISTS classification_reasoning jsonb;
