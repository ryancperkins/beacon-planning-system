
-- Drop all restrictive policies and recreate as permissive

-- churches
DROP POLICY IF EXISTS "Users can insert churches" ON public.churches;
DROP POLICY IF EXISTS "Users can view own church" ON public.churches;
CREATE POLICY "Users can insert churches" ON public.churches FOR INSERT TO authenticated WITH CHECK (created_by = auth.uid());
CREATE POLICY "Users can view own church" ON public.churches FOR SELECT TO authenticated USING (id = get_user_church_id(auth.uid()));

-- campuses
DROP POLICY IF EXISTS "Users can insert church campuses" ON public.campuses;
DROP POLICY IF EXISTS "Users can view church campuses" ON public.campuses;
CREATE POLICY "Users can insert church campuses" ON public.campuses FOR INSERT TO authenticated WITH CHECK (church_id = get_user_church_id(auth.uid()));
CREATE POLICY "Users can view church campuses" ON public.campuses FOR SELECT TO authenticated USING (church_id = get_user_church_id(auth.uid()));

-- profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view profiles in church" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can view profiles in church" ON public.profiles FOR SELECT TO authenticated USING ((church_id = get_user_church_id(auth.uid())) OR (id = auth.uid()));

-- user_roles
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can insert own roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ministries
DROP POLICY IF EXISTS "Users can insert church ministries" ON public.ministries;
DROP POLICY IF EXISTS "Users can view church ministries" ON public.ministries;
CREATE POLICY "Users can insert church ministries" ON public.ministries FOR INSERT TO authenticated WITH CHECK (church_id = get_user_church_id(auth.uid()));
CREATE POLICY "Users can view church ministries" ON public.ministries FOR SELECT TO authenticated USING (church_id = get_user_church_id(auth.uid()));

-- initiatives
DROP POLICY IF EXISTS "Users can insert church initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Users can update church initiatives" ON public.initiatives;
DROP POLICY IF EXISTS "Users can view church initiatives" ON public.initiatives;
CREATE POLICY "Users can insert church initiatives" ON public.initiatives FOR INSERT TO authenticated WITH CHECK (church_id = get_user_church_id(auth.uid()));
CREATE POLICY "Users can update church initiatives" ON public.initiatives FOR UPDATE TO authenticated USING (church_id = get_user_church_id(auth.uid()));
CREATE POLICY "Users can view church initiatives" ON public.initiatives FOR SELECT TO authenticated USING (church_id = get_user_church_id(auth.uid()));

-- work_items
DROP POLICY IF EXISTS "Users can insert work items" ON public.work_items;
DROP POLICY IF EXISTS "Users can view work items" ON public.work_items;
CREATE POLICY "Users can insert work items" ON public.work_items FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM initiatives i WHERE i.id = work_items.initiative_id AND i.church_id = get_user_church_id(auth.uid())));
CREATE POLICY "Users can view work items" ON public.work_items FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM initiatives i WHERE i.id = work_items.initiative_id AND i.church_id = get_user_church_id(auth.uid())));

-- initiative_notes
DROP POLICY IF EXISTS "Users can insert initiative notes" ON public.initiative_notes;
DROP POLICY IF EXISTS "Users can view initiative notes" ON public.initiative_notes;
DROP POLICY IF EXISTS "Users can update own notes" ON public.initiative_notes;
DROP POLICY IF EXISTS "Users can delete own notes" ON public.initiative_notes;
CREATE POLICY "Users can insert initiative notes" ON public.initiative_notes FOR INSERT TO authenticated WITH CHECK ((author_id = auth.uid()) AND (EXISTS (SELECT 1 FROM initiatives i WHERE i.id = initiative_notes.initiative_id AND i.church_id = get_user_church_id(auth.uid()))));
CREATE POLICY "Users can view initiative notes" ON public.initiative_notes FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM initiatives i WHERE i.id = initiative_notes.initiative_id AND i.church_id = get_user_church_id(auth.uid())));
CREATE POLICY "Users can update own notes" ON public.initiative_notes FOR UPDATE TO authenticated USING (author_id = auth.uid());
CREATE POLICY "Users can delete own notes" ON public.initiative_notes FOR DELETE TO authenticated USING (author_id = auth.uid());

-- initiative_activity
DROP POLICY IF EXISTS "Users can insert initiative activity" ON public.initiative_activity;
DROP POLICY IF EXISTS "Users can view initiative activity" ON public.initiative_activity;
CREATE POLICY "Users can insert initiative activity" ON public.initiative_activity FOR INSERT TO authenticated WITH CHECK ((actor_id = auth.uid()) AND (EXISTS (SELECT 1 FROM initiatives i WHERE i.id = initiative_activity.initiative_id AND i.church_id = get_user_church_id(auth.uid()))));
CREATE POLICY "Users can view initiative activity" ON public.initiative_activity FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM initiatives i WHERE i.id = initiative_activity.initiative_id AND i.church_id = get_user_church_id(auth.uid())));

-- token_balances
DROP POLICY IF EXISTS "Users can insert token balances" ON public.token_balances;
DROP POLICY IF EXISTS "Users can view token balances" ON public.token_balances;
CREATE POLICY "Users can insert token balances" ON public.token_balances FOR INSERT TO authenticated WITH CHECK (church_id = get_user_church_id(auth.uid()));
CREATE POLICY "Users can view token balances" ON public.token_balances FOR SELECT TO authenticated USING (church_id = get_user_church_id(auth.uid()));

-- token_transactions
DROP POLICY IF EXISTS "Users can insert token transactions" ON public.token_transactions;
DROP POLICY IF EXISTS "Users can view token transactions" ON public.token_transactions;
CREATE POLICY "Users can insert token transactions" ON public.token_transactions FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM initiatives i WHERE i.id = token_transactions.initiative_id AND i.church_id = get_user_church_id(auth.uid())));
CREATE POLICY "Users can view token transactions" ON public.token_transactions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM initiatives i WHERE i.id = token_transactions.initiative_id AND i.church_id = get_user_church_id(auth.uid())));
