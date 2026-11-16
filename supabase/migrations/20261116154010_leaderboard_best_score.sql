CREATE OR REPLACE FUNCTION public.get_class_leaderboard(p_class_id bigint)
    RETURNS TABLE
            (
                student_id   uuid,
                student_name text,
                total_score  bigint,
                rank         bigint
            )
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = ''
AS
$$
WITH best AS (SELECT s."StudentID", max(s."Score") AS score
              FROM public."Submission" s
                       JOIN public."Challenges" c ON c."ChallengeID" = s."ChallengeID"
              WHERE c."ClassID" = p_class_id
              GROUP BY s."StudentID", s."ChallengeID")
SELECT e."StudentID",
       p."Name",
       coalesce(sum(b.score), 0) AS total_score,
       rank() OVER (ORDER BY coalesce(sum(b.score), 0) DESC)
FROM public."Enrollment" e
         JOIN public."Profile" p ON p."ID" = e."StudentID"
         JOIN public."Classes" cl ON cl."ClassID" = e."ClassID"
         LEFT JOIN best b ON b."StudentID" = e."StudentID"
WHERE e."ClassID" = p_class_id
  AND (cl."ProfessorID" = auth.uid() OR
       EXISTS (SELECT 1 FROM public."Enrollment" WHERE "ClassID" = p_class_id AND "StudentID" = auth.uid()))
GROUP BY e."StudentID", p."Name"
ORDER BY total_score DESC, p."Name";
$$;
