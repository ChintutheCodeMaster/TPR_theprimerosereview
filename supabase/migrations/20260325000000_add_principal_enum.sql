-- Must run outside a transaction block (Supabase runs each migration file separately)
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'principal';
