import React from 'react';
import { 
  Sun, 
  Cloud, 
  CloudRain, 
  CloudSnow, 
  CloudLightning, 
  CloudDrizzle,
  Cloudy,
  CloudFog
} from 'lucide-react';

interface WeatherIconProps {
  code: number;
  size?: number;
  className?: string;
}

export function WeatherIcon({ code, size = 24, className = '' }: WeatherIconProps) {
  const getWeatherIcon = (weatherCode: number) => {
    const iconProps = {
      size,
      className: `${className} text-foreground`
    };

    switch (true) {
      case weatherCode === 0: // Clear sky
        return <Sun {...iconProps} className={`${iconProps.className} text-yellow-500`} />;
      
      case weatherCode === 1: // Mainly clear
        return <Sun {...iconProps} className={`${iconProps.className} text-yellow-400`} />;
      
      case weatherCode === 2: // Partly cloudy
        return <Cloudy {...iconProps} className={`${iconProps.className} text-gray-400`} />;
      
      case weatherCode === 3: // Overcast
        return <Cloud {...iconProps} className={`${iconProps.className} text-gray-500`} />;
      
      case weatherCode === 45 || weatherCode === 48: // Fog
        return <CloudFog {...iconProps} className={`${iconProps.className} text-gray-400`} />;
      
      case weatherCode >= 51 && weatherCode <= 57: // Drizzle
        return <CloudDrizzle {...iconProps} className={`${iconProps.className} text-blue-400`} />;
      
      case (weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82): // Rain
        return <CloudRain {...iconProps} className={`${iconProps.className} text-blue-500`} />;
      
      case (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86): // Snow
        return <CloudSnow {...iconProps} className={`${iconProps.className} text-blue-200`} />;
      
      case weatherCode >= 95 && weatherCode <= 99: // Thunderstorm
        return <CloudLightning {...iconProps} className={`${iconProps.className} text-yellow-600`} />;
      
      default:
        return <Sun {...iconProps} />;
    }
  };

  return (
    <div className="flex items-center justify-center">
      {getWeatherIcon(code)}
    </div>
  );
}