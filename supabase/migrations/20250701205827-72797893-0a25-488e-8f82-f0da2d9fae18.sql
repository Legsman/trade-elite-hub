-- Add RLS policies and unique constraint to feedback table

-- Enable RLS on feedback table
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Add unique constraint to prevent duplicate feedback from same user for same listing
ALTER TABLE feedback ADD CONSTRAINT feedback_unique_per_listing 
  UNIQUE (from_user_id, to_user_id, listing_id);

-- Policy: Users can view feedback they gave or received
CREATE POLICY "Users can view feedback they gave or received" 
ON feedback FOR SELECT 
USING (auth.uid() = from_user_id OR auth.uid() = to_user_id);

-- Policy: Users can create feedback (only if they haven't already for this listing)
CREATE POLICY "Users can create feedback" 
ON feedback FOR INSERT 
WITH CHECK (
  auth.uid() = from_user_id 
  AND NOT EXISTS (
    SELECT 1 FROM feedback 
    WHERE from_user_id = auth.uid() 
    AND to_user_id = NEW.to_user_id 
    AND listing_id = NEW.listing_id
  )
);

-- Policy: Allow public read access for feedback (so users can see seller ratings)
CREATE POLICY "Public can view all feedback" 
ON feedback FOR SELECT 
USING (true);

-- Remove duplicate feedback entries (keep the first one created)
DELETE FROM feedback 
WHERE id IN (
  SELECT id 
  FROM (
    SELECT id, 
           ROW_NUMBER() OVER (
             PARTITION BY from_user_id, to_user_id, listing_id 
             ORDER BY created_at ASC
           ) as rn
    FROM feedback
  ) t 
  WHERE t.rn > 1
);