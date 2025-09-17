import { useState } from "react";
import { Search, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { useLocation } from "wouter";

interface SearchBarProps {
  onSearch?: (query: string, checkIn?: Date, checkOut?: Date) => void;
}

export default function SearchBar({ onSearch }: SearchBarProps) {
  const [, setLocation] = useLocation();
  const [destination, setDestination] = useState('');
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSearch = () => {
    if (onSearch) {
      onSearch(destination, checkIn, checkOut);
    }
    
    // Update URL with search parameters
    const params = new URLSearchParams();
    if (destination.trim()) {
      params.set('search', destination.trim());
    }
    if (checkIn) {
      params.set('checkin', checkIn.toISOString().split('T')[0]);
    }
    if (checkOut) {
      params.set('checkout', checkOut.toISOString().split('T')[0]);
    }
    
    const query = params.toString();
    setLocation(query ? `/?${query}` : '/');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Agrega fecha...";
    return format(date, "d MMM", { locale: es });
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="relative">
        {/* Compact Search Bar */}
        {!isExpanded && (
          <div 
            className="flex items-center bg-white rounded-full shadow-lg border border-gray-200 hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => setIsExpanded(true)}
            data-testid="search-bar-compact"
          >
            <div className="flex-1 px-6 py-4">
              <input
                type="text"
                placeholder="¿A dónde vas?"
                className="w-full text-gray-600 placeholder-gray-500 bg-transparent border-none outline-none text-sm font-medium"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                onFocus={() => setIsExpanded(true)}
              />
            </div>
            <Button
              size="sm"
              className="bg-rose-500 hover:bg-rose-600 text-white rounded-full h-10 w-10 mr-2"
              onClick={(e) => {
                e.stopPropagation();
                handleSearch();
              }}
              data-testid="button-search"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Expanded Search Bar */}
        {isExpanded && (
          <div className="bg-white rounded-full shadow-xl border border-gray-200 overflow-hidden">
            <div className="flex items-center divide-x divide-gray-200">
              {/* Destination */}
              <div className="flex-1 min-w-0 px-6 py-4">
                <label className="block text-xs font-semibold text-gray-900 mb-1">
                  Dónde
                </label>
                <input
                  type="text"
                  placeholder="Explora destinos"
                  className="w-full text-sm text-gray-600 placeholder-gray-400 bg-transparent border-none outline-none"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  onKeyDown={handleKeyDown}
                  data-testid="input-destination"
                />
              </div>

              {/* Check-in */}
              <div className="flex-1 min-w-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors" data-testid="button-checkin">
                      <div className="text-xs font-semibold text-gray-900 mb-1">
                        Check-in
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(checkIn)}
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={checkIn}
                      onSelect={setCheckIn}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Check-out */}
              <div className="flex-1 min-w-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <button className="w-full px-6 py-4 text-left hover:bg-gray-50 transition-colors" data-testid="button-checkout">
                      <div className="text-xs font-semibold text-gray-900 mb-1">
                        Check-out
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatDate(checkOut)}
                      </div>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={checkOut}
                      onSelect={setCheckOut}
                      disabled={(date) => date < (checkIn || new Date())}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Search Button */}
              <div className="px-2 py-2">
                <Button
                  size="sm"
                  className="bg-rose-500 hover:bg-rose-600 text-white rounded-full h-12 w-12"
                  onClick={handleSearch}
                  data-testid="button-search-expanded"
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Backdrop to close expanded view */}
        {isExpanded && (
          <div 
            className="fixed inset-0 z-[-1]"
            onClick={() => setIsExpanded(false)}
          />
        )}
      </div>
    </div>
  );
}