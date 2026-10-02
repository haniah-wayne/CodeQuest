SET local check_function_bodies = off;

ALTER TABLE "public"."Profile"
  DROP CONSTRAINT "Profile_Role_check";

ALTER TABLE "public"."Profile"
  DROP COLUMN "FirstName";

ALTER TABLE "public"."Profile"
  DROP COLUMN "LastName";

ALTER TABLE "public"."Classes"
  ADD COLUMN "color" text;

ALTER TABLE "public"."Profile"
  ADD COLUMN "Name" text NOT NULL;

ALTER TABLE "public"."Profile"
  ADD COLUMN "Email" text;

ALTER TABLE "public"."Profile"
  ADD COLUMN "Password" text;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  insert into public."Profile" ("ID", "Name", "Email", "Role")
  values (
    new.id,                                                   -- the new user's ID
    coalesce(new.raw_user_meta_data ->> 'display_name',
             new.raw_user_meta_data ->> 'name'),              -- name from sign-up data
    new.email,                                                -- email comes straight from auth
    coalesce(new.raw_user_meta_data ->> 'role', 'student')    -- default to student
  );
  return new;
end;
$function$;

ALTER TABLE "public"."Profile"
  ADD CONSTRAINT "Profile_Email_key" UNIQUE ("Email");

ALTER TABLE "public"."Profile"
  ADD CONSTRAINT "Profile_Password_key" UNIQUE ("Password");

ALTER TABLE "public"."Profile"
  ADD CONSTRAINT "Profile_Role_check" CHECK (("Role" = ANY (ARRAY['student'::text, 'professor'::text])));

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC, "anon", "authenticated", "postgres", "service_role";
