
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export const ShippingInfoCard = () => (
  <Card>
    <CardHeader>
      <CardTitle>Shipping Information</CardTitle>
    </CardHeader>
    <CardContent>
      <p>
        The seller is responsible for arranging shipping. Contact the seller for shipping options and costs.
      </p>
      <div className="p-4 bg-muted/40 rounded-lg mt-4">
        <h4 className="font-medium mb-2">Shipping Terms</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Buyer is responsible for all shipping and handling costs</li>
          <li>Items will be shipped within 7 business days of cleared payment</li>
          <li>International buyers are responsible for any customs fees</li>
          <li>Insurance is recommended for high-value items</li>
        </ul>
      </div>
    </CardContent>
  </Card>
);
