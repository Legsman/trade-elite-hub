import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/auth';
import { useVerificationRequests } from '@/hooks/auth/useVerificationRequests';
import { useToast } from '@/hooks/use-toast';
import EnhancedVerificationForm from '@/components/auth/EnhancedVerificationForm';

interface EnhancedVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestType?: 'verified' | 'trader';
}

const EnhancedVerificationModal: React.FC<EnhancedVerificationModalProps> = ({
  isOpen,
  onClose,
  requestType = 'verified'
}) => {
  const { user } = useAuth();
  const { createVerificationRequest, loading } = useVerificationRequests();
  const { toast } = useToast();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (formData: any) => {
    if (!user) return;

    setSubmitting(true);
    try {
      const success = await createVerificationRequest({
        user_id: user.id,
        request_type: formData.request_type,
        message: formData.message,
        business_name: formData.business_name,
        business_registration: formData.business_registration,
        trading_experience: formData.trading_experience,
        id_document_url: formData.id_document_url,
        address_proof_url: formData.address_proof_url,
        insurance_document_url: formData.insurance_document_url,
        document_verification_status: formData.document_verification_status,
        payment_status: formData.payment_status,
        status: 'pending',
      });

      if (success) {
        toast({
          title: "Application Submitted",
          description: `Your ${formData.request_type} verification request has been submitted successfully. You will receive payment instructions once your documents are reviewed.`,
        });
        onClose();
      }
    } catch (error) {
      console.error('Error submitting verification request:', error);
      toast({
        title: "Submission Failed",
        description: "Failed to submit your verification request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {requestType === 'verified' ? 'Apply for Verification' : 'Apply for Trader Status'}
          </DialogTitle>
          <DialogDescription>
            Complete the form below to submit your {requestType} application. 
            All required documents must be uploaded for processing.
          </DialogDescription>
        </DialogHeader>
        
        <EnhancedVerificationForm 
          onSubmit={handleSubmit}
          loading={submitting || loading}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EnhancedVerificationModal;