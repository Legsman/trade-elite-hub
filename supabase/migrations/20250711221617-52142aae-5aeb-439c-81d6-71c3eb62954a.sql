-- Add foreign key relationship between verification_requests and profiles
ALTER TABLE public.verification_requests 
ADD CONSTRAINT fk_verification_requests_user
FOREIGN KEY (user_id) 
REFERENCES public.profiles(id) 
ON DELETE CASCADE;