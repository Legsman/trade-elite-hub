-- Create storage bucket for verification documents
INSERT INTO storage.buckets (id, name, public) VALUES ('verification-documents', 'verification-documents', false);

-- Create policies for verification documents storage
CREATE POLICY "Users can upload their own verification documents" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'verification-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can view their own verification documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'verification-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Admins can view all verification documents" ON storage.objects
FOR SELECT USING (
  bucket_id = 'verification-documents' AND 
  is_admin(auth.uid())
);

CREATE POLICY "Users can update their own verification documents" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'verification-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can delete their own verification documents" ON storage.objects
FOR DELETE USING (
  bucket_id = 'verification-documents' AND 
  auth.uid()::text = (storage.foldername(name))[1]
);

-- Add new columns to verification_requests table for document uploads
ALTER TABLE public.verification_requests ADD COLUMN IF NOT EXISTS id_document_url TEXT;
ALTER TABLE public.verification_requests ADD COLUMN IF NOT EXISTS address_proof_url TEXT;
ALTER TABLE public.verification_requests ADD COLUMN IF NOT EXISTS insurance_document_url TEXT;
ALTER TABLE public.verification_requests ADD COLUMN IF NOT EXISTS document_verification_status TEXT DEFAULT 'pending';
ALTER TABLE public.verification_requests ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending';
ALTER TABLE public.verification_requests ADD COLUMN IF NOT EXISTS payment_reference TEXT;