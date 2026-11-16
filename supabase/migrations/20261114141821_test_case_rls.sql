create schema if not exists private;

create or replace function private.teaches_challenge(challenge_id bigint)
    returns boolean
    language sql
    stable
    security definer
    set search_path = ''
as
$$
select exists (select 1
               from public."Challenges" c
                        join public."Classes" cl on cl."ClassID" = c."ClassID"
               where c."ChallengeID" = challenge_id
                 and cl."ProfessorID" = (select auth.uid()));
$$;

create or replace function private.enrolled_in_challenge(challenge_id bigint)
    returns boolean
    language sql
    stable
    security definer
    set search_path = ''
as
$$
select exists (select 1
               from public."Challenges" c
                        join public."Enrollment" e on e."ClassID" = c."ClassID"
               where c."ChallengeID" = challenge_id
                 and e."StudentID" = (select auth.uid()));
$$;

create or replace function private.is_example_test_case(test_case_id bigint, challenge_id bigint)
    returns boolean
    language sql
    stable
    security definer
    set search_path = ''
as
$$
select test_case_id = (select min(tc."TestCaseID")
                       from public."TestCase" tc
                       where tc."ChallengeID" = challenge_id);
$$;

revoke all on function private.teaches_challenge(bigint) from public;
revoke all on function private.enrolled_in_challenge(bigint) from public;
revoke all on function private.is_example_test_case(bigint, bigint) from public;

grant usage on schema private to authenticated;
grant execute on function private.teaches_challenge(bigint) to authenticated;
grant execute on function private.enrolled_in_challenge(bigint) to authenticated;
grant execute on function private.is_example_test_case(bigint, bigint) to authenticated;

alter table public."TestCase"
    enable row level security;

drop policy if exists "Professors read their test cases" on public."TestCase";
drop policy if exists "Professors add test cases" on public."TestCase";
drop policy if exists "Professors update their test cases" on public."TestCase";
drop policy if exists "Professors delete their test cases" on public."TestCase";
drop policy if exists "Students read the example test case" on public."TestCase";

create policy "Professors read their test cases"
    on public."TestCase"
    for select
    to authenticated
    using (private.teaches_challenge("ChallengeID"));

create policy "Professors add test cases"
    on public."TestCase"
    for insert
    to authenticated
    with check (private.teaches_challenge("ChallengeID"));

create policy "Professors update their test cases"
    on public."TestCase"
    for update
    to authenticated
    using (private.teaches_challenge("ChallengeID"))
    with check (private.teaches_challenge("ChallengeID"));

create policy "Professors delete their test cases"
    on public."TestCase"
    for delete
    to authenticated
    using (private.teaches_challenge("ChallengeID"));

create policy "Students read the example test case"
    on public."TestCase"
    for select
    to authenticated
    using (
    private.enrolled_in_challenge("ChallengeID")
        and private.is_example_test_case("TestCaseID", "ChallengeID")
    );
