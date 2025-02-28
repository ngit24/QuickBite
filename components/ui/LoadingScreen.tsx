import { motion } from 'framer-motion';
import { FaUtensils } from 'react-icons/fa';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      {/* Dancing Fork Animation */}
      <motion.div
        className="mb-6"
        initial={{ y: 0 }}
        animate={{
          y: [0, -20, 0, 20, 0],
          rotate: [0, 15, 0, -15, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      >
        <FaUtensils className="text-primary-600 text-6xl" />
      </motion.div>

      {/* Brand Name with Bounce */}
      <motion.div
        className="flex items-center mb-4"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: "backOut" }}
      >
        <span className="text-3xl font-bold text-gray-800">QuickByte</span>
      </motion.div>

      {/* Spinning Loader with Wobble */}
      <motion.div
        className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full mb-6"
        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
        transition={{
          duration: 1.2,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Funny Loading Text with Typing Effect */}
      <motion.p
        className="mt-4 text-gray-600 text-center text-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        "Hang tight! Our free plan servers are doing the cha-cha...
        <motion.span
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          loading...
        </motion.span>"
      </motion.p>
    </div>
  );
}