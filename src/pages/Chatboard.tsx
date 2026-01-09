import { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { onAuthChange, getCurrentUser, signOut } from "@/lib/firebase";
import { getAllPersonalities, createConversation } from "@/db/services";
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
    const unsubscribe = onAuthChange((firebaseUser) => {
      setUser(firebaseUser);
    });
    fetchPersonalities();

    return () => {
      unsubscribe();
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    debouncedSearch(searchQuery);
  }, [searchQuery, debouncedSearch]);



  const fetchPersonalities = async () => {
    setIsLoading(true);
    try {
      const data = await getAllPersonalities();
      
      // Transform data to match our interface
      const transformedData = data.map(p => ({
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
    await signOut();
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
      const data = await createConversation(user.uid, personalityId, `Chat with ${displayName}`);

      if (!data) throw new Error('Failed to create conversation');

      navigate(`/chat/${data.id}`);
    } catch (error: any) {
      toast.error("Failed to start conversation");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header - Mobile Responsive */}
      <header className="bg-card border-b border-border sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Persona
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant={user ? "ghost" : "outline"}
              size="sm" 
              className="text-xs sm:text-sm px-2 sm:px-3"
              onClick={async (e) => {
                e.preventDefault();
                console.log('🔍 Chatboard: Checking auth for My Conversations...');
                
                const currentUser = getCurrentUser();
                
                if (!currentUser) {
                  console.log('❌ Chatboard: No session - BLOCKING navigation');
                  showAuthToast();
                  setTimeout(() => navigate("/auth"), 2000);
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
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {/* Welcome Section */}
        <div className="text-center mb-6 sm:mb-8 md:mb-12">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 text-foreground">
            Choose Your Guide
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto mb-4 sm:mb-6 px-2">
            Select a historical personality to begin your conversation and learn from their wisdom
          </p>

          {/* Enhanced Search with Autocomplete */}
          <div className="max-w-md mx-auto relative px-2 sm:px-0" ref={searchRef}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-3.5 h-3.5 sm:w-4 sm:h-4 z-10" />
              <Input
                ref={inputRef}
                type="text"
                placeholder="Search by name, era, or values..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => searchQuery && setShowAutocomplete(true)}
                className="pl-9 sm:pl-10 pr-9 sm:pr-10 text-sm sm:text-base h-10 sm:h-11 touch-manipulation"
                autoComplete="off"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors z-10 touch-manipulation"
                  aria-label="Clear search"
                >
                  <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                </button>
              )}
            </div>

            {/* Autocomplete Dropdown */}
            {showAutocomplete && (
              <div className="absolute top-full mt-1 sm:mt-2 w-full bg-card border border-border rounded-lg shadow-2xl z-50 max-h-60 sm:max-h-80 overflow-y-auto">
                {autocompleteResults.length > 0 ? (
                  <div className="py-1 sm:py-2">
                    {autocompleteResults.map((personality, index) => (
                      <button
                        key={personality.id}
                        onClick={() => handleSelectPersonality(personality)}
                        className={`w-full px-3 sm:px-4 py-2 sm:py-3 flex items-center gap-2 sm:gap-3 hover:bg-accent/50 transition-colors text-left touch-manipulation ${
                          selectedIndex === index ? 'bg-accent/50' : ''
                        }`}
                        onMouseEnter={() => setSelectedIndex(index)}
                      >
                        {/* Avatar */}
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex-shrink-0 overflow-hidden">
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
                                <User className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                              </div>
                            );
                          })()}
                        </div>

                        {/* Name and Era */}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-xs sm:text-sm truncate">
                            {highlightMatch(personality.display_name, searchQuery)}
                          </div>
                          <div className="text-[10px] sm:text-xs text-muted-foreground flex items-center gap-1">
                            <span className="inline-block w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-orange-500"></span>
                            {highlightMatch(personality.era, searchQuery)}
                          </div>
                        </div>

                        {/* Arrow indicator */}
                        {selectedIndex === index && (
                          <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4 text-muted-foreground rotate-[-90deg]" />
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 sm:py-8 px-3 sm:px-4 text-center">
                    <div className="text-muted-foreground mb-2">
                      <Search className="w-6 h-6 sm:w-8 sm:h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-xs sm:text-sm font-medium">No results found</p>
                      <p className="text-[10px] sm:text-xs mt-1">
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
          <div className="text-center py-8 sm:py-12">
            <p className="text-sm sm:text-base text-muted-foreground">No personalities found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
            {filteredPersonalities.map((personality) => (
              <Card 
                key={personality.id} 
                className="hover:shadow-xl transition-all cursor-pointer group border-border overflow-hidden touch-manipulation"
              >
                <CardHeader className="relative p-4 sm:p-6">
                  <div className="flex items-start gap-3 sm:gap-4">
                    <div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-br from-primary to-accent flex-shrink-0 overflow-hidden">
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
                            <User className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-white" />
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg md:text-xl group-hover:text-primary transition-colors truncate">
                        {personality.display_name}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">{personality.era}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
                  <p className="text-xs sm:text-sm text-muted-foreground line-clamp-3">
                    {personality.short_bio}
                  </p>

                  {personality.values_pillars && personality.values_pillars.length > 0 && (
                    <TooltipProvider>
                      <div className="flex flex-wrap gap-1 sm:gap-1.5">
                        {/* Show top 3-4 values */}
                        {personality.values_pillars.slice(0, 4).map((value, index) => (
                          <Tooltip key={index} delayDuration={200}>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant="secondary" 
                                className={`text-[10px] sm:text-xs cursor-pointer transition-all duration-200 touch-manipulation ${getBadgeColorClass(index)}`}
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
                                className="text-[10px] sm:text-xs cursor-pointer bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-500/20 hover:bg-gray-500/20 transition-all duration-200 touch-manipulation"
                              >
                                <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-1" />
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
                    className="w-full text-sm sm:text-base touch-manipulation" 
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
