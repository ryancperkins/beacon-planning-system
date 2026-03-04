

# Fix: RLS Policy on "churches" Table

## Problem
The "churches" table INSERT policy is **RESTRICTIVE** (not permissive). In Postgres RLS, you need at least one **PERMISSIVE** policy to grant access — restrictive policies can only narrow existing access. Since all policies on the churches table are restrictive, no inserts are allowed at all.

This same issue affects **all tables** — every RLS policy in the schema was created as restrictive.

## Fix
Run a migration that drops all existing restrictive policies and recreates them as **permissive** (the default `CREATE POLICY` behavior). This applies to all 11 tables: `churches`, `campuses`, `profiles`, `user_roles`, `ministries`, `initiatives`, `work_items`, `initiative_notes`, `initiative_activity`, `token_balances`, `token_transactions`.

No code changes needed — only a database migration to fix the policy type.

