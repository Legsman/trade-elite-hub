
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight, ArrowLeft, User, Image, AlertCircle, Send } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Loading } from "@/components/ui/loading";
import NoMessages from "./NoMessages";
import { formatDate, formatTime, groupMessagesByDate } from "./utils/messageHelpers";

type Props = {
  isMobile: boolean;
  showMessages: boolean;
  handleBack: () => void;
  otherUser: { name: string; avatarUrl?: string } | null;
  listing?: { id: string; title: string; price: number; imageUrl?: string } | null;
  messages: any[];
  messagesLoading: boolean;
  messageInput: string;
  setMessageInput: (v: string) => void;
  handleSendMessage: () => void;
  userId?: string;
  navigate: (url: string) => void;
};

const MessageThread = ({
  isMobile,
  showMessages,
  handleBack,
  otherUser,
  listing,
  messages,
  messagesLoading,
  messageInput,
  setMessageInput,
  handleSendMessage,
  userId,
  navigate,
}: Props) => (
  <div className={`${isMobile ? 'w-full' : 'w-2/3'} flex flex-col bg-background`}>
    {/* Conversation header */}
    <div className="p-3 border-b flex items-center justify-between">
      <div className="flex items-center">
        {isMobile && (
          <Button size="icon" variant="ghost" onClick={handleBack} className="mr-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <Avatar className="h-8 w-8 mr-2">
          <AvatarImage src={otherUser?.avatarUrl} />
          <AvatarFallback>{otherUser?.name?.[0] || <User className="h-4 w-4" />}</AvatarFallback>
        </Avatar>
        <div>
          <div className="font-medium">{otherUser?.name || "Loading..."}</div>
          {listing && (
            <div className="text-xs text-muted-foreground">
              Regarding: {listing.title}
            </div>
          )}
        </div>
      </div>
      {listing && (
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/listings/${listing.id}`)}
        >
          View Listing
        </Button>
      )}
    </div>
    {/* Message thread */}
    {messagesLoading ? (
      <div className="flex-1 flex items-center justify-center">
        <Loading message="Loading messages..." />
      </div>
    ) : (
      <ScrollArea className="flex-1 p-4">
        {messages.length === 0 ? (
          <NoMessages />
        ) : (
          <div className="space-y-6">
            {listing && (
              <div 
                className="bg-muted/20 p-3 rounded-lg flex items-center gap-3 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => navigate(`/listings/${listing.id}`)}
              >
                <div className="w-16 h-16 rounded-md overflow-hidden border flex-shrink-0">
                  {listing.imageUrl ? (
                    <img
                      src={listing.imageUrl}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <Image className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium">{listing.title}</h4>
                  <p className="text-purple font-bold">£{listing.price.toLocaleString()}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground ml-auto" />
              </div>
            )}
            {groupMessagesByDate(messages).map((group) => (
              <div key={group.date.toISOString()} className="space-y-4">
                <div className="flex justify-center">
                  <div className="bg-muted/20 text-muted-foreground text-xs px-3 py-1 rounded-full">
                    {formatDate(group.date)}
                  </div>
                </div>
                {group.messages.map((message: any) => {
                  const isCurrentUser = message.senderId === userId;
                  const showWarning = message.hasContactInfo && !isCurrentUser;
                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] space-y-1 ${showWarning ? 'space-y-2' : ''}`}>
                        {!isCurrentUser && (
                          <div className="flex items-center">
                            <Avatar className="h-6 w-6 mr-2">
                              <AvatarImage src={otherUser?.avatarUrl} />
                              <AvatarFallback>{otherUser?.name?.[0] || <User className="h-3 w-3" />}</AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">{otherUser?.name}</span>
                          </div>
                        )}
                        <div className={`px-4 py-2 rounded-lg ${
                          isCurrentUser 
                            ? 'bg-purple text-white rounded-br-none' 
                            : 'bg-muted rounded-bl-none'
                        }`}>
                          {message.content}
                        </div>
                        {showWarning && (
                          <Alert variant="destructive" className="py-2 px-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="text-xs">Contact information detected</AlertTitle>
                            <AlertDescription className="text-xs">
                              Be cautious when sharing personal details outside our platform.
                            </AlertDescription>
                          </Alert>
                        )}
                        <div className={`text-xs text-muted-foreground ${isCurrentUser ? 'text-right' : 'text-left'}`}>
                          {formatTime(message.createdAt)}
                          {message.isRead && isCurrentUser && (
                            <span className="ml-1">• Read</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
    )}
    {/* Message input */}
    <div className="p-3 border-t mt-auto">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Type your message..."
          value={messageInput}
          onChange={e => setMessageInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button 
          size="icon" 
          type="button" 
          onClick={handleSendMessage}
          disabled={!messageInput.trim()}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      <div className="text-xs text-muted-foreground mt-2 flex items-center">
        <AlertCircle className="h-3 w-3 mr-1" />
        We recommend not sharing contact details until necessary
      </div>
    </div>
  </div>
);

export default MessageThread;
