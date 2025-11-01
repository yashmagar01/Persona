import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { generatePersonalityResponse, isGeminiConfigured } from "@/lib/gemini";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
}

interface Conversation {
  id: string;
  title: string;
  personality_id: string;
  personalities: {
    display_name: string;
    avatar_url: string | null;
    era: string;
    speaking_style: string;
    short_bio: string;
    values_pillars: any;
  };
}

const Chat = () => {
  const { conversationId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
      fetchMessages();
    }
  }, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversation = async () => {
    try {
      // Check if this is a guest conversation
      if (conversationId?.startsWith('guest-')) {
        const guestData = localStorage.getItem(`guest-conversation-${conversationId}`);
        if (guestData) {
          const guestConv = JSON.parse(guestData);
          
          // Fetch personality data from database
          const { data: personality, error: personalityError } = await supabase
            .from("personalities")
            .select("*")
            .eq("id", guestConv.personality_id)
            .single();

          if (personalityError) throw personalityError;

          // Format to match expected structure
          setConversation({
            id: guestConv.id,
            title: guestConv.title,
            personality_id: guestConv.personality_id,
            personalities: personality
          } as any);
          return;
        }
      }

      // Regular authenticated user conversation
      const { data, error } = await supabase
        .from("conversations")
        .select(`
          *,
          personalities (
            display_name,
            avatar_url,
            era,
            speaking_style,
            short_bio,
            values_pillars
          )
        `)
        .eq("id", conversationId)
        .single();

      if (error) throw error;
      setConversation(data);
    } catch (error: any) {
      toast.error("Failed to load conversation");
      console.error(error);
      navigate("/chatboard");
    }
  };

  const fetchMessages = async () => {
    setIsFetchingMessages(true);
    try {
      // Handle guest conversations
      if (conversationId?.startsWith('guest-')) {
        const guestData = localStorage.getItem(`guest-conversation-${conversationId}`);
        if (guestData) {
          const guestConv = JSON.parse(guestData);
          setMessages(guestConv.messages || []);
        }
        return;
      }

      // Regular authenticated user messages
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error: any) {
      toast.error("Failed to load messages");
      console.error(error);
    } finally {
      setIsFetchingMessages(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim() || !conversationId || !conversation) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      // Check if Gemini is configured
      if (!isGeminiConfigured()) {
        toast.error("Gemini API not configured. Please add VITE_GEMINI_API_KEY to your .env file.");
        setIsLoading(false);
        setIsTyping(false);
        return;
      }

      let userMsg: Message;

      // Handle guest vs authenticated user
      if (conversationId.startsWith('guest-')) {
        // Guest user - store in localStorage
        userMsg = {
          id: `msg-${Date.now()}`,
          role: "user",
          content: userMessage,
          created_at: new Date().toISOString()
        } as Message;

        setMessages(prev => [...prev, userMsg]);
      } else {
        // Authenticated user - store in database
        const { data: dbUserMsg, error: userError } = await supabase
          .from("messages")
          .insert([
            {
              conversation_id: conversationId,
              role: "user",
              content: userMessage,
            }
          ])
          .select()
          .single();

        if (userError) throw userError;
        userMsg = dbUserMsg as Message;
        setMessages(prev => [...prev, userMsg]);
      }

      // Get conversation history for context (last 10 messages)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));

      // Generate AI response using Gemini
      const assistantContent = await generatePersonalityResponse(
        conversation.personalities,
        conversationHistory,
        userMessage
      );

      let aiMsg: Message;

      // Handle guest vs authenticated user
      if (conversationId.startsWith('guest-')) {
        // Guest user - store in localStorage
        aiMsg = {
          id: `msg-${Date.now()}`,
          role: "assistant",
          content: assistantContent,
          created_at: new Date().toISOString()
        } as Message;

        const updatedMessages = [...messages, userMsg, aiMsg];
        setMessages(updatedMessages);

        // Update localStorage
        const guestData = localStorage.getItem(`guest-conversation-${conversationId}`);
        if (guestData) {
          const guestConv = JSON.parse(guestData);
          guestConv.messages = updatedMessages;
          localStorage.setItem(`guest-conversation-${conversationId}`, JSON.stringify(guestConv));
        }
      } else {
        // Authenticated user - store in database
        const { data: dbAiMsg, error: insertError } = await supabase
          .from("messages")
          .insert([
            {
              conversation_id: conversationId,
              role: "assistant",
              content: assistantContent,
            }
          ])
          .select()
          .single();

        if (insertError) throw insertError;
        aiMsg = dbAiMsg as Message;
        setMessages(prev => [...prev, aiMsg]);
      }

      setIsTyping(false);
      toast.success(`${conversation.personalities.display_name} replied!`);
    } catch (error: any) {
      console.error('Chat error:', error);
      setIsTyping(false);
      
      // Show specific error messages
      if (error.message?.includes('Rate limit')) {
        toast.error("Rate limit exceeded. Please wait and try again.");
      } else if (error.message?.includes('API key')) {
        toast.error("Invalid API key. Please check your Gemini API configuration.");
      } else if (error.message?.includes('quota')) {
        toast.error("API quota exceeded. Please try again later.");
      } else {
        toast.error(error.message || "Failed to send message");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!conversation) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading conversation...</p>
        </div>
      </div>
    );
  }

  const personality = conversation.personalities;
  const valuesPillars = Array.isArray(personality.values_pillars) 
    ? personality.values_pillars.map(v => String(v))
    : [];

  return (
    <div className="h-screen bg-gradient-to-br from-background to-muted flex flex-col">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm flex-shrink-0">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/chatboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden flex-shrink-0">
                {personality.avatar_url ? (
                  <img 
                    src={personality.avatar_url} 
                    alt={personality.display_name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <h1 className="text-xl font-bold text-foreground">
                  {personality.display_name}
                </h1>
                <p className="text-sm text-muted-foreground">{personality.era}</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Guest User Banner */}
      {conversationId?.startsWith('guest-') && (
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border-b border-border flex-shrink-0">
          <div className="container mx-auto px-4 py-3 max-w-4xl">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-foreground">
                ✨ You're chatting as a <span className="font-semibold">guest</span>. Sign up to save your conversations!
              </p>
              <Button 
                size="sm" 
                onClick={() => navigate("/auth")}
                className="shrink-0"
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Personality Info Card */}
          <Card className="mb-6 p-6 bg-card/50 backdrop-blur-sm border-border">
            <div className="flex flex-wrap gap-2 mb-2">
              {valuesPillars.map((value, index) => (
                <Badge key={index} variant="secondary">
                  {value}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              I'm here to share insights about my life, values, and the era I lived in. Ask me anything!
            </p>
          </Card>

          {/* Messages */}
          {isFetchingMessages ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 px-4">
              <div className="inline-block bg-card border border-border rounded-2xl p-6 shadow-md max-w-md">
                <div className="mb-3 text-4xl">👋</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Welcome to your conversation with {personality.display_name}!
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {conversationId?.startsWith('guest-') 
                    ? "You're chatting as a guest. Start by asking a question or sharing your thoughts!"
                    : "Your conversation is ready! Ask anything and I'll respond in character."}
                </p>
                <p className="text-xs text-muted-foreground italic">
                  💡 Tip: Try asking about my life experiences, values, or era
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {messages.map((message) => {
                // Skip system messages or treat them as assistant
                const messageRole = message.role === "system" ? "assistant" : message.role;
                
                return (
                  <Message key={message.id} from={messageRole}>
                    {messageRole === "assistant" && (
                      <MessageAvatar 
                        src={personality.avatar_url || ""} 
                        name={personality.display_name}
                      />
                    )}
                    <MessageContent>
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      <p className="text-xs mt-2 opacity-70">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </p>
                    </MessageContent>
                    {messageRole === "user" && (
                      <MessageAvatar 
                        src="" 
                        name="You"
                      />
                    )}
                  </Message>
                );
              })}
              
              {/* Typing Indicator */}
              {isTyping && (
                <Message from="assistant">
                  <MessageAvatar 
                    src={personality.avatar_url || ""} 
                    name={personality.display_name}
                  />
                  <MessageContent>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">
                        {personality.display_name} is typing
                      </span>
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  </MessageContent>
                </Message>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="bg-card border-t border-border flex-shrink-0 sticky bottom-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-4xl">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 h-10 sm:h-auto"
              autoComplete="off"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !input.trim()}
              size="icon"
              className="h-10 w-10 sm:h-auto sm:w-auto sm:px-4"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
