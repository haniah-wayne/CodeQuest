CREATE TABLE Profiles(
  ID UUID PRIMARY KEY REFERENCES auth.users(id),
  LastName TEXT NOT NULL,
  FirstName TEXT NOT NULL,
  ROLE TEXT NOT NULL,
  CONSTRAINT check_role
    CHECK (ROLE IN ('student', 'professor')) 
);

CREATE POLICY Policyforrole ON Profiles
    AS PERMISSIVE
    FOR SELECT
    TO authenticated
    USING ( auth.uid() = ID
) 
  