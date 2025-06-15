
export interface FeedbackItem {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string | Date;
  transactionType: string;
  user: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  };
}
