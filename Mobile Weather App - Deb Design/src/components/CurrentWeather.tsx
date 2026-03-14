import React from 'react';
import { Card } from './ui/card';
import { WeatherIcon } from './WeatherIcon';
import { Wind, Droplets, Eye, Gauge } from 'lucide-react';

interface CurrentWeatherProps {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
  };
  location: string;
  isDay: boolean;
  temperatureUnit?: 'fahrenheit' | 'celsius';
}

export function CurrentWeather({ current, location, isDay, temperatureUnit = 'fahrenheit' }: CurrentWeatherProps) {
  const getWeatherDescription = (code: number): string => {
    const weatherCodes: { [key: number]: string } = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      56: 'Light freezing drizzle',
      57: 'Dense freezing drizzle',
      61: 'Slight rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      66: 'Light freezing rain',
      67: 'Heavy freezing rain',
      71: 'Slight snow fall',
      73: 'Moderate snow fall',
      75: 'Heavy snow fall',
      77: 'Snow grains',
      80: 'Slight rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      85: 'Slight snow showers',
      86: 'Heavy snow showers',
      95: 'Thunderstorm',
      96: 'Thunderstorm with slight hail',
      99: 'Thunderstorm with heavy hail'
    };
    return weatherCodes[code] || 'Unknown';
  };

  const getWindDirection = (degrees: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(degrees / 45) % 8];
  };

  const formatTime = (timeString: string): string => {
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getFeelsLikeTemp = (temp: number, humidity: number, windSpeed: number): number => {
    // Simple feels-like calculation
    return temp + (humidity > 60 ? 2 : 0) - (windSpeed > 10 ? 3 : 0);
  };

  return (
    <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-xl w-full">
      <div className="p-4 sm:p-6 lg:p-6 w-full">
        {/* Main Temperature Display */}
        <div className="text-center mb-6 lg:mb-8 w-full">
          <div className="flex items-center justify-center mb-4 lg:mb-6 w-full">
            <WeatherIcon code={current.weather_code} size={80} className="sm:w-24 sm:h-24 lg:w-20 lg:h-20" />
          </div>
          
          <div className="space-y-2 w-full">
            <div className="text-5xl sm:text-6xl lg:text-5xl xl:text-6xl font-light text-foreground tracking-tight">
              {Math.round(current.temperature_2m)}°
            </div>
            <div className="text-lg sm:text-xl lg:text-lg xl:text-xl text-foreground font-medium">
              {getWeatherDescription(current.weather_code)}
            </div>
            <div className="text-sm sm:text-base lg:text-sm text-muted-foreground">
              Feels like {Math.round(getFeelsLikeTemp(current.temperature_2m, current.relative_humidity_2m, current.wind_speed_10m))}°{temperatureUnit === 'celsius' ? 'C' : 'F'}
            </div>
            <div className="text-xs sm:text-sm lg:text-xs text-muted-foreground">
              Updated {formatTime(current.time)}
            </div>
          </div>
        </div>

        {/* Weather Details Grid */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:gap-3 w-full">
          <div className="bg-accent/30 rounded-lg p-3 sm:p-4 lg:p-3 flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
              <Wind className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Wind</p>
              <p className="text-base sm:text-lg lg:text-base font-medium text-foreground">
                {Math.round(current.wind_speed_10m)} km/h
              </p>
              <p className="text-xs text-muted-foreground">
                {getWindDirection(current.wind_direction_10m)}
              </p>
            </div>
          </div>

          <div className="bg-accent/30 rounded-lg p-3 sm:p-4 lg:p-3 flex items-center gap-3 min-w-0">
            <div className="p-2 bg-primary/10 rounded-full flex-shrink-0">
              <Droplets className="h-4 w-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Humidity</p>
              <p className="text-base sm:text-lg lg:text-base font-medium text-foreground">
                {current.relative_humidity_2m}%
              </p>
              <p className="text-xs text-muted-foreground">
                {current.relative_humidity_2m > 70 ? 'High' : current.relative_humidity_2m > 30 ? 'Normal' : 'Low'}
              </p>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-4 sm:mt-6 lg:mt-4 pt-4 border-t border-border/30 w-full">
          <div className="flex items-center justify-between text-sm w-full">
            <span className="text-muted-foreground">Weather Code</span>
            <span className="font-medium text-foreground">{current.weather_code}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}