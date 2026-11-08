/*
# Create transmissions table (public inquiry inbox)

1. New Tables
- `transmissions`
  - `id` (uuid, primary key)
  - `scope` (text, one of the studio's service scopes)
  - `name` (text, sender name, 1-80 chars)
  - `email` (text, sender email, 3-120 chars)
  - `message` (text, inquiry body, 10-2000 chars)
  - `created_at` (timestamptz)

2. Security
- Enable RLS on `transmissions`.
- Grant INSERT only to `anon` and `authenticated`. Visitors can send inquiries but cannot read anyone else's.
- Single INSERT policy with length and scope checks enforced in the database.
*/

CREATE TABLE IF NOT EXISTS transmissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL CHECK (scope IN ('software', 'uiux', 'identity', 'other')),
  name text NOT NULL CHECK (char_length(name) BETWEEN 1 AND 80),
  email text NOT NULL CHECK (char_length(email) BETWEEN 3 AND 120),
  message text NOT NULL CHECK (char_length(message) BETWEEN 10 AND 2000),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE transmissions ENABLE ROW LEVEL SECURITY;

GRANT INSERT ON transmissions TO anon, authenticated;

DROP POLICY IF EXISTS "anon_insert_transmissions" ON transmissions;
CREATE POLICY "anon_insert_transmissions" ON transmissions FOR INSERT
TO anon, authenticated
WITH CHECK (true);
