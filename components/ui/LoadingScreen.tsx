import { motion } from 'framer-motion';
import { FaUtensils } from 'react-icons/fa';

export default function LoadingScreen() {
  return (
    <div className="fixed inset-0 bg-white bg-opacity-80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
      <motion.div 
        className="flex items-center mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <FaUtensils className="text-primary-600 text-3xl mr-2" />
        <span className="text-2xl font-bold text-gray-800">QuickByte</span>
      </motion.div>
      <motion.div 
        className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
      <motion.p 
        className="mt-4 text-gray-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Loading...
      </motion.p>
    </div>
  );
}
