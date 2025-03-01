import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTags } from 'react-icons/fa';

const offers = [
  {
    title: "New User Offer",
    description: "Get ₹100 off on your first order",
    code: "WELCOME100",
    color: "from-blue-500 to-purple-500"
  },
  {
    title: "Happy Hours",
    description: "50% off between 3-5 PM",
    code: "HAPPY50",
    color: "from-orange-500 to-pink-500"
  },
  {
    title: "Weekend Special",
    description: "Free delivery on orders above ₹200",
    code: "WEEKEND",
    color: "from-green-500 to-teal-500"
  }
];

export default function OffersSlideshow() {
  const [currentOffer, setCurrentOffer] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentOffer((prev) => (prev + 1) % offers.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="relative h-48 mb-8">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentOffer}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`absolute inset-0 bg-gradient-to-r ${offers[currentOffer].color} rounded-2xl p-6 shadow-lg`}
        >
          {/* ... existing offer card content ... */}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
