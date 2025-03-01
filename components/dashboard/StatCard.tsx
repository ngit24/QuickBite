import { IconType } from 'react-icons';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  trend?: number;
  color?: string;
}

export default function StatCard({ title, value, icon: Icon, trend, color = 'primary' }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className={`bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-200`}
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg bg-${color}-50`}>
          <Icon className={`w-6 h-6 text-${color}-600`} />
        </div>
        {trend !== undefined && (
          <span className={`text-sm font-medium ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <h3 className="mt-4 text-gray-500 text-sm font-medium">{title}</h3>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
    </motion.div>
  );
}
