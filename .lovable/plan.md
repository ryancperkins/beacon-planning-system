

# Phase 4: Role-Based Access, Admin, Library, Profile & Polish

This is a large phase with 7 implementation steps. Here's the full plan.

---

## Step 1: Database Migration

### New enum values
The current `app_role` enum has: `admin`, `creative_team`, `ministry_leader`, `mentor`, `community_member`. We need to add `ministry_director` and `ministry_user`. We'll keep `ministry_leader` as-is and add the two new values. During onboarding, the creator gets `admin`. We'll treat `ministry_leader` as equivalent to `ministry_director` going forward, or migrate it.

Actually, to keep things clean: we'll add `ministry_director` and `ministry_user` to the enum. The existing `ministry_leader` stays but won't be assigned going forward. The `community_member` also stays as a legacy value.

### New column: `initiatives.visible_to_all_staff`
- `boolean NOT NULL DEFAULT false`

### New table: `ministry_members`
```text
id            uuid PK default gen_random_uuid()
user_id       uuid NOT NULL (FK → auth.users ON DELETE CASCADE)
ministry_id   uuid NOT NULL (FK → ministries ON DELETE CASCADE)
church_id     uuid NOT NULL (FK → churches)
role          text NOT NULL DEFAULT 'member'  -- 'director' or 'member'
created_at    timestamptz DEFAULT now()
UNIQUE(user_id, ministry_id)
```

### New table: `resources`
```text
id            uuid PK default gen_random_uuid()
church_id     uuid NOT NULL (FK → churches)
title         text NOT NULL
description   text
category      text NOT NULL DEFAULT 'document'
file_url      text
thumbnail_url text
created_by    uuid NOT NULL
created_at    timestamptz DEFAULT now()
```

### New security definer functions
- `get_user_ministry_ids(_user_id uuid)` → returns `uuid[]` from `ministry_members`
- `is_ministry_director(_user_id uuid, _ministry_id uuid)` → checks `ministry_members` where `role = 'director'`
- `get_user_app_role(_user_id uuid)` → returns the user's `app_role` from `user_roles` (avoids recursive RLS)

### RLS Policies

**`ministry_members`**: SELECT for same-church users. INSERT/UPDATE/DELETE for admins only.

**`resources`**: SELECT/INSERT for same-church users. UPDATE/DELETE for own records or admins.

**`user_roles`** (update existing): 
- SELECT: Allow users to see all roles within their church (needed for admin team page). Use a security definer function to check church membership.
- INSERT/DELETE: Only admins (via `has_role`).

**`ministries`** (add missing policies): UPDATE and DELETE for admins.

**`token_balances`** (add missing): UPDATE for admins.

**`churches`** (add missing): UPDATE for admins.

**`initiatives`** — the visibility logic will be handled client-side for now since RLS changes for ministry-scoped access are complex and the current same-church policy is a safe baseline. The `usePermissions` hook will filter on the client. This avoids risky RLS changes that could break existing flows.

### Seed data update
Update `seedDemoData` to also create `ministry_members` entries linking the creating user as director of all seeded ministries.

---

## Step 2: AuthContext + usePermissions

### AuthContext changes
After fetching the profile, also fetch:
- User's role from `user_roles` → expose as `role: app_role | null`
- User's ministry memberships from `ministry_members` → expose as `userMinistries: { ministry_id: string; role: string }[]`
- Helper: `isDirectorOf(ministryId: string): boolean`

### New hook: `usePermissions`
Returns computed flags based on `role` and `userMinistries`:

```text
canApprove          → admin only
canTriage           → admin, creative_team
canCreate           → admin, creative_team, ministry_director
canManageTeam       → admin only
canManageBudget     → admin only
canAddToLibrary     → admin, creative_team
canEditInitiative(ministryId) → admin, creative_team, or director of that ministry
canSeeAllInitiatives → admin, creative_team, ministry_director, mentor
canToggleVisibility(ministryId) → admin, creative_team, or director of that ministry
```

---

## Step 3: UI Gating

### Sidebar (`AppSidebar.tsx`)
- Hide "Admin" nav item unless `canManageTeam`
- Hide "Create" in TopBar unless `canCreate`

### TopBar (`TopBar.tsx`)
- Hide Create button unless `canCreate`
- Replace profile avatar dropdown with new `ProfileDropdown` component
- Replace static bell with `NotificationBell` component

### Inbox (`InboxPage.tsx`)
- Hide quick-action buttons when `!canTriage`
- Show read-only rows for non-triage roles

