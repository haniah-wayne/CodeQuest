CREATE TABLE enrollments(
  enrollmentid int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  studentid UUID NOT NULL REFERENCES profiles(id),
  classesid int NOT NULL REFERENCES classes(classesid)
);
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY PolicyforenrollmentS ON enrollments
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    studentid = auth.uid()
);

CREATE POLICY PolicyforclenrollmentP ON Enrollments
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM classes
        WHERE classes.classesid= enrollments.classesid
        AND classes.professorid = auth.uid()
    )
);