CREATE FUNCTION public.get_class_roster(p_class_id bigint)
    RETURNS TABLE
            (
                student_id    uuid,
                student_name  text,
                student_email text
            )
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = ''
AS
$$
SELECT e."StudentID", p."Name", CASE WHEN c."ProfessorID" = auth.uid() THEN p."Email" END
FROM public."Enrollment" e
         JOIN public."Profile" p ON p."ID" = e."StudentID"
         JOIN public."Classes" c ON c."ClassID" = e."ClassID"
WHERE e."ClassID" = p_class_id
  AND (c."ProfessorID" = auth.uid() OR
       EXISTS (SELECT 1 FROM public."Enrollment" WHERE "ClassID" = p_class_id AND "StudentID" = auth.uid()))
ORDER BY e."EnrolledAt";
$$;

REVOKE EXECUTE ON FUNCTION public.get_class_roster FROM PUBLIC, anon;
