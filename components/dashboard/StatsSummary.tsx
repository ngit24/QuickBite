import { motion } from 'framer-motion';
import { FaStar, FaMoneyBillWave, FaHistory } from 'react-icons/fa';

interface StatsSummaryProps {
  totalSaved: number;
  loyaltyPoints: number;
  ordersCount: number;
}

export default function StatsSummary({ totalSaved, loyaltyPoints, ordersCount }: StatsSummaryProps) {
  const stats = [
    {
      icon: FaMoneyBillWave,
      label: "Total Savings",
      value: `₹${totalSaved.toFixed(2)}`,
      color: "emerald",
      delay: 0
    },
    {
      icon: FaStar,
      label: "Loyalty Points",
      value: loyaltyPoints,
      color: "amber",
      delay: 0.1
    },
    {
      icon: FaHistory,
      label: "Orders Placed",
      value: ordersCount,
      color: "blue",
      delay: 0.2
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: stat.delay }}
          className="bg-white rounded-xl shadow-sm overflow-hidden"
        >
          <div className="p-6">
            <div className={`inline-flex p-3 rounded-lg bg-${stat.color}-50 mb-4`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900">
              {typeof stat.value === 'number' ? stat.value.toLocaleString() : stat.value}
            </h3>
            <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
          </div>
          <div className={`h-1 bg-${stat.color}-500`} />
        </motion.div>
      ))}
    </div>
  );
}
