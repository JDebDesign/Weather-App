import React from 'react';
import { motion } from 'motion/react';

interface WeatherBackgroundProps {
  weatherCode: number;
  isDay: boolean;
  className?: string;
}

export function WeatherBackground({ weatherCode, isDay, className = '' }: WeatherBackgroundProps) {
  const getBackgroundAnimation = () => {
    switch (true) {
      case weatherCode === 0: // Clear sky
        return <ClearSkyBackground isDay={isDay} />;
      case weatherCode >= 1 && weatherCode <= 3: // Cloudy
        return <CloudyBackground isDay={isDay} />;
      case weatherCode === 45 || weatherCode === 48: // Fog
        return <FogBackground isDay={isDay} />;
      case weatherCode >= 51 && weatherCode <= 57: // Drizzle
        return <DrizzleBackground isDay={isDay} />;
      case (weatherCode >= 61 && weatherCode <= 67) || (weatherCode >= 80 && weatherCode <= 82): // Rain
        return <RainBackground isDay={isDay} />;
      case (weatherCode >= 71 && weatherCode <= 77) || (weatherCode >= 85 && weatherCode <= 86): // Snow
        return <SnowBackground isDay={isDay} />;
      case weatherCode >= 95 && weatherCode <= 99: // Thunderstorm
        return <ThunderstormBackground isDay={isDay} />;
      default:
        return <ClearSkyBackground isDay={isDay} />;
    }
  };

  return (
    <div className={`fixed inset-0 pointer-events-none overflow-hidden ${className}`}>
      {getBackgroundAnimation()}
    </div>
  );
}

function ClearSkyBackground({ isDay }: { isDay: boolean }) {
  const particleCount = 15;
  const particleColor = isDay ? 'bg-yellow-300/20' : 'bg-blue-100/10';
  
  return (
    <div className="absolute inset-0">
      {/* Floating particles */}
      {Array.from({ length: particleCount }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1 h-1 ${particleColor} rounded-full`}
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
          }}
          animate={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 800),
            scale: [1, 1.5, 1],
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 20 + Math.random() * 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: Math.random() * 5,
          }}
        />
      ))}
    </div>
  );
}

function CloudyBackground({ isDay }: { isDay: boolean }) {
  const cloudColor = isDay ? 'bg-gray-300/15' : 'bg-gray-600/20';
  
  return (
    <div className="absolute inset-0">
      {/* Drifting clouds */}
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute ${cloudColor} rounded-full blur-xl`}
          style={{
            width: 120 + Math.random() * 180,
            height: 60 + Math.random() * 80,
            top: Math.random() * 60 + '%',
          }}
          initial={{ x: -250 }}
          animate={{ 
            x: (typeof window !== 'undefined' ? window.innerWidth : 400) + 250,
            scale: [1, 1.1, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            x: {
              duration: 25 + Math.random() * 15,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 10,
            },
            scale: {
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
            },
            opacity: {
              duration: 6 + Math.random() * 4,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
      ))}
    </div>
  );
}

function FogBackground({ isDay }: { isDay: boolean }) {
  const fogColor = isDay ? 'bg-gray-200/25' : 'bg-gray-500/15';
  
  return (
    <div className="absolute inset-0">
      {/* Misty overlay layers */}
      {Array.from({ length: 3 }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute inset-0 ${fogColor} blur-3xl`}
          animate={{
            x: [-30, 30, -30],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 12 + i * 2,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 2,
          }}
        />
      ))}
    </div>
  );
}

function DrizzleBackground({ isDay }: { isDay: boolean }) {
  const dropColor = isDay ? 'bg-blue-400/25' : 'bg-blue-300/15';
  
  return (
    <div className="absolute inset-0">
      {/* Light drizzle particles */}
      {Array.from({ length: 25 }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-0.5 h-3 ${dropColor} rounded-full opacity-60`}
          style={{
            left: Math.random() * 100 + '%',
          }}
          initial={{ y: -20 }}
          animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20 }}
          transition={{
            duration: 4 + Math.random() * 2,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 4,
          }}
        />
      ))}
    </div>
  );
}

function RainBackground({ isDay }: { isDay: boolean }) {
  const dropColor = isDay ? 'bg-blue-500/30' : 'bg-blue-400/20';
  
  return (
    <div className="absolute inset-0">
      {/* Rain drops */}
      {Array.from({ length: 50 }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-0.5 h-6 ${dropColor} rounded-full`}
          style={{
            left: Math.random() * 100 + '%',
          }}
          initial={{ y: -30 }}
          animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 30 }}
          transition={{
            duration: 1.5 + Math.random() * 1,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 3,
          }}
        />
      ))}
    </div>
  );
}

function SnowBackground({ isDay }: { isDay: boolean }) {
  const snowColor = isDay ? 'bg-white/70' : 'bg-white/50';
  
  return (
    <div className="absolute inset-0">
      {/* Snowflakes */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-1.5 h-1.5 ${snowColor} rounded-full`}
          style={{
            left: Math.random() * 100 + '%',
          }}
          initial={{ y: -20 }}
          animate={{ 
            y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20,
            x: [0, 15, -15, 0],
          }}
          transition={{
            y: {
              duration: 5 + Math.random() * 3,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            },
            x: {
              duration: 4 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut",
            },
          }}
        />
      ))}
    </div>
  );
}

function ThunderstormBackground({ isDay }: { isDay: boolean }) {
  const dropColor = isDay ? 'bg-blue-600/40' : 'bg-blue-500/30';
  
  return (
    <div className="absolute inset-0">
      {/* Lightning flashes */}
      <motion.div
        className="absolute inset-0 bg-yellow-200/20"
        animate={{
          opacity: [0, 0.8, 0, 0, 0, 0, 0.6, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          times: [0, 0.05, 0.1, 0.15, 0.6, 0.65, 0.7, 1],
        }}
      />
      
      {/* Heavy rain */}
      {Array.from({ length: 80 }).map((_, i) => (
        <motion.div
          key={i}
          className={`absolute w-0.5 h-8 ${dropColor} rounded-full`}
          style={{
            left: Math.random() * 100 + '%',
          }}
          initial={{ y: -40 }}
          animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 40 }}
          transition={{
            duration: 0.8 + Math.random() * 0.4,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
}