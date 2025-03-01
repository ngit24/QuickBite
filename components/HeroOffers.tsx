import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTag } from 'react-icons/fa';

const offers = [
  {
    code: 'WELCOME',
    description: 'Get ₹100 Cashback on orders above ₹200',
    terms: 'For new users only',
    color: 'from-violet-500 to-purple-500'
  },
  {
    code: 'MEGA50',
    description: 'Flat ₹50 Cashback on orders above ₹150',
    terms: 'Valid once per user',
    color: 'from-blue-500 to-cyan-500'
  },
  {
    code: 'LUNCH25',
    description: '₹25 Instant Cashback on Lunch orders',
    terms: 'Valid between 12 PM - 3 PM',
    color: 'from-orange-500 to-red-500'
  }
];

export default function HeroOffers() {
  const [currentOffer, setCurrentOffer] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % offers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="overflow-hidden relative h-24 mb-6 rounded-lg">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentOffer}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.5 }}
          className={`w-full h-full bg-gradient-to-r ${offers[currentOffer].color} p-4`}
        >
          <div className="max-w-2xl mx-auto text-white">
            <div className="flex items-center gap-3">
              <FaTag className="text-2xl" />
              <div>
                <div className="text-sm font-medium mb-1">Use code: {offers[currentOffer].code}</div>
                <div className="text-lg font-bold">{offers[currentOffer].description}</div>
                <div className="text-xs opacity-75">{offers[currentOffer].terms}</div>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
