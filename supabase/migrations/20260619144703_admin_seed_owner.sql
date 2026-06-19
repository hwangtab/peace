-- Promote the designated operator to owner so member management and editing
-- stay reachable after the role migration (default role is 'editor'). Target
-- chosen explicitly by the project operator. Idempotent: matches by email and
-- is a no-op if the account is not (yet) a member.
update public.admin_members
set role = 'owner'
where lower(email) = lower('hwangtab@gmail.com');
