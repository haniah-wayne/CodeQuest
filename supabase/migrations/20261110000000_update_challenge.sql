CREATE FUNCTION public.update_challenge(
    challenge_id integer,
    class_id integer,
    title text,
    description text,
    solution text,
    points integer,
    long numeric,
    lat numeric,
    radius integer,
    hidden boolean
)
    RETURNS void
    LANGUAGE plpgsql
    SET search_path = ''
AS
$$
BEGIN
    UPDATE public."Challenges"
    SET "Title"       = title,
        "Description" = description,
        "Points"      = points,
        "Hidden"      = hidden
    WHERE "ChallengeID" = challenge_id
      AND "ClassID" = class_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Challenge % not found in class % for this professor', challenge_id, class_id
            USING ERRCODE = '42501';
    END IF;

    UPDATE public."Solutions" SET "Solution" = solution WHERE "ChallengeID" = challenge_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Solution for challenge % could not be updated', challenge_id
            USING ERRCODE = 'P0002';
    END IF;

    UPDATE public."Locations"
    SET "Longitude" = long,
        "Latitude"  = lat,
        "Radius"    = radius
    WHERE "ChallengeID" = challenge_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Location for challenge % could not be updated', challenge_id
            USING ERRCODE = 'P0002';
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.update_challenge FROM PUBLIC, anon;
