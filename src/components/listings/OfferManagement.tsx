
import { useState } from "react";
import { Clock, Loader2, MessageCircle, ThumbsDown, ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Offer } from "@/types";

interface OfferManagementProps {
  offers: Offer[];
  isLoading: boolean;
  onRefresh: () => void;
  onRespond: (offerId: string, status: 'accepted' | 'declined') => Promise<{ success: boolean }>;
  listingTitle: string;
}

export const OfferManagement = ({ 
  offers, 
  isLoading,
  onRefresh,
  onRespond,
  listingTitle
}: OfferManagementProps) => {
  const [refreshing, setRefreshing] = useState(false);
  const [responding, setResponding] = useState<string | null>(null);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'accepted' | 'declined' | null>(null);

  // Format the date
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefresh();
    setRefreshing(false);
  };

  const openConfirmDialog = (offer: Offer, action: 'accepted' | 'declined') => {
    setSelectedOffer(offer);
    setConfirmAction(action);
    setConfirmDialogOpen(true);
  };

  const handleConfirmResponse = async () => {
    if (!selectedOffer || !confirmAction) return;
    
    setResponding(selectedOffer.id);
    const result = await onRespond(selectedOffer.id, confirmAction);
    setResponding(null);
    
    if (result.success) {
      setConfirmDialogOpen(false);
    }
  };

  // Separate offers by status
  const pendingOffers = offers.filter(offer => offer.status === 'pending');
  const respondedOffers = offers.filter(offer => offer.status !== 'pending');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500">Accepted</Badge>;
      case 'declined':
        return <Badge variant="outline" className="text-muted-foreground">Declined</Badge>;
      case 'expired':
        return <Badge variant="outline" className="text-muted-foreground">Expired</Badge>;
      default:
        return <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100">Pending</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-xl">Offers</CardTitle>
          <CardDescription>
            {offers.length === 0 ? "No offers yet" : 
             `${offers.length} offer${offers.length !== 1 ? 's' : ''} (${pendingOffers.length} pending)`}
          </CardDescription>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRefresh}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Refresh"
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : offers.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No offers have been received yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {pendingOffers.length > 0 && (
              <div className="space-y-4">
                <h3 className="font-medium text-sm">Pending Offers</h3>
                {pendingOffers.map((offer) => (
                  <div key={offer.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                          {offer.user?.avatarUrl ? (
                            <img 
                              src={offer.user.avatarUrl} 
                              alt="User avatar" 
                              className="h-8 w-8 rounded-full object-cover"
                            />
                          ) : (
                            <User className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium flex items-center">
                            {offer.user?.username || "Anonymous"}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Clock className="h-3 w-3 mr-1" />
                            {formatDate(offer.createdAt)}
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(offer.status)}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-muted-foreground">Offer Amount</p>
                        <p className="text-lg font-bold">£{offer.amount.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          onClick={() => openConfirmDialog(offer, 'declined')}
                          disabled={!!responding}
                        >
                          {responding === offer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ThumbsDown className="h-4 w-4 mr-1" />
                              Decline
                            </>
                          )}
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => openConfirmDialog(offer, 'accepted')}
                          disabled={!!responding}
                        >
                          {responding === offer.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <ThumbsUp className="h-4 w-4 mr-1" />
                              Accept
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    {offer.message && (
                      <div className="bg-muted/30 p-3 rounded-md text-sm">
                        <div className="flex items-center text-muted-foreground mb-1">
                          <MessageCircle className="h-3 w-3 mr-1" />
                          <span className="text-xs">Message from buyer</span>
                        </div>
                        <p>{offer.message}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {respondedOffers.length > 0 && (
              <div>
                <h3 className="font-medium text-sm mb-2">Previous Offers</h3>
                <Accordion type="single" collapsible className="w-full">
                  {respondedOffers.map((offer, index) => (
                    <AccordionItem key={offer.id} value={offer.id}>
                      <AccordionTrigger className="hover:no-underline">
                        <div className="flex justify-between items-center w-full pr-4">
                          <div className="flex items-center gap-2">
                            <div className="font-medium">
                              £{offer.amount.toLocaleString()}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatDate(offer.updatedAt)}
                            </div>
                          </div>
                          {getStatusBadge(offer.status)}
                        </div>
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="py-2 space-y-3">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                              {offer.user?.avatarUrl ? (
                                <img 
                                  src={offer.user.avatarUrl} 
                                  alt="User avatar" 
                                  className="h-6 w-6 rounded-full object-cover"
                                />
                              ) : (
                                <User className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                            <span>{offer.user?.username || "Anonymous"}</span>
                          </div>
                          
                          {offer.message && (
                            <div className="bg-muted/30 p-2 rounded-md text-sm">
                              <p>{offer.message}</p>
                            </div>
                          )}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {confirmAction === 'accepted' ? 'Accept Offer' : 'Decline Offer'}
            </DialogTitle>
            <DialogDescription>
              {confirmAction === 'accepted' 
                ? `Are you sure you want to accept this offer of £${selectedOffer?.amount.toLocaleString()}?`
                : `Are you sure you want to decline this offer of £${selectedOffer?.amount.toLocaleString()}?`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm">
              {confirmAction === 'accepted' 
                ? "By accepting this offer, you agree to sell the item to this buyer at the offered price. The buyer will be notified of your acceptance."
                : "The buyer will be notified that you've declined their offer."}
            </p>
            
            <div className="mt-4 p-3 bg-muted/30 rounded-md">
              <h4 className="text-sm font-medium">{listingTitle}</h4>
              <p className="text-lg font-bold mt-1">£{selectedOffer?.amount.toLocaleString()}</p>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={!!responding}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              variant={confirmAction === 'accepted' ? 'default' : 'destructive'}
              onClick={handleConfirmResponse}
              disabled={!!responding}
            >
              {responding ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : confirmAction === 'accepted' ? (
                "Accept Offer"
              ) : (
                "Decline Offer"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};
