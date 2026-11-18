CREATE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = ''
AS
$$
BEGIN
    INSERT INTO public."Profile" ("ID", "Name", "Email", "Role")
    VALUES (new.id,
            coalesce(new.raw_user_meta_data ->> 'display_name', new.raw_user_meta_data ->> 'name'),
            new.email,
            coalesce(new.raw_user_meta_data ->> 'role', 'student'));

    RETURN new;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT
    ON auth.users
    FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();
