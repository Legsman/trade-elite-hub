import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/auth";
import { useMessages } from "@/hooks/useMessages";
import { useConversation, type Conversation } from "@/hooks/useConversation";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useAnalytics } from "@/hooks/use-analytics";
import { Button } from "@/components/ui/button";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import ConversationsList from "./ConversationsList";
import MessageThread from "./MessageThread";
import NoConversations from "./NoConversations";
import { Loading } from "@/components/ui/loading";

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

  const handleSelectConversation = (conversation: Conversation) => {
    setActiveConversation(conversation.otherUserId);
    setActiveListingId(conversation.listingId || null);
    setShowMessages(true);
    trackEvent("conversation_selected", { 
      conversationId: conversation.otherUserId,
      hasListing: !!conversation.listingId
    });
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !activeConversation) return;
    const trimmedMessage = messageInput.trim();
    setMessageInput("");
    const result = await sendMessage(trimmedMessage);
    if (result.success) {
      trackEvent("message_sent", { hasListing: !!activeListingId });
    }
  };

  const handleBackToConversations = () => {
    setShowMessages(false);
    trackEvent("conversation_back_to_list");
  };

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
          <p className="text-muted-foreground">View and manage your conversations</p>
        </div>
        <div className="border rounded-lg overflow-hidden h-[calc(80vh-100px)] flex">
          {(!showMessages || !isMobile) && (
            <ConversationsList
              conversations={conversations}
              activeConversation={activeConversation}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              onSelectConversation={handleSelectConversation}
              conversationsLoading={conversationsLoading}
              navigate={navigate}
              isMobile={isMobile}
            />
          )}
          {(showMessages || !isMobile) && (
            activeConversation ? (
              <MessageThread
                isMobile={isMobile}
                showMessages={showMessages}
                handleBack={handleBackToConversations}
                otherUser={otherUser}
                listing={listing}
                messages={messages}
                messagesLoading={messagesLoading}
                messageInput={messageInput}
                setMessageInput={setMessageInput}
                handleSendMessage={handleSendMessage}
                userId={user?.id}
                navigate={navigate}
              />
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <span className="h-12 w-12 mb-4 flex items-center justify-center bg-muted/30 rounded-full">
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10z"></path></svg>
                </span>
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
            )
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default MessagesPage;