### Initiative Detail (`InitiativeDetailPage.tsx`)
- Hide Approve button when `!canApprove`
- Hide status dropdown when `!canEditInitiative(initiative.ministry_id)`
- Show "Visible to all staff" toggle when `canToggleVisibility(initiative.ministry_id)`
- Disable Edit button for unauthorized roles

### Initiatives List & Timeline
- For `ministry_user` role: filter client-side to show only own-ministry initiatives + those with `visible_to_all_staff = true`
- Show a "Shared" badge on cross-ministry visible initiatives

### Create Initiative
- For `ministry_director`: limit ministry dropdown to only their ministries

---

## Step 4: Admin Page

New file: `src/pages/AdminPage.tsx`

Four tabs using the same tab pattern as Inbox:

**Overview tab**: 4 stat cards (total initiatives, active, total tokens spent, team members count). Aggregate queries.

**Team tab**: List profiles in same church. Show name, role badge. Admin can change roles via dropdown (updates `user_roles`). Can assign users to ministries via `ministry_members`. Invite button (placeholder toast).

**Ministries tab**: List ministries with color dot. Add form (name + color). Edit name inline. Delete with confirmation dialog. Show member count.

**Token Budget tab**: List `token_balances` for current month grouped by ministry. Progress bar per ministry (spent/allocated). Edit allocation (updates `token_balances`). Church total at top.

Route change in `App.tsx`: replace placeholder with `AdminPage`.

---

## Step 5: Resource Library

New file: `src/pages/LibraryPage.tsx`

- Category filter pills (All, Templates, Graphics, Documents, Guides)
- Search bar
- Card grid — each card: title, category badge, creator name, date
- "Add Resource" button (only for `canAddToLibrary`) opens dialog with title, description, category select
- Empty state when no resources

Route change in `App.tsx`: replace placeholder with `LibraryPage`.

---

## Step 6: Profile Dropdown + Notification Bell

### ProfileDropdown (`src/components/beacon/ProfileDropdown.tsx`)
Replaces the current inline profile menu in TopBar:
- Avatar button with initials
- Dropdown: name, role badge, church name
- Edit Profile option → dialog with name and avatar URL fields, saves to `profiles`
- Sign Out button
- Click-outside-to-close

### NotificationBell (`src/components/beacon/NotificationBell.tsx`)
Replaces static bell in TopBar:
- Query last 20 `initiative_activity` entries for the church
- Badge count: activities since last viewed (timestamp in localStorage)
- Dropdown list: action text, initiative title (join), timestamp
- Click entry → navigate to initiative detail
- Click-outside-to-close
- Clicking the bell updates the localStorage timestamp

---

## Step 7: Polish Pass

- **Loading skeletons**: Replace "Loading..." text on Timeline, Initiatives, Inbox, Initiative Detail with animated skeleton components (3-4 placeholder rows using the existing `Skeleton` component from shadcn)
- **Click-outside-to-close**: Add `useEffect` with `mousedown` listener on all dropdown menus (status filter, type filter, status menu on detail page, profile dropdown, notification dropdown)
- **Framer-motion page transitions**: Wrap page content in `motion.div` with `initial={{ opacity: 0, y: 6 }}` `animate={{ opacity: 1, y: 0 }}` using the existing `framer-motion` dependency
- **Escape key**: Close dialogs and dropdowns on Escape keypress

---

## Files Summary

### New files (6)
- `src/hooks/usePermissions.ts`
- `src/pages/AdminPage.tsx`
- `src/pages/LibraryPage.tsx`
- `src/components/beacon/ProfileDropdown.tsx`
- `src/components/beacon/NotificationBell.tsx`
- `src/components/beacon/LoadingSkeleton.tsx`

### Modified files (9)
- `src/contexts/AuthContext.tsx` — role + ministry membership fetching
- `src/components/beacon/AppSidebar.tsx` — gate nav items
- `src/components/beacon/TopBar.tsx` — ProfileDropdown, NotificationBell, gate Create
- `src/pages/InboxPage.tsx` — gate quick actions
- `src/pages/InitiativeDetailPage.tsx` — gate controls, visibility toggle
- `src/pages/InitiativesPage.tsx` — client-side visibility filtering
- `src/pages/TimelinePage.tsx` — client-side visibility filtering
- `src/pages/CreateInitiativePage.tsx` — scope ministry dropdown
- `src/App.tsx` — swap Admin and Library routes
- `src/lib/seedData.ts` — seed ministry_members

### Database migration
One migration with: enum additions, `visible_to_all_staff` column, `ministry_members` table, `resources` table, security definer functions, updated RLS policies.

