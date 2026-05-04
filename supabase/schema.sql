-- ==========================================
-- SUPABASE SCHEMA FOR LUMINA INVITES (v5.0)
-- ==========================================

-- 1. CLEANUP (Optional: Only run if you want to start fresh)
-- DROP TABLE IF EXISTS rsvp;
-- DROP TABLE IF EXISTS invitations;

-- 2. TABLE: invitations
-- Stores all wedding invitation data created by users
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  groom TEXT NOT NULL,
  bride TEXT NOT NULL,
  date TEXT,
  template TEXT DEFAULT 'midnight',
  url TEXT, 
  slug TEXT UNIQUE, -- Custom URL slug (e.g., 'budi-siti')
  formdata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. ENFORCE 1 INVITATION PER USER (Constraint)
-- This allows the 'upsert' feature to work correctly
DO $$ 
BEGIN 
  -- First, delete any duplicates just in case (keep newest)
  DELETE FROM invitations a
  USING invitations b
  WHERE a.created_at < b.created_at
    AND a.user_id = b.user_id;

  -- Add column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invitations' AND column_name = 'slug') THEN
    ALTER TABLE invitations ADD COLUMN slug TEXT;
  END IF;

  -- Then add the unique constraint if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invitations_user_id_key') THEN
    ALTER TABLE invitations ADD CONSTRAINT invitations_user_id_key UNIQUE (user_id);
  END IF;

  -- Add slug unique constraint if it doesn't exist (safety)
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invitations_slug_key') THEN
    ALTER TABLE invitations ADD CONSTRAINT invitations_slug_key UNIQUE (slug);
  END IF;
END $$;

-- 4. ENABLE ROW LEVEL SECURITY
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- 5. POLICIES FOR invitations TABLE
DROP POLICY IF EXISTS "Users can manage their own invitations" ON invitations;
CREATE POLICY "Users can manage their own invitations" 
ON invitations FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 6. TABLE: profiles
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
CREATE POLICY "Users can view their own profile" ON profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 7. TRIGGER: Create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Cleanup existing trigger before creating
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. TABLE: rsvp
CREATE TABLE IF NOT EXISTS rsvp (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  attendance TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE rsvp ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can insert RSVP" ON rsvp;
DROP POLICY IF EXISTS "Anyone can view RSVPs" ON rsvp;
CREATE POLICY "Anyone can insert RSVP" ON rsvp FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can view RSVPs" ON rsvp FOR SELECT TO public USING (true);


-- 9. TABLE: guests
CREATE TABLE IF NOT EXISTS guests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invitation_id UUID REFERENCES invitations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE guests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can manage guests" ON guests;
CREATE POLICY "Users can manage guests" 
ON guests FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM invitations 
    WHERE invitations.id = guests.invitation_id 
    AND invitations.user_id = auth.uid()
  )
);
