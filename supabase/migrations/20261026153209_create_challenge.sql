CREATE FUNCTION public.create_challenge(
    class_id bigint,
    title text,
    description text,
    solution text,
    points integer,
    long double precision,
    lat double precision,
    radius integer,
    hidden boolean DEFAULT false
)
    RETURNS bigint
    LANGUAGE plpgsql
AS
$$
DECLARE
    new_challenge_id bigint;
BEGIN
    INSERT INTO public."Challenges" ("ClassID", "Title", "Description", "Points", "Hidden")
    VALUES (class_id, title, description, points, hidden)
    RETURNING "ChallengeID" INTO new_challenge_id;

    INSERT INTO public."Solutions" ("ChallengeID", "Solution")
    VALUES (new_challenge_id, solution);

    INSERT INTO public."Locations" ("ChallengeID", "Longitude", "Latitude", "Radius")
    VALUES (new_challenge_id, long, lat, radius);

    RETURN new_challenge_id;
END;
$$;
