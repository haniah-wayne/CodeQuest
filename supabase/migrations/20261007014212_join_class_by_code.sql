CREATE FUNCTION public.join_class_by_code(class_code text)
    RETURNS text
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
AS
$$
DECLARE
    target_class_id bigint;
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public."Profile" WHERE "ID" = auth.uid() AND "Role" = 'student') THEN
        RAISE EXCEPTION 'Only students can join classes';
    END IF;

    SELECT "ClassID" INTO target_class_id FROM public."Classes" WHERE "ClassCode" = trim(class_code);

    IF target_class_id IS NULL THEN
        RETURN 'not_found';
    END IF;

    INSERT INTO public."Enrollment" ("StudentID", "ClassID")
    VALUES (auth.uid(), target_class_id)
    ON CONFLICT DO NOTHING;

    RETURN CASE WHEN FOUND THEN 'joined' ELSE 'already_enrolled' END;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.join_class_by_code FROM PUBLIC, anon;
