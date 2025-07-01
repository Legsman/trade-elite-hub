
import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useSubmitFeedback } from "@/hooks/feedback/useSubmitFeedback";

export interface LeaveFeedbackModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fromUserId: string;
  toUserId: string;
  listingId: string;
  onSubmitted?: () => void;
}

export const LeaveFeedbackModal: React.FC<LeaveFeedbackModalProps> = ({
  open,
  onOpenChange,
  fromUserId,
  toUserId,
  listingId,
  onSubmitted,
}) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const { submitFeedback, isSubmitting } = useSubmitFeedback();
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    try {
      await submitFeedback({ fromUserId, toUserId, listingId, rating, comment });
      setRating(5);
      setComment("");
      onOpenChange(false);
      if (onSubmitted) onSubmitted();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit feedback.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave Feedback</DialogTitle>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block font-medium mb-2">Rating</label>
            <select
              className="w-full rounded border p-2"
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
            >
              {[5, 4, 3, 2, 1].map(n => (
                <option key={n} value={n}>{n} Star{n > 1 ? "s" : ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium mb-2">Comment</label>
            <textarea
              className="w-full rounded border p-2"
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              maxLength={512}
              placeholder="Write something helpful for future buyers/sellers"
            />
          </div>
          {errorMsg && <div className="text-red-500 text-sm">{errorMsg}</div>}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};
