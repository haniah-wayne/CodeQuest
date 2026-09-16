CREATE TABLE enrollments(
  enrollmentid int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  studentid UUID NOT NULL REFERENCES profiles(id),
  classesid int NOT NULL REFERENCES classes(classesid)
);