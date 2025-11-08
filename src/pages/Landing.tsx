import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, MessageSquare, Users, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { supabase } from "@/integrations/supabase/client";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import { showAuthToast } from "@/lib/toast-notifications";

const Landing = () => {
  const navigate = useNavigate();

  // Function to create a guest conversation and navigate directly to chat
  const startChatWithPersonality = async (personalityName: string) => {
    try {
      // Fetch the personality from database
      const { data: personalities, error } = await supabase
        .from('personalities')
        .select('id, display_name')
        .ilike('display_name', `%${personalityName}%`)
        .limit(1);

      if (error || !personalities || personalities.length === 0) {
        console.error('Error fetching personality:', error);
        // Fallback to chatboard if personality not found
        navigate('/chatboard');
        return;
      }

      const personality = personalities[0];
      
      // Create a guest conversation ID
      const guestConversationId = `guest-${personality.id}-${Date.now()}`;
      
      // Store guest conversation in localStorage
      const guestConversation = {
        id: guestConversationId,
        personality_id: personality.id,
        title: `Chat with ${personality.display_name}`,
        created_at: new Date().toISOString(),
      };
      
      localStorage.setItem(`guest-conversation-${guestConversationId}`, JSON.stringify(guestConversation));
      
      // Navigate directly to the chat
      navigate(`/chat/${guestConversationId}`);
    } catch (error) {
      console.error('Error starting chat:', error);
      navigate('/chatboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Enhanced Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          {/* Dark gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
        </div>

        {/* Content with backdrop blur */}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8 backdrop-blur-sm bg-black/20 rounded-3xl p-8 md:p-12">
            <div className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 rounded-full bg-orange-500/20 backdrop-blur-md border border-orange-400/30 text-white shadow-lg">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span className="text-xs sm:text-sm font-medium">Learn from India's Greatest Minds</span>
            </div>

            <h1 
              className="text-4xl sm:text-5xl md:text-7xl font-bold leading-tight px-4"
              style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.5)' }}
            >
              <ShimmeringText 
                text="Persona"
                duration={3}
                color="#ffffff"
                shimmerColor="#fb923c"
                repeat={true}
                repeatDelay={3}
                className="text-4xl sm:text-5xl md:text-7xl font-bold"
              />
            </h1>

            <p 
              className="text-base sm:text-xl md:text-2xl text-white max-w-2xl mx-auto px-4 leading-relaxed"
              style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.6)' }}
            >
              <ShimmeringText 
                text="Connect with legendary Indian historical personalities. Learn their wisdom, understand their values, and gain insights from those who shaped our nation."
                duration={4}
                color="#ffffff"
                shimmerColor="#fbbf24"
                startOnView={true}
                once={true}
                className="text-base sm:text-xl md:text-2xl"
              />
            </p>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 px-4">
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => navigate("/auth")}
                className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto font-semibold"
              >
                Start Your Journey
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/chatboard")}
                className="text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto bg-white/10 backdrop-blur-md border-white/40 text-white hover:bg-white/30 hover:border-white/60 font-semibold"
              >
                Explore as Guest
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-12 sm:mb-16 text-foreground">
            Why Persona?
          </h2>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-card-foreground">Interactive Conversations</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Engage in meaningful dialogues with historical figures. Ask questions, seek guidance, and learn their philosophies.
              </p>
            </div>

            <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-card-foreground">Authentic Wisdom</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                Each personality speaks in their unique style, reflecting their values, beliefs, and the era they lived in.
              </p>
            </div>

            <div className="bg-card p-6 sm:p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all sm:col-span-2 md:col-span-1">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 text-card-foreground">Learn from Legends</h3>
              <p className="text-sm sm:text-base text-muted-foreground">
                From Gandhi's non-violence to Shivaji's valor, explore diverse perspectives that shaped Indian history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Personalities Preview */}
      <section className="py-12 sm:py-16 md:py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-4">
            <ShimmeringText 
              text="Meet the Legends"
              duration={2.5}
              color="#0f172a"
              shimmerColor="#3b82f6"
              startOnView={true}
              once={true}
              className="text-2xl sm:text-3xl md:text-4xl font-bold"
            />
          </h2>
          <p className="text-sm sm:text-base text-center text-muted-foreground mb-12 sm:mb-16 max-w-2xl mx-auto px-4">
            Chat with iconic figures who changed the course of Indian history
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {[
              { name: "Mahatma Gandhi", image: "https://blogcdn.aakash.ac.in/wordpress_media/2024/08/Mahatma-Gandhi.jpg", era: "1869-1948" },
              { name: "Shivaji Maharaj", image: "https://www.shivajicollege.ac.in/img/chhtraptishivaji.jpg", era: "1630-1680" },
              { name: "Rani Lakshmibai", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/89/Rani_Lakshmibai.jpg/800px-Rani_Lakshmibai.jpg", era: "1828-1858" },
              { name: "Netaji Bose", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Subhas_Chandra_Bose_NRB.jpg/800px-Subhas_Chandra_Bose_NRB.jpg", era: "1897-1945" },
              { name: "Dr. APJ Abdul Kalam", image: "https://cdn.britannica.com/48/222648-050-F4D0A2D8/President-of-India-A-P-J-Abdul-Kalam-2007.jpg", era: "1931-2015" },
              { name: "Swami Vivekananda", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Swami_Vivekananda-1893-09-signed.jpg/800px-Swami_Vivekananda-1893-09-signed.jpg", era: "1863-1902" }
            ].map((person) => (
              <div 
                key={person.name}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all cursor-pointer hover:-translate-y-2 group"
                onClick={() => startChatWithPersonality(person.name)}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={person.image} 
                    alt={person.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                    <p className="font-semibold text-white text-xs sm:text-sm mb-0.5 leading-tight">{person.name}</p>
                    <p className="text-[10px] sm:text-xs text-white/80">{person.era}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 sm:mt-12 px-4">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate("/chatboard")}
              className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto"
            >
              Start Chatting Now
            </Button>
          </div>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="bg-card border-t border-border">
        <div className="container mx-auto px-4 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* About */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-foreground">Persona</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Bringing India's rich history to life through AI-powered conversations with legendary personalities.
              </p>
              <div className="flex gap-3">
                <a href="https://github.com/yashmagar01" target="_blank" rel="noopener noreferrer" 
                   className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button onClick={() => navigate("/")} className="text-muted-foreground hover:text-primary transition-colors">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/chatboard")} className="text-muted-foreground hover:text-primary transition-colors">
                    Chatboard
                  </button>
                </li>
                <li>
                  <button onClick={() => navigate("/auth")} className="text-muted-foreground hover:text-primary transition-colors">
                    Sign In
                  </button>
                </li>
                <li>
                  <button 
                    onClick={async (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('🔍 Landing: Checking auth for conversations...');
                      
                      const { data: { session } } = await supabase.auth.getSession();
                      
                      if (!session) {
                        console.log('❌ Landing: No session - BLOCKING navigation');
                        console.log('Toast triggered!');
                        showAuthToast();
                        setTimeout(() => {
                          console.log('🔄 Landing: Redirecting to auth...');
                          navigate("/auth");
                        }, 2000);
                      } else {
                        console.log('✅ Landing: User authenticated - navigating');
                        navigate("/conversations");
                      }
                    }} 
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    My Conversations
                  </button>
                </li>
              </ul>
            </div>

            {/* Personalities */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Featured Personalities</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Mahatma Gandhi</li>
                <li>Chhatrapati Shivaji Maharaj</li>
                <li>Dr. APJ Abdul Kalam</li>
                <li>Rani Lakshmibai</li>
                <li>Swami Vivekananda</li>
                <li>+ 5 more legends</li>
              </ul>
            </div>

            {/* Info */}
            <div>
              <h4 className="font-semibold mb-4 text-foreground">Project Info</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>🤖 Powered by Google Gemini AI</li>
                <li>💾 Built with React + Vite</li>
                <li>🔐 Secure with Supabase</li>
                <li>🎨 Styled with Tailwind CSS</li>
                <li>📱 Mobile Responsive</li>
                <li>✨ Guest Mode Available</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-border pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center gap-3 sm:gap-4">
            <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left px-2">
              © 2025 Persona. Bringing India's history to life through conversation.
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-right px-2">
              Created by Yash Magar for Skill India Competition
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
