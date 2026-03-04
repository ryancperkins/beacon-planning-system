
-- Fix the permissive churches INSERT policy
DROP POLICY "Users can insert churches" ON public.churches;

CREATE POLICY "Users can insert churches" ON public.churches
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());
