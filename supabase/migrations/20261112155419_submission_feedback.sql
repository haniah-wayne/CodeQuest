CREATE FUNCTION public.set_submission_feedback(submission_id integer, feedback text)
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
AS
$$
BEGIN
    UPDATE public."Submission" s
    SET "Feedback" = nullif(btrim(feedback), '')
    FROM public."Challenges" c
             JOIN public."Classes" cl ON cl."ClassID" = c."ClassID"
    WHERE s."SubmissionID" = submission_id
      AND c."ChallengeID" = s."ChallengeID"
      AND cl."ProfessorID" = auth.uid();

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Submission % not found for this professor', submission_id
            USING ERRCODE = '42501';
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.set_submission_feedback FROM PUBLIC, anon;
