import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LogOut, MessageSquare, Search, User, Info } from "lucide-react";
import { toast } from "sonner";
import { showAuthToast } from "@/lib/toast-notifications";
import { PersonalityGridSkeleton } from "@/components/PersonalityCardSkeleton";

interface Personality {
  id: string;
  slug: string;
  display_name: string;
  era: string;
  short_bio: string;
  speaking_style: string;
  values_pillars: string[];
  avatar_url: string | null;
}

// Helper function to get badge color variant based on index
const getBadgeColorClass = (index: number) => {
  const colors = [
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/20", // Primary
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20 hover:bg-green-500/20", // Primary
    "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20 hover:bg-blue-500/20",     // Secondary
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20 hover:bg-purple-500/20" // Tertiary
  ];
  return colors[index] || colors[colors.length - 1];
};

const Chatboard = () => {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [filteredPersonalities, setFilteredPersonalities] = useState<Personality[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkUser();
    fetchPersonalities();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredPersonalities(personalities);
    } else {
      const filtered = personalities.filter((p) =>
        p.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.era.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.short_bio.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredPersonalities(filtered);
    }
  }, [searchQuery, personalities]);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user ?? null);
  };

  const fetchPersonalities = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("personalities")
        .select("*")
        .order("display_name");

      if (error) throw error;
      
      // Transform data to match our interface
      const transformedData = (data || []).map(p => ({
        ...p,
        values_pillars: Array.isArray(p.values_pillars) 
          ? p.values_pillars.map(v => String(v))
          : []
      })) as Personality[];
      
      setPersonalities(transformedData);
      setFilteredPersonalities(transformedData);
    } catch (error: any) {
      toast.error("Failed to load personalities");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const handleStartChat = async (personalityId: string, displayName: string) => {
    // Allow guest users - navigate to chat in guest mode
    if (!user) {
      // Create a guest conversation ID
      const guestConversationId = `guest-${personalityId}-${Date.now()}`;
      
      // Store guest conversation info in localStorage
      localStorage.setItem(`guest-conversation-${guestConversationId}`, JSON.stringify({
        id: guestConversationId,
        personality_id: personalityId,
        display_name: displayName,
        title: `Chat with ${displayName}`,
        created_at: new Date().toISOString(),
        messages: []
      }));
      
      // Navigate directly without toast (we'll show welcome message in chat page)
      navigate(`/chat/${guestConversationId}`);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("conversations")
        .insert([
          {
            user_id: user.id,
            personality_id: personalityId,
            title: `Chat with ${displayName}`,
          }
        ])
        .select()
        .single();

      if (error) throw error;

      navigate(`/chat/${data.id}`);
    } catch (error: any) {
      toast.error("Failed to start conversation");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Historical Chatboard
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant={user ? "ghost" : "outline"}
              size="sm" 
              onClick={async (e) => {
                e.preventDefault();
                console.log('🔍 Chatboard: Checking auth for My Conversations...');
                
                const { data: { session } } = await supabase.auth.getSession();
                
                if (!session) {
                  console.log('❌ Chatboard: No session - BLOCKING navigation');
                  console.log('Toast triggered!');
                  showAuthToast();
                  setTimeout(() => {
                    console.log('🔄 Chatboard: Redirecting to auth...');
                    navigate("/auth");
                  }, 2000);
                } else {
                  console.log('✅ Chatboard: User authenticated - navigating');
                  navigate("/conversations");
                }
              }}
            >
              My Conversations
            </Button>
            
            {user ? (
              <Button variant="ghost" size="icon" onClick={handleSignOut}>
                <LogOut className="w-4 h-4" />
              </Button>
            ) : (
              <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Choose Your Guide
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
            Select a historical personality to begin your conversation and learn from their wisdom
          </p>

          {/* Search */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by name, era, or values..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Personalities Grid */}
        {isLoading ? (
          <PersonalityGridSkeleton count={6} />
        ) : filteredPersonalities.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No personalities found matching your search.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPersonalities.map((personality) => (
              <Card 
                key={personality.id} 
                className="hover:shadow-xl transition-all cursor-pointer group border-border overflow-hidden"
              >
                <CardHeader className="relative">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex-shrink-0 overflow-hidden">
                      {personality.avatar_url ? (
                        <img 
                          src={personality.avatar_url} 
                          alt={personality.display_name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <User className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {personality.display_name}
                      </CardTitle>
                      <CardDescription className="text-sm">{personality.era}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {personality.short_bio}
                  </p>

                  {personality.values_pillars && personality.values_pillars.length > 0 && (
                    <TooltipProvider>
                      <div className="flex flex-wrap gap-1.5">
                        {/* Show top 3-4 values */}
                        {personality.values_pillars.slice(0, 4).map((value, index) => (
                          <Tooltip key={index} delayDuration={200}>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant="secondary" 
                                className={`text-xs cursor-pointer transition-all duration-200 ${getBadgeColorClass(index)}`}
                              >
                                {value}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-xs font-medium">{value}</p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Core value of {personality.display_name}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        
                        {/* Show "+X more" badge if there are additional values */}
                        {personality.values_pillars.length > 4 && (
                          <Tooltip delayDuration={200}>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant="secondary" 
                                className="text-xs cursor-pointer bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20 hover:bg-gray-500/20 transition-all duration-200"
                              >
                                <Info className="w-3 h-3 mr-1" />
                                +{personality.values_pillars.length - 4} more
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <p className="text-xs font-semibold mb-2">All Values:</p>
                              <div className="flex flex-wrap gap-1">
                                {personality.values_pillars.map((value, idx) => (
                                  <span 
                                    key={idx}
                                    className="text-xs bg-background px-2 py-1 rounded-md border"
                                  >
                                    {value}
                                  </span>
                                ))}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TooltipProvider>
                  )}

                  <Button 
                    className="w-full" 
                    variant="default"
                    onClick={() => handleStartChat(personality.id, personality.display_name)}
                  >
                    Start Conversation
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Chatboard;
