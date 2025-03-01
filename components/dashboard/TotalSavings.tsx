import { motion } from 'framer-motion';
import { FaMoneyBillWave } from 'react-icons/fa';

interface TotalSavingsProps {
  amount: number;
}

const TotalSavings = ({ amount }: TotalSavingsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 bg-green-100 rounded-xl">
          <FaMoneyBillWave className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h3 className="text-sm text-gray-500 font-medium">Total Savings</h3>
          <p className="text-2xl font-bold text-gray-900">₹{amount.toFixed(2)}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default TotalSavings;
