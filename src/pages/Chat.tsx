import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useConversationDraft } from "@/features/chat/hooks/useChatStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Loader2, User, Info, Share2, X } from "lucide-react";
import { toast } from "sonner";
import { generatePersonalityResponse, isGeminiConfigured } from "@/lib/gemini";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import { Conversation, ConversationContent, ConversationEmptyState, ConversationScrollButton } from "@/components/ui/conversation";
import { Response } from "@/components/ui/response";
import { MessageSkeleton } from "@/features/chat/components/MessageList/MessageSkeleton";
import { ChatLoadingSkeleton } from "@/components/ChatLoadingSkeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMessages, setIsFetchingMessages] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [showGuestBanner, setShowGuestBanner] = useState(true);
  const [isBioModalOpen, setIsBioModalOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  
  // Use draft store for input persistence
  const { draft, setDraft, clearDraft } = useConversationDraft(conversationId || 'temp');
  const [input, setInput] = useState("");

  // Restore draft when conversation loads
  useEffect(() => {
    if (conversationId && draft) {
      setInput(draft);
    }
  }, [conversationId, draft]);

  useEffect(() => {
    if (conversationId) {
      fetchConversation();
      fetchMessages();
    }
  }, [conversationId]);

  // Hide suggestions when messages are present
  useEffect(() => {
    if (messages.length > 0) {
      setShowSuggestions(false);
    }
  }, [messages.length]);

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
    clearDraft(); // Clear persisted draft when sending
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

      // Helper to bump conversation's last activity timestamp
      const touchConversation = async () => {
        try {
          if (!conversationId.startsWith('guest-')) {
            await supabase
              .from("conversations")
              .update({ updated_at: new Date().toISOString() })
              .eq("id", conversationId);
          }
        } catch (err) {
          // Non-fatal: log but don't block chat flow
          console.warn('Failed to update conversation timestamp', err);
        }
      };

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

        // Update last activity timestamp for conversation
        await touchConversation();
      }

      // Get conversation history for context (last 10 messages)
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content
      }));

      // Generate AI response using Gemini with retry logic
      let assistantContent: string;
      try {
        assistantContent = await generatePersonalityResponse(
          conversation.personalities,
          conversationHistory,
          userMessage
        );
      } catch (error: any) {
        // Handle rate limit errors gracefully
        if (error.message?.includes('Rate limit')) {
          throw new Error(`${conversation.personalities.display_name} is experiencing high demand. Please wait 10-15 seconds and try again.`);
        }
        throw error;
      }

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

        // Touch conversation again to reflect assistant reply time
        await touchConversation();
      }

      setIsTyping(false);
      toast.success(`${conversation.personalities.display_name} replied!`);
    } catch (error: any) {
      console.error('Chat error:', error);
      setIsTyping(false);
      
      // Show specific error messages
      if (error.message?.includes('Rate limit') || error.message?.includes('high demand')) {
        toast.error(error.message || "Rate limit exceeded. Please wait 10-15 seconds and try again.", {
          duration: 5000,
        });
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
    return <ChatLoadingSkeleton />;
  }

  const personality = conversation.personalities;
  const valuesPillars = Array.isArray(personality.values_pillars) 
    ? personality.values_pillars.map(v => String(v))
    : [];

  // Generate conversation starters based on personality
  const generateConversationStarters = (): string[] => {
    const name = personality.display_name;
    const era = personality.era;
    const values = valuesPillars;

    // Base suggestions that work for most personalities
    const baseStarters = [
      `What was life like during ${era}?`,
      `What inspired your ${values[0] || 'beliefs'}?`,
      `Can you share a pivotal moment from your life?`,
      `What advice would you give to today's generation?`,
    ];

    // Personality-specific starters (can be expanded with more personalities)
    const specificStarters: { [key: string]: string[] } = {
      'Mahatma Gandhi': [
        'What inspired your non-violence philosophy?',
        'How did Satyagraha transform India?',
        'What was your relationship with other freedom fighters?',
        'How did your time in South Africa shape your views?',
      ],
      'Bhagat Singh': [
        'What motivated you to fight for independence?',
        'How did you develop your revolutionary ideas?',
        'What message would you give to young revolutionaries?',
        'Can you tell me about your final days?',
      ],
      'Chhatrapati Shivaji': [
        'How did you build the Maratha Empire?',
        'What was your strategy against the Mughals?',
        'How did you treat your subjects and army?',
        'What inspired your administrative reforms?',
      ],
      'Rani Lakshmibai': [
        'What drove you to lead the 1857 rebellion?',
        'How did you balance being a queen and warrior?',
        'What was your training in martial arts like?',
        'How did you inspire your troops?',
      ],
      'Dr. B.R. Ambedkar': [
        'How did you fight against caste discrimination?',
        'What was your vision for the Indian Constitution?',
        'How did education transform your life?',
        'What inspired your Buddhist conversion?',
      ],
      'Swami Vivekananda': [
        'How did your Chicago speech impact the world?',
        'What was your relationship with Ramakrishna?',
        'How can spirituality coexist with modernity?',
        'What is your message for youth empowerment?',
      ],
    };

    // Return specific starters if available, otherwise use base starters
    return specificStarters[name] || baseStarters;
  };

  const conversationStarters = generateConversationStarters().slice(0, 4);

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
    // Focus the input field
    setTimeout(() => {
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
      if (inputElement) {
        inputElement.focus();
      }
    }, 100);
  };

  const handleShareConversation = () => {
    const shareUrl = `${window.location.origin}/chat/${conversationId}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Chat with ${personality.display_name}`,
        text: `Check out my conversation with ${personality.display_name} on Persona!`,
        url: shareUrl,
      }).catch(() => {
        // Fallback to clipboard if share fails
        navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      });
    } else {
      // Fallback to clipboard
      navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard!");
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-background to-muted flex flex-col overflow-hidden">
      {/* Header - Fixed at Top */}
      <header className="flex-shrink-0 bg-card border-b border-border shadow-md z-30 backdrop-blur-md bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Back Button with Hover Effect */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/chatboard")}
              className="hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-3 flex-1">
              {/* Avatar with Online Status Indicator */}
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden flex-shrink-0">
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
                {/* Green Online/Active Status Dot - More Prominent */}
                <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 rounded-full border-[3px] border-card shadow-lg animate-pulse" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-bold text-foreground truncate">
                    {personality.display_name}
                  </h1>
                  {/* Info Button - Opens Bio Modal */}
                  <Dialog open={isBioModalOpen} onOpenChange={setIsBioModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-7 w-7 hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200"
                      >
                        <Info className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden">
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
                          <div>
                            <div className="text-xl font-bold">{personality.display_name}</div>
                            <div className="text-sm font-normal text-muted-foreground">{personality.era}</div>
                          </div>
                        </DialogTitle>
                        <DialogDescription className="space-y-4 pt-4">
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2">Biography</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {personality.short_bio}
                            </p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-semibold text-foreground mb-2">Speaking Style</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {personality.speaking_style}
                            </p>
                          </div>
                          
                          {valuesPillars.length > 0 && (
                            <div>
                              <h3 className="text-sm font-semibold text-foreground mb-2">Values & Pillars</h3>
                              <div className="flex flex-wrap gap-2">
                                {valuesPillars.map((value, index) => (
                                  <Badge key={index} variant="secondary">
                                    {value}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
                <p className="text-sm text-muted-foreground">{personality.era}</p>
              </div>

              {/* Share Conversation Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShareConversation}
                className="gap-2 hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200"
              >
                <Share2 className="h-4 w-4" />
                <span className="hidden sm:inline">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Guest User Banner - Dismissible with Slide-down Animation */}
      {conversationId?.startsWith('guest-') && showGuestBanner && (
        <div 
          className={cn(
            "bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b border-orange-500/20 flex-shrink-0",
            "animate-in slide-in-from-top duration-300",
            "transition-all"
          )}
        >
          <div className="container mx-auto px-4 py-3 max-w-4xl">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm text-foreground flex-1">
                ✨ You're chatting as a <span className="font-semibold text-orange-600 dark:text-orange-400">guest</span>. Sign up to save your conversations!
              </p>
              <Button 
                size="sm" 
                onClick={() => navigate("/auth")}
                className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white"
              >
                Sign Up Free
              </Button>
              {/* Dismiss Button with X Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 shrink-0 hover:bg-orange-500/20 hover:text-orange-600"
                onClick={() => setShowGuestBanner(false)}
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area with Conversation Component */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 overflow-hidden">
        <Conversation className="h-full overflow-y-auto">
          <ConversationContent className="container mx-auto px-4 py-6 max-w-4xl">
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
              <>
                <ConversationEmptyState
                  icon={<div className="text-6xl">👋</div>}
                  title={`Welcome to your conversation with ${personality.display_name}!`}
                  description={
                    conversationId?.startsWith('guest-')
                      ? "You're chatting as a guest. Start by asking a question or sharing your thoughts!"
                      : "Your conversation is ready! Ask anything and I'll respond in character."
                  }
                >
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground italic">
                      💡 Tip: Try asking about my life experiences, values, or era
                    </p>
                  </div>
                </ConversationEmptyState>

                {/* Conversation Starter Suggestions */}
                {showSuggestions && (
                  <div className="mt-8 space-y-4">
                    <p className="text-sm font-medium text-muted-foreground text-center">
                      💬 Suggested questions to get started:
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center max-w-3xl mx-auto">
                      {conversationStarters.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={cn(
                            "px-4 py-2.5 rounded-full",
                            "border-2 border-primary/20 bg-card hover:bg-primary/5",
                            "text-sm text-foreground",
                            "transition-all duration-200",
                            "hover:border-primary/40 hover:scale-105 hover:shadow-md",
                            "active:scale-95",
                            "cursor-pointer",
                            "animate-in fade-in slide-in-from-bottom-2"
                          )}
                          style={{
                            animationDelay: `${index * 100}ms`,
                            animationFillMode: 'backwards'
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </>
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
                        <Response className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:text-current prose-headings:text-current prose-strong:font-semibold prose-strong:text-[#ececec] prose-em:italic prose-em:text-[#ececec] prose-li:text-current prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80 prose-code:text-[#ececec] prose-code:bg-[#2f2f2f] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-[rgba(77,77,77,0.2)]">
                          {message.content}
                        </Response>
                        <p className="text-xs mt-1.5 opacity-80 font-normal">
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
                
                {/* Loading Skeleton while AI is generating response */}
                {isTyping && <MessageSkeleton from="assistant" />}
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Input Area - Fixed at bottom */}
      <div className="bg-card border-t border-border flex-shrink-0 sticky bottom-0 z-10 shadow-lg">
        <div className="container mx-auto px-4 py-3 sm:py-4 max-w-4xl">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => {
                const newValue = e.target.value;
                setInput(newValue);
                
                // Hide suggestions when user starts typing their own message
                if (newValue.length > 0 && showSuggestions) {
                  setShowSuggestions(false);
                }
                
                // Persist draft to store (debounced in real usage)
                if (conversationId) {
                  setDraft(newValue);
                }
              }}
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
