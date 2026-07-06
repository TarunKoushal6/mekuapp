-- Grant admin role to the account owner so the /admin panel unlocks.
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'::public.app_role
FROM auth.users
WHERE lower(email) = 'kumarishakti722@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;