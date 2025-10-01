import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Menu, X, ChevronDown, LayoutDashboard, FileText, TrendingUp, User, Compass, Users, UserCircle, Award, Briefcase } from "lucide-react";
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

  const academicsItems = [
    { icon: Award, title: "Courses", description: "Browse available courses", href: "#" },
    { icon: FileText, title: "Certifications", description: "Track your achievements", href: "#" },
    { icon: TrendingUp, title: "Progress", description: "View your learning progress", href: "#" },
  ];

  const opportunitiesItems = [
    { icon: Briefcase, title: "Jobs", description: "Explore job opportunities", href: "#" },
    { icon: Award, title: "Internships", description: "Find internships", href: "#" },
    { icon: Users, title: "Networking", description: "Connect with professionals", href: "#" },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 hover-scale">
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Persona Project
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            <Link
              to="/dashboard"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/dashboard") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 inline mr-2" />
              Dashboard
            </Link>

            <Link
              to="/assessments"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/assessments") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Assessments
            </Link>

            <Link
              to="/learning-path"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/learning-path") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Learning Path
            </Link>

            <Link
              to="/skill-persona"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/skill-persona") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
            >
              <UserCircle className="w-4 h-4 inline mr-2" />
              Skill Persona
            </Link>

            {/* Academics Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium">
                  Academics <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[500px] p-4 bg-background/95 backdrop-blur z-50">
                <div className="grid grid-cols-1 gap-3">
                  {academicsItems.map((item) => (
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

            {/* Opportunities Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-sm font-medium">
                  Opportunities <ChevronDown className="ml-1 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-[500px] p-4 bg-background/95 backdrop-blur z-50">
                <div className="grid grid-cols-1 gap-3">
                  {opportunitiesItems.map((item) => (
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

            <Link
              to="/career-guide"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/career-guide") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
            >
              <Compass className="w-4 h-4 inline mr-2" />
              Career Guide
            </Link>

            <Link
              to="/community"
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive("/community") ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              Community
            </Link>
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <UserCircle className="w-4 h-4 mr-2" />
                    Profile
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-background/95 backdrop-blur z-50">
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/skill-persona">My Persona</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/auth">
                  Sign In
                </Link>
              </Button>
            )}
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
              to="/dashboard"
              className="block px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/assessments"
              className="block px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Assessments
            </Link>
            <Link
              to="/learning-path"
              className="block px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Learning Path
            </Link>
            <Link
              to="/skill-persona"
              className="block px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Skill Persona
            </Link>
            <Link
              to="/career-guide"
              className="block px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Career Guide
            </Link>
            <Link
              to="/community"
              className="block px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Community
            </Link>
            
            <div className="pt-4 space-y-2 border-t border-border">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="block px-4 py-2 rounded-lg hover:bg-accent/50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    My Dashboard
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
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
