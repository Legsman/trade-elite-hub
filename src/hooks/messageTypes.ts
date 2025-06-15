
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  listingId?: string;
  content: string;
  isRead: boolean;
  createdAt: Date;
  hasContactInfo: boolean;
}

export interface Conversation {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar?: string;
  lastMessage?: string;
  lastMessageDate?: Date;
  unreadCount: number;
  listingId?: string;
  listingTitle?: string;
}
