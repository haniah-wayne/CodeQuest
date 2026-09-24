DROP POLICY IF EXISTS "PolicyforclenrollmentP" ON "Enrollment";

DROP POLICY IF EXISTS "Policyforenrollment_P" ON "Enrollment";

CREATE FUNCTION public.is_class_professor(class_id BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM "Classes"
        WHERE "ClassID" = class_id
          AND "ProfessorID" = auth.uid()
    );
$$;

CREATE POLICY "Policyforenrollment_P"
ON "Enrollment"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    public.is_class_professor("ClassID")
);