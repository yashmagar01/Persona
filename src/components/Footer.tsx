import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/firebase";
import { showAuthToast } from "@/lib/toast-notifications";

const Footer = () => {
  const navigate = useNavigate();

  const handleConversationsClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('🔍 Footer: Checking auth for conversations...');
    
    const user = getCurrentUser();
    
    if (!user) {
      console.log('❌ Footer: No user - BLOCKING navigation');
      showAuthToast();
      setTimeout(() => {
        console.log('🔄 Footer: Redirecting to auth...');
        navigate("/auth");
      }, 2000);
    } else {
      console.log('✅ Footer: User authenticated - navigating');
      navigate("/conversations");
    }
  };

  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-foreground">Persona</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Bringing India's rich history to life through AI-powered conversations with legendary personalities.
            </p>
            <div className="flex gap-3">
              <a 
                href="https://github.com/yashmagar01" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-9 h-9 rounded-full bg-muted flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
              >
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
                <button 
                  onClick={() => navigate("/")} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Home
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/chatboard")} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Chatboard
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate("/auth")} 
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Sign In
                </button>
              </li>
              <li>
                <button 
                  onClick={handleConversationsClick}
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
              <li>🤖 Powered by Groq AI (Llama 3.3)</li>
              <li>💾 Built with React + Vite</li>
              <li>🔐 Secure with Firebase Auth</li>
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
  );
};

export default Footer;
