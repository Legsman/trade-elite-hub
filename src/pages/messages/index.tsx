
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { 
  Search, 
  ChevronRight, 
  MessageSquare, 
  User, 
  Send, 
  Paperclip,
  Clock,
  ArrowLeft,
  MoreVertical,
  Trash2
} from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Card, 
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/auth";
import { Loading } from "@/components/ui/loading";
import { toast } from "@/hooks/use-toast";
import { Message } from "@/types";

// Mock data
const MOCK_CONVERSATIONS = [
  {
    id: "1",
    userId: "user1",
    userName: "David Thompson",
    lastMessage: "I'm interested in the Porsche you listed. Is the price negotiable?",
    lastMessageTime: new Date(2025, 3, 19, 14, 30),
    unreadCount: 1,
    listingId: "listing1",
    listingTitle: "2020 Ferrari 488 Pista",
    listingImage: "https://images.unsplash.com/photo-1592198084033-aade902d1aae?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "2",
    userId: "user2",
    userName: "Sarah Wilson",
    lastMessage: "Thanks for the information. I'll get back to you tomorrow.",
    lastMessageTime: new Date(2025, 3, 18, 9, 45),
    unreadCount: 0,
    listingId: "listing2",
    listingTitle: "Patek Philippe Nautilus 5711",
    listingImage: "https://images.unsplash.com/photo-1620625515032-6ed0c1790c75?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "3",
    userId: "user3",
    userName: "Mark Lewis",
    lastMessage: "Is the property still available? I'd like to arrange a viewing.",
    lastMessageTime: new Date(2025, 3, 17, 16, 20),
    unreadCount: 0,
    listingId: "listing3",
    listingTitle: "Luxury Penthouse - Central London",
    listingImage: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "4",
    userId: "user4",
    userName: "Emma Parker",
    lastMessage: "Would you consider £110,000 for the Porsche?",
    lastMessageTime: new Date(2025, 3, 15, 11, 10),
    unreadCount: 0,
    listingId: "listing4",
    listingTitle: "Vintage Porsche 911 (1973)",
    listingImage: "https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
  },
];

// Mock messages for a conversation
const MOCK_MESSAGES: { [key: string]: Message[] } = {
  "1": [
    {
      id: "m1",
      senderId: "user1",
      receiverId: "currentUser",
      listingId: "listing1",
      content: "Hi there, I'm interested in the Ferrari 488 Pista you have listed. Is it still available?",
      isRead: true,
      createdAt: new Date(2025, 3, 19, 10, 15),
      hasContactInfo: false,
    },
    {
      id: "m2",
      senderId: "currentUser",
      receiverId: "user1",
      listingId: "listing1",
      content: "Yes, it's still available. Would you like to know more about it?",
      isRead: true,
      createdAt: new Date(2025, 3, 19, 10, 30),
      hasContactInfo: false,
    },
    {
      id: "m3",
      senderId: "user1",
      receiverId: "currentUser",
      listingId: "listing1",
      content: "I'm interested in the Porsche you listed. Is the price negotiable?",
      isRead: false,
      createdAt: new Date(2025, 3, 19, 14, 30),
      hasContactInfo: false,
    },
  ],
  "2": [
    {
      id: "m4",
      senderId: "user2",
      receiverId: "currentUser",
      listingId: "listing2",
      content: "Hello, I'm interested in the Patek Philippe Nautilus. Does it have all the original documentation?",
      isRead: true,
      createdAt: new Date(2025, 3, 18, 8, 45),
      hasContactInfo: false,
    },
    {
      id: "m5",
      senderId: "currentUser",
      receiverId: "user2",
      listingId: "listing2",
      content: "Hi Sarah, yes it comes with the original box, papers, and warranty card. The watch is in excellent condition with minimal wear.",
      isRead: true,
      createdAt: new Date(2025, 3, 18, 9, 15),
      hasContactInfo: false,
    },
    {
      id: "m6",
      senderId: "user2",
      receiverId: "currentUser",
      listingId: "listing2",
      content: "Thanks for the information. I'll get back to you tomorrow.",
      isRead: true,
      createdAt: new Date(2025, 3, 18, 9, 45),
      hasContactInfo: false,
    },
  ],
};

const MessagesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [conversations, setConversations] = useState(MOCK_CONVERSATIONS);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [conversationMessages, setConversationMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [showMobileChat, setShowMobileChat] = useState(false);

  // This would connect to an API in a real application
  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setConversations(MOCK_CONVERSATIONS);
      
      // Check if there's a conversation ID in the URL
      const conversationId = searchParams.get("id");
      if (conversationId) {
        setSelectedConversation(conversationId);
        setConversationMessages(MOCK_MESSAGES[conversationId] || []);
        setShowMobileChat(true);
      }
      
      setLoading(false);
    }, 800);
  }, [searchParams]);

  useEffect(() => {
    if (selectedConversation) {
      // Mark messages as read in a real app
      // For mock data, we're just showing the messages
      setConversationMessages(MOCK_MESSAGES[selectedConversation] || []);
      
      // Update unread count
      setConversations(prev => 
        prev.map(convo => 
          convo.id === selectedConversation 
            ? { ...convo, unreadCount: 0 } 
            : convo
        )
      );
    }
  }, [selectedConversation]);

  const handleSelectConversation = (id: string) => {
    setSelectedConversation(id);
    setShowMobileChat(true);
    // In a real app, this would also update the URL
    navigate(`/messages?id=${id}`, { replace: true });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const selectedConvo = conversations.find(c => c.id === selectedConversation);
    if (!selectedConvo) return;

    // In a real app, this would send the message to the API
    const newMsg: Message = {
      id: `new-${Date.now()}`,
      senderId: "currentUser",
      receiverId: selectedConvo.userId,
      listingId: selectedConvo.listingId,
      content: newMessage,
      isRead: true,
      createdAt: new Date(),
      hasContactInfo: false,
    };

    // Update conversation messages
    setConversationMessages(prev => [...prev, newMsg]);

    // Update last message in conversations list
    setConversations(prev => 
      prev.map(convo => 
        convo.id === selectedConversation 
          ? { 
              ...convo, 
              lastMessage: newMessage,
              lastMessageTime: new Date(),
            } 
          : convo
      )
    );

    // Clear input
    setNewMessage("");

    // Simulate a reply in 2 seconds for demo purposes
    if (selectedConversation === "1") {
      setTimeout(() => {
        const autoReply: Message = {
          id: `auto-${Date.now()}`,
          senderId: selectedConvo.userId,
          receiverId: "currentUser",
          listingId: selectedConvo.listingId,
          content: "Thanks for your message. I'll consider your offer and get back to you soon.",
          isRead: false,
          createdAt: new Date(),
          hasContactInfo: false,
        };

        setConversationMessages(prev => [...prev, autoReply]);
        
        setConversations(prev => 
          prev.map(convo => 
            convo.id === selectedConversation 
              ? { 
                  ...convo, 
                  lastMessage: autoReply.content,
                  lastMessageTime: new Date(),
                  unreadCount: showMobileChat ? 0 : 1,
                } 
              : convo
          )
        );
      }, 2000);
    }
  };

  const handleBackToList = () => {
    setShowMobileChat(false);
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', { 
      hour: 'numeric', 
      minute: 'numeric',
      hour12: true 
    }).format(date);
  };

  const formatDate = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return new Intl.DateTimeFormat('en-GB', { 
        day: 'numeric', 
        month: 'short'
      }).format(date);
    }
  };

  const filterConversations = () => {
    if (!searchTerm) return conversations;
    
    return conversations.filter(convo => 
      convo.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convo.listingTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      convo.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <Card className="max-w-md mx-auto">
            <CardContent className="py-8">
              <div className="flex flex-col items-center space-y-4">
                <MessageSquare className="h-12 w-12 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Sign In Required</h2>
                <p className="text-muted-foreground">
                  You need to be logged in to access your messages
                </p>
                <Button onClick={() => navigate("/login")}>
                  Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  const filteredConversations = filterConversations();

  return (
    <MainLayout>
      <div className="container py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Messages</h1>
          <p className="text-muted-foreground">
            Manage your conversations with other users
          </p>
        </div>

        {loading ? (
          <div className="py-12">
            <Loading message="Loading messages..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 h-[calc(100vh-16rem)]">
            {/* Conversation list - only hidden on mobile when viewing a specific conversation */}
            <div className={`md:col-span-1 border rounded-lg overflow-hidden
              ${showMobileChat ? 'hidden md:block' : 'block'}`}
            >
              <div className="p-4 border-b">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search messages..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="overflow-y-auto h-[calc(100vh-16rem-10rem)]">
                {filteredConversations.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    No conversations found
                  </div>
                ) : (
                  filteredConversations.map((convo) => (
                    <div
                      key={convo.id}
                      className={`border-b last:border-b-0 hover:bg-muted/50 cursor-pointer transition-colors
                        ${selectedConversation === convo.id ? 'bg-muted' : ''}
                      `}
                      onClick={() => handleSelectConversation(convo.id)}
                    >
                      <div className="p-4 flex items-start gap-3">
                        <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                          <User className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium truncate">{convo.userName}</h4>
                            <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                              {formatDate(convo.lastMessageTime)}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {convo.lastMessage}
                          </p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs truncate">{convo.listingTitle}</span>
                            {convo.unreadCount > 0 && (
                              <Badge variant="default" className="ml-2">
                                {convo.unreadCount}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            
            {/* Conversation detail */}
            <div className={`md:col-span-2 lg:col-span-3 border rounded-lg overflow-hidden flex flex-col
              ${!showMobileChat ? 'hidden md:flex' : 'flex'}`}
            >
              {!selectedConversation ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No conversation selected</h3>
                  <p>Select a conversation from the list to view messages</p>
                </div>
              ) : (
                <>
                  {/* Conversation header */}
                  <div className="p-4 border-b flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="md:hidden"
                        onClick={handleBackToList}
                      >
                        <ArrowLeft className="h-5 w-5" />
                      </Button>
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="font-medium">
                          {conversations.find(c => c.id === selectedConversation)?.userName}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          Re: {conversations.find(c => c.id === selectedConversation)?.listingTitle}
                        </p>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">More options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Conversation</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => {
                          const convo = conversations.find(c => c.id === selectedConversation);
                          if (convo) navigate(`/listings/${convo.listingId}`);
                        }}>
                          View Listing
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          toast({
                            title: "Conversation reported",
                            description: "We'll review this conversation and take appropriate action.",
                          });
                        }}>
                          Report
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-500" onClick={() => {
                          toast({
                            title: "Delete conversation?",
                            description: "This action cannot be undone.",
                            variant: "destructive",
                          });
                        }}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  
                  {/* Message list */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {conversationMessages.map((message) => {
                      const isCurrentUser = message.senderId === "currentUser";
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] sm:max-w-[70%] rounded-lg p-3 ${
                              isCurrentUser 
                                ? 'bg-purple text-white rounded-tr-none' 
                                : 'bg-muted rounded-tl-none'
                            }`}
                          >
                            <p className="break-words">{message.content}</p>
                            <div className={`text-xs mt-1 flex items-center ${
                              isCurrentUser ? 'text-purple-100' : 'text-muted-foreground'
                            }`}>
                              <Clock className="h-3 w-3 mr-1" />
                              {formatTime(message.createdAt)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Message composer */}
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Button variant="outline" size="icon" className="flex-shrink-0">
                        <Paperclip className="h-4 w-4" />
                        <span className="sr-only">Attach</span>
                      </Button>
                      <Input 
                        placeholder="Type a message..." 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                      />
                      <Button onClick={handleSendMessage} className="flex-shrink-0">
                        <Send className="h-4 w-4 mr-2" />
                        Send
                      </Button>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground">
                      <p>
                        For your security, never share personal contact information until a transaction is agreed upon.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default MessagesPage;
