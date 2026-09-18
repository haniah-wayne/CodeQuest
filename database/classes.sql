CREATE TABLE Classes (
    ClassID INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    ProfessorID UUID REFERENCES Profiles(ID),
    ClassName TEXT NOT NULL,
    Description TEXT,
    ClassCode INT NOT NULL,
    CreatedAt TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE Classes ENABLE ROW LEVEL SECURITY;


CREATE POLICY Policyforclasses_Prof ON Classes
AS PERMISSIVE
FOR ALL
TO authenticated
USING (auth.uid() = ProfessorID)
WITH CHECK (auth.uid() = ProfessorID);


CREATE POLICY Policyforclasses_Student ON Classes
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM Enrollment
        WHERE enrollments.StudentID = auth.uid()
        AND enrollments.classesid = classes.classesid
    )
);