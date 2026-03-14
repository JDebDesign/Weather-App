import React, { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card } from './ui/card';
import { Search, MapPin, Loader2, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface LocationSearchProps {
  onLocationSelect: (lat: number, lon: number, name: string) => void;
  isInStickyHeader?: boolean;
}

interface LocationSearchRef {
  focusInput: () => void;
}

interface Location {
  name: string;
  country: string;
  admin1?: string; // State/Province
  latitude: number;
  longitude: number;
}

export const LocationSearch = forwardRef<LocationSearchRef, LocationSearchProps>(
  ({ onLocationSelect, isInStickyHeader = false }, ref) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Location[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      focusInput: () => {
        inputRef.current?.focus();
      }
    }));

  const formatLocationName = (location: Location): string => {
    const parts = [location.name];
    if (location.admin1) {
      parts.push(location.admin1);
    }
    if (location.country && location.country !== 'United States') {
      parts.push(location.country);
    }
    return parts.join(', ');
  };

  const searchLocations = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchQuery)}&count=8&language=en&format=json`
      );
      
      if (!response.ok) {
        throw new Error('Failed to search locations');
      }
      
      const data = await response.json();
      setResults(data.results || []);
      setShowResults(true);
    } catch (error) {
      toast.error('Failed to search locations');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchLocations(query);
  };

  const handleLocationClick = (location: Location) => {
    const formattedName = formatLocationName(location);
    onLocationSelect(location.latitude, location.longitude, formattedName);
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Auto-search as user types (debounced)
    clearTimeout((window as any).searchTimeout);
    (window as any).searchTimeout = setTimeout(() => {
      searchLocations(value);
    }, 300);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  // Much higher z-index values, with sticky header search being even higher
  const dropdownZIndex = isInStickyHeader ? 'z-[9999]' : 'z-[999]';
  const backdropZIndex = isInStickyHeader ? 'z-[9998]' : 'z-[998]';

  return (
    <div className="relative w-full">
      <form onSubmit={handleSearch} className="flex gap-3 w-full">
        <div className="relative flex-1 min-w-0">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            {loading ? (
              <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
            ) : (
              <Search className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          
          <Input
            ref={inputRef}
            type="text"
            placeholder="Search for a city..."
            value={query}
            onChange={handleInputChange}
            className="pl-10 pr-10 bg-input-background border-border/50 focus:border-primary/50 focus:ring-primary/20 text-base h-10 sm:h-11 lg:h-10 w-full"
            onFocus={() => {
              if (results.length > 0) setShowResults(true);
            }}
          />
          
          {query && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-accent rounded-full transition-colors"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          )}
        </div>
        
        <Button
          type="submit"
          variant="default"
          size="default"
          disabled={loading || !query.trim()}
          className="px-4 shadow-md text-base h-10 sm:h-11 lg:h-10 flex-shrink-0"
        >
          <Search className="h-4 w-4" />
        </Button>
      </form>

      {/* Search Results - Much higher z-index */}
      {showResults && results.length > 0 && (
        <Card className={`absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-md border-border/50 shadow-xl ${dropdownZIndex} max-h-80 overflow-hidden`}>
          <div className="overflow-auto max-h-80">
            {results.map((location, index) => (
              <button
                key={index}
                onClick={() => handleLocationClick(location)}
                className="w-full p-3 sm:p-4 text-left hover:bg-accent/50 flex items-center gap-3 transition-colors border-b border-border/30 last:border-b-0"
              >
                <div className="p-2 bg-primary/10 rounded-full">
                  <MapPin className="h-3 w-3 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm sm:text-base font-medium text-foreground truncate">
                    {location.name}
                  </div>
                  <div className="text-xs sm:text-sm text-muted-foreground truncate">
                    {location.admin1 && location.country === 'United States' ? (
                      location.admin1
                    ) : location.admin1 && location.country !== 'United States' ? (
                      `${location.admin1}, ${location.country}`
                    ) : (
                      location.country
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* No Results - Much higher z-index */}
      {showResults && results.length === 0 && query.length > 1 && !loading && (
        <Card className={`absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-md border-border/50 shadow-xl ${dropdownZIndex}`}>
          <div className="p-4 sm:p-6 text-center">
            <div className="p-3 bg-muted/50 rounded-full w-fit mx-auto mb-3">
              <Search className="h-4 sm:h-5 w-4 sm:w-5 text-muted-foreground" />
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              No locations found for "<span className="font-medium">{query}</span>"
            </p>
          </div>
        </Card>
      )}

      {/* Click outside to close - Much higher z-index backdrop */}
      {showResults && (
        <div
          className={`fixed inset-0 ${backdropZIndex}`}
          onClick={() => setShowResults(false)}
        />
      )}
    </div>
  );
});

LocationSearch.displayName = 'LocationSearch';