import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth/useAuth";
import { useToast } from "@/hooks/use-toast";

interface VerificationRequestFormProps {
  onSuccess?: () => void;
}

export function VerificationRequestForm({ onSuccess }: VerificationRequestFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requestType, setRequestType] = useState<"verified" | "trader">("verified");
  const [message, setMessage] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [businessRegistration, setBusinessRegistration] = useState("");
  const [tradingExperience, setTradingExperience] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("verification_requests")
        .insert({
          user_id: user.id,
          request_type: requestType,
          message,
          business_name: requestType === "trader" ? businessName : null,
          business_registration: requestType === "trader" ? businessRegistration : null,
          trading_experience: requestType === "trader" ? tradingExperience : null,
        });

      if (error) throw error;

      setSubmitted(true);
      toast({
        title: "Request Submitted",
        description: "Your verification request has been submitted and will be reviewed by our team.",
      });
      onSuccess?.();
    } catch (error) {
      console.error("Error submitting verification request:", error);
      toast({
        title: "Error",
        description: "Failed to submit verification request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-green-600">
            <CheckCircle className="h-5 w-5" />
            <div>
              <h3 className="font-semibold">Request Submitted Successfully</h3>
              <p className="text-sm text-muted-foreground">
                We'll review your request within 1-2 business days and notify you of the outcome.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Request</CardTitle>
        <CardDescription>
          Request verification to access enhanced features and build trust with other users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label className="text-base font-medium">Verification Type</Label>
            <RadioGroup
              value={requestType}
              onValueChange={(value) => setRequestType(value as "verified" | "trader")}
              className="grid grid-cols-1 gap-4"
            >
              <div className="flex items-center space-x-2 border rounded-lg p-4">
                <RadioGroupItem value="verified" id="verified" />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="verified"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Verified User
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Basic identity verification for trusted transactions
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 border rounded-lg p-4">
                <RadioGroupItem value="trader" id="trader" />
                <div className="grid gap-1.5 leading-none">
                  <Label
                    htmlFor="trader"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Trader Status
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Business verification with enhanced features and higher limits
                  </p>
                </div>
              </div>
            </RadioGroup>
          </div>

          {requestType === "trader" && (
            <div className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Trader status requires business documentation and trading experience verification.
                </AlertDescription>
              </Alert>

              <div className="grid gap-4">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Enter your business name"
                    required={requestType === "trader"}
                  />
                </div>

                <div>
                  <Label htmlFor="businessRegistration">
                    Business Registration Number
                  </Label>
                  <Input
                    id="businessRegistration"
                    value={businessRegistration}
                    onChange={(e) => setBusinessRegistration(e.target.value)}
                    placeholder="Enter registration number"
                    required={requestType === "trader"}
                  />
                </div>

                <div>
                  <Label htmlFor="tradingExperience">Trading Experience</Label>
                  <Textarea
                    id="tradingExperience"
                    value={tradingExperience}
                    onChange={(e) => setTradingExperience(e.target.value)}
                    placeholder="Describe your trading experience and business activities"
                    required={requestType === "trader"}
                    rows={3}
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="message">Additional Information (Optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Provide any additional information to support your verification request"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Verification Request"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}