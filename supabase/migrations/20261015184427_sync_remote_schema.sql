SET local check_function_bodies = off;

ALTER TABLE "public"."Questions"
  DISABLE ROW LEVEL SECURITY;


DROP FUNCTION IF EXISTS public.get_class_leaderboard();

CREATE OR REPLACE FUNCTION public.get_class_leaderboard(
  p_class_id bigint
)
RETURNS TABLE (
  student_id uuid,
  student_name text,
  total_score bigint,
  rank bigint
)
LANGUAGE sql
AS $$
  WITH student_scores AS (
    SELECT
      e."StudentID" AS student_id,
      p."Name" AS student_name,
      COALESCE(SUM(s."Score"), 0)::bigint AS total_score
    FROM public."Enrollment" e
    JOIN public."Profile" p
      ON p."ID" = e."StudentID"
    LEFT JOIN public."Challenges" c
      ON c."ClassID" = e."ClassID"
    LEFT JOIN public."Submission" s
      ON s."ChallengeID" = c."ChallengeID"
      AND s."StudentID" = e."StudentID"
    WHERE e."ClassID" = p_class_id
    GROUP BY
      e."StudentID",
      p."Name"
  )
  SELECT
    student_scores.student_id,
    student_scores.student_name,
    student_scores.total_score,
    RANK() OVER (
      ORDER BY student_scores.total_score DESC
    ) AS rank
  FROM student_scores
  ORDER BY
    student_scores.total_score DESC,
    student_scores.student_name ASC;
$$;

GRANT EXECUTE ON FUNCTION public.get_class_leaderboard(bigint)
TO authenticated;


CREATE OR REPLACE FUNCTION public.get_global_leaderboard()
  RETURNS void
  LANGUAGE sql
  AS $function$CREATE OR REPLACE FUNCTION get_leaderboard(
  p_class_id bigint
)
RETURNS TABLE (
  student_id uuid,
  student_name text,
  total_score bigint,
  rank bigint
)
LANGUAGE sql
AS $$
  SELECT
    s."StudentID" AS student_id,
    p."Name" AS student_name,
    SUM(s."Score")::bigint AS total_score,
    RANK() OVER (
      ORDER BY SUM(s."Score") DESC
    ) AS rank
  FROM "Submission" s
  JOIN "Profile" p
    ON p."ID" = s."StudentID"
  JOIN "Challenges" c
    ON c."ChallengeID" = s."ChallengeID"
  WHERE c."ClassID" = p_class_id
  GROUP BY
    s."StudentID",
    p."Name"
  ORDER BY total_score DESC;
$$;$function$;

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

CREATE OR REPLACE FUNCTION public.join_class_by_code (
  class_code text
)
  RETURNS text
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$DECLARE
    student_id uuid;
    target_class_id bigint;
BEGIN
    student_id := auth.uid();

    IF student_id IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM public."Profile"
        WHERE "ID" = student_id
          AND "Role" = 'student'
    ) THEN
        RAISE EXCEPTION 'Only students can join classes';
    END IF;

    SELECT "ClassID"
    INTO target_class_id
    FROM public."Classes"
    WHERE "ClassCode" = trim(class_code);

    IF target_class_id IS NULL THEN
        RETURN 'not_found';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public."Enrollment"
        WHERE "StudentID" = student_id
          AND "ClassID" = target_class_id
    ) THEN
        RETURN 'already_enrolled';
    END IF;

    INSERT INTO public."Enrollment" ("StudentID", "ClassID")
    VALUES (student_id, target_class_id);

    RETURN 'joined';
END;$function$;

CREATE POLICY "insert policy" ON "public"."AnswerChoices"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((EXISTS ( SELECT 1
   FROM ((public."Questions" q
     JOIN public."Challenges" ch ON ((ch."ChallengeID" = q."ChallengeID")))
     JOIN public."Classes" c ON ((c."ClassID" = ch."ClassID")))
  WHERE ((q."QuestionID" = "AnswerChoices"."QuestionID") AND (c."ProfessorID" = auth.uid())))));

CREATE POLICY "insert policy" ON "public"."Challenges"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((EXISTS ( SELECT 1
   FROM public."Classes" c
  WHERE ((c."ClassID" = "Challenges"."ClassID") AND (c."ProfessorID" = auth.uid())))));

CREATE POLICY "insert policy" ON "public"."Questions"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((EXISTS ( SELECT 1
   FROM (public."Challenges" ch
     JOIN public."Classes" c ON ((c."ClassID" = ch."ClassID")))
  WHERE ((ch."ChallengeID" = "Questions"."ChallengeID") AND (c."ProfessorID" = auth.uid())))));

