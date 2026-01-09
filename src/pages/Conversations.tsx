import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "@/lib/firebase";
import { getUserConversationsWithPersonalities, deleteConversation } from "@/db/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquare, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  personalities: {
    display_name: string;
    avatar_url: string | null;
  };
}

const Conversations = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Auth is now handled by ProtectedRoute wrapper
    // Just fetch conversations directly
    console.log('✅ Conversations Page: Loading conversations (auth verified by ProtectedRoute)');
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const user = getCurrentUser();
      if (!user) {
        toast.error("Please sign in to view conversations");
        return;
      }

      const data = await getUserConversationsWithPersonalities(user.uid);
      
      // Transform to expected format
      const transformed = data.map(c => ({
        id: c.id,
        title: c.title || '',
        created_at: c.created_at || '',
        updated_at: c.updated_at || '',
        personalities: {
          display_name: c.personalities?.display_name || 'Unknown',
          avatar_url: c.personalities?.avatar_url || null,
        }
      }));
      
      setConversations(transformed);
    } catch (error: any) {
      toast.error("Failed to load conversations");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (conversationId: string) => {
    try {
      const success = await deleteConversation(conversationId);

      if (!success) throw new Error('Failed to delete');

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      toast.success("Conversation deleted");
    } catch (error: any) {
      toast.error("Failed to delete conversation");
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/chatboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-2xl font-bold text-foreground">My Conversations</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No conversations yet</h2>
            <p className="text-muted-foreground mb-6">
              Start your first conversation with a historical personality
            </p>
            <Button onClick={() => navigate("/chatboard")}>
              Go to Chatboard
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
            {conversations.map((conversation) => (
              <Card key={conversation.id} className="hover:shadow-lg transition-all cursor-pointer group">
                <CardHeader 
                  className="pb-3"
                  onClick={() => navigate(`/chat/${conversation.id}`)}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-accent overflow-hidden flex-shrink-0">
                      {(() => {
                        const imageUrl = getPersonalityImage(
                          conversation.personalities.display_name, 
                          conversation.personalities.avatar_url
                        );
                        return imageUrl ? (
                          <img 
                            src={imageUrl} 
                            alt={conversation.personalities.display_name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        );
                      })()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                        {conversation.personalities.display_name}
                      </CardTitle>
                      <CardDescription className="text-sm truncate">
                        {conversation.title}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                      {new Date(conversation.updated_at).toLocaleDateString()}
                    </p>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this conversation? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(conversation.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Conversations;
