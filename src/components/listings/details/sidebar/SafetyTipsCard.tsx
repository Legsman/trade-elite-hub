
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Shield } from "lucide-react";

export const SafetyTipsCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Safety Tips</CardTitle>
    </CardHeader>
    <CardContent>
      <ul className="text-sm space-y-2">
        <li className="flex items-start">
          <Shield className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <span>Meet in public places for viewings or exchanges</span>
        </li>
        <li className="flex items-start">
          <Shield className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <span>Use our secure messaging system for all communications</span>
        </li>
        <li className="flex items-start">
          <Shield className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <span>Verify high-value items with an expert before purchase</span>
        </li>
        <li className="flex items-start">
          <Shield className="h-4 w-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" />
          <span>Report suspicious listings or behavior to our team</span>
        </li>
      </ul>
    </CardContent>
  </Card>
);
