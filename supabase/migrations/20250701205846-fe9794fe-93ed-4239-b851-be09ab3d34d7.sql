-- First remove duplicate feedback entries (keep the first one created)
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

-- Now add the unique constraint
ALTER TABLE feedback ADD CONSTRAINT feedback_unique_per_listing 
  UNIQUE (from_user_id, to_user_id, listing_id);

-- Enable RLS on feedback table
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Policy: Allow public read access for feedback (so users can see seller ratings)
CREATE POLICY "Public can view all feedback" 
ON feedback FOR SELECT 
USING (true);

-- Policy: Users can create feedback (only once per listing pair)
CREATE POLICY "Users can create feedback" 
ON feedback FOR INSERT 
WITH CHECK (auth.uid() = from_user_id);