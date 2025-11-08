import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { LogOut, MessageSquare, Search, User, Info, X, ChevronDown } from "lucide-react";
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
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [autocompleteResults, setAutocompleteResults] = useState<Personality[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();
  const navigate = useNavigate();

  // Debounced search function
  const debouncedSearch = useCallback((query: string) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (query.trim() === "") {
        setFilteredPersonalities(personalities);
        setAutocompleteResults([]);
        setShowAutocomplete(false);
      } else {
        const filtered = personalities.filter((p) =>
          p.display_name.toLowerCase().includes(query.toLowerCase()) ||
          p.era.toLowerCase().includes(query.toLowerCase()) ||
          p.short_bio.toLowerCase().includes(query.toLowerCase()) ||
          p.values_pillars.some(v => v.toLowerCase().includes(query.toLowerCase()))
        );
        setFilteredPersonalities(filtered);
        setAutocompleteResults(filtered.slice(0, 5)); // Show max 5 results in dropdown
        setShowAutocomplete(query.trim() !== "");
      }
      setSelectedIndex(-1);
    }, 300);
  }, [personalities]);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    checkUser();
    fetchPersonalities();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);

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

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showAutocomplete || autocompleteResults.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < autocompleteResults.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < autocompleteResults.length) {
          const selected = autocompleteResults[selectedIndex];
          handleSelectPersonality(selected);
        }
        break;
      case 'Escape':
        setShowAutocomplete(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle personality selection from autocomplete
  const handleSelectPersonality = (personality: Personality) => {
    setSearchQuery(personality.display_name);
    setShowAutocomplete(false);
    setSelectedIndex(-1);
    // Optionally scroll to the card or start chat
    handleStartChat(personality.id, personality.display_name);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery("");
    setShowAutocomplete(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  // Highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-orange-500/30 text-orange-700 dark:text-orange-300 rounded px-0.5">
          {part}
        </mark>
      ) : (
        <span key={index}>{part}</span>
      )
    );
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
              Persona
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

          {/* Enhanced Search with Autocomplete */}
          <div className="max-w-md mx-auto relative" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 z-10" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search by name, era, or values..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery && setShowAutocomplete(true)}
                className="pl-10 pr-10"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {showAutocomplete && (
              <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-2xl z-50 max-h-80 overflow-y-auto">
                {autocompleteResults.length > 0 ? (
                  <div className="py-2">
                    {autocompleteResults.map((personality, index) => (
                      <button
                        key={personality.id}
                        onClick={() => handleSelectPersonality(personality)}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-accent/50 transition-colors text-left ${
                          selectedIndex === index ? 'bg-accent/50' : ''
                        }`}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex-shrink-0 overflow-hidden">
                          {personality.avatar_url ? (
                            <img 
                              src={personality.avatar_url} 
                              alt={personality.display_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </div>

                        {/* Name and Era */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {highlightMatch(personality.display_name, searchQuery)}
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-500"></span>
                            {highlightMatch(personality.era, searchQuery)}
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        {selectedIndex === index && (
                          <ChevronDown className="w-4 h-4 text-muted-foreground rotate-[-90deg]" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 px-4 text-center">
                    <div className="text-muted-foreground mb-2">
                      <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-medium">No results found</p>
                      <p className="text-xs mt-1">
                        Try searching for "Gandhi", "Freedom Fighter", or "1869"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
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
