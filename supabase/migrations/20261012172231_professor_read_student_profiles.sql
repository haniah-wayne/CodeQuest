CREATE POLICY "Professors can read their students' profiles" ON public."Profile"
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1
                   FROM public."Enrollment"
                   WHERE "StudentID" = "Profile"."ID"
                     AND public.is_class_professor("ClassID")));
