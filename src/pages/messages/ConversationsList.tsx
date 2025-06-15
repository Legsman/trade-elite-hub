import { useState } from "react";
import { Search, ChevronRight, BadgeAlert } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import NoConversations from "./NoConversations";
import { Conversation } from "@/hooks/messageTypes";
import { formatDate } from "./utils/messageHelpers";
import { Loading } from "@/components/ui/loading";

type Props = {
  conversations: Conversation[];
  activeConversation: string | null;
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  onSelectConversation: (c: Conversation) => void;
  conversationsLoading: boolean;
  navigate: (url: string) => void;
  isMobile: boolean;
};

const ConversationsList = ({
  conversations,
  activeConversation,
  searchTerm,
  setSearchTerm,
  onSelectConversation,
  conversationsLoading,
  navigate,
  isMobile,
}: Props) => {
  const filteredConversations = conversations.filter(convo => {
    if (!searchTerm) return true;
    return convo.otherUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (convo.listingTitle && convo.listingTitle.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  return (
    <div className={`${isMobile ? 'w-full' : 'w-1/3 border-r'} flex flex-col bg-muted/10`}>
      <div className="p-3 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-9"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {conversationsLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loading message="Loading conversations..." />
        </div>
      ) : filteredConversations.length === 0 ? (
        <NoConversations
          searchTerm={searchTerm}
          onClearSearch={() => setSearchTerm("")}
          onBrowseListings={() => navigate("/listings")}
        />
      ) : (
        <ScrollArea className="flex-1">
          {filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`border-b p-3 cursor-pointer hover:bg-muted/20 transition-colors ${
                activeConversation === conversation.otherUserId ? "bg-muted/30" : ""
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex items-start gap-3">
                <Avatar>
                  <AvatarImage src={conversation.otherUserAvatar} />
                  <AvatarFallback>{conversation.otherUserName[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between items-start">
                    <div className="font-medium truncate">
                      {conversation.otherUserName}
                      {conversation.unreadCount > 0 && (
                        <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-red-500 text-white">{conversation.unreadCount}</span>
                      )}
                    </div>
                    {conversation.lastMessageDate && (
                      <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                        {formatDate(conversation.lastMessageDate)}
                      </span>
                    )}
                  </div>
                  {conversation.listingTitle && (
                    <div className="text-xs text-primary truncate mt-1">
                      Re: {conversation.listingTitle}
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground truncate mt-1">
                    {conversation.lastMessage || "No messages yet"}
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-2" />
              </div>
            </div>
          ))}
        </ScrollArea>
      )}
    </div>
  );
};

export default ConversationsList;
