import { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Send, Search, User, ArrowLeft, Clock, Check, MessageSquare } from "lucide-react";
import MainLayout from "@/components/layout/MainLayout";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { Loading } from "@/components/ui/loading";

interface Contact {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  latest_message: string;
  latest_timestamp: string;
  unread_count: number;
  user_id: string;
}

interface Message {
  id: string;
  content: string;
  created_at: string;
  sender_id: string;
  receiver_id: string;
  is_read: boolean;
  listing_id?: string;
  listing?: {
    id: string;
    title: string;
  };
}

const MessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeContact, setActiveContact] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [contactDetails, setContactDetails] = useState<any>(null);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const contactId = searchParams.get("contact");
    if (contactId) {
      setActiveContact(contactId);
    }
  }, [searchParams]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `receiver_id=eq.${user.id}`
        },
        async (payload: any) => {
          const newMessage = payload.new;
          
          if (activeContact === newMessage.sender_id) {
            setMessages(prev => [...prev, newMessage]);
            
            try {
              await supabase
                .from('messages')
                .update({ is_read: true })
                .eq('id', newMessage.id);
            } catch (error) {
              console.error('Error marking message as read:', error);
            }
          }
          
          fetchContacts();
          
          try {
            await supabase.from('notifications').insert({
              user_id: user.id,
              type: 'message',
              message: `New message from ${contactDetails?.full_name || 'a user'}`,
              metadata: {
                message_id: newMessage.id,
                sender_id: newMessage.sender_id,
              }
            });
          } catch (error) {
            console.error('Error creating notification:', error);
          }
        }
      )
      .subscribe();

    fetchContacts();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeContact, contactDetails]);

  useEffect(() => {
    if (activeContact) {
      fetchMessages(activeContact);
      fetchContactDetails(activeContact);
    }
  }, [activeContact]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const fetchContacts = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_user_conversations', {
        user_id: user.id
      });
      
      if (error) throw error;
      
      if (data) {
        setContacts(data);
        
        if (!activeContact && data.length > 0) {
          setActiveContact(data[0].user_id);
          setSearchParams({ contact: data[0].user_id });
        }
      }
    } catch (error) {
      console.error('Error fetching contacts:', error);
      toast({
        title: "Error loading contacts",
        description: "Failed to load your contacts. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (contactId: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          receiver_id,
          is_read,
          listing_id,
          listings:listing_id (
            id,
            title
          )
        `)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${contactId}),and(sender_id.eq.${contactId},receiver_id.eq.${user.id})`)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      setMessages(data || []);
      
      const unreadMessages = data?.filter(m => 
        m.receiver_id === user.id && !m.is_read
      ) || [];
      
      if (unreadMessages.length > 0) {
        try {
          await supabase
            .from('messages')
            .update({ is_read: true })
            .in('id', unreadMessages.map(m => m.id));
          
          fetchContacts();
        } catch (updateError) {
          console.error('Error marking messages as read:', updateError);
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Error loading messages",
        description: "Failed to load your messages. Please try again.",
        variant: "destructive"
      });
    }
  };

  const fetchContactDetails = async (contactId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', contactId)
        .single();
      
      if (error) throw error;
      
      setContactDetails(data);
    } catch (error) {
      console.error('Error fetching contact details:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!user || !activeContact || !newMessage.trim()) return;
    
    setSendingMessage(true);
    try {
      const hasContactInfo = /(\+?\d{10,}|@|email|phone|contact|whatsapp|telegram)/i.test(newMessage);
      
      const { data, error } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: activeContact,
          content: newMessage,
          has_contact_info: hasContactInfo
        })
        .select();
      
      if (error) throw error;
      
      if (data) {
        setMessages(prev => [...prev, data[0]]);
        setNewMessage("");
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error sending message",
        description: "Failed to send your message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSendingMessage(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { day: 'numeric', month: 'short' });
    }
    
    return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const filteredContacts = contacts.filter(contact => 
    contact.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!user) {
    return (
      <MainLayout>
        <div className="container py-12 text-center">
          <Alert className="max-w-md mx-auto">
            <AlertDescription>
              You need to be logged in to view your messages.
            </AlertDescription>
          </Alert>
          <Button className="mt-6" onClick={() => navigate("/login")}>
            Log In
          </Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Messages</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-7 gap-6">
          {activeContact && (
            <div className="md:hidden w-full mb-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  setActiveContact(null);
                  setSearchParams({});
                }}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to contacts
              </Button>
            </div>
          )}
          
          <Card className={`md:col-span-2 ${activeContact ? 'hidden md:block' : ''}`}>
            <CardHeader className="p-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search contacts..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="p-0 h-[calc(80vh-10rem)] overflow-y-auto">
              {loading ? (
                <div className="space-y-2 p-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-4 w-[100px]" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="py-12 text-center px-4">
                  <User className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery ? "No contacts match your search" : "No conversations yet"}
                  </p>
                  {!searchQuery && (
                    <Button 
                      variant="link" 
                      className="mt-2"
                      onClick={() => navigate("/listings")}
                    >
                      Browse listings to contact sellers
                    </Button>
                  )}
                </div>
              ) : (
                <div className="divide-y">
                  {filteredContacts.map((contact) => (
                    <div
                      key={contact.id}
                      className={`flex items-center space-x-4 p-4 cursor-pointer hover:bg-muted/50 transition-colors ${
                        activeContact === contact.user_id ? 'bg-muted' : ''
                      }`}
                      onClick={() => {
                        setActiveContact(contact.user_id);
                        setSearchParams({ contact: contact.user_id });
                      }}
                    >
                      <Avatar>
                        <AvatarFallback>
                          {(contact.full_name?.charAt(0) || 'U').toUpperCase()}
                        </AvatarFallback>
                        {contact.avatar_url && (
                          <AvatarImage src={contact.avatar_url} />
                        )}
                      </Avatar>
                      <div className="flex-1 overflow-hidden">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium truncate">
                            {contact.full_name || 'User'}
                          </h3>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {formatTime(contact.latest_timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {contact.latest_message}
                        </p>
                      </div>
                      {contact.unread_count > 0 && (
                        <Badge>{contact.unread_count}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card className={`md:col-span-5 ${!activeContact ? 'hidden md:block' : ''}`}>
            {activeContact ? (
              <>
                <CardHeader className="p-4 border-b flex-row items-center justify-between space-y-0">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarFallback>
                        {(contactDetails?.full_name?.charAt(0) || 'U').toUpperCase()}
                      </AvatarFallback>
                      {contactDetails?.avatar_url && (
                        <AvatarImage src={contactDetails.avatar_url} />
                      )}
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg">
                        {contactDetails?.full_name || 'User'}
                      </CardTitle>
                      <CardDescription>
                        {contactDetails?.email || ''}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0">
                  <div className="h-[calc(80vh-15rem)] overflow-y-auto p-4">
                    {messages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                          <MessageSquare className="h-6 w-6 text-primary" />
                        </div>
                        <h3 className="font-medium mb-1">No messages yet</h3>
                        <p className="text-sm text-muted-foreground">
                          Send a message to start the conversation
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message, index) => {
                          const isCurrentUser = message.sender_id === user.id;
                          const showDate = index === 0 || 
                            new Date(message.created_at).toDateString() !== 
                            new Date(messages[index - 1].created_at).toDateString();
                          
                          return (
                            <div key={message.id}>
                              {showDate && (
                                <div className="flex justify-center my-4">
                                  <div className="bg-muted px-3 py-1 rounded-full text-xs">
                                    {new Date(message.created_at).toLocaleDateString([], {
                                      weekday: 'long',
                                      day: 'numeric',
                                      month: 'long',
                                      year: 'numeric'
                                    })}
                                  </div>
                                </div>
                              )}
                              
                              <div
                                className={`flex ${
                                  isCurrentUser ? 'justify-end' : 'justify-start'
                                }`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-lg p-3 ${
                                    isCurrentUser
                                      ? 'bg-primary text-primary-foreground'
                                      : 'bg-muted'
                                  }`}
                                >
                                  {message.listing && (
                                    <div 
                                      className={`text-xs mb-1 ${
                                        isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                      }`}
                                    >
                                      Re: {message.listing.title}
                                    </div>
                                  )}
                                  <div className="text-sm">{message.content}</div>
                                  <div 
                                    className={`text-xs mt-1 flex items-center justify-end space-x-1 ${
                                      isCurrentUser ? 'text-primary-foreground/70' : 'text-muted-foreground'
                                    }`}
                                  >
                                    <span>{formatTime(message.created_at)}</span>
                                    {isCurrentUser && (
                                      <Check className={`h-3 w-3 ${message.is_read ? 'opacity-100' : 'opacity-40'}`} />
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 border-t">
                  <form 
                    className="flex w-full items-end gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                  >
                    <Textarea
                      placeholder="Type your message..."
                      className="flex-1 min-h-[80px]"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <Button 
                      type="submit" 
                      size="icon" 
                      disabled={!newMessage.trim() || sendingMessage}
                    >
                      {sendingMessage ? (
                        <div className="animate-spin">
                          <Clock className="h-4 w-4" />
                        </div>
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </CardFooter>
              </>
            ) : (
              <CardContent className="flex flex-col items-center justify-center py-24 px-4 text-center">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-medium mb-2">Your Messages</h3>
                <p className="text-muted-foreground mb-6 max-w-md">
                  Select a conversation from the sidebar or start a new one by contacting a seller from a listing.
                </p>
                <Button onClick={() => navigate("/listings")}>
                  Browse Listings
                </Button>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </MainLayout>
  );
};

export default MessagesPage;
