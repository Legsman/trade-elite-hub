import { Shield, CheckCircle, Star, Crown, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface VerificationInfoPageProps {
  onClose?: () => void;
  onRequestVerification?: () => void;
}

export function VerificationInfoPage({ onClose, onRequestVerification }: VerificationInfoPageProps) {
  const verificationLevels = [
    {
      level: "Unverified",
      icon: Shield,
      color: "text-muted-foreground",
      bgColor: "bg-muted",
      description: "Basic account with limited access",
      features: [
        "Browse listings",
        "View seller profiles",
        "Save listings for later"
      ],
      restrictions: [
        "Cannot send messages",
        "Cannot place bids",
        "Cannot make offers",
        "Cannot create listings"
      ]
    },
    {
      level: "Verified",
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100 dark:bg-green-900/20",
      description: "Standard verified user with full marketplace access",
      features: [
        "All unverified features",
        "Send and receive messages",
        "Place bids on auctions",
        "Make offers on listings",
        "Create and manage listings",
        "Leave and receive feedback"
      ],
      restrictions: [
        "Standard transaction limits",
        "Basic seller privileges"
      ]
    },
    {
      level: "Trader",
      icon: Star,
      color: "text-blue-600",
      bgColor: "bg-blue-100 dark:bg-blue-900/20",
      description: "Enhanced privileges for serious traders and businesses",
      features: [
        "All verified features",
        "Higher transaction limits",
        "Priority customer support",
        "Advanced analytics",
        "Bulk listing tools",
        "Special trader badge"
      ],
      restrictions: [
        "Business verification required"
      ]
    },
    {
      level: "Admin",
      icon: Crown,
      color: "text-purple-600",
      bgColor: "bg-purple-100 dark:bg-purple-900/20",
      description: "Platform administrators with full system access",
      features: [
        "All trader features",
        "User management",
        "Content moderation",
        "System administration",
        "Analytics access",
        "Platform configuration"
      ],
      restrictions: []
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center">
          <Shield className="h-12 w-12 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Account Verification</h1>
          <p className="text-lg text-muted-foreground mt-2">
            Learn about our verification system and how to unlock full marketplace access
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {verificationLevels.map((level, index) => (
          <Card key={level.level} className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${level.bgColor}`}>
                  <level.icon className={`h-6 w-6 ${level.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="flex items-center gap-2">
                    {level.level}
                    <Badge variant={level.level === "Admin" ? "default" : "outline"}>
                      Level {index + 1}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{level.description}</CardDescription>
                </div>
                {index < verificationLevels.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {level.features.length > 0 && (
                <div>
                  <h4 className="font-medium text-green-600 dark:text-green-400 mb-2">
                    ✓ Features & Permissions
                  </h4>
                  <ul className="text-sm space-y-1">
                    {level.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {level.restrictions.length > 0 && (
                <div>
                  <h4 className="font-medium text-orange-600 dark:text-orange-400 mb-2">
                    ⚠ Limitations
                  </h4>
                  <ul className="text-sm space-y-1">
                    {level.restrictions.map((restriction, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-3 w-3 flex-shrink-0">•</span>
                        {restriction}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Ready to Get Verified?
          </CardTitle>
          <CardDescription>
            Start your verification process to unlock full marketplace access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">Verification Process:</h4>
            <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
              <li>Submit a verification request with your information</li>
              <li>Our team will review your application</li>
              <li>You'll receive an email notification with the decision</li>
              <li>Upon approval, your account will be upgraded immediately</li>
            </ol>
          </div>
          
          <div className="flex gap-3">
            {onRequestVerification && (
              <Button onClick={onRequestVerification} className="flex-1">
                <Shield className="h-4 w-4 mr-2" />
                Request Verification
              </Button>
            )}
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}