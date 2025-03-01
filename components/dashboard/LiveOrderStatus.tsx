import { motion } from 'framer-motion';
import { FaCircle, FaCheckCircle } from 'react-icons/fa';

const steps = [
  { label: 'Order Placed', icon: FaCircle },
  { label: 'Preparing', icon: FaCircle },
  { label: 'Ready', icon: FaCircle },
  { label: 'Delivered', icon: FaCheckCircle }
];

export default function LiveOrderStatus({ currentStatus = 0 }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-6">Live Order Status</h3>
      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 w-full h-1 bg-gray-200 rounded-full">
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: `${(currentStatus / (steps.length - 1)) * 100}%` }}
            className="h-full bg-primary-600 rounded-full"
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Steps */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index <= currentStatus;
            const Icon = step.icon;

            return (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                className="flex flex-col items-center"
              >
                <motion.div
                  animate={isCompleted ? { scale: [1, 1.2, 1] } : {}}
                  transition={{ duration: 0.5 }}
                  className={`w-10 h-10 rounded-full ${
                    isCompleted ? 'bg-primary-600' : 'bg-gray-200'
                  } flex items-center justify-center relative z-10`}
                >
                  <Icon className={`w-5 h-5 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                </motion.div>
                <span className={`mt-2 text-sm ${isCompleted ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
