CREATE TABLE classes(
  classesid int GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  classesname TEXT NOT NULL,
  professorid UUID REFERENCES profiles(id)
);