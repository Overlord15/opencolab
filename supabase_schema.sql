-- 📡 SUPABASE SQL DATABASE SCHEMA

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  uid TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  orgCode TEXT,
  avatar TEXT,
  bio TEXT,
  phone TEXT,
  jobTitle TEXT,
  isPremium BOOLEAN DEFAULT FALSE,
  paymentStatus TEXT DEFAULT 'free',
  createdAt TEXT,
  updatedAt TEXT
);

-- 2. Create Organizations Table
CREATE TABLE IF NOT EXISTS public.organizations (
  id TEXT PRIMARY KEY,
  orgCode TEXT UNIQUE,
  name TEXT NOT NULL,
  ownerId TEXT,
  members TEXT[] DEFAULT '{}',
  createdAt TEXT
);

-- 3. Create Tasks Table
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending',
  priority TEXT DEFAULT 'medium',
  category TEXT DEFAULT 'development',
  assigneeId TEXT,
  assigneeName TEXT,
  assigneeAvatar TEXT,
  createdBy TEXT,
  dueDate TEXT,
  orgId TEXT NOT NULL,
  createdAt TEXT,
  updatedAt TEXT
);

-- 4. Create Calendar Events Table
CREATE TABLE IF NOT EXISTS public.calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  date TEXT,
  time TEXT,
  endTime TEXT,
  type TEXT DEFAULT 'meeting',
  priority TEXT DEFAULT 'medium',
  createdBy TEXT,
  attendees TEXT[] DEFAULT '{}',
  orgId TEXT NOT NULL,
  createdAt TEXT,
  updatedAt TEXT
);

-- 5. Create Messages Table
CREATE TABLE IF NOT EXISTS public.messages (
  id TEXT PRIMARY KEY,
  participants TEXT[] NOT NULL,
  orgId TEXT NOT NULL,
  messages JSONB DEFAULT '[]'::jsonb,
  createdAt TEXT,
  updatedAt TEXT
);

-- 6. Create Whiteboards Table
CREATE TABLE IF NOT EXISTS public.whiteboards (
  id TEXT PRIMARY KEY,
  strokes JSONB DEFAULT '[]'::jsonb
);

-- 7. Enable Realtime
-- Run this after tables are created

ALTER PUBLICATION supabase_realtime ADD TABLE public.users;
ALTER PUBLICATION supabase_realtime ADD TABLE public.organizations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.calendar_events;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.whiteboards;

-- 8. Disable RLS (Development Only)

ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_events DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.whiteboards DISABLE ROW LEVEL SECURITY;

-- 9. Grant Permissions

GRANT ALL ON TABLE public.users TO anon, authenticated;
GRANT ALL ON TABLE public.organizations TO anon, authenticated;
GRANT ALL ON TABLE public.tasks TO anon, authenticated;
GRANT ALL ON TABLE public.calendar_events TO anon, authenticated;
GRANT ALL ON TABLE public.messages TO anon, authenticated;
GRANT ALL ON TABLE public.whiteboards TO anon, authenticated;
