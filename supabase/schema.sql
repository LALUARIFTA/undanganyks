-- ==========================================
-- SUPABASE SCHEMA FOR LUMINA INVITES
-- ==========================================

-- 1. TABLE: invitations
-- Stores all wedding invitation data created by users
CREATE TABLE IF NOT EXISTS invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  groom TEXT NOT NULL,
  bride TEXT NOT NULL,
  date TEXT,
  template TEXT DEFAULT 'midnight',
  url TEXT, -- Full URL of the generated invitation
  formData JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES FOR invitations TABLE
DROP POLICY IF EXISTS "Users can manage their own invitations" ON invitations;
DROP POLICY IF EXISTS "Allow Public Access" ON invitations;

CREATE POLICY "Users can manage their own invitations" 
ON invitations FOR ALL 
TO authenticated 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- 4. TABLE: profiles (Optional but recommended)
-- Stores additional user information
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

-- 5. TRIGGER: Create profile on signup
-- Automatically creates a profile entry when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. STORAGE POLICIES (SQL Version)
-- Note: Replace 'invitations' with your actual bucket name if different

DROP POLICY IF EXISTS "Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Public Upload" ON storage.objects;
DROP POLICY IF EXISTS "Public Update" ON storage.objects;
DROP POLICY IF EXISTS "Public Delete" ON storage.objects;

-- Allow Public Access to Read Files
CREATE POLICY "Public Access" ON storage.objects FOR SELECT TO public USING (bucket_id = 'invitations');

-- Allow Anyone to Upload (since dashboard allows local/bypassed login)
CREATE POLICY "Public Upload" ON storage.objects FOR INSERT TO public WITH CHECK (bucket_id = 'invitations');

-- Allow Anyone to Update
CREATE POLICY "Public Update" ON storage.objects FOR UPDATE TO public USING (bucket_id = 'invitations');

-- Allow Anyone to Delete
CREATE POLICY "Public Delete" ON storage.objects FOR DELETE TO public USING (bucket_id = 'invitations');

-- 7. HELPER FOR RSVP
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
DROP POLICY IF EXISTS "Anyone can delete RSVPs" ON rsvp;

CREATE POLICY "Anyone can insert RSVP" ON rsvp FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "Anyone can view RSVPs" ON rsvp FOR SELECT TO public USING (true);
CREATE POLICY "Anyone can delete RSVPs" ON rsvp FOR DELETE TO public USING (true);
