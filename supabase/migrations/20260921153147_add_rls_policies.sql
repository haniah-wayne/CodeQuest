CREATE POLICY "Policyforclasses_Student" ON "Classes"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM "Enrollment"
        WHERE "Enrollment"."StudentID" = auth.uid()
        AND "Enrollment"."ClassID" = "Classes"."ClassID"
    )
);


CREATE POLICY "Policyforsubmission_SS" ON "Submission"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    auth.uid() = "StudentID"
);


CREATE POLICY "Policyforsubmission_SI" ON "Submission"
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = "StudentID"
);


CREATE POLICY "Policyforsubmission_P" ON "Submission"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM "Challenges"
        JOIN "Classes"
            ON "Classes"."ClassID" = "Challenges"."ClassID"
        WHERE "Challenges"."ChallengeID" = "Submission"."ChallengeID"
        AND "Classes"."ProfessorID" = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM "Challenges"
        JOIN "Classes"
            ON "Classes"."ClassID" = "Challenges"."ClassID"
        WHERE "Challenges"."ChallengeID" = "Submission"."ChallengeID"
        AND "Classes"."ProfessorID" = auth.uid()
    )
);


CREATE POLICY "Policyforlocation_SS" ON "Locations"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM "Challenges"
        JOIN "Enrollment"
            ON "Enrollment"."ClassID" = "Challenges"."ClassID"
        WHERE "Challenges"."ChallengeID" = "Locations"."ChallengeID"
        AND "Enrollment"."StudentID" = auth.uid()
    )
);


CREATE POLICY "Policyforlocation_P" ON "Locations"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM "Challenges"
        JOIN "Classes"
            ON "Classes"."ClassID" = "Challenges"."ClassID"
        WHERE "Challenges"."ChallengeID" = "Locations"."ChallengeID"
        AND "Classes"."ProfessorID" = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM "Challenges"
        JOIN "Classes"
            ON "Classes"."ClassID" = "Challenges"."ClassID"
        WHERE "Challenges"."ChallengeID" = "Locations"."ChallengeID"
        AND "Classes"."ProfessorID" = auth.uid()
    )
);


CREATE POLICY "Policyforchallenges_SS" ON "Challenges"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM "Enrollment"
        WHERE "Enrollment"."ClassID" = "Challenges"."ClassID"
        AND "Enrollment"."StudentID" = auth.uid()
    )
);


CREATE POLICY "Policyforchallenges_P" ON "Challenges"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM "Classes"
        WHERE "Classes"."ClassID" = "Challenges"."ClassID"
        AND "Classes"."ProfessorID" = auth.uid()
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM "Classes"
        WHERE "Classes"."ClassID" = "Challenges"."ClassID"
        AND "Classes"."ProfessorID" = auth.uid()
    )
);

CREATE POLICY "Policyforrole" ON "Profile"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    auth.uid() = "ID"
);


CREATE POLICY "Policyforclasses_Prof" ON "Classes"
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
    auth.uid() = "ProfessorID"
)
WITH CHECK (
    auth.uid() = "ProfessorID"
);


CREATE POLICY "PolicyforenrollmentS" ON "Enrollment"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    "StudentID" = auth.uid()
);


CREATE POLICY "PolicyforclenrollmentP" ON "Enrollment"
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM "Classes"
        WHERE "Classes"."ClassID" = "Enrollment"."ClassID"
        AND "Classes"."ProfessorID" = auth.uid()
    )
);