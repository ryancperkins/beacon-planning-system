-- Fix onboarding church creation with insert().select(): SELECT policy must allow reading freshly created church before profile.church_id is set
DROP POLICY IF EXISTS "Users can view own church" ON public.churches;

CREATE POLICY "Users can view own church"
ON public.churches
FOR SELECT
TO authenticated
USING (
  id = get_user_church_id(auth.uid())
  OR created_by = auth.uid()
);