import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FileText, Building, Shield, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/auth';

interface DocumentUploadProps {
  label: string;
  description: string;
  file: File | null;
  onFileSelect: (file: File | null) => void;
  required?: boolean;
  accept?: string;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  label,
  description,
  file,
  onFileSelect,
  required = false,
  accept = '.pdf,.jpg,.jpeg,.png'
}) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    onFileSelect(selectedFile);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={label.toLowerCase().replace(/\s+/g, '-')}>
        {label} {required && <span className="text-destructive">*</span>}
      </Label>
      <p className="text-sm text-muted-foreground">{description}</p>
      <div className="flex items-center space-x-4">
        <Input
          id={label.toLowerCase().replace(/\s+/g, '-')}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          className="flex-1"
        />
        {file && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <FileText className="h-4 w-4" />
            <span>{file.name}</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface EnhancedVerificationFormProps {
  onSubmit: (data: any) => void;
  loading: boolean;
}

const EnhancedVerificationForm: React.FC<EnhancedVerificationFormProps> = ({
  onSubmit,
  loading
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requestType, setRequestType] = useState<'verified' | 'trader'>('verified');
  const [message, setMessage] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [businessRegistration, setBusinessRegistration] = useState('');
  const [tradingExperience, setTradingExperience] = useState('');
  
  // Document files
  const [idDocument, setIdDocument] = useState<File | null>(null);
  const [addressProof, setAddressProof] = useState<File | null>(null);
  const [insuranceDocument, setInsuranceDocument] = useState<File | null>(null);

  const uploadDocument = async (file: File, documentType: string): Promise<string | null> => {
    if (!user || !file) return null;

    try {
      const fileName = `${user.id}/${documentType}/${Date.now()}-${file.name}`;
      const { data, error } = await supabase.storage
        .from('verification-documents')
        .upload(fileName, file);

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('verification-documents')
        .getPublicUrl(fileName);

      return urlData.publicUrl;
    } catch (error) {
      console.error(`Error uploading ${documentType}:`, error);
      toast({
        title: "Upload Error",
        description: `Failed to upload ${documentType}. Please try again.`,
        variant: "destructive",
      });
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!idDocument || !addressProof) {
      toast({
        title: "Missing Documents",
        description: "Please upload your ID and proof of address.",
        variant: "destructive",
      });
      return;
    }

    if (requestType === 'trader' && (!businessName || !businessRegistration || !insuranceDocument)) {
      toast({
        title: "Missing Trader Requirements",
        description: "Please fill in all trader requirements including insurance document.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Upload documents
      const idDocumentUrl = await uploadDocument(idDocument, 'id');
      const addressProofUrl = await uploadDocument(addressProof, 'address');
      const insuranceDocumentUrl = requestType === 'trader' && insuranceDocument 
        ? await uploadDocument(insuranceDocument, 'insurance') 
        : null;

      if (!idDocumentUrl || !addressProofUrl) {
        throw new Error('Failed to upload required documents');
      }

      if (requestType === 'trader' && !insuranceDocumentUrl) {
        throw new Error('Failed to upload insurance document');
      }

      // Submit verification request
      const requestData = {
        request_type: requestType,
        message,
        business_name: requestType === 'trader' ? businessName : null,
        business_registration: requestType === 'trader' ? businessRegistration : null,
        trading_experience: requestType === 'trader' ? tradingExperience : null,
        id_document_url: idDocumentUrl,
        address_proof_url: addressProofUrl,
        insurance_document_url: insuranceDocumentUrl,
        document_verification_status: 'pending',
        payment_status: 'pending',
      };

      onSubmit(requestData);
    } catch (error) {
      console.error('Error submitting verification request:', error);
      toast({
        title: "Submission Error",
        description: "Failed to submit verification request. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Request Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Verification Type
          </CardTitle>
          <CardDescription>
            Choose the type of verification you'd like to apply for
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={requestType} onValueChange={(value: 'verified' | 'trader') => setRequestType(value)}>
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="verified" id="verified" />
                <div className="flex-1">
                  <Label htmlFor="verified" className="font-medium">Verified Status</Label>
                  <p className="text-sm text-muted-foreground">
                    £35/year • 3 listings/month • £12,500/year limit • £3.50/listing
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 p-4 border rounded-lg">
                <RadioGroupItem value="trader" id="trader" />
                <div className="flex-1">
                  <Label htmlFor="trader" className="font-medium">Trader Status</Label>
                  <p className="text-sm text-muted-foreground">
                    £108/year • Unlimited listings • No limits • £1.50/listing
                  </p>
                </div>
              </div>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Required Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Required Documents
          </CardTitle>
          <CardDescription>
            Upload the following documents for verification
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <DocumentUpload
            label="Photo ID"
            description="Valid passport, driving license, or national ID card"
            file={idDocument}
            onFileSelect={setIdDocument}
            required
          />
          
          <DocumentUpload
            label="Proof of Address"
            description="Utility bill, bank statement, or council tax bill (within last 3 months)"
            file={addressProof}
            onFileSelect={setAddressProof}
            required
          />

          {requestType === 'trader' && (
            <DocumentUpload
              label="Insurance Document"
              description="Valid traders insurance policy in the company name"
              file={insuranceDocument}
              onFileSelect={setInsuranceDocument}
              required
            />
          )}
        </CardContent>
      </Card>

      {/* Business Details (Trader Only) */}
      {requestType === 'trader' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Business Information
            </CardTitle>
            <CardDescription>
              Provide details about your business
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="business-name">
                Company Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="business-name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Enter your registered company name"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="business-registration">
                Company Registration Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="business-registration"
                value={businessRegistration}
                onChange={(e) => setBusinessRegistration(e.target.value)}
                placeholder="Enter your company registration number"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="trading-experience">Trading Experience</Label>
              <Textarea
                id="trading-experience"
                value={tradingExperience}
                onChange={(e) => setTradingExperience(e.target.value)}
                placeholder="Describe your trading experience and business background"
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Message */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
          <CardDescription>
            Provide any additional information to support your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Any additional information you'd like to provide..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Fee Information */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Payment Required:</strong> A payment of £{requestType === 'verified' ? '35' : '108'} 
          will be required to complete your {requestType} verification. 
          You will receive payment instructions after your documents are reviewed.
        </AlertDescription>
      </Alert>

      <Button type="submit" className="w-full" disabled={loading}>
        <Upload className="mr-2 h-4 w-4" />
        {loading ? 'Submitting...' : 'Submit Verification Request'}
      </Button>
    </form>
  );
};

export default EnhancedVerificationForm;