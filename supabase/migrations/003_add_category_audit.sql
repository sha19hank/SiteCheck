-- 003_add_category_audit.sql

ALTER TABLE public.audits
ADD COLUMN IF NOT EXISTS category_audit jsonb;
