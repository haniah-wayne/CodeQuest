CREATE POLICY "Professors can add solutions to their challenges" ON public."Solutions"
    FOR INSERT TO authenticated
    WITH CHECK (EXISTS (SELECT 1
                        FROM public."Challenges"
                                 JOIN public."Classes" USING ("ClassID")
                        WHERE "ChallengeID" = "Solutions"."ChallengeID"
                          AND "ProfessorID" = auth.uid()));
