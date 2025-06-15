
-- 1. Add the username column initially nullable (to allow batch update)
ALTER TABLE profiles ADD COLUMN username TEXT;

-- 2. Populate usernames for specific real users
UPDATE profiles SET username = 'S1QUATTRO' WHERE full_name ILIKE 'Sham Patel';
UPDATE profiles SET username = 'HeavyPackage' WHERE full_name ILIKE 'Ash Pancholi';

-- 3. Populate usernames for all Mock Users (e.g., 'Mock User1' -> 'Mockuser1'), skipping anyone already assigned
UPDATE profiles
SET username = REPLACE(full_name, ' ', '')
WHERE full_name ILIKE 'Mock User%' AND username IS NULL;

-- 4. For any users with no username, but with a full_name, make a username candidate (removing spaces/punct)
UPDATE profiles
SET username = REGEXP_REPLACE(full_name, '[^A-Za-z0-9]', '', 'g')
WHERE username IS NULL AND full_name IS NOT NULL;

-- 5. Enforce usernames should be lowercase (optional; comment/uncomment if you want case-insensitive usernames)
-- UPDATE profiles SET username = LOWER(username) WHERE username IS NOT NULL;

-- 6. Make the username column UNIQUE and NOT NULL
ALTER TABLE profiles ALTER COLUMN username SET NOT NULL;

-- Create a unique index for usernames
CREATE UNIQUE INDEX profiles_username_key ON profiles (username);

