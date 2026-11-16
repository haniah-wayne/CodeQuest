CREATE
    POLICY "Users can read their own profile" ON public."Profile"
    FOR
    SELECT TO authenticated
    USING (auth.uid() = "ID");

CREATE
    POLICY "Professors can manage their own classes" ON public."Classes"
    FOR ALL TO authenticated
    USING (auth.uid() = "ProfessorID");

CREATE
    POLICY "Students can read classes they're enrolled in" ON public."Classes"
    FOR
    SELECT TO authenticated
    USING (EXISTS (SELECT 1
                   FROM public."Enrollment"
                   WHERE "StudentID" = auth.uid()
                     AND "ClassID" = "Classes"."ClassID"));

CREATE
    POLICY "Students can read their own enrollments" ON public."Enrollment"
    FOR
    SELECT TO authenticated
    USING ("StudentID" = auth.uid());

CREATE
    POLICY "Professors can manage challenges in their classes" ON public."Challenges"
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1
                   FROM public."Classes"
                   WHERE "ClassID" = "Challenges"."ClassID"
                     AND "ProfessorID" = auth.uid()));

CREATE
    POLICY "Students can read challenges in their classes" ON public."Challenges"
    FOR
    SELECT TO authenticated
    USING (EXISTS (SELECT 1
                   FROM public."Enrollment"
                   WHERE "ClassID" = "Challenges"."ClassID"
                     AND "StudentID" = auth.uid()));

CREATE
    POLICY "Professors can manage locations of their challenges" ON public."Locations"
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1
                   FROM public."Challenges"
                            JOIN public."Classes" USING ("ClassID")
                   WHERE "ChallengeID" = "Locations"."ChallengeID"
                     AND "ProfessorID" = auth.uid()));

CREATE
    POLICY "Students can read locations of their classes' challenges" ON public."Locations"
    FOR
    SELECT TO authenticated
    USING (EXISTS (SELECT 1
                   FROM public."Challenges"
                            JOIN public."Enrollment" USING ("ClassID")
                   WHERE "ChallengeID" = "Locations"."ChallengeID"
                     AND "StudentID" = auth.uid()));

CREATE
    POLICY "Professors can manage submissions to their challenges" ON public."Submission"
    FOR ALL TO authenticated
    USING (EXISTS (SELECT 1
                   FROM public."Challenges"
                            JOIN public."Classes" USING ("ClassID")
                   WHERE "ChallengeID" = "Submission"."ChallengeID"
                     AND "ProfessorID" = auth.uid()));

CREATE
    POLICY "Students can create their own submissions" ON public."Submission"
    FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = "StudentID");

CREATE
    POLICY "Students can read their own submissions" ON public."Submission"
    FOR
    SELECT TO authenticated
    USING (auth.uid() = "StudentID");
