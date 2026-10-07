
CREATE OR REPLACE FUNCTION public.join_class_by_code(class_code text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
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
    VALUES (student_id, target_class_id)
    ON CONFLICT ("StudentID", "ClassID") DO NOTHING;

    RETURN 'joined';
END;
$$;

REVOKE ALL ON FUNCTION public.join_class_by_code(text)
FROM PUBLIC, anon;

GRANT EXECUTE ON FUNCTION public.join_class_by_code(text)
TO authenticated;
