import React from 'react';
import { Card } from './ui/card';
import { ScrollArea, ScrollBar } from './ui/scroll-area';
import { WeatherIcon } from './WeatherIcon';
import { Droplets } from 'lucide-react';

interface HourlyForecastProps {
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
  };
  temperatureUnit?: 'fahrenheit' | 'celsius';
}

export function HourlyForecast({ hourly, temperatureUnit = 'fahrenheit' }: HourlyForecastProps) {
  const formatHour = (timeString: string): string => {
    const date = new Date(timeString);
    const now = new Date();
    
    if (date.getHours() === now.getHours() && date.getDate() === now.getDate()) {
      return 'Now';
    }
    
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      hour12: true
    });
  };

  // Show next 24 hours
  const hourlyData = hourly.time.slice(0, 24).map((time, index) => ({
    time,
    temperature: hourly.temperature_2m[index],
    precipitation: hourly.precipitation_probability[index],
    weatherCode: hourly.weather_code[index]
  }));

  return (
    <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-lg h-full flex flex-col">
      <div className="p-4 sm:p-6 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4 sm:mb-6 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-medium text-foreground">Hourly Forecast</h3>
          <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded-full">
            24 hours
          </span>
        </div>
        
        <div className="flex-1 min-h-0">
          <ScrollArea className="w-full h-full">
            <div className="flex gap-3 sm:gap-4 pb-4 w-max h-full">
              {hourlyData.map((hour, index) => {
                const isCurrentHour = formatHour(hour.time) === 'Now';
                
                return (
                  <div
                    key={index}
                    className={`flex-shrink-0 rounded-lg p-3 sm:p-4 w-[80px] sm:w-[85px] lg:w-[90px] h-full flex flex-col justify-between text-center transition-all duration-200 ${
                      isCurrentHour 
                        ? 'bg-primary/15 border border-primary/30' 
                        : 'bg-accent/30 hover:bg-accent/50'
                    }`}
                  >
                    <div className={`text-xs sm:text-sm mb-3 font-medium flex-shrink-0 ${
                      isCurrentHour ? 'text-primary' : 'text-muted-foreground'
                    }`}>
                      {formatHour(hour.time)}
                    </div>
                    
                    <div className="flex justify-center mb-3 flex-shrink-0">
                      <WeatherIcon code={hour.weatherCode} size={28} className="sm:w-8 sm:h-8" />
                    </div>
                    
                    <div className="text-base sm:text-lg font-medium text-foreground mb-2 flex-shrink-0">
                      {Math.round(hour.temperature)}°{temperatureUnit === 'celsius' ? 'C' : 'F'}
                    </div>
                    
                    <div className="flex-shrink-0">
                      {hour.precipitation > 0 && (
                        <div className="flex items-center justify-center gap-1">
                          <Droplets className="h-3 w-3 text-blue-500" />
                          <span className="text-xs text-blue-600 font-medium">
                            {hour.precipitation}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </div>
    </Card>
  );
}