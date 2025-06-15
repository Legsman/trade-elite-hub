
-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Policy: Only allow users to select their own notifications
CREATE POLICY "Users can view their notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Only allow users to insert notifications for themselves
CREATE POLICY "Users can create their own notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Only allow users to update their own notifications (e.g., mark as read)
CREATE POLICY "Users can update their notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Only allow users to delete their own notifications
CREATE POLICY "Users can delete their notifications"
  ON public.notifications
  FOR DELETE
  USING (auth.uid() = user_id);
