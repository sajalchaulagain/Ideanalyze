# Migration notes

`public.ideas.user_id` is temporarily `text` because auth still runs on Mongo and `req.user._id` is a 24-hex ObjectId string, while the original Postgres column was `uuid`. This avoids Postgres `22P02` insert failures. Dropping the foreign key means a deleted Mongo user can leave orphaned ideas until auth moves to Supabase.

PATCH 3 revert steps: first migrate auth and `authController` so user IDs are Supabase UUIDs, then verify every existing `public.ideas.user_id` value is a valid UUID and remove or repair orphaned rows. Run `ALTER TABLE public.ideas ALTER COLUMN user_id TYPE uuid USING user_id::uuid;`, then add the FK with `ALTER TABLE public.ideas ADD CONSTRAINT ideas_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);`. Finally, update the app mapper so `toIdea()` passes the UUID through unchanged and deploy the Supabase-auth path.
