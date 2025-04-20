
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  MessageSquare, 
  User, 
  ChevronRight, 
  Send, 
  ArrowLeft,
  AlertCircle,
  Loader2,
  Image,
  Paperclip,
  Search
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/auth";
import { useMessages, useConversation, type Conversation } from "@/hooks/use-message";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useAnalytics } from "@/hooks/use-analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loading } from "@/components/ui/loading";

const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-GB', {
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
};

const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  if (date.toDateString() === today.toDateString()) {
    return "Today";
  } else if (date.toDateString() === yesterday.toDateString()) {
    return "Yesterday";
  } else {
    return new Intl.DateTimeFormat('en-GB', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
    }).format(date);
  }
};

const groupMessagesByDate = (messages: any[]) => {
  const groups: { date: Date; messages: any[] }[] = [];
  
  messages.forEach(message => {
    const messageDate = new Date(message.createdAt);
    messageDate.setHours(0, 0, 0, 0);
    
    const existingGroup = groups.find(group => 
      group.date.getTime() === messageDate.getTime()
    );
    
    if (existingGroup) {
      existingGroup.messages.push(message);
    } else {
      groups.push({
        date: messageDate,
        messages: [message],
      });
    }
  });
  
  return groups;
};

const MessagesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const { conversations, isLoading: conversationsLoading } = useMessages();
  const { trackEvent } = useAnalytics();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [activeListingId, setActiveListingId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showMessages, setShowMessages] = useState(!isMobile);

  const {
    messages,
    otherUser,
    listing,
    isLoading: messagesLoading,
    sendMessage,
  } = useConversation(activeConversation || "", activeListingId || undefined);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) {
        setShowMessages(true);
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Check URL for any conversation ID to open
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const conversationId = params.get("id");
    const listingId = params.get("listing");
    
    if (conversationId) {
      setActiveConversation(conversationId);
      setShowMessages(true);
      trackEvent("conversation_opened_from_url", { 
        conversationId, 
        hasListingId: !!listingId 
      });
    }
    
    if (listingId) {
      setActiveListingId(listingId);
    }
  }, [location.search, trackEvent]);

  // Filter conversations by search term
  const filteredConversations = conversations.filter(convo => {
    if (!searchTerm) return true;
    return convo.otherUserName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           (convo.listingTitle && convo.listingTitle.toLowerCase().includes(searchTerm.toLowerCase()));
  });

  // Handle conversation selection
  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation.otherUserId);
    setActiveListingId(conversation.listingId || null);
    setShowMessages(true);
    trackEvent("conversation_selected", { 
      conversationId: conversation.otherUserId,
      hasListing: !!conversation.listingId
    });
  };

  // Handle sending a message
  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;
    
    const trimmedMessage = messageInput.trim();
    setMessageInput("");
    
    const result = await sendMessage(trimmedMessage);
    
    if (result.success) {
      trackEvent("message_sent", { hasListing: !!activeListingId });
    }
  };

  // Handle back button on mobile
  const handleBackToConversations = () => {
    setShowMessages(false);
    trackEvent("conversation_back_to_list");
  };

  // If not logged in, show login prompt
  if (!user) {
    return (
      <MainLayout>
        <div className="container py-12">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Authentication Required</AlertTitle>
            <AlertDescription>
              You need to be logged in to view your messages.
            </AlertDescription>
          </Alert>
          <Button className="mt-4" onClick={() => navigate("/login")}>
            Log In
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            View and manage your conversations
          </p>
        </div>

        <div className="border rounded-lg overflow-hidden h-[calc(80vh-100px)] flex">
          {/* Conversations list */}
          {(!showMessages || !isMobile) && (
            <div className={`${isMobile ? 'w-full' : 'w-1/3 border-r'} flex flex-col bg-muted/10`}>
              <div className="p-3 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search conversations..."
                    className="pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {conversationsLoading ? (
                <div className="flex-1 flex items-center justify-center">
                  <Loading message="Loading conversations..." />
                </div>
              ) : filteredConversations.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  {searchTerm ? (
                    <>
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-1">No matching conversations</h3>
                      <p className="text-muted-foreground text-sm">
                        Try a different search term
                      </p>
                      <Button 
                        variant="ghost" 
                        className="mt-2"
                        onClick={() => setSearchTerm("")}
                      >
                        Clear Search
                      </Button>
                    </>
                  ) : (
                    <>
                      <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="font-medium mb-1">No conversations yet</h3>
                      <p className="text-muted-foreground text-sm">
                        When you contact sellers, your conversations will appear here
                      </p>
                      <Button 
                        className="mt-4"
                        onClick={() => navigate("/listings")}
                      >
                        Browse Listings
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <ScrollArea className="flex-1">
                  {filteredConversations.map((conversation) => (
                    <div
                      key={conversation.id}
                      className={`border-b p-3 cursor-pointer hover:bg-muted/20 transition-colors ${
                        activeConversation === conversation.otherUserId ? "bg-muted/30" : ""
                      }`}
                      onClick={() => handleSelectConversation(conversation)}
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
                                <Badge variant="destructive" className="ml-2">
                                  {conversation.unreadCount}
                                </Badge>
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
          )}

          {/* Message thread */}
          {(showMessages || !isMobile) && (
            <div className={`${isMobile ? 'w-full' : 'w-2/3'} flex flex-col bg-background`}>
              {activeConversation ? (
                <>
                  {/* Conversation header */}
                  <div className="p-3 border-b flex items-center justify-between">
                    <div className="flex items-center">
                      {isMobile && (
                        <Button size="icon" variant="ghost" onClick={handleBackToConversations} className="mr-2">
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
                        <div className="h-full flex flex-col items-center justify-center text-center p-6">
                          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                          <h3 className="font-medium mb-1">No messages yet</h3>
                          <p className="text-muted-foreground text-sm">
                            Start the conversation by sending a message below
                          </p>
                        </div>
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
                          
                          {groupMessagesByDate(messages).map((group, groupIndex) => (
                            <div key={group.date.toISOString()} className="space-y-4">
                              <div className="flex justify-center">
                                <div className="bg-muted/20 text-muted-foreground text-xs px-3 py-1 rounded-full">
                                  {formatDate(group.date)}
                                </div>
                              </div>
                              
                              {group.messages.map((message, messageIndex) => {
                                const isCurrentUser = message.senderId === user?.id;
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
                                        <Alert variant="destructive" className="py-2">
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
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
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
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                  <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                  <p className="text-muted-foreground mb-6">
                    Select a conversation from the list to view messages
                  </p>
                  {isMobile && (
                    <Button onClick={handleBackToConversations}>
                      View Conversations
                    </Button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MessagesPage;
