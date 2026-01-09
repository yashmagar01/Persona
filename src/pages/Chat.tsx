import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getConversationWithPersonality, getPersonalityById, getConversationMessages, createMessage, updateConversationTimestamp } from "@/db/services";
import { useConversationDraft } from "@/features/chat/hooks/useChatStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Send, Loader2, User, Info, Share2, X, Mic, Paperclip, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { generatePersonalityResponse, isGroqConfigured } from "@/lib/groq";
import { Message, MessageAvatar, MessageContent } from "@/components/ui/message";
import { MessageAudio } from "@/components/ui/message-audio";
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

// Personality image mapping - same as Landing page
const PERSONALITY_IMAGES: Record<string, string> = {
  "Mahatma Gandhi": "https://blogcdn.aakash.ac.in/wordpress_media/2024/08/Mahatma-Gandhi.jpg",
  "Chhatrapati Shivaji Maharaj": "https://www.shivajicollege.ac.in/img/chhtraptishivaji.jpg",
  "Shivaji Maharaj": "https://www.shivajicollege.ac.in/img/chhtraptishivaji.jpg",
  "Rani Lakshmibai": "https://images1.dnaindia.com/images/DNA-EN/900x1600/2023/7/5/1688549461607_qwee024vv81.jpg",
  "Rani Laxmibai": "https://images1.dnaindia.com/images/DNA-EN/900x1600/2023/7/5/1688549461607_qwee024vv81.jpg",
  "Netaji Subhas Chandra Bose": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Subhas_Chandra_Bose_NRB.jpg/800px-Subhas_Chandra_Bose_NRB.jpg",
  "Netaji Bose": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Subhas_Chandra_Bose_NRB.jpg/800px-Subhas_Chandra_Bose_NRB.jpg",
  "Dr. APJ Abdul Kalam": "https://cdn.britannica.com/48/222648-050-F4D0A2D8/President-of-India-A-P-J-Abdul-Kalam-2007.jpg",
  "APJ Abdul Kalam": "https://cdn.britannica.com/48/222648-050-F4D0A2D8/President-of-India-A-P-J-Abdul-Kalam-2007.jpg",
  "Swami Vivekananda": "https://indiwiki.com/wp-content/uploads/2025/07/86757ae05e5df302097a810ae0933ec1.jpg",
  "Bhagat Singh": "https://resize.indiatvnews.com/en/resize/newbucket/1200_-/2017/09/bhagatsingh-1506598593.jpg",
  "Dr. B.R. Ambedkar": "https://ambedkarinternationalcenter.org/wp-content/uploads/2020/11/DrAmbedkar1.jpg",
  "Dr Ambedkar": "https://ambedkarinternationalcenter.org/wp-content/uploads/2020/11/DrAmbedkar1.jpg",
  "B.R. Ambedkar": "https://ambedkarinternationalcenter.org/wp-content/uploads/2020/11/DrAmbedkar1.jpg",
  "Rani Durgavati": "https://d18x2uyjeekruj.cloudfront.net/wp-content/uploads/2023/06/durgawati.jpg",
  "Savitribai Phule": "https://vajiramandravi.com/current-affairs/wp-content/uploads/2025/04/savitribai_phule.webp",
  "Chanakya": "https://miro.medium.com/1*l-uCTj8NEeZ-N47y9Kk4wQ.png",
};

// Helper function to get personality image
const getPersonalityImage = (displayName: string, avatarUrl: string | null): string | null => {
  // First, try to find exact match
  if (PERSONALITY_IMAGES[displayName]) {
    return PERSONALITY_IMAGES[displayName];
  }
  
  // Try partial match (case insensitive)
  const normalizedName = displayName.toLowerCase();
  for (const [key, value] of Object.entries(PERSONALITY_IMAGES)) {
    if (normalizedName.includes(key.toLowerCase()) || key.toLowerCase().includes(normalizedName)) {
      return value;
    }
  }
  
  // Fallback to database avatar_url
  return avatarUrl;
};

interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  audio_url?: string; // Google TTS audio URL
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
  const [isRecording, setIsRecording] = useState(false);
  const [showRateLimitWarning, setShowRateLimitWarning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Use draft store for input persistence
  const { draft, setDraft, clearDraft } = useConversationDraft(conversationId || 'temp');
  const [input, setInput] = useState("");
  
  const MAX_CHARS = 500;

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

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 24 * 4; // 4 lines (approx 24px per line)
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  }, [input]);

  const fetchConversation = async () => {
    try {
      // Check if this is a guest conversation
      if (conversationId?.startsWith('guest-')) {
        const guestData = localStorage.getItem(`guest-conversation-${conversationId}`);
        if (guestData) {
          const guestConv = JSON.parse(guestData);
          
          // Fetch personality data from database
          const personality = await getPersonalityById(guestConv.personality_id);

          if (!personality) throw new Error('Personality not found');

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
      const data = await getConversationWithPersonality(conversationId!);

      if (!data) throw new Error('Conversation not found');
      setConversation(data as any);
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
      const data = await getConversationMessages(conversationId!);
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
      // Check if Groq is configured
      if (!isGroqConfigured()) {
        toast.error("Groq API not configured. Please add VITE_GROQ_API_KEY to your .env file.");
        setIsLoading(false);
        setIsTyping(false);
        return;
      }

      let userMsg: Message;

      // Helper to bump conversation's last activity timestamp
      const touchConversation = async () => {
        try {
          if (!conversationId.startsWith('guest-')) {
            await updateConversationTimestamp(conversationId);
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
        const dbUserMsg = await createMessage(conversationId, "user", userMessage);

        if (!dbUserMsg) throw new Error('Failed to create message');
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

      // Generate AI response using Groq (Llama 3.3)
      let assistantContent: string;
      let audioUrl: string | undefined;
      
      try {
        assistantContent = await generatePersonalityResponse(
          conversation.personalities,
          conversationHistory,
          userMessage
        );

        // TTS generation removed - Supabase edge function no longer available
        // TTS can be re-added later with a different service if needed
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
          audio_url: audioUrl,
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
        const dbAiMsg = await createMessage(conversationId, "assistant", assistantContent, audioUrl);

        if (!dbAiMsg) throw new Error('Failed to save message');
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
        setShowRateLimitWarning(true);
        toast.error(error.message || "Rate limit exceeded. Please wait 10-15 seconds and try again.", {
          duration: 5000,
        });
        // Auto-hide warning after 15 seconds
        setTimeout(() => setShowRateLimitWarning(false), 15000);
      } else if (error.message?.includes('API key')) {
        toast.error("Invalid API key. Please check your Groq API configuration.");
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
    // Focus the textarea field
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 100);
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf,.doc,.docx,.txt';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        toast.success(`File selected: ${file.name}`);
        // TODO: Implement file upload logic
      }
    };
    input.click();
  };

  const handleVoiceInput = async () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast.error("Voice input is not supported in your browser");
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    try {
      setIsRecording(true);
      // @ts-ignore - SpeechRecognition types
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(prev => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
      };
      
      recognition.onerror = () => {
        toast.error("Could not capture voice input");
        setIsRecording(false);
      };
      
      recognition.onend = () => {
        setIsRecording(false);
      };
      
      recognition.start();
    } catch (error) {
      toast.error("Failed to start voice input");
      setIsRecording(false);
    }
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
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
            {/* Back Button with Hover Effect */}
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate("/chatboard")}
              className="hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200 h-8 w-8 sm:h-10 sm:w-10 touch-manipulation flex-shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            
            <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
              {/* Avatar with Online Status Indicator */}
              <div className="relative w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden flex-shrink-0">
                {(() => {
                  const imageUrl = getPersonalityImage(personality.display_name, personality.avatar_url);
                  return imageUrl ? (
                    <img 
                      src={imageUrl} 
                      alt={personality.display_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                  );
                })()}
                {/* Green Online/Active Status Dot - More Prominent */}
                <div className="absolute bottom-0 right-0 w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full border-2 sm:border-[3px] border-card shadow-lg animate-pulse" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 sm:gap-2">
                  <h1 className="text-base sm:text-lg md:text-xl font-bold text-foreground truncate">
                    {personality.display_name}
                  </h1>
                  {/* Info Button - Opens Bio Modal */}
                  <Dialog open={isBioModalOpen} onOpenChange={setIsBioModalOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6 sm:h-7 sm:w-7 hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200 touch-manipulation flex-shrink-0"
                      >
                        <Info className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto mx-3 sm:mx-0">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden">
                            {(() => {
                              const imageUrl = getPersonalityImage(personality.display_name, personality.avatar_url);
                              return imageUrl ? (
                                <img 
                                  src={imageUrl} 
                                  alt={personality.display_name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <User className="w-6 h-6 text-white" />
                                </div>
                              );
                            })()}
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
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{personality.era}</p>
              </div>

              {/* Share Conversation Button */}
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleShareConversation}
                className="gap-1.5 sm:gap-2 hover:bg-accent hover:scale-105 active:scale-95 transition-all duration-200 h-8 sm:h-9 px-2 sm:px-3 touch-manipulation flex-shrink-0"
              >
                <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Rate Limit Warning Banner */}
      {showRateLimitWarning && (
        <div 
          className={cn(
            "bg-gradient-to-r from-amber-500/15 to-orange-500/15 border-b border-amber-500/30 flex-shrink-0",
            "animate-in slide-in-from-top duration-300"
          )}
        >
          <div className="container mx-auto px-3 sm:px-4 py-2.5 sm:py-3 max-w-4xl">
            <Alert className="bg-transparent border-0 p-0">
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <AlertDescription className="text-xs sm:text-sm text-foreground ml-2">
                <span className="font-semibold">Rate limit reached.</span> Please wait 10-15 seconds before sending another message. 
                <span className="hidden sm:inline"> We're using Google's free tier which has strict limits.</span>
              </AlertDescription>
            </Alert>
          </div>
        </div>
      )}

      {/* Guest User Banner - Dismissible with Slide-down Animation */}
      {conversationId?.startsWith('guest-') && showGuestBanner && (
        <div 
          className={cn(
            "bg-gradient-to-r from-orange-500/10 to-amber-500/10 border-b border-orange-500/20 flex-shrink-0",
            "animate-in slide-in-from-top duration-300",
            "transition-all"
          )}
        >
          <div className="container mx-auto px-3 sm:px-4 py-2 sm:py-3 max-w-4xl">
            <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4">
              <p className="text-xs sm:text-sm text-foreground flex-1 min-w-0">
                ✨ You're chatting as a <span className="font-semibold text-orange-600 dark:text-orange-400">guest</span>. <span className="hidden sm:inline">Sign up to save your conversations!</span>
              </p>
              <Button 
                size="sm" 
                onClick={() => navigate("/auth")}
                className="shrink-0 bg-orange-500 hover:bg-orange-600 text-white text-xs sm:text-sm h-7 sm:h-8 px-2 sm:px-3 touch-manipulation"
              >
                Sign Up<span className="hidden sm:inline"> Free</span>
              </Button>
              {/* Dismiss Button with X Icon */}
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 hover:bg-orange-500/20 hover:text-orange-600 touch-manipulation"
                onClick={() => setShowGuestBanner(false)}
              >
                <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="sr-only">Dismiss</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Messages Area with Conversation Component */}
      <div className="flex-1 relative bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 overflow-hidden">
        <Conversation className="h-full overflow-y-auto">
          <ConversationContent className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 max-w-4xl">
            {/* Personality Info Card */}
            <Card className="mb-4 sm:mb-6 p-4 sm:p-5 md:p-6 bg-card/50 backdrop-blur-sm border-border">
              <div className="flex flex-wrap gap-1 sm:gap-1.5 md:gap-2 mb-2">
                {valuesPillars.map((value, index) => (
                  <Badge key={index} variant="secondary" className="text-[10px] sm:text-xs">
                    {value}
                  </Badge>
                ))}
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
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
                  <div className="mt-6 sm:mt-8 space-y-3 sm:space-y-4">
                    <p className="text-xs sm:text-sm font-medium text-muted-foreground text-center px-2">
                      💬 Suggested questions to get started:
                    </p>
                    <div className="flex flex-wrap gap-2 sm:gap-3 justify-center max-w-3xl mx-auto px-2">
                      {conversationStarters.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={cn(
                            "px-3 sm:px-4 py-2 sm:py-2.5 rounded-full",
                            "border-2 border-primary/20 bg-card hover:bg-primary/5",
                            "text-xs sm:text-sm text-foreground",
                            "transition-all duration-200",
                            "hover:border-primary/40 hover:scale-105 hover:shadow-md",
                            "active:scale-95",
                            "cursor-pointer touch-manipulation",
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
                          src={getPersonalityImage(personality.display_name, personality.avatar_url) || ""} 
                          name={personality.display_name}
                        />
                      )}
                      <MessageContent>
                        <Response className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none prose-p:text-current prose-headings:text-current prose-strong:font-semibold prose-strong:text-[#ececec] prose-em:italic prose-em:text-[#ececec] prose-li:text-current prose-a:text-primary prose-a:underline hover:prose-a:text-primary/80 prose-code:text-[#ececec] prose-code:bg-[#2f2f2f] prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-[#1e1e1e] prose-pre:border prose-pre:border-[rgba(77,77,77,0.2)]">
                          {message.content}
                        </Response>
                        
                        {/* Audio Player for Assistant Messages */}
                        {messageRole === "assistant" && message.audio_url && (
                          <MessageAudio 
                            audioUrl={message.audio_url} 
                            autoPlay={false}
                          />
                        )}
                        
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
                
                {/* Typing Indicator while AI is generating response */}
                {isTyping && (
                  <div className="flex items-center gap-3 py-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden flex-shrink-0">
                      {(() => {
                        const imageUrl = getPersonalityImage(personality.display_name, personality.avatar_url);
                        return imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={personality.display_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-5 h-5 text-white" />
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex flex-col gap-1">
                      <p className="text-sm text-muted-foreground italic">
                        {personality.display_name} is typing...
                      </p>
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </ConversationContent>
          <ConversationScrollButton />
        </Conversation>
      </div>

      {/* Grok-style Input Area - Fixed at bottom */}
      <div className="bg-background/95 backdrop-blur-xl border-t border-border/40 flex-shrink-0 sticky bottom-0 z-10">
        <div className="container mx-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3 md:py-4 max-w-4xl">
          <form onSubmit={handleSendMessage} className="space-y-1.5 sm:space-y-2">
            {/* Main Input Container - Grok Style */}
            <div className={cn(
              "relative rounded-2xl sm:rounded-3xl bg-card border transition-all duration-200",
              "hover:border-border",
              input.length > 0 ? "border-orange-500/50 shadow-[0_0_0_3px_rgba(249,115,22,0.1)]" : "border-border/60"
            )}>
              {/* Input Row */}
              <div className="flex items-end gap-1.5 sm:gap-2 px-2 sm:px-3 md:px-4 py-2 sm:py-2.5 md:py-3">
                {/* File Upload Button - Grok Style */}
                <button
                  type="button"
                  onClick={handleFileUpload}
                  className="flex-shrink-0 p-1.5 sm:p-2 hover:bg-accent rounded-full transition-colors disabled:opacity-50 touch-manipulation hidden sm:flex"
                  disabled={isLoading}
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
                </button>

                {/* Auto-resize Textarea */}
                <div className="relative flex-1">
                  <textarea
                    ref={textareaRef}
                    value={input}
                    onChange={(e) => {
                      const newValue = e.target.value;
                      
                      // Enforce character limit
                      if (newValue.length <= MAX_CHARS) {
                        setInput(newValue);
                        
                        // Hide suggestions when user starts typing
                        if (newValue.length > 0 && showSuggestions) {
                          setShowSuggestions(false);
                        }
                        
                        // Persist draft
                        if (conversationId) {
                          setDraft(newValue);
                        }
                      }
                    }}
                    onKeyDown={(e) => {
                      // Submit on Enter, new line on Shift+Enter
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (input.trim()) {
                          handleSendMessage(e as any);
                        }
                      }
                    }}
                    placeholder="What do you want to know?"
                    disabled={isLoading}
                    className={cn(
                      "w-full bg-transparent resize-none outline-none",
                      "text-xs sm:text-sm placeholder:text-muted-foreground",
                      "min-h-[20px] sm:min-h-[24px] max-h-[80px] sm:max-h-[96px] py-0.5",
                      "disabled:opacity-50"
                    )}
                    rows={1}
                    style={{ scrollbarWidth: 'thin' }}
                  />
                  
                  {/* Character Counter */}
                  {input.length > 0 && (
                    <div className={cn(
                      "absolute -bottom-4 sm:-bottom-5 right-0 text-[10px] sm:text-xs transition-colors",
                      input.length >= MAX_CHARS * 0.9 ? "text-orange-500 font-semibold" : "text-muted-foreground/60"
                    )}>
                      {input.length}/{MAX_CHARS}
                    </div>
                  )}
                </div>

                {/* Voice Input Button - Grok Style */}
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={cn(
                    "flex-shrink-0 w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-50 touch-manipulation hidden sm:flex",
                    isRecording 
                      ? "bg-black text-white hover:bg-black/90" 
                      : "hover:bg-accent text-muted-foreground"
                  )}
                  disabled={isLoading}
                  title={isRecording ? "Stop recording" : "Voice input"}
                >
                  {isRecording ? (
                    <div className="relative flex items-center justify-center">
                      <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-white animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    <Mic className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>

                {/* Send Button - Grok Style */}
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={cn(
                    "flex-shrink-0 p-2 sm:p-2.5 rounded-full transition-all duration-200 touch-manipulation",
                    "disabled:opacity-40 disabled:cursor-not-allowed",
                    input.trim() && !isLoading
                      ? "bg-orange-500 hover:bg-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-105 active:scale-95"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Chat;
