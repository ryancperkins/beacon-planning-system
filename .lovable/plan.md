
# Beacon — Phase 1: Foundation

## Overview
Build the design system, authentication, database schema, and seed data. This gives you a working app shell with login, church creation, and seeded demo data — ready for wiring pages in Phase 2.

## What we'll build

### 1. Theme System & Design Foundation (Mobile-First)
- Port all ~80 CSS custom property tokens from the JSX file into `index.css` (light + dark variants)
- Import Outfit + Satoshi fonts
- Create a `ThemeProvider` context with 3-way toggle (light/dark/system) persisted to localStorage
- Build reusable `GlassPanel` component using theme tokens
- Build status chips, ambient background glow, and typography utilities
- Reconstruct the app shell layout **mobile-first**: collapsible sidebar (off-canvas on mobile), responsive top bar, ⌘K command palette
- All pages use `var(--token)` exclusively — no hardcoded colors

### 2. Supabase Setup (Lovable Cloud)
- Enable Lovable Cloud for auth + database
- Configure email/password authentication

### 3. Database Schema
Create all tables with RLS:
- **churches** — workspace container
- **campuses** — multi-campus support
- **profiles** — user data linked to auth.users and churches, with role (stored properly)
- **user_roles** — separate roles table for security (admin, creative_team, ministry_leader, mentor, community_member)
- **ministries** — departments with color codes
- **initiatives** — the core entity with all fields (goal, strategy stubs, token estimates, etc.)
- **work_items** — tasks linked to initiatives
- **initiative_notes** — threaded notes
- **initiative_activity** — audit log
- **token_balances** — monthly ministry budgets
- **token_transactions** — spending records

RLS policies scope all data to the user's `church_id`.

### 4. Authentication Pages
- **Sign In / Sign Up** page using GlassPanel, ambient glow, accent gradient button — theme-aware
- **Onboarding**: after first sign-up, "Create Your Church" step (church name + first campus name)
- Auto-create profile + church + campus records on completion
- Protected route wrapper redirecting unauthenticated users to sign-in
- Church name displayed in top bar after login

### 5. Seed Data
Insert demo data for the authenticated user's church:
- 1 church, 2 campuses (Main Campus, West Campus)
- 4 ministries with colors
- 10 initiatives across various statuses/types/dates
- Token balances (100/month per ministry)
- Activity entries and notes on the first initiative

### 6. Placeholder Pages
- Set up routing for Timeline, Inbox, Initiatives, Initiative Detail, Library, Community, Mentorship, Integrations, Admin
- Each shows the page title in a GlassPanel — ready for Phase 2 wiring

## What's NOT in this phase
- Wiring real data to Timeline, Inbox, Initiative Workspace, Create flow (Phase 2)
- AI integration
- External integrations
- Role-based permissions beyond church_id scoping
