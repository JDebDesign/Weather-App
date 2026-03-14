import React, { useState, useEffect, useRef } from 'react';
import { CurrentWeather } from './components/CurrentWeather';
import { HourlyForecast } from './components/HourlyForecast';
import { DailyForecast } from './components/DailyForecast';
import { LocationSearch } from './components/LocationSearch';
import { WeatherBackground } from './components/WeatherBackground';
import { SettingsSheet } from './components/SettingsSheet';
import { Button } from './components/ui/button';
import { Card } from './components/ui/card';
import { MapPin, RefreshCw, Search, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface WeatherData {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
  };
}

interface Location {
  latitude: number;
  longitude: number;
  name: string;
}

export default function App() {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [location, setLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDay, setIsDay] = useState(true);
  const [isHeaderSticky, setIsHeaderSticky] = useState(false);
  const [showLocationPrompt, setShowLocationPrompt] = useState(true);
  const [showStickySearch, setShowStickySearch] = useState(false);
  const [temperatureUnit, setTemperatureUnit] = useState<'fahrenheit' | 'celsius'>('fahrenheit');
  const [themeMode, setThemeMode] = useState<'auto' | 'light' | 'dark'>('auto');
  const locationSearchRef = useRef<{ focusInput: () => void }>(null);
  const stickyLocationSearchRef = useRef<{ focusInput: () => void }>(null);

  // Load settings from localStorage
  useEffect(() => {
    const savedTemperatureUnit = localStorage.getItem('temperatureUnit') as 'fahrenheit' | 'celsius' | null;
    const savedThemeMode = localStorage.getItem('themeMode') as 'auto' | 'light' | 'dark' | null;
    
    if (savedTemperatureUnit) {
      setTemperatureUnit(savedTemperatureUnit);
    }
    if (savedThemeMode) {
      setThemeMode(savedThemeMode);
    }
  }, []);

  // Determine if it's day or night based on current time
  const checkTimeOfDay = () => {
    const hour = new Date().getHours();
    setIsDay(hour >= 6 && hour < 18);
  };

  useEffect(() => {
    checkTimeOfDay();
    const interval = setInterval(checkTimeOfDay, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  // Handle theme based on user preference
  const getEffectiveTheme = () => {
    switch (themeMode) {
      case 'light':
        return 'light';
      case 'dark':
        return 'dark';
      case 'auto':
      default:
        return isDay ? 'light' : 'dark';
    }
  };

  // Scroll detection for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const threshold = 100; // Start transition after scrolling 100px
      setIsHeaderSticky(scrollY > threshold);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Apply theme class to document
  useEffect(() => {
    const effectiveTheme = getEffectiveTheme();
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
  }, [isDay, themeMode]);

  // Reverse geocoding to get city and state from coordinates
  const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
    try {
      // Use a simple reverse geocoding service
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
      );
      
      if (response.ok) {
        const data = await response.json();
        console.log('[Geocoding API] Success:', data);
        const parts = [];
        
        if (data.city || data.locality) {
          parts.push(data.city || data.locality);
        }
        
        if (data.principalSubdivision) {
          parts.push(data.principalSubdivision);
        } else if (data.countryName === 'United States' && data.principalSubdivisionCode) {
          parts.push(data.principalSubdivisionCode);
        }
        
        if (parts.length > 0) {
          return parts.join(', ');
        }
      }
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
    }
    
    // Fallback to coordinates if reverse geocoding fails
    return `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
  };

  const fetchWeatherData = async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const tempUnit = temperatureUnit === 'celsius' ? 'celsius' : 'fahrenheit';
      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m,precipitation_probability,weather_code&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max&timezone=auto&forecast_days=7&temperature_unit=${tempUnit}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch weather data');
      }
      
      const data = await response.json();
      console.log('[Weather API] Success:', data);
      setWeatherData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      toast.error('Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by this browser');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        // Get proper location name with city and state
        const locationName = await reverseGeocode(latitude, longitude);
        
        setLocation({
          latitude,
          longitude,
          name: locationName
        });
        
        await fetchWeatherData(latitude, longitude);
        setShowLocationPrompt(false); // Hide prompt after successful location access
      },
      (error) => {
        setLoading(false);
        toast.error('Unable to get your location');
      }
    );
  };

  const handleLocationSelect = async (lat: number, lon: number, name: string) => {
    setLocation({ latitude: lat, longitude: lon, name });
    await fetchWeatherData(lat, lon);
    setShowStickySearch(false); // Close sticky search after selection
  };

  const refreshWeather = async () => {
    if (location) {
      // If it's a coordinate-based location (from current location), re-reverse geocode
      if (location.name.includes(',') && location.name.match(/^-?\d+\.\d+, -?\d+\.\d+$/)) {
        const newLocationName = await reverseGeocode(location.latitude, location.longitude);
        setLocation(prev => prev ? { ...prev, name: newLocationName } : null);
      }
      await fetchWeatherData(location.latitude, location.longitude);
    }
  };

  // Load default location (NYC) on app start
  useEffect(() => {
    const loadDefaultLocation = async () => {
      // NYC coordinates: 40.7128, -74.0060
      const nycLocation = {
        latitude: 40.7128,
        longitude: -74.0060,
        name: 'New York, New York'
      };
      
      setLocation(nycLocation);
      await fetchWeatherData(nycLocation.latitude, nycLocation.longitude);
    };

    loadDefaultLocation();
  }, []);

  // Settings handlers
  const handleTemperatureUnitChange = (unit: 'fahrenheit' | 'celsius') => {
    setTemperatureUnit(unit);
    localStorage.setItem('temperatureUnit', unit);
    // Refresh weather data with new unit
    if (location) {
      fetchWeatherData(location.latitude, location.longitude);
    }
  };

  const handleThemeModeChange = (mode: 'auto' | 'light' | 'dark') => {
    setThemeMode(mode);
    localStorage.setItem('themeMode', mode);
  };

  // Get background colors based on weather and time
  const getBackgroundGradient = () => {
    const effectiveTheme = getEffectiveTheme();
    const isDarkTheme = effectiveTheme === 'dark';
    
    if (!weatherData) {
      return isDarkTheme 
        ? 'from-slate-900 via-slate-800 to-slate-900'
        : 'from-blue-400 via-sky-300 to-blue-500';
    }
    
    const weatherCode = weatherData.current.weather_code;
    
    if (!isDarkTheme) {
      switch (true) {
        case weatherCode === 0: // Clear sky
          return 'from-amber-300 via-sky-400 to-blue-500';
        case weatherCode >= 1 && weatherCode <= 3: // Cloudy
          return 'from-gray-300 via-gray-400 to-slate-500';
        case weatherCode === 45 || weatherCode === 48: // Fog
          return 'from-gray-200 via-gray-300 to-gray-400';
        case weatherCode >= 51 && weatherCode <= 57: // Drizzle
          return 'from-slate-300 via-slate-400 to-blue-500';
        case (weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82): // Rain
          return 'from-slate-400 via-slate-500 to-slate-600';
        case (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86): // Snow
          return 'from-slate-100 via-slate-200 to-blue-300';
        case weatherCode >= 95 && weatherCode <= 99: // Thunderstorm
          return 'from-slate-600 via-slate-700 to-slate-800';
        default:
          return 'from-blue-400 via-sky-300 to-blue-500';
      }
    } else {
      switch (true) {
        case weatherCode === 0: // Clear sky
          return 'from-slate-900 via-blue-900 to-purple-900';
        case weatherCode >= 1 && weatherCode <= 3: // Cloudy
          return 'from-slate-800 via-slate-700 to-slate-800';
        case weatherCode === 45 || weatherCode === 48: // Fog
          return 'from-gray-700 via-gray-600 to-gray-700';
        case weatherCode >= 51 && weatherCode <= 57: // Drizzle
          return 'from-slate-800 via-slate-700 to-blue-800';
        case (weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82): // Rain
          return 'from-slate-900 via-slate-800 to-slate-900';
        case (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86): // Snow
          return 'from-slate-700 via-slate-600 to-blue-700';
        case weatherCode >= 95 && weatherCode <= 99: // Thunderstorm
          return 'from-slate-900 via-purple-900 to-slate-900';
        default:
          return 'from-slate-900 via-slate-800 to-slate-900';
      }
    }
  };

  // Get Apple-style glass background based on state and theme
  const getHeaderBackground = () => {
    const effectiveTheme = getEffectiveTheme();
    if (isHeaderSticky) {
      return effectiveTheme === 'light'
        ? 'bg-white/80 dark:bg-black/80' 
        : 'bg-black/80 dark:bg-black/80';
    }
    return 'bg-card/60';
  };

  // Handle sticky header location click - NO SCROLL OR FOCUS FUNCTIONALITY
  const handleStickyHeaderClick = () => {
    // Completely removed - no scroll or focus behavior
    // This prevents any unwanted scrolling from focus events
  };

  // Handle search icon toggle in sticky header - NO SCROLL OR FOCUS FUNCTIONALITY  
  const handleStickySearchToggle = () => {
    if (showStickySearch) {
      setShowStickySearch(false);
    } else {
      setShowStickySearch(true);
    }
    // Removed focus behavior to prevent auto-scroll
    // Users can manually click in the search field when it appears
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundGradient()} transition-all duration-1000 relative`}>
      {/* Animated Weather Background */}
      {weatherData && (
        <WeatherBackground 
          weatherCode={weatherData.current.weather_code}
          isDay={getEffectiveTheme() === 'light'}
          className="z-0"
        />
      )}
      
      {/* Sticky Header */}
      <div 
        className={`
          fixed top-0 left-0 right-0 z-[60] transition-all duration-500 ease-out
          ${isHeaderSticky 
            ? 'translate-y-0 opacity-100' 
            : '-translate-y-full opacity-0 pointer-events-none'
          }
        `}
      >
        <div 
          className={`
            ${getHeaderBackground()}
            backdrop-blur-xl backdrop-saturate-180
            border-b border-border/20 
            shadow-lg shadow-black/5
            transition-all duration-500 ease-out
          `}
          style={{
            WebkitBackdropFilter: 'blur(20px) saturate(180%)',
            backdropFilter: 'blur(20px) saturate(180%)',
          }}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className={`transition-all duration-300 ${showStickySearch ? 'py-4' : 'py-3'}`}>
              <div className="flex items-center justify-between">
                <button
                  onClick={handleStickyHeaderClick}
                  className="flex items-center gap-3 flex-1 min-w-0 p-2 -m-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors active:scale-[0.98] cursor-pointer"
                >
                  <div className="p-2 bg-primary/10 rounded-full">
                    <MapPin className="h-4 w-4 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-xs text-muted-foreground">Current Location</p>
                    <p className="text-sm font-medium text-foreground truncate">
                      {location?.name || 'Location not set'}
                    </p>
                  </div>
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleStickySearchToggle}
                    className="h-8 w-8 p-0"
                  >
                    {showStickySearch ? (
                      <X className="h-3 w-3" />
                    ) : (
                      <Search className="h-3 w-3" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshWeather}
                    disabled={loading || !location}
                    className="h-8 w-8 p-0"
                  >
                    <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
              </div>
              
              {/* Sticky Search Bar */}
              <div className={`
                transition-all duration-300 ease-out overflow-visible
                ${showStickySearch ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0 mt-0'}
              `}>
                <div className="max-w-md mx-auto lg:max-w-lg">
                  <LocationSearch 
                    ref={stickyLocationSearchRef} 
                    onLocationSelect={handleLocationSelect}
                    isInStickyHeader={true}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Responsive Container */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-full m-[0px] p-[24px] px-[0px] py-[24px]">
          {/* Desktop Layout */}
          <div className="hidden lg:block">
            <div className="grid grid-cols-12 gap-6 min-h-[calc(100vh-3rem)]">
              {/* Left Column - Location Header & Search */}
              <div className="col-span-4 xl:col-span-3">
                <div className="sticky top-6 space-y-6">
                  {/* Header - Desktop */}
                  <Card className={`backdrop-blur-md border-border/50 shadow-lg transition-all duration-500 relative z-50 w-full ${getHeaderBackground()}`}>
                    <div className="p-6 w-full">
                      <div className="flex items-center justify-between mb-6 w-full">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className="p-3 bg-primary/10 rounded-full flex-shrink-0">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm text-muted-foreground">Current Location</p>
                            <p className="text-lg font-medium text-foreground truncate">
                              {location?.name || 'Location not set'}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={refreshWeather}
                          disabled={loading || !location}
                          className="h-12 w-12 p-0 flex-shrink-0"
                        >
                          <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                        </Button>
                      </div>
                      
                      {/* Location Search integrated into card */}
                      <div className="w-full">
                        <LocationSearch 
                          ref={locationSearchRef} 
                          onLocationSelect={handleLocationSelect}
                          isInStickyHeader={false}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Current Weather - Desktop Sidebar */}
                  {weatherData && (
                    <CurrentWeather 
                      current={weatherData.current}
                      location={location?.name || ''}
                      isDay={getEffectiveTheme() === 'light'}
                      temperatureUnit={temperatureUnit}
                    />
                  )}
                </div>
              </div>

              {/* Right Column - Main Content */}
              <div className="col-span-8 xl:col-span-9 flex flex-col min-h-[calc(100vh-6rem)]">
                {/* Enable Location Access Prompt - Desktop */}
                {showLocationPrompt && (
                  <Card className="bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/50 shadow-lg backdrop-blur-md relative z-20 mb-6">
                    <div className="p-5">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/10 rounded-full flex-shrink-0">
                          <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-blue-900 dark:text-blue-100 text-lg mb-1">
                            Get Your Local Weather
                          </p>
                          <p className="text-blue-700 dark:text-blue-300 text-base">
                            Enable location access to see weather for your area
                          </p>
                        </div>
                        <Button
                          onClick={getCurrentLocation}
                          disabled={loading}
                          size="default"
                          className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                        >
                          {loading ? (
                            <>
                              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                              Getting Location...
                            </>
                          ) : (
                            'Enable Location'
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowLocationPrompt(false)}
                          className="h-10 w-10 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 flex-shrink-0"
                        >
                          <X className="h-5 w-5" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Error State - Desktop */}
                {error && (
                  <Card className="bg-destructive/10 border-destructive/20 shadow-lg mb-6">
                    <div className="p-6">
                      <p className="text-destructive text-base mb-4">{error}</p>
                      <Button
                        variant="outline"
                        size="default"
                        onClick={refreshWeather}
                        className="border-destructive/20 text-destructive hover:bg-destructive/10"
                      >
                        Try Again
                      </Button>
                    </div>
                  </Card>
                )}

                {/* Loading State - Desktop */}
                {loading && !weatherData && (
                  <Card className="bg-card/60 backdrop-blur-md border-border/50 shadow-lg flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <RefreshCw className="h-12 w-12 text-primary animate-spin mx-auto mb-6" />
                      <p className="text-xl text-muted-foreground">Loading weather data...</p>
                    </div>
                  </Card>
                )}

                {/* Weather Content - Desktop - Flex Layout */}
                {weatherData && (
                  <div className="flex flex-col gap-6 flex-1">
                    <div className="flex-1">
                      <HourlyForecast hourly={weatherData.hourly} temperatureUnit={temperatureUnit} />
                    </div>
                    <div className="flex-1">
                      <DailyForecast daily={weatherData.daily} temperatureUnit={temperatureUnit} />
                    </div>
                    <div className="flex-shrink-0">
                      <SettingsSheet 
                        temperatureUnit={temperatureUnit}
                        onTemperatureUnitChange={handleTemperatureUnitChange}
                        themeMode={themeMode}
                        onThemeModeChange={handleThemeModeChange}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tablet Layout */}
          <div className="hidden md:block lg:hidden">
            <div className="max-w-4xl mx-auto space-y-6">
              {/* Header - Tablet */}
              <Card className={`backdrop-blur-md border-border/50 shadow-lg transition-all duration-500 relative z-50 ${getHeaderBackground()}`}>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/10 rounded-full">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-muted-foreground">Current Location</p>
                        <p className="text-lg font-medium text-foreground truncate">
                          {location?.name || 'Location not set'}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={refreshWeather}
                      disabled={loading || !location}
                      className="h-12 w-12 p-0 flex-shrink-0"
                    >
                      <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                  
                  {/* Location Search integrated into card */}
                  <LocationSearch 
                    ref={locationSearchRef} 
                    onLocationSelect={handleLocationSelect}
                    isInStickyHeader={false}
                  />
                </div>
              </Card>

              {/* Enable Location Access Prompt - Tablet */}
              {showLocationPrompt && (
                <Card className="bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/50 shadow-lg backdrop-blur-md relative z-20">
                  <div className="p-5">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-blue-500/10 rounded-full flex-shrink-0">
                        <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-blue-900 dark:text-blue-100 text-lg mb-1">
                          Get Your Local Weather
                        </p>
                        <p className="text-blue-700 dark:text-blue-300 text-base">
                          Enable location access to see weather for your area
                        </p>
                      </div>
                      <Button
                        onClick={getCurrentLocation}
                        disabled={loading}
                        size="default"
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                      >
                        {loading ? (
                          <>
                            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                            Getting Location...
                          </>
                        ) : (
                          'Enable Location'
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowLocationPrompt(false)}
                        className="h-10 w-10 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 flex-shrink-0"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              )}

              {/* Error State - Tablet */}
              {error && (
                <Card className="bg-destructive/10 border-destructive/20 shadow-lg">
                  <div className="p-6">
                    <p className="text-destructive text-base mb-4">{error}</p>
                    <Button
                      variant="outline"
                      size="default"
                      onClick={refreshWeather}
                      className="border-destructive/20 text-destructive hover:bg-destructive/10"
                    >
                      Try Again
                    </Button>
                  </div>
                </Card>
              )}

              {/* Loading State - Tablet */}
              {loading && !weatherData && (
                <Card className="bg-card/60 backdrop-blur-md border-border/50 shadow-lg">
                  <div className="flex items-center justify-center py-24">
                    <div className="text-center">
                      <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto mb-4" />
                      <p className="text-lg text-muted-foreground">Loading weather data...</p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Weather Content - Tablet Grid */}
              {weatherData && (
                <div className="space-y-6">
                  <CurrentWeather 
                    current={weatherData.current}
                    location={location?.name || ''}
                    isDay={getEffectiveTheme() === 'light'}
                    temperatureUnit={temperatureUnit}
                  />
                  <div className="grid grid-cols-1 gap-6">
                    <HourlyForecast hourly={weatherData.hourly} temperatureUnit={temperatureUnit} />
                    <DailyForecast daily={weatherData.daily} temperatureUnit={temperatureUnit} />
                    <SettingsSheet 
                      temperatureUnit={temperatureUnit}
                      onTemperatureUnitChange={handleTemperatureUnitChange}
                      themeMode={themeMode}
                      onThemeModeChange={handleThemeModeChange}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden max-w-md mx-auto">
            {/* Header - Mobile */}
            <Card className={`mb-6 backdrop-blur-md border-border/50 shadow-lg transition-all duration-500 relative z-50 ${getHeaderBackground()}`}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-muted-foreground">Current Location</p>
                      <p className="text-base font-medium text-foreground truncate">
                        {location?.name || 'Location not set'}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={refreshWeather}
                    disabled={loading || !location}
                    className="h-10 w-10 p-0 flex-shrink-0"
                  >
                    <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                </div>
                
                {/* Location Search integrated into card */}
                <LocationSearch 
                  ref={locationSearchRef} 
                  onLocationSelect={handleLocationSelect}
                  isInStickyHeader={false}
                />
              </div>
            </Card>

            {/* Enable Location Access Prompt - Mobile */}
            {showLocationPrompt && (
              <Card className="mb-6 bg-blue-50/80 dark:bg-blue-950/30 border-blue-200/50 dark:border-blue-800/50 shadow-lg backdrop-blur-md relative z-20">
                <div className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-full flex-shrink-0">
                      <MapPin className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-blue-900 dark:text-blue-100 text-sm mb-0.5">
                        Get Your Local Weather
                      </p>
                      <p className="text-blue-700 dark:text-blue-300 text-xs">
                        Enable location access to see weather for your area
                      </p>
                    </div>
                    <Button
                      onClick={getCurrentLocation}
                      disabled={loading}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 flex-shrink-0"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                          Getting...
                        </>
                      ) : (
                        'Enable'
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowLocationPrompt(false)}
                      className="h-8 w-8 p-0 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Error State - Mobile */}
            {error && (
              <Card className="mb-6 bg-destructive/10 border-destructive/20 shadow-lg">
                <div className="p-4">
                  <p className="text-destructive text-sm mb-3">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={refreshWeather}
                    className="border-destructive/20 text-destructive hover:bg-destructive/10 text-sm"
                  >
                    Try Again
                  </Button>
                </div>
              </Card>
            )}

            {/* Loading State - Mobile */}
            {loading && !weatherData && (
              <Card className="bg-card/60 backdrop-blur-md border-border/50 shadow-lg">
                <div className="flex items-center justify-center py-20">
                  <div className="text-center">
                    <RefreshCw className="h-8 w-8 text-primary animate-spin mx-auto mb-4" />
                    <p className="text-base text-muted-foreground">Loading weather data...</p>
                  </div>
                </div>
              </Card>
            )}

            {/* Weather Content - Mobile */}
            {weatherData && (
              <div className="space-y-4">
                <CurrentWeather 
                  current={weatherData.current}
                  location={location?.name || ''}
                  isDay={getEffectiveTheme() === 'light'}
                  temperatureUnit={temperatureUnit}
                />
                <HourlyForecast hourly={weatherData.hourly} temperatureUnit={temperatureUnit} />
                <DailyForecast daily={weatherData.daily} temperatureUnit={temperatureUnit} />
                <SettingsSheet 
                  temperatureUnit={temperatureUnit}
                  onTemperatureUnitChange={handleTemperatureUnitChange}
                  themeMode={themeMode}
                  onThemeModeChange={handleThemeModeChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}