CREATE POLICY "Professors can read solutions to their challenges" ON public."Solutions"
    FOR SELECT TO authenticated
    USING (EXISTS (SELECT 1
                   FROM public."Challenges"
                   WHERE "ChallengeID" = "Solutions"."ChallengeID"
                     AND public.is_class_professor("ClassID")));

CREATE POLICY "Professors can update solutions to their challenges" ON public."Solutions"
    FOR UPDATE TO authenticated
    USING (EXISTS (SELECT 1
                   FROM public."Challenges"
                   WHERE "ChallengeID" = "Solutions"."ChallengeID"
                     AND public.is_class_professor("ClassID")));
