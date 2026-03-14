import React from 'react';
import { Card } from './ui/card';
import { Switch } from './ui/switch';
import { Settings, Thermometer, Palette, Sun, Moon, Clock } from 'lucide-react';

interface SettingsSheetProps {
  temperatureUnit: 'fahrenheit' | 'celsius';
  onTemperatureUnitChange: (unit: 'fahrenheit' | 'celsius') => void;
  themeMode: 'auto' | 'light' | 'dark';
  onThemeModeChange: (mode: 'auto' | 'light' | 'dark') => void;
}

export function SettingsSheet({ 
  temperatureUnit, 
  onTemperatureUnitChange, 
  themeMode, 
  onThemeModeChange 
}: SettingsSheetProps) {
  return (
    <Card className="bg-card/80 backdrop-blur-md border-border/50 shadow-lg h-full flex flex-col">
      <div className="p-4 sm:p-6 flex flex-col h-full">
        <div className="flex items-center gap-3 mb-4 sm:mb-6 flex-shrink-0">
          <div className="p-2 bg-primary/10 rounded-full">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg sm:text-xl font-medium text-foreground">Settings</h3>
        </div>
        
        <div className="flex-1 space-y-4">
          {/* Temperature Unit Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/50 rounded-full">
                <Thermometer className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-base text-foreground">Temperature Unit</span>
                <span className="text-sm text-muted-foreground">
                  {temperatureUnit === 'celsius' ? 'Celsius (°C)' : 'Fahrenheit (°F)'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-medium transition-colors ${temperatureUnit === 'fahrenheit' ? 'text-foreground' : 'text-muted-foreground'}`}>
                °F
              </span>
              <Switch
                checked={temperatureUnit === 'celsius'}
                onCheckedChange={(checked) => onTemperatureUnitChange(checked ? 'celsius' : 'fahrenheit')}
                className="data-[state=checked]:bg-primary"
              />
              <span className={`text-sm font-medium transition-colors ${temperatureUnit === 'celsius' ? 'text-foreground' : 'text-muted-foreground'}`}>
                °C
              </span>
            </div>
          </div>
          
          {/* Appearance Triple Toggle */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/50 rounded-full">
                <Palette className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-base text-foreground">Appearance</span>
                <span className="text-sm text-muted-foreground">
                  {themeMode === 'auto' ? 'Match time of day' : themeMode === 'light' ? 'Light mode' : 'Dark mode'}
                </span>
              </div>
            </div>
            <div className="flex items-center bg-accent/50 p-1 rounded-lg">
              <button
                onClick={() => onThemeModeChange('auto')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  themeMode === 'auto' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Clock className="h-4 w-4" />
              </button>
              <button
                onClick={() => onThemeModeChange('light')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  themeMode === 'light' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Sun className="h-4 w-4" />
              </button>
              <button
                onClick={() => onThemeModeChange('dark')}
                className={`p-2 rounded-md transition-all duration-200 ${
                  themeMode === 'dark' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                }`}
              >
                <Moon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        
        <div className="flex-shrink-0 pt-4 border-t border-border/30">
          <p className="text-sm text-muted-foreground text-center">
            Quickly adjust your app preferences
          </p>
        </div>
      </div>
    </Card>
  );
}