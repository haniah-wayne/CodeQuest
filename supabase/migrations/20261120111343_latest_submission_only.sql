DELETE
FROM public."Submission" s
    USING (SELECT "SubmissionID",
                  row_number() OVER (
                      PARTITION BY "StudentID", "ChallengeID"
                      ORDER BY ("Status" = 'correct') DESC NULLS LAST, "SubmittedAt" DESC, "SubmissionID" DESC
                      ) AS rn
           FROM public."Submission") ranked
WHERE s."SubmissionID" = ranked."SubmissionID"
  AND ranked.rn > 1;

ALTER TABLE public."Submission"
    ADD CONSTRAINT "Submission_StudentID_ChallengeID_key" UNIQUE ("StudentID", "ChallengeID");

DROP POLICY "Students can create their own submissions" ON public."Submission";

CREATE FUNCTION public.record_submission(
    p_student_id uuid,
    p_challenge_id bigint,
    p_code text,
    p_language text,
    p_output text,
    p_score integer,
    p_status text
)
    RETURNS boolean
    LANGUAGE plpgsql
    SET search_path = ''
AS
$$
BEGIN
    INSERT INTO public."Submission" AS s
        ("StudentID", "ChallengeID", "Code", "Language", "Output", "Score", "Status")
    VALUES (p_student_id, p_challenge_id, p_code, p_language, p_output, p_score, p_status)
    ON CONFLICT ("StudentID", "ChallengeID") DO UPDATE
        SET "Code"        = excluded."Code",
            "Language"    = excluded."Language",
            "Output"      = excluded."Output",
            "Score"       = excluded."Score",
            "Status"      = excluded."Status",
            "SubmittedAt" = now(),
            "Feedback"    = NULL
    WHERE s."Status" IS DISTINCT FROM 'correct';

    RETURN FOUND;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.record_submission FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.record_submission TO service_role;
