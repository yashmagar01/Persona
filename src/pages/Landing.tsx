import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, MessageSquare, Users, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";
import { getPersonalityByName } from "@/db/services";
import { ShimmeringText } from "@/components/ui/shimmering-text";
import { showAuthToast } from "@/lib/toast-notifications";
import Footer from "@/components/Footer";

const Landing = () => {
  const navigate = useNavigate();

  // Function to create a guest conversation and navigate directly to chat
  const startChatWithPersonality = async (personalityName: string) => {
    try {
      // Fetch the personality from database
      const personality = await getPersonalityByName(personalityName);

      if (!personality) {
        console.error('Personality not found:', personalityName);
        // Fallback to chatboard if personality not found
        navigate('/chatboard');
        return;
      }
      
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
      {/* Hero Section - Mobile Responsive */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 md:pt-0">
        {/* Background Image with Enhanced Dark Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          {/* Dark gradient overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/80" />
        </div>

        {/* Content with backdrop blur - Mobile Optimized */}
        <div className="relative z-10 container mx-auto px-3 sm:px-4 py-12 sm:py-16 md:py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 backdrop-blur-sm bg-black/20 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 lg:p-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-orange-500/20 backdrop-blur-md border border-orange-400/30 text-white shadow-lg">
              <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
              <span className="text-[10px] sm:text-xs md:text-sm font-medium">Learn from India's Greatest Minds</span>
            </div>

            <h1 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight px-2 sm:px-4"
              style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.7), 0 0 20px rgba(0,0,0,0.5)' }}
            >
              <ShimmeringText 
                text="Persona"
                duration={3}
                color="#ffffff"
                shimmerColor="#fb923c"
                repeat={true}
                repeatDelay={3}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold"
              />
            </h1>

            <p 
              className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-white max-w-2xl mx-auto px-2 sm:px-4 leading-relaxed"
              style={{ textShadow: '1px 1px 4px rgba(0,0,0,0.8), 0 0 10px rgba(0,0,0,0.6)' }}
            >
              <ShimmeringText 
                text="Connect with legendary Indian historical personalities. Learn their wisdom, understand their values, and gain insights from those who shaped our nation."
                duration={4}
                color="#ffffff"
                shimmerColor="#fbbf24"
                startOnView={true}
                once={true}
                className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl"
              />
            </p>

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 md:gap-4 justify-center pt-2 sm:pt-4 px-2 sm:px-4">
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => navigate("/auth")}
                className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 lg:py-6 w-full sm:w-auto font-semibold"
              >
                Start Your Journey
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/chatboard")}
                className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 py-3 sm:py-4 md:py-5 lg:py-6 w-full sm:w-auto bg-white/10 backdrop-blur-md border-white/40 text-white hover:bg-white/30 hover:border-white/60 font-semibold"
              >
                Explore as Guest
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Features Section - Mobile Responsive */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-background">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-8 sm:mb-12 md:mb-16 text-foreground">
            Why Persona?
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                <MessageSquare className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 text-card-foreground">Interactive Conversations</h3>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                Engage in meaningful dialogues with historical figures. Ask questions, seek guidance, and learn their philosophies.
              </p>
            </div>

            <div className="bg-card p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-3 sm:mb-4">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-secondary" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 text-card-foreground">Authentic Wisdom</h3>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                Each personality speaks in their unique style, reflecting their values, beliefs, and the era they lived in.
              </p>
            </div>

            <div className="bg-card p-4 sm:p-6 md:p-8 rounded-xl sm:rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all sm:col-span-2 lg:col-span-1">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-accent/10 flex items-center justify-center mb-3 sm:mb-4">
                <Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent" />
              </div>
              <h3 className="text-base sm:text-lg md:text-xl font-semibold mb-2 sm:mb-3 text-card-foreground">Learn from Legends</h3>
              <p className="text-xs sm:text-sm md:text-base text-muted-foreground leading-relaxed">
                From Gandhi's non-violence to Shivaji's valor, explore diverse perspectives that shaped Indian history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Personalities Preview - Mobile Responsive */}
      <section className="py-8 sm:py-12 md:py-16 lg:py-20 bg-muted">
        <div className="container mx-auto px-3 sm:px-4">
          <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-center mb-3 sm:mb-4">
            <ShimmeringText 
              text="Meet the Legends"
              duration={2.5}
              color="#0f172a"
              shimmerColor="#3b82f6"
              startOnView={true}
              once={true}
              className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold"
            />
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-center text-muted-foreground mb-8 sm:mb-12 md:mb-16 max-w-2xl mx-auto px-2 sm:px-4">
            Chat with iconic figures who changed the course of Indian history
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto">
            {[
              { name: "Mahatma Gandhi", image: "https://blogcdn.aakash.ac.in/wordpress_media/2024/08/Mahatma-Gandhi.jpg", era: "1869-1948" },
              { name: "Shivaji Maharaj", image: "https://www.shivajicollege.ac.in/img/chhtraptishivaji.jpg", era: "1630-1680" },
              { name: "Rani Lakshmibai", image: "https://images1.dnaindia.com/images/DNA-EN/900x1600/2023/7/5/1688549461607_qwee024vv81.jpg", era: "1828-1858" },
              { name: "Netaji Bose", image: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Subhas_Chandra_Bose_NRB.jpg/800px-Subhas_Chandra_Bose_NRB.jpg", era: "1897-1945" },
              { name: "Dr. APJ Abdul Kalam", image: "https://cdn.britannica.com/48/222648-050-F4D0A2D8/President-of-India-A-P-J-Abdul-Kalam-2007.jpg", era: "1931-2015" },
              { name: "Swami Vivekananda", image: "https://indiwiki.com/wp-content/uploads/2025/07/86757ae05e5df302097a810ae0933ec1.jpg", era: "1863-1902" },
              { name: "Bhagat Singh", image: "https://resize.indiatvnews.com/en/resize/newbucket/1200_-/2017/09/bhagatsingh-1506598593.jpg", era: "1907-1931" },
              { name: "Dr. B.R. Ambedkar", image: "https://ambedkarinternationalcenter.org/wp-content/uploads/2020/11/DrAmbedkar1.jpg", era: "1891-1956" },
              { name: "Rani Durgavati", image: "https://d18x2uyjeekruj.cloudfront.net/wp-content/uploads/2023/06/durgawati.jpg", era: "1524-1564" },
              { name: "Savitribai Phule", image: "https://vajiramandravi.com/current-affairs/wp-content/uploads/2025/04/savitribai_phule.webp", era: "1831-1897" },
              { name: "Chanakya", image: "https://miro.medium.com/1*l-uCTj8NEeZ-N47y9Kk4wQ.png", era: "375-283 BCE" }
            ].map((person) => (
              <div 
                key={person.name}
                className="bg-card rounded-lg sm:rounded-xl border border-border overflow-hidden hover:shadow-xl transition-all cursor-pointer hover:-translate-y-1 sm:hover:-translate-y-2 group touch-manipulation"
                onClick={() => startChatWithPersonality(person.name)}
              >
                <div className="aspect-square relative overflow-hidden">
                  <img 
                    src={person.image} 
                    alt={person.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3">
                    <p className="font-semibold text-white text-[10px] sm:text-xs md:text-sm mb-0.5 leading-tight line-clamp-2">{person.name}</p>
                    <p className="text-[8px] sm:text-[10px] md:text-xs text-white/80">{person.era}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-6 sm:mt-8 md:mt-12 px-2 sm:px-4">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate("/chatboard")}
              className="text-sm sm:text-base md:text-lg px-4 sm:px-6 md:px-8 w-full sm:w-auto"
            >
              Start Chatting Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer Component */}
      <Footer />
    </div>
  );
};

export default Landing;
