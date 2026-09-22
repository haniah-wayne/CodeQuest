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
ALTER COLUMN challenge_id TYPE BIGINT
USING challenge_id::INT;

ALTER TABLE submissions
ADD CONSTRAINT submissions_challenge_id_fkey
FOREIGN KEY (challenge_id)
REFERENCES challenges(id);

ALTER TABLE Challenges
RENAME COLUMN class TO class_id;

ALTER TABLE Challenges
ALTER COLUMN class_id TYPE BIGINT
USING class_id::INT;

ALTER TABLE Challenges
ADD CONSTRAINT challenges_class_id_fkey
FOREIGN KEY (class_id)
REFERENCES Classes(ClassID);

ALTER TABLE Challenges
ADD COLUMN description TEXT,
ADD COLUMN points INT,
ADD COLUMN instructions TEXT;

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
        WHERE enrollments.studentid = auth.uid()
        AND enrollments.classesid = classes.classid
    )
);