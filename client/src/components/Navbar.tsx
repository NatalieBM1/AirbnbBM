import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Globe, Menu, User, Home, Bell } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface NavbarProps {
  onSearch?: (query: string) => void;
}

export default function Navbar({ onSearch }: NavbarProps) {
  const [location, setLocation] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Common search suggestions
  const searchSuggestions = [
    'Malibu, California',
    'Aspen, Colorado', 
    'New York, NY',
    'Miami Beach, Florida',
    'San Francisco, California',
    'Austin, Texas',
    'Seattle, Washington',
    'Portland, Oregon'
  ];

  const filteredSuggestions = searchSuggestions.filter(location =>
    location.toLowerCase().includes(searchQuery.toLowerCase()) && searchQuery.length > 0
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim());
      }
      setShowSuggestions(false);
      
      // Navigate to home with search query
      const params = new URLSearchParams({ search: searchQuery.trim() });
      setLocation(`/?${params.toString()}`);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    if (onSearch) {
      onSearch(suggestion);
    }
    const params = new URLSearchParams({ search: suggestion });
    setLocation(`/?${params.toString()}`);
  };

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border" data-testid="navbar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2" data-testid="link-home">
            <Home className="text-primary h-8 w-8" />
            <span className="text-primary text-xl font-bold hidden sm:block">airbnbbm</span>
          </Link>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8 relative">
            <form onSubmit={handleSearch}>
              <div className="search-shadow bg-background border border-border rounded-full flex items-center hover:shadow-lg transition-shadow duration-200">
                <Input
                  type="text"
                  placeholder="Where are you going?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                  className="flex-1 border-0 bg-transparent px-6 py-3 rounded-l-full focus:ring-0"
                  data-testid="input-search"
                />
                <Button 
                  type="submit"
                  size="icon"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full m-2"
                  data-testid="button-search"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && filteredSuggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-xl shadow-lg z-50 mt-2">
                  {filteredSuggestions.map((suggestion, index) => (
                    <div
                      key={index}
                      className="px-4 py-3 hover:bg-muted cursor-pointer border-b border-border last:border-b-0"
                      onClick={() => handleSuggestionClick(suggestion)}
                      data-testid={`search-suggestion-${index}`}
                    >
                      <div className="flex items-center space-x-3">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <span>{suggestion}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </form>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-foreground hover:bg-muted">
              Airbnb your home
            </Button>
            
            <Button variant="ghost" size="icon" className="text-muted-foreground">
              <Globe className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="flex items-center space-x-2 rounded-full px-3 py-2"
                  data-testid="button-user-menu"
                >
                  <Menu className="h-4 w-4" />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {isAuthenticated ? user?.firstName?.[0] : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent align="end" className="w-56">
                {isAuthenticated ? (
                  <>
                    <DropdownMenuItem>
                      <span className="font-medium">{user?.firstName} {user?.lastName}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/notifications" data-testid="link-notifications">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>Account</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>Host your home</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout} data-testid="button-logout">
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem asChild>
                      <Link href="/login" data-testid="link-login">Log in</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register" data-testid="link-register">Sign up</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <span>Host your home</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
