DROP TABLE IF EXISTS "public"."submissions" CASCADE;
DROP TABLE IF EXISTS "public"."location" CASCADE;
DROP TABLE IF EXISTS "public"."challenges" CASCADE;
DROP TABLE IF EXISTS "public"."profiles" CASCADE;


CREATE TABLE "public"."Profile" (
    "ID" UUID NOT NULL,
    "FirstName" TEXT NOT NULL,
    "LastName" TEXT NOT NULL,
    "Role" TEXT NOT NULL,
    CONSTRAINT "Profile_pkey" PRIMARY KEY ("ID"),
    CONSTRAINT "Profile_Role_check"
        CHECK ("Role" IN ('student', 'instructor')),
    CONSTRAINT "Profile_ID_fkey"
        FOREIGN KEY ("ID")
        REFERENCES "auth"."users"("id")
        ON DELETE CASCADE
);


CREATE TABLE "public"."Classes" (
    "ClassID" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "ProfessorID" UUID NOT NULL,
    "ClassName" TEXT NOT NULL,
    "Description" TEXT,
    "ClassCode" TEXT NOT NULL,
    "CreatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT "Classes_ClassCode_key"
        UNIQUE ("ClassCode"),

    CONSTRAINT "Classes_ProfessorID_fkey"
        FOREIGN KEY ("ProfessorID")
        REFERENCES "public"."Profile"("ID")
        ON DELETE CASCADE
);


CREATE TABLE "public"."Enrollment" (
    "EnrollmentID" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "StudentID" UUID NOT NULL,
    "ClassID" BIGINT NOT NULL,
    "EnrolledAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT "Enrollment_StudentID_ClassID_key"
        UNIQUE ("StudentID", "ClassID"),

    CONSTRAINT "Enrollment_StudentID_fkey"
        FOREIGN KEY ("StudentID")
        REFERENCES "public"."Profile"("ID")
        ON DELETE CASCADE,

    CONSTRAINT "Enrollment_ClassID_fkey"
        FOREIGN KEY ("ClassID")
        REFERENCES "public"."Classes"("ClassID")
        ON DELETE CASCADE
);


CREATE TABLE "public"."Challenges" (
    "ChallengeID" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "ClassID" BIGINT NOT NULL,
    "Title" TEXT NOT NULL,
    "Description" TEXT,
    "ChallengeType" TEXT,
    "Points" INTEGER DEFAULT 0 NOT NULL,
    "Instructions" TEXT,
    "CreatedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT "Challenges_ClassID_fkey"
        FOREIGN KEY ("ClassID")
        REFERENCES "public"."Classes"("ClassID")
        ON DELETE CASCADE
);


CREATE TABLE "public"."Locations" (
    "LocationID" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "ChallengeID" BIGINT NOT NULL,
    "Latitude" NUMERIC(9,6) NOT NULL,
    "Longitude" NUMERIC(9,6) NOT NULL,
    "Radius" INTEGER NOT NULL,

    CONSTRAINT "Locations_ChallengeID_fkey"
        FOREIGN KEY ("ChallengeID")
        REFERENCES "public"."Challenges"("ChallengeID")
        ON DELETE CASCADE
);


CREATE TABLE "public"."CheckIns" (
    "CheckInID" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "StudentID" UUID NOT NULL,
    "ChallengeID" BIGINT NOT NULL,
    "Latitude" NUMERIC(9,6) NOT NULL,
    "Longitude" NUMERIC(9,6) NOT NULL,
    "Distance" NUMERIC(10,2),
    "Successful" BOOLEAN DEFAULT FALSE NOT NULL,
    "CheckedInAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT "CheckIns_StudentID_fkey"
        FOREIGN KEY ("StudentID")
        REFERENCES "public"."Profile"("ID")
        ON DELETE CASCADE,

    CONSTRAINT "CheckIns_ChallengeID_fkey"
        FOREIGN KEY ("ChallengeID")
        REFERENCES "public"."Challenges"("ChallengeID")
        ON DELETE CASCADE
);


CREATE TABLE "public"."Questions" (
    "QuestionID" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "ChallengeID" BIGINT NOT NULL,
    "QuestionText" TEXT NOT NULL,
    "QuestionType" TEXT NOT NULL,

    CONSTRAINT "Questions_ChallengeID_fkey"
        FOREIGN KEY ("ChallengeID")
        REFERENCES "public"."Challenges"("ChallengeID")
        ON DELETE CASCADE
);


CREATE TABLE "public"."AnswerChoices" (
    "ChoiceID" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "QuestionID" BIGINT NOT NULL,
    "AnswerText" TEXT NOT NULL,
    "IsCorrect" BOOLEAN DEFAULT FALSE NOT NULL,

    CONSTRAINT "AnswerChoices_QuestionID_fkey"
        FOREIGN KEY ("QuestionID")
        REFERENCES "public"."Questions"("QuestionID")
        ON DELETE CASCADE
);


CREATE TABLE "public"."StudentAnswers" (
    "StudentAnswersID" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "StudentID" UUID NOT NULL,
    "QuestionID" BIGINT NOT NULL,
    "ChoiceID" BIGINT,
    "AnswerText" TEXT,
    "IsCorrect" BOOLEAN,
    "SubmittedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT "StudentAnswers_StudentID_fkey"
        FOREIGN KEY ("StudentID")
        REFERENCES "public"."Profile"("ID")
        ON DELETE CASCADE,

    CONSTRAINT "StudentAnswers_QuestionID_fkey"
        FOREIGN KEY ("QuestionID")
        REFERENCES "public"."Questions"("QuestionID")
        ON DELETE CASCADE,

    CONSTRAINT "StudentAnswers_ChoiceID_fkey"
        FOREIGN KEY ("ChoiceID")
        REFERENCES "public"."AnswerChoices"("ChoiceID")
        ON DELETE SET NULL
);


CREATE TABLE "public"."ChallengeCompletions" (
    "CompletionID" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "ChallengeID" BIGINT NOT NULL,
    "Status" TEXT NOT NULL,
    "StartedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    "CompletedAt" TIMESTAMPTZ,

    CONSTRAINT "ChallengeCompletions_Status_check"
        CHECK ("Status" IN ('started', 'completed')),

    CONSTRAINT "ChallengeCompletions_ChallengeID_fkey"
        FOREIGN KEY ("ChallengeID")
        REFERENCES "public"."Challenges"("ChallengeID")
        ON DELETE CASCADE
);


CREATE TABLE "public"."Submission" (
    "SubmissionID" BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    "StudentID" UUID NOT NULL,
    "ChallengeID" BIGINT NOT NULL,
    "Score" INTEGER,
    "Output" TEXT,
    "Code" TEXT,
    "Language" TEXT,
    "Feedback" TEXT,
    "SubmittedAt" TIMESTAMPTZ DEFAULT NOW() NOT NULL,

    CONSTRAINT "Submission_StudentID_fkey"
        FOREIGN KEY ("StudentID")
        REFERENCES "public"."Profile"("ID")
        ON DELETE CASCADE,

    CONSTRAINT "Submission_ChallengeID_fkey"
        FOREIGN KEY ("ChallengeID")
        REFERENCES "public"."Challenges"("ChallengeID")
        ON DELETE CASCADE
);


ALTER TABLE "public"."Profile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Classes" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Enrollment" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Challenges" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Locations" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."CheckIns" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Questions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."AnswerChoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."StudentAnswers" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."ChallengeCompletions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."Submission" ENABLE ROW LEVEL SECURITY;