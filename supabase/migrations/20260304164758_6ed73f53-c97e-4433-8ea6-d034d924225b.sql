
-- Add new enum values
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ministry_director';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ministry_user';

-- Add visible_to_all_staff column to initiatives
ALTER TABLE public.initiatives ADD COLUMN IF NOT EXISTS visible_to_all_staff boolean NOT NULL DEFAULT false;

-- Create ministry_members table
CREATE TABLE public.ministry_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ministry_id uuid NOT NULL REFERENCES public.ministries(id) ON DELETE CASCADE,
  church_id uuid NOT NULL REFERENCES public.churches(id),
  role text NOT NULL DEFAULT 'member',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, ministry_id)
);
ALTER TABLE public.ministry_members ENABLE ROW LEVEL SECURITY;

-- Create resources table
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  church_id uuid NOT NULL REFERENCES public.churches(id),
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'document',
  file_url text,
  thumbnail_url text,
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Security definer functions
CREATE OR REPLACE FUNCTION public.get_user_ministry_ids(_user_id uuid)
RETURNS uuid[]
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(array_agg(ministry_id), '{}')
  FROM public.ministry_members
  WHERE user_id = _user_id
$$;

CREATE OR REPLACE FUNCTION public.is_ministry_director(_user_id uuid, _ministry_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.ministry_members
    WHERE user_id = _user_id AND ministry_id = _ministry_id AND role = 'director'
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_app_role(_user_id uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role::text FROM public.user_roles WHERE user_id = _user_id LIMIT 1
$$;

-- RLS for ministry_members
CREATE POLICY "Users can view church ministry members"
ON public.ministry_members FOR SELECT TO authenticated
USING (church_id = get_user_church_id(auth.uid()));

CREATE POLICY "Admins can insert ministry members"
ON public.ministry_members FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update ministry members"
ON public.ministry_members FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ministry members"
ON public.ministry_members FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- RLS for resources
CREATE POLICY "Users can view church resources"
ON public.resources FOR SELECT TO authenticated
USING (church_id = get_user_church_id(auth.uid()));

CREATE POLICY "Users can insert church resources"
ON public.resources FOR INSERT TO authenticated
WITH CHECK (church_id = get_user_church_id(auth.uid()));

CREATE POLICY "Users can update own resources"
ON public.resources FOR UPDATE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can delete own resources"
ON public.resources FOR DELETE TO authenticated
USING (created_by = auth.uid() OR has_role(auth.uid(), 'admin'));

-- Update user_roles RLS: allow admins to see all roles in their church
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view roles in church"
ON public.user_roles FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR has_role(auth.uid(), 'admin')
);

-- Allow admins to insert/delete roles for others
DROP POLICY IF EXISTS "Users can insert own roles" ON public.user_roles;
CREATE POLICY "Users can insert roles"
ON public.user_roles FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid() OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete roles"
ON public.user_roles FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update roles"
ON public.user_roles FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Add missing policies for ministries
CREATE POLICY "Admins can update ministries"
ON public.ministries FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin') AND church_id = get_user_church_id(auth.uid()));

CREATE POLICY "Admins can delete ministries"
ON public.ministries FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin') AND church_id = get_user_church_id(auth.uid()));

-- Add missing policies for token_balances
CREATE POLICY "Admins can update token balances"
ON public.token_balances FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin') AND church_id = get_user_church_id(auth.uid()));

-- Add missing policy for churches
CREATE POLICY "Admins can update church"
ON public.churches FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin') AND id = get_user_church_id(auth.uid()));
