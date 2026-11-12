CREATE FUNCTION public.is_class_professor(class_id bigint)
    RETURNS boolean
    LANGUAGE sql
    SECURITY DEFINER
    SET search_path = public
AS
$$
SELECT EXISTS (SELECT 1 FROM "Classes" WHERE "ClassID" = class_id AND "ProfessorID" = auth.uid());
$$;

CREATE
    POLICY "Professors can read enrollments in their classes" ON public."Enrollment"
    FOR
    SELECT TO authenticated
    USING (public.is_class_professor("ClassID"));
