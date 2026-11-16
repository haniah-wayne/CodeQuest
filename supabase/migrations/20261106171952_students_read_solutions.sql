CREATE POLICY "Students can read solutions to their classes' challenges" ON public."Solutions"
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1
                   FROM public."Challenges"
                            JOIN public."Enrollment" USING ("ClassID")
                   WHERE "ChallengeID" = "Solutions"."ChallengeID"
                     AND "StudentID" = (SELECT auth.uid())));
