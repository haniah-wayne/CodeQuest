CREATE FUNCTION public.delete_own_account()
    RETURNS void
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
AS
$$
BEGIN
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'Not signed in';
    END IF;

    DELETE FROM auth.users WHERE id = auth.uid();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.delete_own_account FROM PUBLIC, anon;
