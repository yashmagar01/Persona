import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, MessageSquare, Users, Sparkles } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${heroBg})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-primary/90 via-primary/70 to-background/95" />
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background/10 backdrop-blur-sm border border-primary-foreground/20 text-primary-foreground">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">Learn from India's Greatest Minds</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-primary-foreground leading-tight">
              Historical Chatboard
            </h1>

            <p className="text-xl md:text-2xl text-primary-foreground/90 max-w-2xl mx-auto">
              Connect with legendary Indian historical personalities. Learn their wisdom, understand their values, 
              and gain insights from those who shaped our nation.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button 
                size="lg" 
                variant="hero"
                onClick={() => navigate("/auth")}
                className="text-lg px-8 py-6"
              >
                Start Your Journey
              </Button>
              <Button 
                size="lg" 
                variant="outline"
                onClick={() => navigate("/chatboard")}
                className="text-lg px-8 py-6 bg-background/10 backdrop-blur-sm border-primary-foreground/40 text-primary-foreground hover:bg-background/20"
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
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 text-foreground">
            Why Historical Chatboard?
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">Interactive Conversations</h3>
              <p className="text-muted-foreground">
                Engage in meaningful dialogues with historical figures. Ask questions, seek guidance, and learn their philosophies.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mb-4">
                <BookOpen className="w-6 h-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">Authentic Wisdom</h3>
              <p className="text-muted-foreground">
                Each personality speaks in their unique style, reflecting their values, beliefs, and the era they lived in.
              </p>
            </div>

            <div className="bg-card p-8 rounded-2xl border border-border shadow-lg hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-card-foreground">Learn from Legends</h3>
              <p className="text-muted-foreground">
                From Gandhi's non-violence to Shivaji's valor, explore diverse perspectives that shaped Indian history.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Personalities Preview */}
      <section className="py-20 bg-muted">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-foreground">
            Meet the Legends
          </h2>
          <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
            Chat with iconic figures who changed the course of Indian history
          </p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 max-w-6xl mx-auto">
            {[
              "Mahatma Gandhi",
              "Shivaji Maharaj", 
              "Rani Lakshmibai",
              "Netaji Bose",
              "Dr. Ambedkar",
              "Swami Vivekananda"
            ].map((name) => (
              <div 
                key={name}
                className="bg-card p-6 rounded-xl border border-border text-center hover:shadow-lg transition-all cursor-pointer hover:-translate-y-1"
              >
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mx-auto mb-3" />
                <p className="font-medium text-sm text-card-foreground">{name}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button 
              variant="hero" 
              size="lg"
              onClick={() => navigate("/auth")}
            >
              Start Chatting Now
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2025 Historical Chatboard. Bringing India's history to life through conversation.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
