
-- ===== Beacon Phase 1: Full Schema =====

-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('admin', 'creative_team', 'ministry_leader', 'mentor', 'community_member');

-- Churches table
CREATE TABLE public.churches (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.churches ENABLE ROW LEVEL SECURITY;

-- Campuses table
CREATE TABLE public.campuses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.campuses ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  church_id UUID REFERENCES public.churches(id) ON DELETE SET NULL,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Ministries table
CREATE TABLE public.ministries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#60A5FA',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.ministries ENABLE ROW LEVEL SECURITY;

-- Initiatives table
CREATE TABLE public.initiatives (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  campus_id UUID REFERENCES public.campuses(id) ON DELETE SET NULL,
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  goal TEXT DEFAULT '',
  target_outcome TEXT,
  audience TEXT,
  channels_requested TEXT[] DEFAULT '{}',
  initiative_type TEXT NOT NULL DEFAULT 'campaign' CHECK (initiative_type IN ('campaign', 'series', 'event')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'Intake' CHECK (status IN ('Draft', 'Intake', 'Needs Info', 'Reviewed', 'Approved', 'Creative Ready', 'In Production', 'Scheduled', 'Complete')),
  initiative_brief TEXT,
  missing_info_checklist JSONB,
  recommended_strategy JSONB,
  suggested_timeline JSONB,
  token_cost_estimate INTEGER,
  token_cost_final INTEGER,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.initiatives ENABLE ROW LEVEL SECURITY;

-- Work items table
CREATE TABLE public.work_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_id UUID NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'todo',
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  external_tool TEXT,
  external_task_id TEXT,
  external_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.work_items ENABLE ROW LEVEL SECURITY;

-- Initiative notes
CREATE TABLE public.initiative_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_id UUID NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.initiative_notes ENABLE ROW LEVEL SECURITY;

-- Initiative activity log
CREATE TABLE public.initiative_activity (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_id UUID NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.initiative_activity ENABLE ROW LEVEL SECURITY;

-- Token balances
CREATE TABLE public.token_balances (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  church_id UUID NOT NULL REFERENCES public.churches(id) ON DELETE CASCADE,
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  month DATE NOT NULL,
  allocated INTEGER NOT NULL DEFAULT 100,
  spent INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.token_balances ENABLE ROW LEVEL SECURITY;

-- Token transactions
CREATE TABLE public.token_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  initiative_id UUID NOT NULL REFERENCES public.initiatives(id) ON DELETE CASCADE,
  ministry_id UUID NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.token_transactions ENABLE ROW LEVEL SECURITY;

-- ===== Security definer function for role checks =====
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Helper: get user's church_id
CREATE OR REPLACE FUNCTION public.get_user_church_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT church_id FROM public.profiles WHERE id = _user_id
$$;

-- ===== RLS Policies =====

-- Churches: users see their own church
CREATE POLICY "Users can view own church" ON public.churches
  FOR SELECT TO authenticated
  USING (id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Users can insert churches" ON public.churches
  FOR INSERT TO authenticated
  WITH CHECK (true);

-- Campuses: scoped to church
CREATE POLICY "Users can view church campuses" ON public.campuses
  FOR SELECT TO authenticated
  USING (church_id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Users can insert church campuses" ON public.campuses
  FOR INSERT TO authenticated
  WITH CHECK (church_id = public.get_user_church_id(auth.uid()));

-- Profiles
CREATE POLICY "Users can view profiles in church" ON public.profiles
  FOR SELECT TO authenticated
  USING (church_id = public.get_user_church_id(auth.uid()) OR id = auth.uid());

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Ministries
CREATE POLICY "Users can view church ministries" ON public.ministries
  FOR SELECT TO authenticated
  USING (church_id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Users can insert church ministries" ON public.ministries
  FOR INSERT TO authenticated
  WITH CHECK (church_id = public.get_user_church_id(auth.uid()));

-- Initiatives
CREATE POLICY "Users can view church initiatives" ON public.initiatives
  FOR SELECT TO authenticated
  USING (church_id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Users can insert church initiatives" ON public.initiatives
  FOR INSERT TO authenticated
  WITH CHECK (church_id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Users can update church initiatives" ON public.initiatives
  FOR UPDATE TO authenticated
  USING (church_id = public.get_user_church_id(auth.uid()));

-- Work items (via initiative's church)
CREATE POLICY "Users can view work items" ON public.work_items
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.initiatives i WHERE i.id = initiative_id AND i.church_id = public.get_user_church_id(auth.uid())));

CREATE POLICY "Users can insert work items" ON public.work_items
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.initiatives i WHERE i.id = initiative_id AND i.church_id = public.get_user_church_id(auth.uid())));

-- Initiative notes
CREATE POLICY "Users can view initiative notes" ON public.initiative_notes
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.initiatives i WHERE i.id = initiative_id AND i.church_id = public.get_user_church_id(auth.uid())));

CREATE POLICY "Users can insert initiative notes" ON public.initiative_notes
  FOR INSERT TO authenticated
  WITH CHECK (author_id = auth.uid() AND EXISTS (SELECT 1 FROM public.initiatives i WHERE i.id = initiative_id AND i.church_id = public.get_user_church_id(auth.uid())));

CREATE POLICY "Users can update own notes" ON public.initiative_notes
  FOR UPDATE TO authenticated
  USING (author_id = auth.uid());

CREATE POLICY "Users can delete own notes" ON public.initiative_notes
  FOR DELETE TO authenticated
  USING (author_id = auth.uid());

-- Initiative activity
CREATE POLICY "Users can view initiative activity" ON public.initiative_activity
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.initiatives i WHERE i.id = initiative_id AND i.church_id = public.get_user_church_id(auth.uid())));

CREATE POLICY "Users can insert initiative activity" ON public.initiative_activity
  FOR INSERT TO authenticated
  WITH CHECK (actor_id = auth.uid() AND EXISTS (SELECT 1 FROM public.initiatives i WHERE i.id = initiative_id AND i.church_id = public.get_user_church_id(auth.uid())));

-- Token balances
CREATE POLICY "Users can view token balances" ON public.token_balances
  FOR SELECT TO authenticated
  USING (church_id = public.get_user_church_id(auth.uid()));

CREATE POLICY "Users can insert token balances" ON public.token_balances
  FOR INSERT TO authenticated
  WITH CHECK (church_id = public.get_user_church_id(auth.uid()));

-- Token transactions
CREATE POLICY "Users can view token transactions" ON public.token_transactions
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.initiatives i WHERE i.id = initiative_id AND i.church_id = public.get_user_church_id(auth.uid())));

CREATE POLICY "Users can insert token transactions" ON public.token_transactions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.initiatives i WHERE i.id = initiative_id AND i.church_id = public.get_user_church_id(auth.uid())));

-- ===== Trigger for updated_at =====
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_initiatives_updated_at
  BEFORE UPDATE ON public.initiatives
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ===== Auto-create profile on signup =====
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
