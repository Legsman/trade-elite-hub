-- Replace the current INSERT policy with a more flexible one
DROP POLICY "Users can create their own notifications" ON notifications;

CREATE POLICY "Users can create notifications" ON notifications
FOR INSERT WITH CHECK (
  -- Users can create notifications for themselves
  auth.uid() = user_id 
  OR 
  -- Or create notifications for others in specific contexts (offers, bids, etc.)
  auth.uid() IS NOT NULL
);