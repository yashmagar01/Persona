import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, BookOpen, GraduationCap, Users, Building2, Megaphone, Mail, Home, LogIn, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const Navigation = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<any>(null);

  // Check if user is logged in
  supabase.auth.getSession().then(({ data: { session } }) => {
    setUser(session?.user);
  });

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast({ title: "Signed out successfully" });
    navigate("/");
  };

  const isActive = (path: string) => location.pathname === path;

  const departmentsItems = [
    { icon: Building2, title: "Computer Engineering", description: "Cutting-edge tech education", href: "#" },
    { icon: Building2, title: "Mechanical Engineering", description: "Innovation in mechanics", href: "#" },
    { icon: Building2, title: "Civil Engineering", description: "Building the future", href: "#" },
    { icon: Building2, title: "Electrical Engineering", description: "Power & electronics", href: "#" },
  ];

  const academicsItems = [
    { icon: BookOpen, title: "Curriculum", description: "Comprehensive course structure", href: "#" },
    { icon: GraduationCap, title: "Faculty", description: "Expert teaching staff", href: "#" },
    { icon: BookOpen, title: "Research", description: "Innovation & development", href: "#" },
    { icon: GraduationCap, title: "Projects", description: "Student achievements", href: "#" },
  ];

  const studentItems = [
    { icon: Users, title: "Clubs & Activities", description: "Extracurricular engagement", href: "/chatboard" },
    { icon: Users, title: "Student Portal", description: "Access your resources", href: "#" },
    { icon: Users, title: "Events", description: "Upcoming programs", href: "#" },
    { icon: Users, title: "Historical Chat", description: "Learn from legends", href: "/chatboard" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover-scale">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Historical Chatboard
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
            >
              <Home className="w-4 h-4 inline mr-2" />
              Home
            </Link>

            <Link
              to="/about"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/about") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
            >
              About Us
            </Link>

            {/* Departments Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium">
                  Departments <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[600px] p-4 bg-background/95 backdrop-blur">
                <div className="grid grid-cols-2 gap-3">
                  {departmentsItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.href}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <item.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-0.5">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Academics Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium">
                  Academics <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[600px] p-4 bg-background/95 backdrop-blur">
                <div className="grid grid-cols-2 gap-3">
                  {academicsItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.href}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center group-hover:bg-secondary/20 transition-colors">
                        <item.icon className="w-5 h-5 text-secondary-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-0.5">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Student Corner Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium">
                  Student Corner <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[600px] p-4 bg-background/95 backdrop-blur">
                <div className="grid grid-cols-2 gap-3">
                  {studentItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.href}
                      className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
                        <item.icon className="w-5 h-5 text-accent-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-sm mb-0.5">{item.title}</p>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link
              to="/notices"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/notices") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
            >
              <Megaphone className="w-4 h-4 inline mr-2" />
              Notices
            </Link>

            <Link
              to="/contact"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/contact") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
            >
              <Mail className="w-4 h-4 inline mr-2" />
              Contact Us
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur">
                  <DropdownMenuItem asChild>
                    <Link to="/conversations">My Conversations</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/chatboard">Chatboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">
                  <LogIn className="w-4 h-4 mr-2" />
                  Sign In
                </Link>
              </Button>
            )}

            <Button variant="accent" size="sm" asChild className="bg-[#c8ff3d] text-[#0f172a] hover:bg-[#b8ef2d]">
              <Link to="/chatboard">
                <GraduationCap className="w-4 h-4 mr-2" />
                Start Learning
              </Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-accent/50 transition-colors"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2 animate-fade-in">
            <Link
              to="/"
              className="block px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/about"
              className="block px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              to="/chatboard"
              className="block px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Chatboard
            </Link>
            <Link
              to="/notices"
              className="block px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Notices
            </Link>
            <Link
              to="/contact"
              className="block px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact Us
            </Link>
            
            <div className="pt-4 space-y-2 border-t border-border">
              {user ? (
                <>
                  <Link
                    to="/conversations"
                    className="block px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Conversations
                  </Link>
                  <button
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    className="w-full text-left px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link
                  to="/auth"
                  className="block px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Sign In
                </Link>
              )}
              <Button variant="accent" className="w-full bg-[#c8ff3d] text-[#0f172a] hover:bg-[#b8ef2d]" asChild>
                <Link to="/chatboard" onClick={() => setMobileMenuOpen(false)}>
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Start Learning
                </Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
