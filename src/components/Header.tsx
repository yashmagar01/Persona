import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, MessageSquare } from 'lucide-react';
import { Button } from './ui/button';

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { to: '/', label: 'Home', end: true },
    { to: '/chatboard', label: 'Chatboard' },
    { to: '/conversations', label: 'Conversations' },
    { to: '/auth', label: 'Sign In' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-gray-900/95 backdrop-blur-md shadow-lg'
            : 'bg-gray-900/95 backdrop-blur-sm'
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo - Visible on all screens */}
            <Link
              to="/"
              className="flex items-center space-x-2 group transition-transform duration-300 hover:scale-105 flex-shrink-0"
            >
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-2 rounded-lg shadow-lg transition-all duration-300 group-hover:shadow-orange-500/50">
                <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <span className="text-base sm:text-lg md:text-2xl font-bold text-white truncate max-w-[180px] sm:max-w-none">
                Historical Chatboard
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 ${
                      isActive
                        ? 'text-orange-500 bg-orange-500/10'
                        : 'text-gray-300 hover:text-orange-400 hover:bg-gray-800/50'
                    }`
                  }
                >
                  {link.label}
                </NavLink>
              ))}
              <Link to="/auth">
                <Button
                  variant="hero"
                  className="ml-4 font-semibold px-6"
                >
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button - Visible only on mobile (<768px) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-300 hover:text-white hover:bg-gray-800/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-orange-500/50 flex-shrink-0"
              aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6 transition-transform duration-200" />
              ) : (
                <Menu className="h-6 w-6 transition-transform duration-200" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile Menu Overlay - Only visible on mobile when menu is open */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ease-in-out md:hidden ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu - Slides in from top with smooth animation */}
      <div
        className={`fixed top-16 left-0 right-0 z-40 bg-gray-900/98 backdrop-blur-lg border-t border-gray-800 shadow-2xl transition-all duration-300 ease-in-out md:hidden max-h-[calc(100vh-4rem)] overflow-y-auto ${
          isMobileMenuOpen
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0'
        }`}
      >
        <nav className="container mx-auto px-4 sm:px-6 py-6 space-y-2">
          {navLinks.map((link, index) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg text-base font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 touch-manipulation ${
                  isActive
                    ? 'text-orange-500 bg-orange-500/10'
                    : 'text-gray-300 hover:text-orange-400 hover:bg-gray-800/50 active:bg-gray-800'
                }`
              }
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {link.label}
            </NavLink>
          ))}
          <div className="pt-4">
            <Link to="/auth" className="block">
              <Button
                variant="hero"
                className="w-full font-semibold py-3 touch-manipulation"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </nav>
      </div>

      {/* Spacer to prevent content from going under fixed header */}
      <div className="h-16 md:h-20" />
    </>
  );
}
