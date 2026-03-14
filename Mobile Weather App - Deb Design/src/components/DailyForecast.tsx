import React from 'react';
import { Card } from './ui/card';
import { WeatherIcon } from './WeatherIcon';
import { Droplets, TrendingUp, TrendingDown } from 'lucide-react';

interface DailyForecastProps {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
  };
  temperatureUnit?: 'fahrenheit' | 'celsius';
}

export function DailyForecast({ daily, temperatureUnit = 'fahrenheit' }: DailyForecastProps) {
  const formatDay = (timeString: string): string => {
    const date = new Date(timeString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
  };

  const getShortDay = (timeString: string): string => {
    const date = new Date(timeString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    }
  };

  const getFullDay = (timeString: string): string => {
    const date = new Date(timeString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString('en-US', { weekday: 'long' });
    }
  };

  const dailyData = daily.time.map((time, index) => ({
    time,
    day: formatDay(time),
    shortDay: getShortDay(time),
    fullDay: getFullDay(time),
    maxTemp: daily.temperature_2m_max[index],
    minTemp: daily.temperature_2m_min[index],
    weatherCode: daily.weather_code[index],
    precipitation: daily.precipitation_probability_max[index]
  }));

  return (
    <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-lg h-full flex flex-col">
      <div className="p-4 sm:p-6 flex flex-col h-full">
        <div className="flex items-center gap-2 mb-4 sm:mb-6 flex-shrink-0">
          <h3 className="text-lg sm:text-xl font-medium text-foreground">7-Day Forecast</h3>
          <span className="text-xs text-muted-foreground bg-accent/50 px-2 py-1 rounded-full">
            Weekly
          </span>
        </div>
        
        <div className="flex-1 space-y-2 sm:space-y-3 overflow-auto">
          {dailyData.map((day, index) => {
            const isToday = day.day === 'Today';
            
            return (
              <div
                key={index}
                className={`flex items-center justify-between rounded-lg p-3 sm:p-4 transition-all duration-200 min-h-[60px] sm:min-h-[70px] ${
                  isToday 
                    ? 'bg-primary/10 border border-primary/20' 
                    : 'bg-accent/20 hover:bg-accent/40'
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                  <div className="min-w-[70px] sm:min-w-[80px] lg:min-w-[100px] flex-shrink-0">
                    <div className={`text-sm sm:text-base font-medium truncate ${
                      isToday ? 'text-primary' : 'text-foreground'
                    }`}>
                      <span className="sm:hidden">{day.shortDay}</span>
                      <span className="hidden sm:inline lg:hidden">{day.shortDay}</span>
                      <span className="hidden lg:inline">{day.fullDay}</span>
                    </div>
                    {isToday && (
                      <div className="text-xs text-muted-foreground">
                        {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                    <WeatherIcon code={day.weatherCode} size={24} className="sm:w-7 sm:h-7" />
                    
                    {day.precipitation > 0 && (
                      <div className="flex items-center gap-1 bg-blue-50 dark:bg-blue-950 px-2 py-1 rounded-full">
                        <Droplets className="h-3 w-3 text-blue-500" />
                        <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                          {day.precipitation}%
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2 text-right">
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3 text-orange-500" />
                      <span className="text-base sm:text-lg font-medium text-foreground">
                        {Math.round(day.maxTemp)}°{temperatureUnit === 'celsius' ? 'C' : 'F'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingDown className="h-3 w-3 text-blue-500" />
                      <span className="text-sm text-muted-foreground">
                        {Math.round(day.minTemp)}°{temperatureUnit === 'celsius' ? 'C' : 'F'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}