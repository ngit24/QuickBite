import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface WelcomeHeroProps {
  userName: string;
}

export default function WelcomeHero({ userName }: WelcomeHeroProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeBasedInfo = () => {
    const hour = currentTime.getHours();
    if (hour >= 5 && hour < 11) {
      return {
        greeting: 'Good Morning',
        emoji: '',
        message: 'Start your day with a delicious breakfast'
      };
    } else if (hour >= 11 && hour < 15) {
      return {
        greeting: 'Good Afternoon',
        emoji: '',
        message: "Time for a refreshing lunch"
      };
    } else if (hour >= 15 && hour < 18) {
      return {
        greeting: 'Good Evening',
        emoji: '',
        message: "Perfect time for some snacks"
      };
    } else {
      return {
        greeting: 'Good Evening',
        emoji: '',
        message: "Dinner time"
      };
    }
  };

  const timeInfo = getTimeBasedInfo();

  return (
    <div className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.07]" 
        style={{
          backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
          backgroundSize: '48px 48px'
        }}
      />

      <div className="relative px-6 py-8 max-w-7xl mx-auto">
        <div className="text-center sm:text-left space-y-2">
          {/* Date */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-primary-100 text-sm font-medium"
          >
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </motion.p>
          
          {/* Greeting */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 justify-center sm:justify-start"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-white">
              {timeInfo.greeting}, {userName.split(' ')[0]}
            </h1>
            <span className="text-3xl">{timeInfo.emoji}</span>
          </motion.div>

          {/* Time-based message */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-primary-100/80 text-sm md:text-base"
          >
            {timeInfo.message}
          </motion.p>
        </div>
      </div>
    </div>
  );
}
