-- Temporary migration: keep Mongo ObjectId strings in ideas.user_id while auth
-- remains on Mongo. Revert to uuid + FK when authController moves to Supabase;
-- see PATCH 3 in docs/migration-notes.md.

DO $$
DECLARE
  constraint_name text;
BEGIN
  FOR constraint_name IN
    SELECT DISTINCT c.conname
    FROM pg_constraint AS c
    JOIN pg_attribute AS a
      ON a.attrelid = c.conrelid
     AND a.attnum = ANY (c.conkey)
    WHERE c.conrelid = 'public.ideas'::regclass
      AND c.contype = 'f'
      AND a.attname = 'user_id'
  LOOP
    EXECUTE format('ALTER TABLE public.ideas DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END
$$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'ideas'
      AND column_name = 'user_id'
      AND data_type <> 'text'
  ) THEN
    ALTER TABLE public.ideas
      ALTER COLUMN user_id TYPE text
      USING user_id::text;
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS ideas_user_created_idx
  ON public.ideas (user_id, (text(created_at)) DESC);
