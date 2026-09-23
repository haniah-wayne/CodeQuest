ALTER TABLE submissions
RENAME COLUMN student TO student_id;

ALTER TABLE submissions
ALTER COLUMN student_id TYPE UUID
USING student_id :: UUID;

ALTER TABLE submissions
ADD CONSTRAINT submissions_student_id_fkey
FOREIGN KEY (student_id)
REFERENCES profiles(id);

ALTER TABLE submissions
RENAME COLUMN chellenge TO challenge_id;

ALTER TABLE submissions
ALTER COLUMN challenge_id TYPE INT
USING challenge_id::INT;

ALTER TABLE challenges
ALTER COLUMN id TYPE INT
USING id::INT;

ALTER TABLE submissions
ADD CONSTRAINT submissions_challenge_id_fkey
FOREIGN KEY (challenge_id)
REFERENCES challenges(id);

ALTER TABLE Challenges
RENAME COLUMN class TO class_id;

ALTER TABLE Challenges
ALTER COLUMN class_id TYPE INT
USING class_id::INT;

ALTER TABLE Challenges
ADD CONSTRAINT challenges_class_id_fkey
FOREIGN KEY (class_id)
REFERENCES Classes(ClassID);

ALTER TABLE Challenges
ADD COLUMN description TEXT,
ADD COLUMN points INT,
ADD COLUMN instructions TEXT;

ALTER TABLE classes
RENAME COLUMN classid TO class_id;

ALTER TABLE classes
RENAME COLUMN professorid TO professor_id;

ALTER TABLE enrollments
RENAME COLUMN enrollmentid TO enrollment_id;

ALTER TABLE enrollments
RENAME COLUMN studentid TO student_id;

ALTER TABLE enrollments
RENAME COLUMN classesid TO class_id;

ALTER TABLE location
RENAME COLUMN challenge TO challenge_id;

ALTER TABLE Location
DROP COLUMN reveal_status,
ADD COLUMN latitude DOUBLE PRECISION,
ADD COLUMN longitude DOUBLE PRECISION,
ADD COLUMN radius DOUBLE PRECISION;

ALTER TABLE location
ALTER COLUMN challenge_id TYPE INT
USING challenge_id::INT;

ALTER TABLE Location
ADD CONSTRAINT location_challenge_id_fkey
FOREIGN KEY (challenge_id)
REFERENCES challenges(id);

ALTER TABLE classes
ADD CONSTRAINT classes_classcode_unique UNIQUE (classcode);

DROP POLICY IF EXISTS Policyforclasses_Student ON classes;

CREATE POLICY Policyforclasses_Student ON classes
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM enrollments
        WHERE enrollments.student_id = auth.uid()
        AND enrollments.class_id = classes.class_id
    )
);

CREATE POLICY Policyforsubmission_SS on submissions
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (auth.uid() = student_id);

CREATE POLICY Policyforsubmission_SI on submissions
AS PERMISSIVE
FOR INSERT
TO authenticated
WITH CHECK (
    auth.uid() = student_id
);

CREATE POLICY Policyforsubmission_P on submissions
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM challenges
        JOIN classes
            ON classes.class_id = challenges.class_id
        WHERE challenges.id = submissions.challenge_id
        AND classes.professor_id = auth.uid()
    )
)

WITH CHECK(
    EXISTS(
        SELECT 1
        FROM challenges
        JOIN classes
            ON classes.class_id = challenges.class_id
        WHERE challenges.id = submissions.challenge_id
        AND classes.professor_id = auth.uid()
    )
);

ALTER TABLE Location
DROP COLUMN location_info;

CREATE POLICY Policyforlocation_SS on location
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS(
        SELECT 1
        FROM challenges
        JOIN enrollments
            on enrollments.class_id = challenges.class_id
        WHERE challenges.id = location.challenge_id
        AND enrollments.student_id = auth.uid()
    )
);

CREATE POLICY Policyforlocation_P on location
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
    EXISTS(
        SELECT 1
        FROM challenges
        JOIN classes
            on classes.class_id = challenges.class_id
        WHERE challenges.id = location.challenge_id
        AND classes.professor_id = auth.uid()
    )
)
WITH CHECK(
      EXISTS(
        SELECT 1
        FROM challenges
        JOIN classes
            ON classes.class_id = challenges.class_id
        WHERE challenges.id = location.challenge_id
        AND classes.professor_id = auth.uid()
    )
);

CREATE POLICY Policyforchallenges_SS on challenges
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS(
        SELECT 1
        FROM enrollments
        WHERE enrollments.class_id = challenges.class_id
        AND enrollments.student_id = auth.uid()
    )
);

CREATE POLICY Policyforchallenges_P on challenges
AS PERMISSIVE
FOR ALL
TO authenticated
USING (
    EXISTS(
        SELECT 1
        FROM classes
        WHERE classes.class_id = challenges.class_id
        AND classes.professor_id = auth.uid()
    )
)
WITH CHECK(
      EXISTS(
        SELECT 1
        FROM classes
        WHERE classes.class_id = challenges.class_id
        AND classes.professor_id = auth.uid()
    )
);