CREATE FUNCTION public.is_class_member(p_class_id bigint)
    RETURNS boolean
    LANGUAGE sql
    STABLE
    SECURITY DEFINER
    SET search_path = ''
AS
$$
SELECT EXISTS (SELECT 1 FROM public."Classes" WHERE "ClassID" = p_class_id AND "ProfessorID" = (SELECT auth.uid()))
           OR
       EXISTS (SELECT 1 FROM public."Enrollment" WHERE "ClassID" = p_class_id AND "StudentID" = (SELECT auth.uid()));
$$;

CREATE FUNCTION public.broadcast_class_change()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
AS
$$
DECLARE
    class_id bigint;
BEGIN
    IF TG_TABLE_NAME = 'Enrollment' THEN
        class_id := coalesce(new."ClassID", old."ClassID");
    ELSE
        -- Submission has no ClassID, so find it through the challenge
        SELECT "ClassID"
        INTO class_id
        FROM public."Challenges"
        WHERE "ChallengeID" = coalesce(new."ChallengeID", old."ChallengeID");
    END IF;

    IF class_id IS NOT NULL THEN
        PERFORM realtime.send(jsonb_build_object('table', TG_TABLE_NAME), 'changed', 'class:' || class_id, true);
    END IF;

    RETURN NULL;
END;
$$;

CREATE TRIGGER broadcast_class_change
    AFTER INSERT OR UPDATE OR DELETE
    ON public."Enrollment"
    FOR EACH ROW
EXECUTE FUNCTION public.broadcast_class_change();

CREATE TRIGGER broadcast_class_change
    AFTER INSERT OR UPDATE OR DELETE
    ON public."Submission"
    FOR EACH ROW
EXECUTE FUNCTION public.broadcast_class_change();

-- The CASE keeps the bigint cast from running on topics that aren't class:<id>
CREATE POLICY "Class members can receive their class's broadcasts" ON realtime.messages
    FOR SELECT TO authenticated
    USING (
    extension = 'broadcast'
        AND CASE
                WHEN (SELECT realtime.topic()) ~ '^class:[0-9]{1,18}$'
                    THEN public.is_class_member(substr((SELECT realtime.topic()), 7)::bigint)
                ELSE false
        END
    );
