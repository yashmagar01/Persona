import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser, onAuthChange } from "@/lib/firebase";
import { getProfile, createProfile, updateProfile, getUserConversations } from "@/db/services";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, User, Mail, Calendar, MessageSquare, Clock, Settings, Edit2, Save, X } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}

interface UserStats {
  totalConversations: number;
  totalMessages: number;
  joinedDate: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkAuthAndLoadProfile();
  }, []);

  const checkAuthAndLoadProfile = async () => {
    try {
      const firebaseUser = getCurrentUser();
      
      if (!firebaseUser) {
        // Guest mode
        setIsGuest(true);
        setUser({
          id: 'guest',
          email: 'guest@persona.app',
          full_name: 'Guest User',
          avatar_url: null,
          created_at: new Date().toISOString(),
        });
        setStats({
          totalConversations: 0,
          totalMessages: 0,
          joinedDate: new Date().toLocaleDateString(),
        });
        setIsLoading(false);
        return;
      }

      // Authenticated user
      setIsGuest(false);
      
      // Try to get profile from database
      let profile = await getProfile(firebaseUser.uid);
      
      if (!profile) {
        // Create profile if it doesn't exist
        await createProfile(firebaseUser.uid, firebaseUser.email || '', firebaseUser.displayName || undefined);
        profile = {
          id: firebaseUser.uid,
          email: firebaseUser.email,
          fullName: firebaseUser.displayName,
          avatarUrl: firebaseUser.photoURL,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      }
      
      setUser({
        id: profile.id,
        email: profile.email || firebaseUser.email || '',
        full_name: profile.fullName || firebaseUser.displayName || null,
        avatar_url: profile.avatarUrl || firebaseUser.photoURL || null,
        created_at: profile.createdAt?.toISOString() || firebaseUser.metadata.creationTime || new Date().toISOString(),
      });
      setEditedName(profile.fullName || firebaseUser.displayName || '');

      // Fetch user statistics
      await fetchUserStats(firebaseUser.uid);
    } catch (error: any) {
      console.error('Error loading profile:', error);
      toast.error("Failed to load profile");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserStats = async (userId: string) => {
    try {
      // Get conversations for this user
      const conversations = await getUserConversations(userId);
      const conversationCount = conversations.length;
      
      // For now, we don't have an efficient way to count messages
      // This would require an additional service method
      const messageCount = 0; // TODO: Add message count service

      // Get user creation date from Firebase
      const firebaseUser = getCurrentUser();
      
      setStats({
        totalConversations: conversationCount,
        totalMessages: messageCount,
        joinedDate: firebaseUser?.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime).toLocaleDateString() : 'Unknown',
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user || isGuest) return;
    
    setIsSaving(true);
    try {
      const success = await updateProfile(user.id, { fullName: editedName });

      if (!success) throw new Error('Failed to update profile');

      setUser({ ...user, full_name: editedName });
      setIsEditing(false);
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedName(user?.full_name || '');
    setIsEditing(false);
  };

  const getInitials = (name: string | null, email: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email.slice(0, 2).toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Unable to Load Profile</CardTitle>
            <CardDescription>Please try again later</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/")}>Go Home</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/chatboard")}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold text-foreground">Profile</h1>
            </div>
            {!isGuest && (
              <Button variant="outline" onClick={() => navigate("/settings")}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {isGuest && (
          <Card className="mb-6 bg-orange-500/10 border-orange-500/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <User className="w-5 h-5 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground">You're viewing as a guest</p>
                  <p className="text-xs text-muted-foreground">Sign up to save your profile and conversations</p>
                </div>
                <Button onClick={() => navigate("/auth")} className="bg-orange-500 hover:bg-orange-600">
                  Sign Up
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Profile Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Your personal information and account details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={user.avatar_url || undefined} alt={user.full_name || user.email} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl">
                  {getInitials(user.full_name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{user.full_name || 'User'}</h2>
                  {isGuest && <Badge variant="secondary">Guest</Badge>}
                </div>
                <p className="text-muted-foreground">{user.email}</p>
              </div>
            </div>

            <Separator />

            {/* Editable Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <div className="flex gap-2">
                <Input
                  id="fullName"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  disabled={!isEditing || isGuest}
                  placeholder="Enter your full name"
                  className={cn(
                    "flex-1",
                    isEditing && "border-primary"
                  )}
                />
                {!isGuest && (
                  <>
                    {!isEditing ? (
                      <Button onClick={() => setIsEditing(true)} variant="outline" size="icon">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    ) : (
                      <>
                        <Button onClick={handleSaveProfile} disabled={isSaving} size="icon">
                          <Save className="w-4 h-4" />
                        </Button>
                        <Button onClick={handleCancelEdit} variant="outline" size="icon">
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Email (Read-only) */}
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex gap-2 items-center">
                <Mail className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="email"
                  value={user.email}
                  disabled
                  className="flex-1"
                />
              </div>
            </div>

            {/* Account Created */}
            <div className="space-y-2">
              <Label>Member Since</Label>
              <div className="flex gap-2 items-center">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Input
                  value={stats?.joinedDate || 'Unknown'}
                  disabled
                  className="flex-1"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Card */}
        <Card>
          <CardHeader>
            <CardTitle>Activity Statistics</CardTitle>
            <CardDescription>Your engagement with Persona</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Total Conversations */}
              <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalConversations || 0}</p>
                  <p className="text-sm text-muted-foreground">Conversations</p>
                </div>
              </div>

              {/* Total Messages */}
              <div className="flex items-center gap-4 p-4 bg-secondary/5 rounded-lg border border-secondary/10">
                <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.totalMessages || 0}</p>
                  <p className="text-sm text-muted-foreground">Messages Sent</p>
                </div>
              </div>

              {/* Account Age */}
              <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-lg border border-accent/10">
                <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {stats?.joinedDate ? Math.floor((Date.now() - new Date(stats.joinedDate).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Days Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Profile;
