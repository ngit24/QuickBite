import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface QuickStat {
  icon: IconType;
  label: string;
  value: string | number;
  change?: number;
  color: string;
}

export default function QuickStats({ stats }: { stats: QuickStat[] }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow"
        >
          <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl bg-${stat.color}-50`}>
              <stat.icon className={`w-6 h-6 text-${stat.color}-500`} />
            </div>
            {stat.change !== undefined && (
              <div className={`text-sm font-medium ${
                stat.change >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change > 0 ? '+' : ''}{stat.change}%
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
          <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
        </motion.div>
      ))}
    </div>
  );
}
